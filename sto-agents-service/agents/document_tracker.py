"""
Document Tracker Agent
Monitors document status, completeness, and lifecycle for MindFlow.

Functions:
- Track document upload/processing status
- Monitor document completeness by job/plan
- Generate alerts for missing/expiring documents
- Archive old document versions
- Sync document status to MindFlow database
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any

import httpx

from .base import BaseAgent


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class DocumentStatus:
    """Document status information"""
    id: str
    filename: str
    doc_type: str
    status: str                         # "pending", "received", "processed", "archived"
    plan_id: str | None = None
    elevation_id: str | None = None
    community_id: str | None = None
    lot_number: int | None = None
    version: int = 1
    file_url: str | None = None
    file_size: int | None = None
    uploaded_at: datetime | None = None
    processed_at: datetime | None = None

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "id": self.id,
            "filename": self.filename,
            "docType": self.doc_type,
            "status": self.status,
            "planId": self.plan_id,
            "elevationId": self.elevation_id,
            "communityId": self.community_id,
            "lotNumber": self.lot_number,
            "version": self.version,
            "fileUrl": self.file_url,
            "fileSize": self.file_size,
            "uploadedAt": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "processedAt": self.processed_at.isoformat() if self.processed_at else None,
        }


@dataclass
class DocumentAlert:
    """Alert for document issues"""
    alert_type: str                     # "missing", "expired", "version_outdated", "processing_failed"
    title: str
    message: str
    severity: str = "warning"           # "critical", "warning", "info"
    plan_id: str | None = None
    elevation_id: str | None = None
    community_id: str | None = None
    lot_number: int | None = None
    job_id: str | None = None
    document_type: str | None = None
    action_url: str | None = None

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "alertType": self.severity,
            "source": "document_tracker",
            "title": self.title,
            "message": self.message,
            "details": {
                "alertSubType": self.alert_type,
                "planId": self.plan_id,
                "elevationId": self.elevation_id,
                "communityId": self.community_id,
                "lotNumber": self.lot_number,
                "jobId": self.job_id,
                "documentType": self.document_type,
            },
            "actionUrl": self.action_url,
        }


@dataclass
class JobDocumentStatus:
    """Document completeness status for a job"""
    job_id: str
    job_number: str
    plan_code: str
    elevation_code: str | None
    community: str
    lot_number: int
    builder: str
    required_documents: list[str] = field(default_factory=list)
    received_documents: list[str] = field(default_factory=list)
    missing_documents: list[str] = field(default_factory=list)
    completeness_percentage: float = 0.0
    is_complete: bool = False
    last_checked: datetime = field(default_factory=datetime.now)


# =============================================================================
# DOCUMENT REQUIREMENTS BY BUILDER
# =============================================================================

DOCUMENT_REQUIREMENTS = {
    "richmond_american": {
        "required": [
            "ARCH_DRAWINGS",        # Architectural drawings
            "CALC_PKG",             # Structural calculations
        ],
        "optional": [
            "FLOOR_TRUSS_CALCS",    # Floor truss calculations
            "FLOOR_TRUSS_LAYOUT",   # Floor truss layout
            "ROOF_TRUSS_CALCS",     # Roof truss calculations
            "ROOF_TRUSS_LAYOUT",    # Roof truss layout
            "PLOT_PLAN",            # Site/plot plan
            "JIO",                  # Job Information Order
            "HCO",                  # Home Customization Order
        ],
        "critical_deadline_days": 5,  # Days before start that docs must be complete
    },
    "holt_homes": {
        "required": [
            "PLANS",                # Combined plans
            "STRUCTURAL",           # Structural package
        ],
        "optional": [
            "TRUSS_LAYOUT",
            "PLOT_PLAN",
        ],
        "critical_deadline_days": 3,
    },
    "manor_homes": {
        "required": [
            "PLANS",
        ],
        "optional": [
            "STRUCTURAL",
            "PLOT_PLAN",
        ],
        "critical_deadline_days": 3,
    },
}

# Document type aliases (normalize different naming conventions)
DOC_TYPE_ALIASES = {
    "arch": "ARCH_DRAWINGS",
    "architectural": "ARCH_DRAWINGS",
    "arch drawings": "ARCH_DRAWINGS",
    "architectural drawings": "ARCH_DRAWINGS",
    "calc": "CALC_PKG",
    "calcs": "CALC_PKG",
    "calculations": "CALC_PKG",
    "calc pkg": "CALC_PKG",
    "structural calcs": "CALC_PKG",
    "floor truss": "FLOOR_TRUSS_CALCS",
    "floor truss calcs": "FLOOR_TRUSS_CALCS",
    "roof truss": "ROOF_TRUSS_CALCS",
    "roof truss calcs": "ROOF_TRUSS_CALCS",
    "plot": "PLOT_PLAN",
    "plot plan": "PLOT_PLAN",
    "site plan": "PLOT_PLAN",
    "plans": "PLANS",
    "structural": "STRUCTURAL",
}


class DocumentTracker(BaseAgent):
    """Agent for tracking document status and completeness"""

    def __init__(self):
        super().__init__("DocumentTracker")

        # MindFlow API configuration
        self.api_base_url = self.get_env("MINDFLOW_API_URL", "http://localhost:3001/api/v1")
        self.api_token = self.get_env("PORTAL_SYNC_SECRET", "")

    async def run(self) -> dict[str, Any]:
        """Run document tracking check"""
        self.log("Starting document tracking check")

        results = {
            "jobs_checked": 0,
            "complete_jobs": 0,
            "incomplete_jobs": 0,
            "alerts_generated": 0,
            "documents_tracked": 0,
            "errors": [],
            "timestamp": datetime.now().isoformat(),
        }

        try:
            # Get active jobs that need document tracking
            jobs = await self.get_active_jobs()
            results["jobs_checked"] = len(jobs)
            self.log(f"Checking documents for {len(jobs)} active jobs")

            # Check document completeness for each job
            for job in jobs:
                try:
                    status = await self.check_job_documents(job)

                    if status.is_complete:
                        results["complete_jobs"] += 1
                    else:
                        results["incomplete_jobs"] += 1

                        # Generate alerts for incomplete jobs
                        alerts = self.generate_document_alerts(status, job)
                        for alert in alerts:
                            await self.send_alert(alert)
                            results["alerts_generated"] += 1

                    results["documents_tracked"] += len(status.received_documents)

                except Exception as e:
                    results["errors"].append(f"Error checking job {job.get('jobNumber', 'unknown')}: {str(e)}")

        except Exception as e:
            self.log(f"Error during document tracking: {e}", "error")
            results["errors"].append(str(e))

        self.last_run = datetime.now()
        self.run_count += 1

        return results

    async def get_active_jobs(self) -> list[dict]:
        """Fetch active jobs from MindFlow that need document tracking"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_base_url}/jobs",
                    params={"status": "IN_PROGRESS,APPROVED,ESTIMATED"},
                    headers={"x-service-token": self.api_token}
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            self.log(f"Error fetching active jobs: {e}", "warning")

        # Return mock data for testing
        return self._get_mock_jobs()

    def _get_mock_jobs(self) -> list[dict]:
        """Mock jobs for testing"""
        return [
            {
                "id": "job-001",
                "jobNumber": "2024-001",
                "planCode": "2400",
                "elevationCode": "A",
                "community": "North Haven Phase 4",
                "lotNumber": 127,
                "builder": "richmond_american",
                "status": "IN_PROGRESS",
                "startDate": (datetime.now() + timedelta(days=7)).isoformat(),
            },
            {
                "id": "job-002",
                "jobNumber": "2024-002",
                "planCode": "G21D",
                "elevationCode": "B",
                "community": "Luden Estates Phase 3",
                "lotNumber": 45,
                "builder": "richmond_american",
                "status": "APPROVED",
                "startDate": (datetime.now() + timedelta(days=3)).isoformat(),
            },
            {
                "id": "job-003",
                "jobNumber": "2024-003",
                "planCode": "1900",
                "elevationCode": "C",
                "community": "Verona Heights",
                "lotNumber": 89,
                "builder": "richmond_american",
                "status": "ESTIMATED",
                "startDate": (datetime.now() + timedelta(days=14)).isoformat(),
            },
        ]

    async def get_job_documents(self, job_id: str) -> list[dict]:
        """Fetch documents associated with a job"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_base_url}/portal-sync/documents",
                    params={"jobId": job_id},
                    headers={"x-service-token": self.api_token}
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            self.log(f"Error fetching job documents: {e}", "warning")

        return []

    async def check_job_documents(self, job: dict) -> JobDocumentStatus:
        """Check document completeness for a job"""
        builder = job.get("builder", "richmond_american")
        requirements = DOCUMENT_REQUIREMENTS.get(builder, DOCUMENT_REQUIREMENTS["richmond_american"])

        status = JobDocumentStatus(
            job_id=job.get("id", ""),
            job_number=job.get("jobNumber", ""),
            plan_code=job.get("planCode", ""),
            elevation_code=job.get("elevationCode"),
            community=job.get("community", ""),
            lot_number=job.get("lotNumber", 0),
            builder=builder,
            required_documents=requirements["required"].copy(),
        )

        # Get documents for this job
        documents = await self.get_job_documents(job.get("id", ""))

        # Normalize and check received documents
        for doc in documents:
            doc_type = self.normalize_document_type(doc.get("docType", ""))
            if doc_type:
                status.received_documents.append(doc_type)

        # Mock documents for testing if API returned nothing
        if not status.received_documents:
            status.received_documents = self._get_mock_documents(job)

        # Calculate missing documents
        status.missing_documents = [
            doc for doc in status.required_documents
            if doc not in status.received_documents
        ]

        # Calculate completeness
        if status.required_documents:
            received_required = len([
                d for d in status.received_documents
                if d in status.required_documents
            ])
            status.completeness_percentage = (received_required / len(status.required_documents)) * 100
            status.is_complete = len(status.missing_documents) == 0
        else:
            status.completeness_percentage = 100.0
            status.is_complete = True

        status.last_checked = datetime.now()

        return status

    def _get_mock_documents(self, job: dict) -> list[str]:
        """Mock documents for testing based on job"""
        lot_num = job.get("lotNumber", 0)

        # Simulate varying document completeness
        if lot_num % 3 == 0:
            return ["ARCH_DRAWINGS", "CALC_PKG"]  # Complete
        elif lot_num % 3 == 1:
            return ["ARCH_DRAWINGS"]  # Missing calc pkg
        else:
            return []  # Missing all docs

    def normalize_document_type(self, doc_type: str) -> str | None:
        """Normalize document type to standard format"""
        if not doc_type:
            return None

        doc_type_lower = doc_type.lower().strip()

        # Check aliases
        if doc_type_lower in DOC_TYPE_ALIASES:
            return DOC_TYPE_ALIASES[doc_type_lower]

        # Check if it's already a standard type
        standard_types = [
            "ARCH_DRAWINGS", "CALC_PKG", "FLOOR_TRUSS_CALCS", "FLOOR_TRUSS_LAYOUT",
            "ROOF_TRUSS_CALCS", "ROOF_TRUSS_LAYOUT", "PLOT_PLAN", "JIO", "HCO",
            "PLANS", "STRUCTURAL"
        ]
        if doc_type.upper() in standard_types:
            return doc_type.upper()

        return None

    def generate_document_alerts(self, status: JobDocumentStatus, job: dict) -> list[DocumentAlert]:
        """Generate alerts for document issues"""
        alerts = []

        # Check start date proximity
        start_date_str = job.get("startDate")
        days_until_start = None
        if start_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
                days_until_start = (start_date - datetime.now(start_date.tzinfo)).days
            except (ValueError, TypeError):
                pass

        requirements = DOCUMENT_REQUIREMENTS.get(status.builder, DOCUMENT_REQUIREMENTS["richmond_american"])
        critical_days = requirements.get("critical_deadline_days", 5)

        for missing_doc in status.missing_documents:
            # Determine severity based on start date
            severity = "warning"
            if days_until_start is not None and days_until_start <= critical_days:
                severity = "critical"

            alert = DocumentAlert(
                alert_type="missing",
                severity=severity,
                title=f"Missing {missing_doc} for Lot {status.lot_number}",
                message=f"Job {status.job_number} ({status.community} Lot {status.lot_number}) is missing required document: {missing_doc}. "
                        f"Start date: {start_date_str if start_date_str else 'Not set'}. "
                        f"Completeness: {status.completeness_percentage:.0f}%",
                plan_id=None,  # Would be set from job data
                community_id=None,
                lot_number=status.lot_number,
                job_id=status.job_id,
                document_type=missing_doc,
                action_url=f"/jobs/{status.job_id}/documents",
            )
            alerts.append(alert)

        return alerts

    async def send_alert(self, alert: DocumentAlert) -> bool:
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

    async def update_document_status(self, document_id: str, status: str) -> bool:
        """Update document status in MindFlow"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.patch(
                    f"{self.api_base_url}/portal-sync/documents/{document_id}",
                    headers={"x-service-token": self.api_token},
                    json={"status": status, "processedAt": datetime.now().isoformat()}
                )
                return response.status_code in (200, 204)
        except Exception as e:
            self.log(f"Error updating document status: {e}", "error")
            return False

    async def archive_document(self, document_id: str, notes: str = None) -> bool:
        """Archive a document (mark as outdated but keep for history)"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.patch(
                    f"{self.api_base_url}/portal-sync/documents/{document_id}/archive",
                    headers={"x-service-token": self.api_token},
                    json={
                        "isArchived": True,
                        "archiveDate": datetime.now().isoformat(),
                        "archiveNotes": notes,
                    }
                )
                return response.status_code in (200, 204)
        except Exception as e:
            self.log(f"Error archiving document: {e}", "error")
            return False

    async def get_completeness_summary(self) -> dict[str, Any]:
        """Get overall document completeness summary"""
        jobs = await self.get_active_jobs()

        summary = {
            "total_jobs": len(jobs),
            "complete_jobs": 0,
            "incomplete_jobs": 0,
            "critical_jobs": 0,  # Jobs starting soon with missing docs
            "by_builder": {},
            "by_community": {},
            "missing_documents": {},
            "timestamp": datetime.now().isoformat(),
        }

        for job in jobs:
            status = await self.check_job_documents(job)
            builder = job.get("builder", "unknown")
            community = job.get("community", "unknown")

            # Count by builder
            if builder not in summary["by_builder"]:
                summary["by_builder"][builder] = {"total": 0, "complete": 0, "incomplete": 0}
            summary["by_builder"][builder]["total"] += 1

            # Count by community
            if community not in summary["by_community"]:
                summary["by_community"][community] = {"total": 0, "complete": 0, "incomplete": 0}
            summary["by_community"][community]["total"] += 1

            if status.is_complete:
                summary["complete_jobs"] += 1
                summary["by_builder"][builder]["complete"] += 1
                summary["by_community"][community]["complete"] += 1
            else:
                summary["incomplete_jobs"] += 1
                summary["by_builder"][builder]["incomplete"] += 1
                summary["by_community"][community]["incomplete"] += 1

                # Track missing document types
                for missing in status.missing_documents:
                    if missing not in summary["missing_documents"]:
                        summary["missing_documents"][missing] = 0
                    summary["missing_documents"][missing] += 1

                # Check if critical (starting soon)
                start_date_str = job.get("startDate")
                if start_date_str:
                    try:
                        start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
                        days_until_start = (start_date - datetime.now(start_date.tzinfo)).days
                        if days_until_start <= 5:
                            summary["critical_jobs"] += 1
                    except (ValueError, TypeError):
                        pass

        return summary
