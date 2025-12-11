"""
Completeness Checker Agent

This agent scans for missing required documents and generates alerts.

Required documents per plan/elevation:
- Architectural drawings
- Structural calculations
- Truss calculations
- I-joist calculations (if applicable)

The agent compares what should exist against what has been received.
"""

import os
from datetime import datetime
from typing import Any

import httpx

from .base import BaseAgent


class CompletenessChecker(BaseAgent):
    """Agent for checking document completeness"""

    def __init__(self):
        super().__init__("CompletenessChecker")

        # MindFlow API configuration
        self.api_url = self.get_env("MINDFLOW_API_URL", "http://localhost:3000")
        self.service_token = self.get_env("PORTAL_SYNC_SECRET", "")

        # Required documents per plan
        self.required_docs = [
            "ARCH_DRAWINGS",
            "CALC_PKG",
            "TRUSS_CALCS",
        ]

        # Optional but recommended docs
        self.optional_docs = [
            "FLOOR_TRUSS",
            "IJOIST",
            "SPEC_SHEET",
        ]

    async def run(self) -> dict[str, Any]:
        """Run full completeness check"""
        self.log("Starting completeness check")

        missing = await self.scan_all_communities()

        self.last_run = datetime.now()
        self.run_count += 1

        return {
            "missing": missing,
            "timestamp": self.last_run.isoformat(),
        }

    async def scan_all_communities(self) -> list[dict[str, Any]]:
        """
        Scan all active communities for missing documents.

        Returns list of missing document records:
        {
            "community": "Sunrise Meadows",
            "community_id": "uuid-...",
            "lot": 42,
            "plan_code": "2400",
            "elevation": "A",
            "doc_type": "TRUSS_CALCS",
            "severity": "critical"  # critical if required, warning if optional
        }
        """
        self.log("Scanning all communities for missing documents")

        missing = []

        # Get active communities from MindFlow API
        communities = await self._get_active_communities()

        for community in communities:
            community_missing = await self._check_community(community)
            missing.extend(community_missing)

        self.log(f"Found {len(missing)} missing documents across {len(communities)} communities")
        return missing

    async def _get_active_communities(self) -> list[dict[str, Any]]:
        """
        Fetch active communities from MindFlow API.

        TODO: Call the customers API to get communities with active jobs.
        """
        self.log("Fetching active communities from MindFlow")

        if not self.service_token:
            self.log("Service token not configured, returning empty list", "warning")
            return []

        # TODO: Implement API call to get communities
        # GET /api/v1/customers?include=communities&status=active

        return []

    async def _check_community(self, community: dict[str, Any]) -> list[dict[str, Any]]:
        """
        Check a single community for missing documents.
        """
        missing = []
        community_id = community.get("id")
        community_name = community.get("name", "Unknown")

        # Get jobs in this community
        jobs = community.get("jobs", [])

        for job in jobs:
            # Skip completed/cancelled jobs
            if job.get("status") in ["COMPLETED", "CANCELLED"]:
                continue

            plan_code = job.get("plan_code")
            elevation = job.get("elevation")
            lot = job.get("lot_number")

            # Get existing documents for this job
            existing_docs = await self._get_existing_docs(job.get("id"))

            # Check required documents
            for doc_type in self.required_docs:
                if doc_type not in existing_docs:
                    missing.append({
                        "community": community_name,
                        "community_id": community_id,
                        "lot": lot,
                        "plan_code": plan_code,
                        "elevation": elevation,
                        "doc_type": doc_type,
                        "severity": "critical",
                    })

            # Check optional documents
            for doc_type in self.optional_docs:
                if doc_type not in existing_docs:
                    # Only warn for certain plan types
                    if self._should_have_doc(job, doc_type):
                        missing.append({
                            "community": community_name,
                            "community_id": community_id,
                            "lot": lot,
                            "plan_code": plan_code,
                            "elevation": elevation,
                            "doc_type": doc_type,
                            "severity": "warning",
                        })

        return missing

    async def _get_existing_docs(self, job_id: str | None) -> set[str]:
        """
        Get set of document types that exist for a job.

        TODO: Query MindFlow API for existing documents.
        """
        if not job_id:
            return set()

        # TODO: Implement API call
        # GET /api/v1/jobs/{job_id}/documents

        return set()

    def _should_have_doc(self, job: dict[str, Any], doc_type: str) -> bool:
        """
        Determine if a job should have a specific optional document.

        Logic:
        - FLOOR_TRUSS: Required for multi-story plans
        - IJOIST: Required for plans with engineered floors
        """
        plan_type = job.get("plan_type", "")

        if doc_type == "FLOOR_TRUSS":
            # Required for multi-story
            return plan_type in ["TWO_STORY", "THREE_STORY"]

        if doc_type == "IJOIST":
            # Usually required for engineered floor systems
            return plan_type in ["TWO_STORY", "THREE_STORY"]

        return False
