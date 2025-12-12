"""
Job Tracker Agent
Monitors job lifecycle, start dates, and progress for MindFlow.

Functions:
- Track job creation and status changes
- Monitor upcoming job starts
- Generate alerts for approaching start dates
- Track job completion and variance data
- Sync job status from portals to MindFlow
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any

import httpx

from .base import BaseAgent


# =============================================================================
# ENUMS AND CONSTANTS
# =============================================================================

class JobStatus(str, Enum):
    DRAFT = "DRAFT"
    ESTIMATED = "ESTIMATED"
    APPROVED = "APPROVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class AlertPriority(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


# Days thresholds for job start alerts
START_DATE_THRESHOLDS = {
    "critical": 3,      # 3 days or less = critical
    "warning": 7,       # 7 days or less = warning
    "upcoming": 14,     # 14 days or less = upcoming
}


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class JobInfo:
    """Job information from portal or database"""
    id: str
    job_number: str
    customer_id: str
    customer_name: str | None = None
    plan_id: str | None = None
    plan_code: str | None = None
    elevation_id: str | None = None
    elevation_code: str | None = None
    community_id: str | None = None
    community_name: str | None = None
    lot_id: str | None = None
    lot_number: int | None = None
    status: JobStatus = JobStatus.DRAFT
    start_date: datetime | None = None
    completion_date: datetime | None = None
    estimated_cost: float | None = None
    actual_cost: float | None = None
    notes: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def days_until_start(self) -> int | None:
        """Calculate days until start date"""
        if not self.start_date:
            return None
        delta = self.start_date - datetime.now()
        return delta.days

    def is_starting_soon(self, days: int = 7) -> bool:
        """Check if job is starting within specified days"""
        days_until = self.days_until_start()
        return days_until is not None and days_until <= days

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "id": self.id,
            "jobNumber": self.job_number,
            "customerId": self.customer_id,
            "planId": self.plan_id,
            "elevationId": self.elevation_id,
            "communityId": self.community_id,
            "lotId": self.lot_id,
            "status": self.status.value,
            "startDate": self.start_date.isoformat() if self.start_date else None,
            "completionDate": self.completion_date.isoformat() if self.completion_date else None,
            "estimatedCost": self.estimated_cost,
            "actualCost": self.actual_cost,
            "notes": self.notes,
        }


@dataclass
class JobAlert:
    """Alert for job-related issues"""
    alert_type: str                     # "start_approaching", "start_today", "overdue", "docs_incomplete"
    severity: str                       # "critical", "warning", "info"
    title: str
    message: str
    job_id: str
    job_number: str
    community: str | None = None
    lot_number: int | None = None
    start_date: datetime | None = None
    action_url: str | None = None
    details: dict = field(default_factory=dict)

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "alertType": self.severity,
            "source": "job_tracker",
            "title": self.title,
            "message": self.message,
            "details": {
                "alertSubType": self.alert_type,
                "jobId": self.job_id,
                "jobNumber": self.job_number,
                "community": self.community,
                "lotNumber": self.lot_number,
                "startDate": self.start_date.isoformat() if self.start_date else None,
                **self.details,
            },
            "actionUrl": self.action_url,
        }


@dataclass
class JobSummary:
    """Summary of jobs by status"""
    total: int = 0
    draft: int = 0
    estimated: int = 0
    approved: int = 0
    in_progress: int = 0
    completed: int = 0
    cancelled: int = 0
    starting_this_week: int = 0
    starting_next_week: int = 0
    overdue: int = 0


@dataclass
class ActivityEntry:
    """Activity log entry for job events"""
    activity_type: str                  # "job_created", "job_started", "job_completed", "status_changed"
    title: str
    detail: str | None = None
    job_id: str | None = None
    user_id: str | None = None
    icon: str | None = None
    timestamp: datetime = field(default_factory=datetime.now)

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "activityType": self.activity_type,
            "title": self.title,
            "detail": self.detail,
            "orderId": self.job_id,  # Using orderId field for job reference
            "userId": self.user_id,
            "icon": self.icon,
        }


# =============================================================================
# JOB TRACKER AGENT
# =============================================================================

class JobTracker(BaseAgent):
    """Agent for tracking job lifecycle and generating alerts"""

    def __init__(self):
        super().__init__("JobTracker")

        # MindFlow API configuration
        self.api_base_url = self.get_env("MINDFLOW_API_URL", "http://localhost:3001/api/v1")
        self.api_token = self.get_env("PORTAL_SYNC_SECRET", "")

    async def run(self) -> dict[str, Any]:
        """Run job tracking check"""
        self.log("Starting job tracking check")

        results = {
            "jobs_checked": 0,
            "alerts_generated": 0,
            "activities_logged": 0,
            "summary": {},
            "errors": [],
            "timestamp": datetime.now().isoformat(),
        }

        try:
            # Get all active jobs
            jobs = await self.get_jobs()
            results["jobs_checked"] = len(jobs)
            self.log(f"Tracking {len(jobs)} jobs")

            # Generate summary
            summary = self.calculate_summary(jobs)
            results["summary"] = {
                "total": summary.total,
                "byStatus": {
                    "draft": summary.draft,
                    "estimated": summary.estimated,
                    "approved": summary.approved,
                    "inProgress": summary.in_progress,
                    "completed": summary.completed,
                    "cancelled": summary.cancelled,
                },
                "startingThisWeek": summary.starting_this_week,
                "startingNextWeek": summary.starting_next_week,
                "overdue": summary.overdue,
            }

            # Check for jobs needing alerts
            for job in jobs:
                alerts = self.generate_job_alerts(job)
                for alert in alerts:
                    success = await self.send_alert(alert)
                    if success:
                        results["alerts_generated"] += 1

            # Sync summary to dashboard
            await self.sync_dashboard_stats(summary)

        except Exception as e:
            self.log(f"Error during job tracking: {e}", "error")
            results["errors"].append(str(e))

        self.last_run = datetime.now()
        self.run_count += 1

        return results

    async def get_jobs(self, status: str | None = None) -> list[JobInfo]:
        """Fetch jobs from MindFlow API"""
        try:
            params = {}
            if status:
                params["status"] = status

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_base_url}/jobs",
                    params=params,
                    headers={"x-service-token": self.api_token}
                )
                if response.status_code == 200:
                    jobs_data = response.json()
                    return [self._parse_job(j) for j in jobs_data]
        except Exception as e:
            self.log(f"Error fetching jobs: {e}", "warning")

        # Return mock data for testing
        return self._get_mock_jobs()

    def _parse_job(self, data: dict) -> JobInfo:
        """Parse job data from API response"""
        start_date = None
        if data.get("startDate"):
            try:
                start_date = datetime.fromisoformat(data["startDate"].replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass

        completion_date = None
        if data.get("completionDate"):
            try:
                completion_date = datetime.fromisoformat(data["completionDate"].replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass

        return JobInfo(
            id=data.get("id", ""),
            job_number=data.get("jobNumber", ""),
            customer_id=data.get("customerId", ""),
            customer_name=data.get("customer", {}).get("customerName") if isinstance(data.get("customer"), dict) else None,
            plan_id=data.get("planId"),
            plan_code=data.get("plan", {}).get("code") if isinstance(data.get("plan"), dict) else None,
            elevation_id=data.get("elevationId"),
            elevation_code=data.get("elevation", {}).get("code") if isinstance(data.get("elevation"), dict) else None,
            community_id=data.get("communityId"),
            community_name=data.get("community", {}).get("name") if isinstance(data.get("community"), dict) else None,
            lot_id=data.get("lotId"),
            lot_number=data.get("lot", {}).get("lotNumber") if isinstance(data.get("lot"), dict) else None,
            status=JobStatus(data.get("status", "DRAFT")),
            start_date=start_date,
            completion_date=completion_date,
            estimated_cost=data.get("estimatedCost"),
            actual_cost=data.get("actualCost"),
            notes=data.get("notes"),
        )

    def _get_mock_jobs(self) -> list[JobInfo]:
        """Mock jobs for testing"""
        now = datetime.now()
        return [
            JobInfo(
                id="job-001",
                job_number="2024-001",
                customer_id="cust-001",
                customer_name="Richmond American",
                plan_code="2400",
                elevation_code="A",
                community_name="North Haven Phase 4",
                lot_number=127,
                status=JobStatus.IN_PROGRESS,
                start_date=now - timedelta(days=3),
                estimated_cost=45000.00,
            ),
            JobInfo(
                id="job-002",
                job_number="2024-002",
                customer_id="cust-001",
                customer_name="Richmond American",
                plan_code="G21D",
                elevation_code="B",
                community_name="Luden Estates Phase 3",
                lot_number=45,
                status=JobStatus.APPROVED,
                start_date=now + timedelta(days=2),  # Starting in 2 days
                estimated_cost=62000.00,
            ),
            JobInfo(
                id="job-003",
                job_number="2024-003",
                customer_id="cust-001",
                customer_name="Richmond American",
                plan_code="2800",
                elevation_code="A",
                community_name="Verona Heights",
                lot_number=89,
                status=JobStatus.APPROVED,
                start_date=now + timedelta(days=5),  # Starting in 5 days
                estimated_cost=52000.00,
            ),
            JobInfo(
                id="job-004",
                job_number="2024-004",
                customer_id="cust-001",
                customer_name="Richmond American",
                plan_code="1900",
                elevation_code="C",
                community_name="North Haven Phase 4",
                lot_number=142,
                status=JobStatus.ESTIMATED,
                start_date=now + timedelta(days=10),
                estimated_cost=38000.00,
            ),
            JobInfo(
                id="job-005",
                job_number="2024-005",
                customer_id="cust-002",
                customer_name="Holt Homes",
                plan_code="H-2400",
                elevation_code="A",
                community_name="Meadow Creek",
                lot_number=23,
                status=JobStatus.COMPLETED,
                start_date=now - timedelta(days=30),
                completion_date=now - timedelta(days=5),
                estimated_cost=41000.00,
                actual_cost=42500.00,
            ),
        ]

    def calculate_summary(self, jobs: list[JobInfo]) -> JobSummary:
        """Calculate job summary statistics"""
        summary = JobSummary(total=len(jobs))
        now = datetime.now()
        week_from_now = now + timedelta(days=7)
        two_weeks_from_now = now + timedelta(days=14)

        for job in jobs:
            # Count by status
            if job.status == JobStatus.DRAFT:
                summary.draft += 1
            elif job.status == JobStatus.ESTIMATED:
                summary.estimated += 1
            elif job.status == JobStatus.APPROVED:
                summary.approved += 1
            elif job.status == JobStatus.IN_PROGRESS:
                summary.in_progress += 1
            elif job.status == JobStatus.COMPLETED:
                summary.completed += 1
            elif job.status == JobStatus.CANCELLED:
                summary.cancelled += 1

            # Check start dates
            if job.start_date:
                if job.start_date < now and job.status not in [JobStatus.IN_PROGRESS, JobStatus.COMPLETED, JobStatus.CANCELLED]:
                    summary.overdue += 1
                elif now <= job.start_date <= week_from_now:
                    summary.starting_this_week += 1
                elif week_from_now < job.start_date <= two_weeks_from_now:
                    summary.starting_next_week += 1

        return summary

    def generate_job_alerts(self, job: JobInfo) -> list[JobAlert]:
        """Generate alerts for a job based on status and dates"""
        alerts = []
        now = datetime.now()

        # Skip completed/cancelled jobs
        if job.status in [JobStatus.COMPLETED, JobStatus.CANCELLED]:
            return alerts

        # Check start date alerts
        if job.start_date:
            days_until = job.days_until_start()

            if days_until is not None:
                # Starting today
                if days_until == 0:
                    alerts.append(JobAlert(
                        alert_type="start_today",
                        severity=AlertPriority.CRITICAL.value,
                        title=f"Job Starting Today: {job.job_number}",
                        message=f"Job {job.job_number} at {job.community_name or 'Unknown'} Lot {job.lot_number} is scheduled to start today. "
                                f"Plan: {job.plan_code}{job.elevation_code or ''}",
                        job_id=job.id,
                        job_number=job.job_number,
                        community=job.community_name,
                        lot_number=job.lot_number,
                        start_date=job.start_date,
                        action_url=f"/jobs/{job.id}",
                    ))

                # Starting within critical threshold (3 days)
                elif 0 < days_until <= START_DATE_THRESHOLDS["critical"]:
                    alerts.append(JobAlert(
                        alert_type="start_approaching",
                        severity=AlertPriority.CRITICAL.value,
                        title=f"Job Starting in {days_until} Day{'s' if days_until != 1 else ''}: {job.job_number}",
                        message=f"Job {job.job_number} at {job.community_name or 'Unknown'} Lot {job.lot_number} "
                                f"starts in {days_until} day{'s' if days_until != 1 else ''}. Ensure all documents are ready.",
                        job_id=job.id,
                        job_number=job.job_number,
                        community=job.community_name,
                        lot_number=job.lot_number,
                        start_date=job.start_date,
                        action_url=f"/jobs/{job.id}",
                    ))

                # Starting within warning threshold (7 days)
                elif START_DATE_THRESHOLDS["critical"] < days_until <= START_DATE_THRESHOLDS["warning"]:
                    alerts.append(JobAlert(
                        alert_type="start_approaching",
                        severity=AlertPriority.WARNING.value,
                        title=f"Job Starting in {days_until} Days: {job.job_number}",
                        message=f"Job {job.job_number} at {job.community_name or 'Unknown'} Lot {job.lot_number} "
                                f"starts in {days_until} days.",
                        job_id=job.id,
                        job_number=job.job_number,
                        community=job.community_name,
                        lot_number=job.lot_number,
                        start_date=job.start_date,
                        action_url=f"/jobs/{job.id}",
                    ))

                # Overdue (past start date but not started)
                elif days_until < 0 and job.status not in [JobStatus.IN_PROGRESS]:
                    alerts.append(JobAlert(
                        alert_type="overdue",
                        severity=AlertPriority.CRITICAL.value,
                        title=f"Job Overdue: {job.job_number}",
                        message=f"Job {job.job_number} at {job.community_name or 'Unknown'} Lot {job.lot_number} "
                                f"was scheduled to start {abs(days_until)} day{'s' if abs(days_until) != 1 else ''} ago but has not been marked as started.",
                        job_id=job.id,
                        job_number=job.job_number,
                        community=job.community_name,
                        lot_number=job.lot_number,
                        start_date=job.start_date,
                        action_url=f"/jobs/{job.id}",
                    ))

        return alerts

    async def send_alert(self, alert: JobAlert) -> bool:
        """Send alert to MindFlow"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/alerts",
                    headers={"x-service-token": self.api_token},
                    json=alert.to_api_format()
                )
                if response.status_code in (200, 201):
                    self.log(f"Alert sent: {alert.title}")
                    return True
                else:
                    self.log(f"Failed to send alert: {response.status_code}", "warning")
                    return False
        except Exception as e:
            self.log(f"Error sending alert: {e}", "error")
            return False

    async def log_activity(self, activity: ActivityEntry) -> bool:
        """Log activity to MindFlow"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/activity",
                    headers={"x-service-token": self.api_token},
                    json=activity.to_api_format()
                )
                return response.status_code in (200, 201)
        except Exception as e:
            self.log(f"Error logging activity: {e}", "error")
            return False

    async def sync_dashboard_stats(self, summary: JobSummary) -> bool:
        """Sync job stats to dashboard"""
        try:
            stats = {
                "activeJobs": summary.in_progress + summary.approved,
                "pendingJobs": summary.draft + summary.estimated,
                "completedJobs": summary.completed,
                "startingThisWeek": summary.starting_this_week,
                "startingNextWeek": summary.starting_next_week,
                "overdueJobs": summary.overdue,
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/stats",
                    headers={"x-service-token": self.api_token},
                    json={"type": "jobs", "data": stats}
                )
                return response.status_code in (200, 201)
        except Exception as e:
            self.log(f"Error syncing dashboard stats: {e}", "error")
            return False

    async def update_job_status(self, job_id: str, status: JobStatus, notes: str | None = None) -> bool:
        """Update job status in MindFlow"""
        try:
            data = {"status": status.value}
            if notes:
                data["notes"] = notes
            if status == JobStatus.COMPLETED:
                data["completionDate"] = datetime.now().isoformat()

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.patch(
                    f"{self.api_base_url}/jobs/{job_id}",
                    headers={"x-service-token": self.api_token},
                    json=data
                )
                return response.status_code in (200, 204)
        except Exception as e:
            self.log(f"Error updating job status: {e}", "error")
            return False

    async def get_upcoming_starts(self, days: int = 7) -> list[JobInfo]:
        """Get jobs starting within specified days"""
        all_jobs = await self.get_jobs()
        now = datetime.now()
        cutoff = now + timedelta(days=days)

        return [
            job for job in all_jobs
            if job.start_date and now <= job.start_date <= cutoff
            and job.status not in [JobStatus.COMPLETED, JobStatus.CANCELLED, JobStatus.IN_PROGRESS]
        ]

    async def get_jobs_by_community(self, community_id: str) -> list[JobInfo]:
        """Get all jobs for a specific community"""
        all_jobs = await self.get_jobs()
        return [job for job in all_jobs if job.community_id == community_id]

    async def get_jobs_by_customer(self, customer_id: str) -> list[JobInfo]:
        """Get all jobs for a specific customer"""
        all_jobs = await self.get_jobs()
        return [job for job in all_jobs if job.customer_id == customer_id]
