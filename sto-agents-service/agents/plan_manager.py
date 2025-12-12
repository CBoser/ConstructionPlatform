"""
Plan Manager Agent
Manages plan creation, versioning, and document association for MindFlow.

Functions:
- Create new plans from portal data or manual entry
- Associate documents with plans/elevations
- Track plan versions and vendor information
- Sync plan data to MindFlow database
"""

import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import httpx

from .base import BaseAgent


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class PlanInfo:
    """Plan information from portal or manual entry"""
    code: str                           # "2400", "G21D"
    name: str | None = None             # Human readable name
    customer_plan_code: str | None = None  # Customer's plan code if different
    builder_id: str | None = None       # MindFlow builder/customer UUID
    plan_type: str = "SINGLE_STORY"     # SINGLE_STORY, TWO_STORY, TOWNHOME, etc.
    sqft: int | None = None
    bedrooms: int | None = None
    bathrooms: float | None = None
    garage: str | None = None           # "2-Car", "3-Car"
    style: str | None = None            # "Ranch", "Modern"
    notes: str | None = None

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "code": self.code,
            "name": self.name,
            "customerPlanCode": self.customer_plan_code,
            "builderId": self.builder_id,
            "type": self.plan_type,
            "sqft": self.sqft,
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "garage": self.garage,
            "style": self.style,
            "notes": self.notes,
        }


@dataclass
class ElevationInfo:
    """Elevation information for a plan"""
    code: str                           # "A", "B", "C", "D"
    name: str | None = None             # "Craftsman", "Contemporary"
    description: str | None = None
    architect_designer: str | None = None
    architect_date: datetime | None = None
    structural_engineer: str | None = None
    structural_date: datetime | None = None
    ijoist_company: str | None = None
    ijoist_date: datetime | None = None
    floor_truss_company: str | None = None
    floor_truss_date: datetime | None = None
    roof_truss_company: str | None = None
    roof_truss_date: datetime | None = None

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "code": self.code,
            "name": self.name,
            "description": self.description,
            "architectDesigner": self.architect_designer,
            "architectDesignerDate": self.architect_date.isoformat() if self.architect_date else None,
            "structuralEngineer": self.structural_engineer,
            "structuralEngineerDate": self.structural_date.isoformat() if self.structural_date else None,
            "iJoistCompany": self.ijoist_company,
            "iJoistCompanyDate": self.ijoist_date.isoformat() if self.ijoist_date else None,
            "floorTrussCompany": self.floor_truss_company,
            "floorTrussCompanyDate": self.floor_truss_date.isoformat() if self.floor_truss_date else None,
            "roofTrussCompany": self.roof_truss_company,
            "roofTrussCompanyDate": self.roof_truss_date.isoformat() if self.roof_truss_date else None,
        }


@dataclass
class PlanDocument:
    """Document to associate with a plan"""
    filename: str
    file_type: str                      # PLAN_DRAWING, ELEVATION_DRAWING, SPECIFICATIONS, etc.
    file_path: str                      # Storage path or URL
    file_size: int
    mime_type: str
    version: int = 1
    document_date: datetime = field(default_factory=datetime.now)
    plan_id: str | None = None
    elevation_id: str | None = None
    change_notes: str | None = None

    def to_api_format(self) -> dict:
        """Convert to MindFlow API format"""
        return {
            "fileName": self.filename,
            "fileType": self.file_type,
            "filePath": self.file_path,
            "fileSize": self.file_size,
            "mimeType": self.mime_type,
            "version": self.version,
            "documentDate": self.document_date.isoformat(),
            "planId": self.plan_id,
            "elevationId": self.elevation_id,
            "changeNotes": self.change_notes,
        }


# =============================================================================
# PLAN CODE PARSING
# =============================================================================

# Common plan code patterns
PLAN_CODE_PATTERNS = {
    # Richmond American style: "2400", "2400A", "G21D"
    "richmond": r'^([A-Z]?\d{2,4}[A-Z]?)$',
    # Holt Homes style: "PLAN-1234", "H-2400"
    "holt": r'^([A-Z]+-\d{3,4})$',
    # Generic: Just numbers
    "generic": r'^(\d{3,5})$',
}

# Document type detection
DOC_TYPE_PATTERNS = {
    "PLAN_DRAWING": [
        r'arch.*draw', r'floor.*plan', r'house.*plan', r'plan.*draw',
        r'blueprint', r'layout'
    ],
    "ELEVATION_DRAWING": [
        r'elevation', r'front.*elev', r'rear.*elev', r'side.*elev'
    ],
    "SPECIFICATIONS": [
        r'spec', r'specification', r'option.*sheet'
    ],
    "MATERIAL_LIST": [
        r'material.*list', r'bom', r'bill.*material', r'takeoff'
    ],
    "PRICING_SHEET": [
        r'pricing', r'price.*sheet', r'quote', r'estimate'
    ],
}

# Builder configurations for plan parsing
BUILDER_PLAN_CONFIGS = {
    "richmond_american": {
        "pattern": r'^([A-Z]?\d{2,4})([A-Z])?$',
        "elevation_suffix": True,  # Plan code includes elevation as suffix
        "code_group": 1,
        "elevation_group": 2,
    },
    "holt_homes": {
        "pattern": r'^([A-Z]+-\d{3,4})(?:-([A-Z]))?$',
        "elevation_suffix": False,
        "code_group": 1,
        "elevation_group": 2,
    },
    "manor_homes": {
        "pattern": r'^(\d{3,5})(?:-([A-Z]))?$',
        "elevation_suffix": False,
        "code_group": 1,
        "elevation_group": 2,
    },
}


class PlanManager(BaseAgent):
    """Agent for managing plans, elevations, and plan documents"""

    def __init__(self):
        super().__init__("PlanManager")

        # MindFlow API configuration
        self.api_base_url = self.get_env("MINDFLOW_API_URL", "http://localhost:3001/api/v1")
        self.api_token = self.get_env("PORTAL_SYNC_SECRET", "")

    async def run(self) -> dict[str, Any]:
        """Run plan sync - fetch plans from portals and sync to MindFlow"""
        self.log("Starting plan management sync")

        results = {
            "plans_synced": 0,
            "elevations_synced": 0,
            "documents_synced": 0,
            "errors": [],
            "timestamp": datetime.now().isoformat(),
        }

        try:
            # Get existing plans from MindFlow
            existing_plans = await self.get_existing_plans()
            self.log(f"Found {len(existing_plans)} existing plans in MindFlow")

            # Get plans from portal data (mock for now)
            portal_plans = await self.get_portal_plans()
            self.log(f"Found {len(portal_plans)} plans from portal")

            # Sync new/updated plans
            for plan_info in portal_plans:
                try:
                    synced = await self.sync_plan(plan_info, existing_plans)
                    if synced:
                        results["plans_synced"] += 1
                except Exception as e:
                    results["errors"].append(f"Error syncing plan {plan_info.code}: {str(e)}")

        except Exception as e:
            self.log(f"Error during plan sync: {e}", "error")
            results["errors"].append(str(e))

        self.last_run = datetime.now()
        self.run_count += 1

        return results

    async def get_existing_plans(self) -> dict[str, dict]:
        """Fetch existing plans from MindFlow API"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.api_base_url}/plans",
                    headers={"x-service-token": self.api_token}
                )
                if response.status_code == 200:
                    plans = response.json()
                    return {p["code"]: p for p in plans}
        except Exception as e:
            self.log(f"Error fetching existing plans: {e}", "warning")

        return {}

    async def get_portal_plans(self) -> list[PlanInfo]:
        """
        Get plans from portal data.

        In production, this would:
        1. Query SupplyPro/Hyphen for plan information
        2. Parse plan codes from document filenames
        3. Extract plan details from portal records

        Returns mock data for now.
        """
        # Mock plans based on typical Richmond American plans
        return [
            PlanInfo(
                code="2400",
                name="The Riverside",
                plan_type="SINGLE_STORY",
                sqft=2400,
                bedrooms=4,
                bathrooms=2.5,
                garage="2-Car",
                style="Ranch",
            ),
            PlanInfo(
                code="G21D",
                name="The Ironwood",
                plan_type="TWO_STORY",
                sqft=3200,
                bedrooms=5,
                bathrooms=3.5,
                garage="3-Car",
                style="Modern",
            ),
            PlanInfo(
                code="2800",
                name="The Summit",
                plan_type="TWO_STORY",
                sqft=2800,
                bedrooms=4,
                bathrooms=3.0,
                garage="2-Car",
                style="Contemporary",
            ),
            PlanInfo(
                code="1900",
                name="The Haven",
                plan_type="SINGLE_STORY",
                sqft=1900,
                bedrooms=3,
                bathrooms=2.0,
                garage="2-Car",
                style="Craftsman",
            ),
        ]

    async def sync_plan(self, plan_info: PlanInfo, existing_plans: dict) -> bool:
        """
        Sync a plan to MindFlow database.

        Returns True if plan was created or updated.
        """
        if plan_info.code in existing_plans:
            self.log(f"Plan {plan_info.code} already exists, skipping")
            return False

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/plans",
                    headers={"x-service-token": self.api_token},
                    json=plan_info.to_api_format()
                )

                if response.status_code in (200, 201):
                    self.log(f"Synced plan: {plan_info.code}")
                    return True
                else:
                    self.log(f"Failed to sync plan {plan_info.code}: {response.status_code}", "warning")
                    return False

        except Exception as e:
            self.log(f"Error syncing plan {plan_info.code}: {e}", "error")
            return False

    async def create_plan(self, plan_info: PlanInfo) -> dict | None:
        """
        Create a new plan in MindFlow.

        Returns the created plan data or None on error.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/plans",
                    headers={"x-service-token": self.api_token},
                    json=plan_info.to_api_format()
                )

                if response.status_code in (200, 201):
                    return response.json()
                else:
                    self.log(f"Failed to create plan: {response.status_code}", "error")
                    return None

        except Exception as e:
            self.log(f"Error creating plan: {e}", "error")
            return None

    async def add_elevation(self, plan_id: str, elevation: ElevationInfo) -> dict | None:
        """
        Add an elevation to a plan.

        Returns the created elevation data or None on error.
        """
        try:
            data = elevation.to_api_format()
            data["planId"] = plan_id

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/elevations",
                    headers={"x-service-token": self.api_token},
                    json=data
                )

                if response.status_code in (200, 201):
                    return response.json()
                else:
                    self.log(f"Failed to create elevation: {response.status_code}", "error")
                    return None

        except Exception as e:
            self.log(f"Error creating elevation: {e}", "error")
            return None

    async def associate_document(self, document: PlanDocument) -> dict | None:
        """
        Associate a document with a plan or elevation.

        Returns the created document record or None on error.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/plan-documents",
                    headers={"x-service-token": self.api_token},
                    json=document.to_api_format()
                )

                if response.status_code in (200, 201):
                    return response.json()
                else:
                    self.log(f"Failed to associate document: {response.status_code}", "error")
                    return None

        except Exception as e:
            self.log(f"Error associating document: {e}", "error")
            return None

    def parse_plan_code(self, text: str, builder: str = "richmond_american") -> dict[str, str | None]:
        """
        Parse plan code from text (filename, description, etc.)

        Returns dict with plan_code and elevation_code.
        """
        result = {"plan_code": None, "elevation_code": None}

        config = BUILDER_PLAN_CONFIGS.get(builder, BUILDER_PLAN_CONFIGS["richmond_american"])
        pattern = config["pattern"]

        match = re.match(pattern, text.strip().upper())
        if match:
            result["plan_code"] = match.group(config["code_group"])
            if config["elevation_group"] and match.lastindex >= config["elevation_group"]:
                result["elevation_code"] = match.group(config["elevation_group"])

        return result

    def detect_document_type(self, filename: str) -> str:
        """
        Detect document type from filename.

        Returns DocumentType enum value.
        """
        filename_lower = filename.lower()

        for doc_type, patterns in DOC_TYPE_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, filename_lower):
                    return doc_type

        return "OTHER"

    def parse_filename(self, filename: str, builder: str = "richmond_american") -> dict[str, Any]:
        """
        Parse a document filename to extract plan, elevation, and type info.

        Expected patterns:
        - "2400A_ArchDrawings.pdf" -> plan=2400, elevation=A, type=PLAN_DRAWING
        - "G21D-B_Specifications.pdf" -> plan=G21D, elevation=B, type=SPECIFICATIONS
        - "Plan 2800 Floor Layout.pdf" -> plan=2800, type=PLAN_DRAWING
        """
        result = {
            "plan_code": None,
            "elevation_code": None,
            "document_type": self.detect_document_type(filename),
            "original_filename": filename,
        }

        # Remove file extension
        name = filename.rsplit('.', 1)[0] if '.' in filename else filename

        # Try to extract plan code
        # Pattern 1: Code at start with optional elevation suffix
        config = BUILDER_PLAN_CONFIGS.get(builder, BUILDER_PLAN_CONFIGS["richmond_american"])

        # Look for plan code patterns in the filename
        parts = re.split(r'[_\-\s]+', name)
        for part in parts:
            parsed = self.parse_plan_code(part, builder)
            if parsed["plan_code"]:
                result["plan_code"] = parsed["plan_code"]
                result["elevation_code"] = parsed["elevation_code"]
                break

        return result
