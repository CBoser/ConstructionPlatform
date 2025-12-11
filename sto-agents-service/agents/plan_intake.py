"""
Plan Intake Monitor Agent

This agent monitors for new documents from file sources:
- OneDrive/SharePoint folders
- Local file system (if configured)
- Email attachments (future)

Documents are routed based on naming conventions and folder structure.
"""

import os
from datetime import datetime
from typing import Any

from .base import BaseAgent


class PlanIntakeMonitor(BaseAgent):
    """Agent for monitoring and routing new documents"""

    def __init__(self):
        super().__init__("PlanIntakeMonitor")

        # OneDrive/SharePoint configuration
        self.onedrive_client_id = self.get_env("ONEDRIVE_CLIENT_ID")
        self.onedrive_client_secret = self.get_env("ONEDRIVE_CLIENT_SECRET")
        self.onedrive_tenant_id = self.get_env("ONEDRIVE_TENANT_ID")
        self.watch_folder = self.get_env("ONEDRIVE_WATCH_FOLDER", "/Plans/Incoming")

        # Local file system configuration (optional)
        self.local_watch_path = self.get_env("LOCAL_WATCH_PATH")

        # Document type patterns for routing
        self.doc_patterns = {
            "ARCH_DRAWINGS": ["arch", "architectural", "floor plan", "elevation"],
            "CALC_PKG": ["calc", "calculation", "engineering"],
            "TRUSS_CALCS": ["truss", "roof truss"],
            "FLOOR_TRUSS": ["floor truss", "floor system"],
            "IJOIST": ["i-joist", "ijoist", "floor joist"],
            "STRUCTURAL": ["structural", "framing"],
            "SPEC_SHEET": ["spec", "specification"],
        }

    async def run(self) -> dict[str, Any]:
        """Run full scan and return results"""
        self.log("Starting plan intake scan")

        documents = await self.scan_for_new_documents()

        self.last_run = datetime.now()
        self.run_count += 1

        return {
            "documents": documents,
            "timestamp": self.last_run.isoformat(),
        }

    async def scan_for_new_documents(self) -> list[dict[str, Any]]:
        """
        Scan configured sources for new documents.

        Returns list of documents in format:
        {
            "external_id": "onedrive-abc123",  # Unique ID from source
            "filename": "2400A_ArchDrawings.pdf", # Original filename
            "doc_type": "ARCH_DRAWINGS",       # Detected document type
            "file_url": "https://...",         # Download URL
            "file_size": 2048576,              # Size in bytes
            "customer_id": null,               # MindFlow customer UUID (if detected)
            "community_id": null,              # MindFlow community UUID (if detected)
            "plan_id": null,                   # MindFlow plan UUID (if detected)
            "lot_number": null                 # Lot number (if detected)
        }
        """
        self.log("Scanning for new documents")
        documents = []

        # Scan OneDrive if configured
        if self.onedrive_client_id:
            onedrive_docs = await self._scan_onedrive()
            documents.extend(onedrive_docs)

        # Scan local path if configured
        if self.local_watch_path:
            local_docs = await self._scan_local()
            documents.extend(local_docs)

        self.log(f"Found {len(documents)} new documents")
        return documents

    async def _scan_onedrive(self) -> list[dict[str, Any]]:
        """
        Scan OneDrive/SharePoint for new documents.

        TODO: Implement using Microsoft Graph API
        https://docs.microsoft.com/en-us/graph/api/resources/onedrive
        """
        self.log("Scanning OneDrive")

        if not all([self.onedrive_client_id, self.onedrive_client_secret]):
            self.log("OneDrive credentials not configured", "warning")
            return []

        # TODO: Implement OneDrive scanning
        # 1. Authenticate with Microsoft Graph
        # 2. List files in watch folder
        # 3. Filter for new files (since last scan)
        # 4. Parse filename for metadata
        # 5. Return document list

        return []

    async def _scan_local(self) -> list[dict[str, Any]]:
        """
        Scan local file system for new documents.
        """
        self.log(f"Scanning local path: {self.local_watch_path}")

        if not self.local_watch_path or not os.path.exists(self.local_watch_path):
            self.log("Local watch path not configured or doesn't exist", "warning")
            return []

        # TODO: Implement local file scanning
        # 1. List files in watch path
        # 2. Filter for new files (modified since last scan)
        # 3. Parse filename for metadata
        # 4. Return document list

        return []

    def detect_doc_type(self, filename: str) -> str | None:
        """
        Detect document type from filename.

        Uses pattern matching against configured doc_patterns.
        """
        filename_lower = filename.lower()

        for doc_type, patterns in self.doc_patterns.items():
            for pattern in patterns:
                if pattern in filename_lower:
                    return doc_type

        return None

    def parse_filename(self, filename: str) -> dict[str, Any]:
        """
        Parse filename to extract metadata.

        Expected patterns:
        - "2400A_ArchDrawings.pdf" -> plan_code=2400, elevation=A, doc_type=ARCH_DRAWINGS
        - "SunriseMeadows_Lot42_TrussCalcs.pdf" -> community, lot, doc_type

        Returns dict with extracted metadata.
        """
        metadata = {
            "plan_code": None,
            "elevation": None,
            "community": None,
            "lot_number": None,
            "doc_type": self.detect_doc_type(filename),
        }

        # TODO: Implement filename parsing based on your naming conventions

        return metadata
