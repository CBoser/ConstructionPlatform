"""
SupplyPro Reporter Agent (Web-Adapted)

Fetches dashboard data, EPOs, and documents from SupplyPro portal.
Adapted for MindFlow web platform - syncs to Express API instead of local files.

Based on: sto-agents-complete/agents/supplypro_reporter.py
"""

import os
import logging
import re
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

from .base import BaseAgent

logger = logging.getLogger("supplypro_reporter")

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPPLYPRO_CONFIG = {
    "url": os.getenv("SUPPLYPRO_URL", "https://www.hyphensolutions.com/MH2Supply/"),
    "account": os.getenv("SUPPLYPRO_ACCOUNT", "Sekisui House U.S., Inc. - Portland Division"),

    # Communities to monitor (filter - only report on these)
    "monitored_communities": [
        "Luden Estates Phase 3",
        "North Haven",
        "North Haven Phase 4",
        "Reserve at Battle Creek",
        "Verona Heights",
    ],

    # Report settings
    "epo_days_back": 30,
    "documents_days_back": 7,

    # Document types to highlight (high priority)
    "priority_doc_types": [
        "ARCH DRAWINGS",
        "CALC PKG",
        "TRUSS CALCS",
        "FLOOR TRUSS CALCS",
        "ROOF TRUSS CALCS",
        "TRUSS LAYOUT",
        "FLOOR TRUSS LAYOUT",
        "ROOF TRUSS LAYOUT",
        "JIO",
    ],
}

# Lot prefix to community mapping
LOT_PREFIX_TO_COMMUNITY = {
    "33750": "North Haven Phase 4",
    "34040": "Verona Heights",
    "35800": "Reserve at Battle Creek",
    "36190": "Luden Estates Phase 3",
    "36199": "Luden Estates Phase 3",
}


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class DashboardData:
    """Dashboard summary counts from SupplyPro"""
    new_orders: int = 0
    to_do_orders: int = 0
    change_orders: int = 0
    cancellations: int = 0
    pending_back_charges: int = 0
    completed_back_charges: int = 0
    future_orders_10_days: int = 0
    future_orders_30_days: int = 0


@dataclass
class EPORecord:
    """Single EPO (Extra Purchase Order) entry"""
    account: str
    community: str
    job_name: str
    lot_number: str
    address: str
    task: str
    supplier_order: str
    submitted_date: str
    task_status: str
    epo_status: str
    amount: float

    def to_api_format(self) -> Dict[str, Any]:
        """Convert to format expected by MindFlow API"""
        return {
            "external_id": self.supplier_order,
            "order_type": "epo",
            "category": "EPO",
            "status": "pending" if "pending" in self.epo_status.lower() else "approved",
            "amount": self.amount,
            "description": self.task,
            "due_date": None,
            "lot_number": int(self.lot_number) if self.lot_number.isdigit() else None,
            "raw_data": {
                "account": self.account,
                "community": self.community,
                "job_name": self.job_name,
                "address": self.address,
                "submitted_date": self.submitted_date,
                "task_status": self.task_status,
                "epo_status": self.epo_status,
            }
        }


@dataclass
class DocumentRecord:
    """Single document entry from portal"""
    builder: str
    folder: str
    community: str
    lot_number: str
    address: str
    doc_name: str
    doc_type: str
    size: str
    revision: int
    date_added: str
    uploaded_by: str
    viewed: bool

    def to_api_format(self) -> Dict[str, Any]:
        """Convert to format expected by MindFlow API"""
        return {
            "external_id": f"{self.community}-{self.lot_number}-{self.doc_name}".replace(" ", "_"),
            "filename": self.doc_name,
            "doc_type": self.detect_doc_type(),
            "file_url": None,
            "file_size": self.parse_size(),
            "lot_number": int(self.lot_number) if self.lot_number.isdigit() else None,
        }

    def detect_doc_type(self) -> Optional[str]:
        """Detect document type from name"""
        name_lower = self.doc_name.lower()
        type_mapping = {
            "ARCH_DRAWINGS": ["arch", "architectural", "floor plan"],
            "CALC_PKG": ["calc pkg", "calculation"],
            "TRUSS_CALCS": ["truss calc"],
            "FLOOR_TRUSS": ["floor truss"],
            "ROOF_TRUSS": ["roof truss"],
            "TRUSS_LAYOUT": ["truss layout"],
            "JIO": ["jio"],
            "HCO": ["hco"],
            "PLOT_PLAN": ["plot plan", "site plan"],
        }
        for doc_type, patterns in type_mapping.items():
            if any(p in name_lower for p in patterns):
                return doc_type
        return None

    def parse_size(self) -> Optional[int]:
        """Parse size string to bytes"""
        if not self.size:
            return None
        size_lower = self.size.lower()
        try:
            if "mb" in size_lower:
                return int(float(size_lower.replace("mb", "").strip()) * 1024 * 1024)
            elif "kb" in size_lower:
                return int(float(size_lower.replace("kb", "").strip()) * 1024)
            return int(float(size_lower))
        except ValueError:
            return None


@dataclass
class SupplyProReport:
    """Complete daily report from SupplyPro"""
    report_date: str
    dashboard: DashboardData
    epos: List[EPORecord] = field(default_factory=list)
    documents: List[DocumentRecord] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def is_monitored_community(community: str, config: dict = None) -> bool:
    """Check if community is in the monitored list"""
    if not community:
        return False

    config = config or SUPPLYPRO_CONFIG
    monitored = config.get("monitored_communities", [])
    community_lower = community.lower()

    for m in monitored:
        if m.lower() in community_lower or community_lower in m.lower():
            return True
    return False


def get_community_from_lot_prefix(lot_id: str) -> str:
    """Map lot prefix to community based on known patterns"""
    for prefix, community in LOT_PREFIX_TO_COMMUNITY.items():
        if lot_id.startswith(prefix):
            return community
    return "Unknown"


def generate_alerts_from_report(report: SupplyProReport) -> List[Dict[str, Any]]:
    """Generate system alerts from the SupplyPro report"""
    alerts = []

    monitored_epos = [e for e in report.epos if is_monitored_community(e.community)]
    pending_epos = [e for e in monitored_epos if "pending" in e.epo_status.lower()]

    if pending_epos:
        total_pending = sum(e.amount for e in pending_epos)
        alerts.append({
            "type": "warning",
            "source": "supplypro",
            "title": f"{len(pending_epos)} EPOs Pending Approval",
            "message": f"Total pending: ${total_pending:,.2f}",
            "action_url": "/purchase-orders?status=pending",
            "details": {
                "count": len(pending_epos),
                "total_amount": total_pending,
                "epos": [{"task": e.task, "amount": e.amount, "lot": e.lot_number}
                        for e in pending_epos[:5]]
            }
        })

    if report.dashboard.pending_back_charges > 0:
        alerts.append({
            "type": "critical",
            "source": "supplypro",
            "title": f"{report.dashboard.pending_back_charges} Pending Back Charges",
            "message": "Review and respond to back charges in SupplyPro",
            "action_url": SUPPLYPRO_CONFIG["url"],
        })

    priority_docs = [d for d in report.documents
                    if not d.viewed and is_monitored_community(d.community)
                    and any(p.lower() in d.doc_name.lower()
                           for p in SUPPLYPRO_CONFIG["priority_doc_types"])]

    if priority_docs:
        alerts.append({
            "type": "info",
            "source": "supplypro",
            "title": f"{len(priority_docs)} New Priority Documents",
            "message": "New ARCH DRAWINGS, CALC PKG, or TRUSS documents available",
            "details": {
                "documents": [{"name": d.doc_name, "community": d.community, "lot": d.lot_number}
                             for d in priority_docs[:5]]
            }
        })

    return alerts


# =============================================================================
# MOCK DATA (Until Playwright scraping is implemented)
# =============================================================================

def get_mock_report() -> SupplyProReport:
    """Generate mock report for testing and development"""
    return SupplyProReport(
        report_date=datetime.now().strftime("%B %d, %Y"),
        dashboard=DashboardData(
            new_orders=4913,
            to_do_orders=808,
            change_orders=170,
            cancellations=1,
            pending_back_charges=2,
            completed_back_charges=34,
        ),
        epos=[
            EPORecord(
                account="Sekisui House U.S., Inc.",
                community="Luden Estates Phase 3",
                job_name="36190093 - 13008 NE 111th St - 93/",
                lot_number="93",
                address="13008 NE 111th St",
                task="Missing hold downs",
                supplier_order="1332200-2004640-000",
                submitted_date="11/17/2025",
                task_status="Complete",
                epo_status="Approved",
                amount=118.27
            ),
            EPORecord(
                account="Sekisui House U.S., Inc.",
                community="Luden Estates Phase 3",
                job_name="36190095 - 11124 NE 131st Ave - 95/",
                lot_number="95",
                address="11124 NE 131st Ave",
                task="Stolen house wrap",
                supplier_order="1332200-2009548-000",
                submitted_date="11/25/2025",
                task_status="Skipped",
                epo_status="Pending Approval",
                amount=1579.81
            ),
            EPORecord(
                account="Sekisui House U.S., Inc.",
                community="North Haven Phase 4",
                job_name="33750114 - 924 NW 178TH WAY - 114/",
                lot_number="114",
                address="924 NW 178TH WAY",
                task="Stolen material",
                supplier_order="1332200-2003697-000",
                submitted_date="11/13/2025",
                task_status="Complete",
                epo_status="Approved",
                amount=235.04
            ),
        ],
        documents=[
            DocumentRecord(
                builder="Sekisui House U.S., Inc.",
                folder="33750127 - 1026 NW 178TH WAY - 127/",
                community="North Haven Phase 4",
                lot_number="127",
                address="1026 NW 178TH WAY",
                doc_name="ARCH DRAWINGS",
                doc_type="pdf",
                size="38.61 MB",
                revision=1,
                date_added="12/5/2025",
                uploaded_by="Alyssa Munden",
                viewed=False
            ),
            DocumentRecord(
                builder="Sekisui House U.S., Inc.",
                folder="33750127 - 1026 NW 178TH WAY - 127/",
                community="North Haven Phase 4",
                lot_number="127",
                address="1026 NW 178TH WAY",
                doc_name="CALC PKG NH 127 128 129",
                doc_type="pdf",
                size="3.83 MB",
                revision=1,
                date_added="12/5/2025",
                uploaded_by="Alyssa Munden",
                viewed=False
            ),
            DocumentRecord(
                builder="Sekisui House U.S., Inc.",
                folder="33750127 - 1026 NW 178TH WAY - 127/",
                community="North Haven Phase 4",
                lot_number="127",
                address="1026 NW 178TH WAY",
                doc_name="FLOOR TRUSS CALCS",
                doc_type="pdf",
                size="1.17 MB",
                revision=1,
                date_added="12/5/2025",
                uploaded_by="Alyssa Munden",
                viewed=False
            ),
        ]
    )


# =============================================================================
# MAIN AGENT CLASS
# =============================================================================

class SupplyProReporter(BaseAgent):
    """SupplyPro Reporter Agent for MindFlow integration"""

    def __init__(self):
        super().__init__("SupplyProReporter")
        self.config = SUPPLYPRO_CONFIG
        self.username = self.get_env("SUPPLYPRO_USERNAME")
        self.password = self.get_env("SUPPLYPRO_PASSWORD")
        self.base_url = self.get_env("SUPPLYPRO_URL", "https://www.hyphensolutions.com/MH2Supply/")
        self.last_report: Optional[SupplyProReport] = None

    async def run(self) -> Dict[str, Any]:
        """Run full sync and return all data"""
        self.log("Starting SupplyPro sync")

        report = await self._fetch_report()
        self.last_report = report
        self.last_run = datetime.now()
        self.run_count += 1

        orders = self._get_orders_for_api(report)
        alerts = generate_alerts_from_report(report)
        documents = self._get_documents_for_api(report)

        return {
            "success": True,
            "orders": orders,
            "deliveries": await self.get_todays_deliveries(),
            "alerts": alerts,
            "documents": documents,
            "timestamp": self.last_run.isoformat(),
            "dashboard": {
                "new_orders": report.dashboard.new_orders,
                "to_do": report.dashboard.to_do_orders,
                "change_orders": report.dashboard.change_orders,
                "pending_back_charges": report.dashboard.pending_back_charges,
            },
            "summary": {
                "epos_total": len(report.epos),
                "epos_monitored": len([e for e in report.epos if is_monitored_community(e.community)]),
                "documents_unviewed": len([d for d in report.documents if not d.viewed]),
            }
        }

    async def _fetch_report(self) -> SupplyProReport:
        """Fetch report from SupplyPro (mock until Playwright implemented)"""
        if not self.username or not self.password:
            self.log("SupplyPro credentials not configured, using mock data", "warning")
            return get_mock_report()

        # TODO: Implement Playwright scraping
        self.log("Playwright scraping not yet implemented, using mock data")
        return get_mock_report()

    def _get_orders_for_api(self, report: SupplyProReport) -> List[Dict[str, Any]]:
        """Convert EPOs to API format"""
        orders = []
        for epo in report.epos:
            if is_monitored_community(epo.community):
                orders.append(epo.to_api_format())
        return orders

    def _get_documents_for_api(self, report: SupplyProReport) -> List[Dict[str, Any]]:
        """Convert documents to API format"""
        documents = []
        for doc in report.documents:
            if is_monitored_community(doc.community) and not doc.viewed:
                documents.append(doc.to_api_format())
        return documents

    async def get_orders(self) -> List[Dict[str, Any]]:
        """Get orders in API format"""
        if not self.last_report:
            self.last_report = await self._fetch_report()
        return self._get_orders_for_api(self.last_report)

    async def get_todays_deliveries(self) -> List[Dict[str, Any]]:
        """Get today's deliveries in API format"""
        # Placeholder - would scrape from portal delivery schedule
        return []

    async def check_for_alerts(self) -> List[Dict[str, Any]]:
        """Check for alert conditions"""
        if not self.last_report:
            self.last_report = await self._fetch_report()
        return generate_alerts_from_report(self.last_report)

    async def login(self) -> bool:
        """Login to SupplyPro portal (Playwright implementation needed)"""
        self.log("Login not implemented - needs Playwright", "warning")
        return False
