"""
Completeness Checker Agent (Web-Adapted)

Validates that jobs have all required documents before estimating.
Adapted for MindFlow web platform - checks database instead of local folders.

Based on: sto-agents-complete/agents/completeness_checker.py
"""

import os
import logging
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Set

import httpx

from .base import BaseAgent

logger = logging.getLogger("completeness_checker")


# =============================================================================
# CONFIGURATION
# =============================================================================

# Required documents by builder
REQUIRED_DOCUMENTS = {
    "richmond_american": {
        "required": [
            "ARCH_DRAWINGS",
            "CALC_PKG",
        ],
        "optional": [
            "FLOOR_TRUSS_CALCS",
            "FLOOR_TRUSS_LAYOUT",
            "ROOF_TRUSS_CALCS",
            "ROOF_TRUSS_LAYOUT",
            "PLOT_PLAN",
            "JIO",
            "HCO",
        ],
    },
    "holt_homes": {
        "required": [
            "PLANS",
            "STRUCTURAL",
        ],
        "optional": [
            "TRUSS_LAYOUT",
            "PLOT_PLAN",
        ],
    },
    "manor_homes": {
        "required": [
            "PLANS",
        ],
        "optional": [
            "STRUCTURAL",
            "PLOT_PLAN",
        ],
    },
    "default": {
        "required": [
            "ARCH_DRAWINGS",
            "CALC_PKG",
        ],
        "optional": [
            "TRUSS_CALCS",
            "PLOT_PLAN",
        ],
    }
}


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class DocumentCheck:
    """Result of checking for a specific document"""
    doc_type: str
    required: bool
    found: bool
    file_name: Optional[str] = None


@dataclass
class JobCompleteness:
    """Completeness status of a single job"""
    builder: str
    community: str
    community_id: Optional[str]
    lot: str
    job_id: Optional[str]
    plan_code: Optional[str]
    elevation: Optional[str]
    documents: List[DocumentCheck] = field(default_factory=list)
    is_complete: bool = False
    missing_required: List[str] = field(default_factory=list)
    missing_optional: List[str] = field(default_factory=list)
    found_documents: List[str] = field(default_factory=list)

    def to_alert_format(self) -> Dict[str, Any]:
        """Convert to alert format for API"""
        return {
            "type": "warning" if self.missing_required else "info",
            "source": "completeness_check",
            "title": f"Missing documents: {self.community} Lot {self.lot}",
            "message": f"Missing: {', '.join(self.missing_required[:3])}",
            "community_id": self.community_id,
            "details": {
                "builder": self.builder,
                "lot": self.lot,
                "plan_code": self.plan_code,
                "missing_required": self.missing_required,
                "missing_optional": self.missing_optional,
                "found": self.found_documents,
            }
        }


@dataclass
class CompletenessReport:
    """Complete report of document completeness"""
    timestamp: str
    total_jobs: int = 0
    complete: int = 0
    incomplete: int = 0
    jobs: List[JobCompleteness] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


# =============================================================================
# MAIN AGENT CLASS
# =============================================================================

class CompletenessChecker(BaseAgent):
    """Agent for checking document completeness via MindFlow API"""

    def __init__(self):
        super().__init__("CompletenessChecker")

        # MindFlow API configuration
        self.api_url = self.get_env("MINDFLOW_API_URL", "http://localhost:3000")
        self.service_token = self.get_env("PORTAL_SYNC_SECRET", "")

        # Document requirements
        self.requirements = REQUIRED_DOCUMENTS

    async def run(self) -> Dict[str, Any]:
        """Run full completeness check"""
        self.log("Starting completeness check")

        report = await self._run_check()

        self.last_run = datetime.now()
        self.run_count += 1

        # Generate alerts for incomplete jobs
        alerts = self._generate_alerts(report)

        return {
            "success": True,
            "timestamp": report.timestamp,
            "summary": {
                "total_jobs": report.total_jobs,
                "complete": report.complete,
                "incomplete": report.incomplete,
            },
            "alerts": alerts,
            "incomplete_jobs": [
                {
                    "community": j.community,
                    "lot": j.lot,
                    "missing_required": j.missing_required,
                    "missing_optional": j.missing_optional,
                }
                for j in report.jobs if not j.is_complete
            ],
            "errors": report.errors,
        }

    async def _run_check(self) -> CompletenessReport:
        """Run the completeness check against MindFlow API"""
        report = CompletenessReport(
            timestamp=datetime.now().isoformat(),
        )

        try:
            # Get active jobs from MindFlow API
            jobs = await self._get_active_jobs()

            for job in jobs:
                job_result = await self._check_job(job)
                report.jobs.append(job_result)
                report.total_jobs += 1

                if job_result.is_complete:
                    report.complete += 1
                else:
                    report.incomplete += 1

        except Exception as e:
            self.log(f"Error during completeness check: {e}", "error")
            report.errors.append(str(e))

        self.log(f"Check complete: {report.complete}/{report.total_jobs} jobs complete")
        return report

    async def _get_active_jobs(self) -> List[Dict[str, Any]]:
        """Fetch active jobs from MindFlow API"""
        if not self.service_token:
            self.log("Service token not configured, using mock data", "warning")
            return self._get_mock_jobs()

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_url}/api/v1/jobs",
                    headers={
                        "x-service-token": self.service_token,
                        "Content-Type": "application/json",
                    },
                    params={"status": "active"},
                )
                response.raise_for_status()
                data = response.json()
                return data.get("jobs", data) if isinstance(data, dict) else data

        except Exception as e:
            self.log(f"Failed to fetch jobs from API: {e}", "warning")
            return self._get_mock_jobs()

    async def _check_job(self, job: Dict[str, Any]) -> JobCompleteness:
        """Check completeness for a single job"""
        builder = job.get("builder", "default")
        builder_key = builder.lower().replace(" ", "_") if builder else "default"

        result = JobCompleteness(
            builder=builder,
            community=job.get("community", "Unknown"),
            community_id=job.get("community_id"),
            lot=str(job.get("lot_number", job.get("lot", "?"))),
            job_id=job.get("id"),
            plan_code=job.get("plan_code"),
            elevation=job.get("elevation"),
        )

        # Get requirements for this builder
        reqs = self.requirements.get(builder_key, self.requirements["default"])
        required_docs = reqs.get("required", [])
        optional_docs = reqs.get("optional", [])

        # Get existing documents for this job
        existing_docs = await self._get_job_documents(job.get("id"))

        # Check required documents
        for doc_type in required_docs:
            found = self._has_document(existing_docs, doc_type)
            result.documents.append(DocumentCheck(
                doc_type=doc_type,
                required=True,
                found=found,
            ))
            if found:
                result.found_documents.append(doc_type)
            else:
                result.missing_required.append(doc_type)

        # Check optional documents
        for doc_type in optional_docs:
            if self._should_have_doc(job, doc_type):
                found = self._has_document(existing_docs, doc_type)
                result.documents.append(DocumentCheck(
                    doc_type=doc_type,
                    required=False,
                    found=found,
                ))
                if found:
                    result.found_documents.append(doc_type)
                else:
                    result.missing_optional.append(doc_type)

        # Job is complete if no required docs are missing
        result.is_complete = len(result.missing_required) == 0

        return result

    async def _get_job_documents(self, job_id: Optional[str]) -> List[Dict[str, Any]]:
        """Get documents for a specific job from API"""
        if not job_id or not self.service_token:
            return []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_url}/api/v1/jobs/{job_id}/documents",
                    headers={
                        "x-service-token": self.service_token,
                        "Content-Type": "application/json",
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("documents", data) if isinstance(data, dict) else data
        except Exception as e:
            self.log(f"Failed to fetch documents for job {job_id}: {e}", "warning")

        return []

    def _has_document(self, documents: List[Dict[str, Any]], doc_type: str) -> bool:
        """Check if document type exists in document list"""
        doc_type_lower = doc_type.lower().replace("_", " ")

        for doc in documents:
            doc_name = (doc.get("doc_type") or doc.get("filename") or "").lower()
            if doc_type_lower in doc_name or doc_name in doc_type_lower:
                return True

            # Check filename patterns
            filename = (doc.get("filename") or "").lower()
            if doc_type_lower.replace(" ", "") in filename.replace(" ", ""):
                return True

        return False

    def _should_have_doc(self, job: Dict[str, Any], doc_type: str) -> bool:
        """Determine if a job should have a specific optional document"""
        plan_type = job.get("plan_type", job.get("type", "")).upper()

        # Floor truss/I-joist docs for multi-story
        if doc_type in ["FLOOR_TRUSS_CALCS", "FLOOR_TRUSS_LAYOUT", "IJOIST"]:
            return plan_type in ["TWO_STORY", "THREE_STORY", "MULTI_STORY"]

        # Roof truss docs for all plans
        if doc_type in ["ROOF_TRUSS_CALCS", "ROOF_TRUSS_LAYOUT"]:
            return True

        return False

    def _generate_alerts(self, report: CompletenessReport) -> List[Dict[str, Any]]:
        """Generate alerts from completeness report"""
        alerts = []

        # Group by community for summary alerts
        by_community: Dict[str, List[JobCompleteness]] = {}
        for job in report.jobs:
            if not job.is_complete:
                key = job.community
                if key not in by_community:
                    by_community[key] = []
                by_community[key].append(job)

        # Create alerts per community
        for community, incomplete_jobs in by_community.items():
            if len(incomplete_jobs) == 1:
                # Single job - detailed alert
                alerts.append(incomplete_jobs[0].to_alert_format())
            else:
                # Multiple jobs - summary alert
                alerts.append({
                    "type": "warning",
                    "source": "completeness_check",
                    "title": f"{len(incomplete_jobs)} incomplete jobs in {community}",
                    "message": f"Lots: {', '.join(j.lot for j in incomplete_jobs[:5])}",
                    "details": {
                        "community": community,
                        "incomplete_count": len(incomplete_jobs),
                        "jobs": [
                            {"lot": j.lot, "missing": j.missing_required}
                            for j in incomplete_jobs[:10]
                        ]
                    }
                })

        return alerts

    def _get_mock_jobs(self) -> List[Dict[str, Any]]:
        """Return mock jobs for testing"""
        return [
            {
                "id": "job-001",
                "builder": "Richmond American",
                "community": "North Haven Phase 4",
                "community_id": "comm-001",
                "lot_number": 127,
                "plan_code": "G892",
                "elevation": "A",
                "plan_type": "TWO_STORY",
                "status": "IN_PROGRESS",
            },
            {
                "id": "job-002",
                "builder": "Richmond American",
                "community": "Luden Estates Phase 3",
                "community_id": "comm-002",
                "lot_number": 93,
                "plan_code": "G601",
                "elevation": "B",
                "plan_type": "SINGLE_STORY",
                "status": "ESTIMATED",
            },
        ]

    async def scan_all_communities(self) -> List[Dict[str, Any]]:
        """Scan all communities - returns missing documents list"""
        report = await self._run_check()
        missing = []

        for job in report.jobs:
            if not job.is_complete:
                for doc_type in job.missing_required:
                    missing.append({
                        "community": job.community,
                        "community_id": job.community_id,
                        "lot": job.lot,
                        "plan_code": job.plan_code,
                        "elevation": job.elevation,
                        "doc_type": doc_type,
                        "severity": "critical",
                    })
                for doc_type in job.missing_optional:
                    missing.append({
                        "community": job.community,
                        "community_id": job.community_id,
                        "lot": job.lot,
                        "plan_code": job.plan_code,
                        "elevation": job.elevation,
                        "doc_type": doc_type,
                        "severity": "warning",
                    })

        return missing
