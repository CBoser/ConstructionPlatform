"""
Excel Importer Agent
Imports data from Excel workbooks and syncs to MindFlow database.

Supported import types:
- Pride Board → Jobs
- PDSS → Job status tracking
- Contract Analysis → Customer/pricing data
- EPO Reports → Portal orders
- Richmond Subdivisions → Communities

This agent can:
1. Receive Excel files via API upload
2. Parse and transform data based on workbook type
3. Sync transformed data to MindFlow database
"""

import io
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import httpx

from .base import BaseAgent

# Optional pandas import - gracefully handle if not installed
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    pd = None


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class ImportResult:
    """Result of an import operation"""
    source_type: str
    records_found: int = 0
    records_imported: int = 0
    records_updated: int = 0
    records_skipped: int = 0
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        return {
            "sourceType": self.source_type,
            "recordsFound": self.records_found,
            "recordsImported": self.records_imported,
            "recordsUpdated": self.records_updated,
            "recordsSkipped": self.records_skipped,
            "errors": self.errors,
            "warnings": self.warnings,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class JobRecord:
    """Job record from Pride Board or PDSS"""
    job_number: str
    builder: str
    subdivision: str
    lot: str
    plan_code: str | None = None
    elevation: str | None = None
    address: str | None = None
    status: str = "DRAFT"
    start_date: datetime | None = None
    notes: str | None = None

    def to_api_format(self) -> dict:
        return {
            "jobNumber": self.job_number,
            "builder": self.builder,
            "subdivision": self.subdivision,
            "lot": self.lot,
            "planCode": self.plan_code,
            "elevation": self.elevation,
            "address": self.address,
            "status": self.status,
            "startDate": self.start_date.isoformat() if self.start_date else None,
            "notes": self.notes,
        }


@dataclass
class CommunityRecord:
    """Community/subdivision record"""
    name: str
    builder: str
    city: str | None = None
    county: str | None = None
    shipping_yard: str | None = None
    lot_prefix: str | None = None
    total_lots: int | None = None
    is_active: bool = True

    def to_api_format(self) -> dict:
        return {
            "name": self.name,
            "builder": self.builder,
            "city": self.city,
            "county": self.county,
            "shippingYard": self.shipping_yard,
            "lotPrefix": self.lot_prefix,
            "totalLots": self.total_lots,
            "isActive": self.is_active,
        }


@dataclass
class EPORecord:
    """EPO (Electronic Purchase Order) record"""
    external_id: str
    portal: str = "supplypro"
    order_type: str = "epo"
    category: str | None = None
    status: str = "pending"
    amount: float = 0.0
    description: str | None = None
    community: str | None = None
    lot_number: int | None = None
    due_date: datetime | None = None

    def to_api_format(self) -> dict:
        return {
            "external_id": self.external_id,
            "portal": self.portal,
            "order_type": self.order_type,
            "category": self.category,
            "status": self.status,
            "amount": self.amount,
            "description": self.description,
            "community": self.community,
            "lot_number": self.lot_number,
            "due_date": self.due_date.isoformat() if self.due_date else None,
        }


# =============================================================================
# COLUMN MAPPINGS
# =============================================================================

# Common column name variations for each field
COLUMN_MAPPINGS = {
    "job_number": ["Job #", "Job Number", "JobNumber", "Job", "JOB #", "Job No"],
    "builder": ["Builder", "BUILDER", "Builder Name", "Customer"],
    "subdivision": ["Subdivision", "Community", "SUBDIVISION", "Sub", "Project"],
    "lot": ["Lot", "Lot #", "LOT", "Lot Number", "Lot No"],
    "plan": ["Plan", "Plan Code", "PLAN", "Plan Name", "Plan #"],
    "elevation": ["Elevation", "Elev", "ELEVATION", "Elev Code"],
    "status": ["Status", "STATUS", "Job Status", "State"],
    "address": ["Address", "ADDRESS", "Street Address", "Street"],
    "start_date": ["Start Date", "Start", "START DATE", "Scheduled Start"],
    "city": ["City", "CITY"],
    "county": ["County", "COUNTY"],
    "amount": ["Amount", "Total", "Price", "$", "Cost"],
    "category": ["Category", "Type", "Material", "Product"],
    "due_date": ["Due Date", "Due", "Delivery Date", "Expected"],
}

# Builder code mapping
BUILDER_CODES = {
    "richmond": "richmond_american",
    "richmond american": "richmond_american",
    "rah": "richmond_american",
    "holt": "holt_homes",
    "holt homes": "holt_homes",
    "manor": "manor_homes",
    "manor hsr": "manor_homes",
    "sekisui": "sekisui_house",
    "sekisui house": "sekisui_house",
}


# =============================================================================
# EXCEL IMPORTER AGENT
# =============================================================================

class ExcelImporter(BaseAgent):
    """Agent for importing data from Excel workbooks"""

    def __init__(self):
        super().__init__("ExcelImporter")

        # MindFlow API configuration
        self.api_base_url = self.get_env("MINDFLOW_API_URL", "http://localhost:3001/api/v1")
        self.api_token = self.get_env("PORTAL_SYNC_SECRET", "")

        if not PANDAS_AVAILABLE:
            self.log("pandas not installed - Excel import will be limited", "warning")

    async def run(self) -> dict[str, Any]:
        """Run is not used for this agent - use import_* methods directly"""
        return {
            "message": "ExcelImporter is designed for direct method calls, not scheduled runs",
            "available_methods": [
                "import_pride_board",
                "import_pdss",
                "import_epo_report",
                "import_subdivisions",
            ],
        }

    def _find_column(self, df, field_name: str) -> str | None:
        """Find actual column name from variations"""
        variations = COLUMN_MAPPINGS.get(field_name, [field_name])
        for var in variations:
            if var in df.columns:
                return var
            # Case-insensitive match
            for col in df.columns:
                if col.lower() == var.lower():
                    return col
        return None

    def _get_builder_code(self, builder_name: str) -> str:
        """Normalize builder name to code"""
        if not builder_name:
            return "unknown"
        name_lower = builder_name.lower().strip()
        for key, code in BUILDER_CODES.items():
            if key in name_lower:
                return code
        return "unknown"

    def _safe_str(self, value) -> str | None:
        """Safely convert value to string"""
        if pd is None:
            return str(value) if value else None
        if pd.isna(value):
            return None
        return str(value).strip() if value else None

    def _safe_float(self, value) -> float:
        """Safely convert value to float"""
        if pd is None:
            try:
                return float(value) if value else 0.0
            except (ValueError, TypeError):
                return 0.0
        if pd.isna(value):
            return 0.0
        try:
            # Handle currency strings
            if isinstance(value, str):
                value = re.sub(r'[,$]', '', value)
            return float(value)
        except (ValueError, TypeError):
            return 0.0

    def _safe_int(self, value) -> int | None:
        """Safely convert value to int"""
        if pd is None:
            try:
                return int(value) if value else None
            except (ValueError, TypeError):
                return None
        if pd.isna(value):
            return None
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None

    def _parse_date(self, value) -> datetime | None:
        """Parse date from various formats"""
        if pd is None or value is None:
            return None
        if pd.isna(value):
            return None
        if isinstance(value, datetime):
            return value
        if hasattr(value, 'to_pydatetime'):
            return value.to_pydatetime()
        try:
            return pd.to_datetime(value)
        except (ValueError, TypeError):
            return None

    # =========================================================================
    # PRIDE BOARD IMPORT
    # =========================================================================

    async def import_pride_board(self, file_content: bytes, filename: str = "pride_board.xlsx") -> ImportResult:
        """
        Import jobs from Pride Board Excel file.

        Pride Board contains active jobs with scheduling information.
        """
        if not PANDAS_AVAILABLE:
            return ImportResult(
                source_type="pride_board",
                errors=["pandas not installed - cannot parse Excel files"],
            )

        result = ImportResult(source_type="pride_board")

        try:
            # Read Excel file
            df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
            result.records_found = len(df)
            self.log(f"Pride Board: Found {len(df)} rows")

            # Find columns
            col_job = self._find_column(df, "job_number")
            col_builder = self._find_column(df, "builder")
            col_sub = self._find_column(df, "subdivision")
            col_lot = self._find_column(df, "lot")
            col_plan = self._find_column(df, "plan")
            col_elev = self._find_column(df, "elevation")
            col_status = self._find_column(df, "status")
            col_address = self._find_column(df, "address")
            col_start = self._find_column(df, "start_date")

            if not col_job:
                result.errors.append("Could not find Job Number column")
                return result

            # Transform rows to jobs
            jobs = []
            for idx, row in df.iterrows():
                job_number = self._safe_str(row.get(col_job) if col_job else None)
                if not job_number or job_number.lower() == 'nan':
                    result.records_skipped += 1
                    continue

                job = JobRecord(
                    job_number=job_number,
                    builder=self._get_builder_code(self._safe_str(row.get(col_builder) if col_builder else None)),
                    subdivision=self._safe_str(row.get(col_sub) if col_sub else None) or "Unknown",
                    lot=self._safe_str(row.get(col_lot) if col_lot else None) or "0",
                    plan_code=self._safe_str(row.get(col_plan) if col_plan else None),
                    elevation=self._safe_str(row.get(col_elev) if col_elev else None),
                    address=self._safe_str(row.get(col_address) if col_address else None),
                    status=self._map_job_status(self._safe_str(row.get(col_status) if col_status else None)),
                    start_date=self._parse_date(row.get(col_start) if col_start else None),
                )
                jobs.append(job)

            # Sync to API
            for job in jobs:
                try:
                    success = await self._sync_job(job)
                    if success:
                        result.records_imported += 1
                    else:
                        result.records_skipped += 1
                except Exception as e:
                    result.errors.append(f"Job {job.job_number}: {str(e)}")

            self.log(f"Pride Board import complete: {result.records_imported} imported")

        except Exception as e:
            self.log(f"Pride Board import error: {e}", "error")
            result.errors.append(str(e))

        return result

    def _map_job_status(self, status: str | None) -> str:
        """Map Pride Board status to MindFlow JobStatus"""
        if not status:
            return "DRAFT"
        status_lower = status.lower()
        if "complete" in status_lower or "done" in status_lower:
            return "COMPLETED"
        if "progress" in status_lower or "active" in status_lower or "started" in status_lower:
            return "IN_PROGRESS"
        if "approved" in status_lower:
            return "APPROVED"
        if "estimated" in status_lower or "quoted" in status_lower:
            return "ESTIMATED"
        if "cancel" in status_lower:
            return "CANCELLED"
        return "DRAFT"

    async def _sync_job(self, job: JobRecord) -> bool:
        """Sync a job record to MindFlow"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/jobs",
                    headers={"x-service-token": self.api_token},
                    json=job.to_api_format()
                )
                return response.status_code in (200, 201)
        except Exception as e:
            self.log(f"Error syncing job: {e}", "error")
            return False

    # =========================================================================
    # PDSS IMPORT
    # =========================================================================

    async def import_pdss(self, file_content: bytes, filename: str = "pdss.xlsx") -> ImportResult:
        """
        Import job status data from PDSS (Plan Data Status Sheet).

        PDSS tracks:
        - Plan status (New, In Progress, Complete)
        - Takeoff status
        - Quote status
        - Document completeness
        """
        if not PANDAS_AVAILABLE:
            return ImportResult(
                source_type="pdss",
                errors=["pandas not installed - cannot parse Excel files"],
            )

        result = ImportResult(source_type="pdss")

        try:
            df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
            result.records_found = len(df)
            self.log(f"PDSS: Found {len(df)} rows")

            # Find columns
            col_sub = self._find_column(df, "subdivision")
            col_lot = self._find_column(df, "lot")
            col_builder = self._find_column(df, "builder")
            col_plan = self._find_column(df, "plan")
            col_status = self._find_column(df, "status")

            # Process rows
            for idx, row in df.iterrows():
                subdivision = self._safe_str(row.get(col_sub) if col_sub else None)
                lot = self._safe_str(row.get(col_lot) if col_lot else None)

                if not subdivision or not lot:
                    result.records_skipped += 1
                    continue

                # Generate job number from subdivision + lot
                job_number = f"{subdivision[:4].upper()}-{lot}"

                job = JobRecord(
                    job_number=job_number,
                    builder=self._get_builder_code(self._safe_str(row.get(col_builder) if col_builder else None)),
                    subdivision=subdivision,
                    lot=lot,
                    plan_code=self._safe_str(row.get(col_plan) if col_plan else None),
                    status=self._map_job_status(self._safe_str(row.get(col_status) if col_status else None)),
                )

                try:
                    success = await self._sync_job(job)
                    if success:
                        result.records_imported += 1
                    else:
                        result.records_skipped += 1
                except Exception as e:
                    result.errors.append(f"Job {job_number}: {str(e)}")

            self.log(f"PDSS import complete: {result.records_imported} imported")

        except Exception as e:
            self.log(f"PDSS import error: {e}", "error")
            result.errors.append(str(e))

        return result

    # =========================================================================
    # EPO REPORT IMPORT
    # =========================================================================

    async def import_epo_report(self, file_content: bytes, filename: str = "epo_report.xlsx") -> ImportResult:
        """
        Import EPO (Electronic Purchase Order) data from Excel report.
        """
        if not PANDAS_AVAILABLE:
            return ImportResult(
                source_type="epo_report",
                errors=["pandas not installed - cannot parse Excel files"],
            )

        result = ImportResult(source_type="epo_report")

        try:
            df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
            result.records_found = len(df)
            self.log(f"EPO Report: Found {len(df)} rows")

            # Find columns
            col_sub = self._find_column(df, "subdivision")
            col_lot = self._find_column(df, "lot")
            col_amount = self._find_column(df, "amount")
            col_category = self._find_column(df, "category")
            col_status = self._find_column(df, "status")
            col_due = self._find_column(df, "due_date")

            orders = []
            for idx, row in df.iterrows():
                community = self._safe_str(row.get(col_sub) if col_sub else None)
                lot_str = self._safe_str(row.get(col_lot) if col_lot else None)
                lot_number = self._safe_int(lot_str) if lot_str else None

                # Generate external ID
                external_id = f"EPO-{idx}-{datetime.now().strftime('%Y%m%d')}"

                epo = EPORecord(
                    external_id=external_id,
                    community=community,
                    lot_number=lot_number,
                    amount=self._safe_float(row.get(col_amount) if col_amount else None),
                    category=self._safe_str(row.get(col_category) if col_category else None),
                    status=self._safe_str(row.get(col_status) if col_status else None) or "pending",
                    due_date=self._parse_date(row.get(col_due) if col_due else None),
                )
                orders.append(epo)

            # Bulk sync orders
            try:
                success = await self._sync_orders(orders)
                result.records_imported = len(orders) if success else 0
            except Exception as e:
                result.errors.append(str(e))

            self.log(f"EPO import complete: {result.records_imported} imported")

        except Exception as e:
            self.log(f"EPO import error: {e}", "error")
            result.errors.append(str(e))

        return result

    async def _sync_orders(self, orders: list[EPORecord]) -> bool:
        """Sync orders to MindFlow"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/orders",
                    headers={"x-service-token": self.api_token},
                    json={
                        "portal": "excel_import",
                        "orders": [o.to_api_format() for o in orders],
                    }
                )
                return response.status_code in (200, 201)
        except Exception as e:
            self.log(f"Error syncing orders: {e}", "error")
            return False

    # =========================================================================
    # SUBDIVISIONS IMPORT
    # =========================================================================

    async def import_subdivisions(self, file_content: bytes, filename: str = "subdivisions.xlsx") -> ImportResult:
        """
        Import subdivision/community data from Excel.
        """
        if not PANDAS_AVAILABLE:
            return ImportResult(
                source_type="subdivisions",
                errors=["pandas not installed - cannot parse Excel files"],
            )

        result = ImportResult(source_type="subdivisions")

        try:
            df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl')
            result.records_found = len(df)
            self.log(f"Subdivisions: Found {len(df)} rows")

            # Find columns
            col_name = self._find_column(df, "subdivision")
            col_builder = self._find_column(df, "builder")
            col_city = self._find_column(df, "city")
            col_county = self._find_column(df, "county")

            if not col_name:
                result.errors.append("Could not find Subdivision/Community column")
                return result

            communities = []
            for idx, row in df.iterrows():
                name = self._safe_str(row.get(col_name) if col_name else None)
                if not name:
                    result.records_skipped += 1
                    continue

                community = CommunityRecord(
                    name=name,
                    builder=self._get_builder_code(self._safe_str(row.get(col_builder) if col_builder else None)),
                    city=self._safe_str(row.get(col_city) if col_city else None),
                    county=self._safe_str(row.get(col_county) if col_county else None),
                )
                communities.append(community)

            # Sync communities
            for comm in communities:
                try:
                    success = await self._sync_community(comm)
                    if success:
                        result.records_imported += 1
                    else:
                        result.records_skipped += 1
                except Exception as e:
                    result.errors.append(f"Community {comm.name}: {str(e)}")

            self.log(f"Subdivisions import complete: {result.records_imported} imported")

        except Exception as e:
            self.log(f"Subdivisions import error: {e}", "error")
            result.errors.append(str(e))

        return result

    async def _sync_community(self, community: CommunityRecord) -> bool:
        """Sync a community record to MindFlow"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_base_url}/portal-sync/communities",
                    headers={"x-service-token": self.api_token},
                    json=community.to_api_format()
                )
                return response.status_code in (200, 201)
        except Exception as e:
            self.log(f"Error syncing community: {e}", "error")
            return False

    # =========================================================================
    # AUTO-DETECT IMPORT TYPE
    # =========================================================================

    def detect_import_type(self, file_content: bytes) -> str | None:
        """
        Auto-detect the type of Excel file based on content.

        Returns: "pride_board", "pdss", "epo_report", "subdivisions", or None
        """
        if not PANDAS_AVAILABLE:
            return None

        try:
            df = pd.read_excel(io.BytesIO(file_content), engine='openpyxl', nrows=5)
            columns_lower = [c.lower() for c in df.columns]

            # Check for Pride Board indicators
            if any("job" in c and "#" in c or "job number" in c for c in columns_lower):
                if any("start" in c and "date" in c for c in columns_lower):
                    return "pride_board"

            # Check for PDSS indicators
            if any("takeoff" in c or "quote status" in c for c in columns_lower):
                return "pdss"

            # Check for EPO indicators
            if any("epo" in c or "purchase order" in c for c in columns_lower):
                return "epo_report"

            # Check for subdivision data
            if any("subdivision" in c or "community" in c for c in columns_lower):
                if not any("lot" in c for c in columns_lower):
                    return "subdivisions"

            return None

        except Exception:
            return None

    async def auto_import(self, file_content: bytes, filename: str) -> ImportResult:
        """
        Auto-detect file type and import accordingly.
        """
        import_type = self.detect_import_type(file_content)

        if import_type == "pride_board":
            return await self.import_pride_board(file_content, filename)
        elif import_type == "pdss":
            return await self.import_pdss(file_content, filename)
        elif import_type == "epo_report":
            return await self.import_epo_report(file_content, filename)
        elif import_type == "subdivisions":
            return await self.import_subdivisions(file_content, filename)
        else:
            return ImportResult(
                source_type="unknown",
                errors=["Could not auto-detect file type. Please specify import type manually."],
            )
