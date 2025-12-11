"""
SupplyPro Daily Reporter Agent
Scrapes SupplyPro portal for dashboard data, EPOs, and new documents.
Sends formatted Teams notification with filtered community data.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(name)s | %(levelname)s | %(message)s')
logger = logging.getLogger('supplypro_reporter')

# =============================================================================
# CONFIGURATION
# =============================================================================

SUPPLYPRO_CONFIG = {
    "url": "https://www.hyphensolutions.com/MH2Supply/",
    "account": "Sekisui House U.S., Inc. - Portland Division - Ric",
    
    # Communities to monitor (filter - only report on these)
    "monitored_communities": [
        "Luden Estates Phase 3",
        "North Haven",           # Catches both "North Haven" and "North Haven Phase 4"
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
    
    # Document types to summarize (medium priority)
    "medium_doc_types": [
        "HCO",
        "PLOT PLAN",
        "RENDERINGS",
    ],
}

# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class DashboardData:
    """Dashboard summary counts"""
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
    """Single EPO entry"""
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

@dataclass
class DocumentRecord:
    """Single document entry"""
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

@dataclass
class SupplyProReport:
    """Complete daily report"""
    report_date: str
    dashboard: DashboardData
    epos: list = field(default_factory=list)
    documents: list = field(default_factory=list)
    errors: list = field(default_factory=list)

# =============================================================================
# PARSING FUNCTIONS
# =============================================================================

def parse_job_name(job_name: str) -> tuple:
    """
    Parse job name into lot number and address.
    Format: '33750115 - 928 NW 178TH WAY - 115/'
    Returns: (lot_number, address)
    """
    if not job_name:
        return ("", "")
    
    parts = job_name.split(" - ")
    if len(parts) >= 3:
        job_id = parts[0].strip()
        address = parts[1].strip()
        lot_suffix = parts[2].strip().rstrip("/")
        return (lot_suffix, address)
    elif len(parts) == 2:
        return (parts[0].strip(), parts[1].strip())
    else:
        return (job_name, "")

def parse_amount(amount_str: str) -> float:
    """Parse amount string like '$1,234.56' to float"""
    if not amount_str:
        return 0.0
    cleaned = amount_str.replace("$", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def extract_community_from_folder(folder: str, community_field: str = "") -> str:
    """
    Extract community name from folder or use community field.
    Folder format: '33750115 - 928 NW 178TH WAY - 115/' or 'North Haven Phase 4'
    """
    if community_field and not re.match(r'^\d+', community_field):
        return community_field
    
    # If folder starts with numbers, it's a lot-level folder
    if re.match(r'^\d+', folder):
        return ""  # Will be determined by lot prefix
    
    return folder

def is_monitored_community(community: str, config: dict) -> bool:
    """Check if community is in the monitored list"""
    if not community:
        return False
    
    monitored = config.get("monitored_communities", [])
    community_lower = community.lower()
    
    for m in monitored:
        if m.lower() in community_lower or community_lower in m.lower():
            return True
    return False

def get_community_from_lot_prefix(lot_id: str) -> str:
    """
    Map lot prefix to community based on known patterns.
    This is Richmond American Portland Division specific.
    """
    lot_prefixes = {
        "33750": "North Haven Phase 4",      # North Haven lots 95-148+
        "36190": "Luden Estates Phase 3",    # Luden lots
        "34040": "Verona Heights",           # Verona lots
        "35800": "Reserve at Battle Creek",  # Battle Creek lots
    }
    
    for prefix, community in lot_prefixes.items():
        if lot_id.startswith(prefix):
            return community
    
    return "Unknown"

# =============================================================================
# REPORT FORMATTING
# =============================================================================

def format_teams_report(report: SupplyProReport, config: dict) -> str:
    """Format the report for Teams notification"""
    
    lines = []
    lines.append("━" * 50)
    lines.append(f"📊 **SupplyPro Daily Report** - {report.report_date}")
    lines.append(f"   Richmond American (Sekisui House - Portland)")
    lines.append("━" * 50)
    lines.append("")
    
    # Dashboard Summary
    d = report.dashboard
    lines.append("**DASHBOARD SUMMARY**")
    lines.append(f"• New Orders: {d.new_orders:,}")
    lines.append(f"• To Do: {d.to_do_orders:,}")
    lines.append(f"• Change Orders: {d.change_orders}")
    lines.append(f"• Cancellations: {d.cancellations}")
    if d.pending_back_charges > 0:
        lines.append(f"• ⚠️ Pending Back Charges: {d.pending_back_charges}")
    lines.append("")
    
    # Filter EPOs to monitored communities
    monitored_epos = [e for e in report.epos if is_monitored_community(e.community, config)]
    
    if monitored_epos:
        lines.append("━" * 50)
        total_amount = sum(e.amount for e in monitored_epos)
        pending_epos = [e for e in monitored_epos if "pending" in e.epo_status.lower()]
        pending_amount = sum(e.amount for e in pending_epos)
        
        lines.append(f"**EPOs (Last {config['epo_days_back']} Days)** - {len(monitored_epos)} Total - ${total_amount:,.2f}")
        lines.append("━" * 50)
        
        # Group by community
        epos_by_community = {}
        for epo in monitored_epos:
            if epo.community not in epos_by_community:
                epos_by_community[epo.community] = []
            epos_by_community[epo.community].append(epo)
        
        for community in sorted(epos_by_community.keys()):
            epos = epos_by_community[community]
            community_total = sum(e.amount for e in epos)
            lines.append(f"\n**{community}** (${community_total:,.2f})")
            
            # Group by lot
            epos_by_lot = {}
            for epo in epos:
                lot_key = f"Lot {epo.lot_number} - {epo.address}" if epo.address else f"Lot {epo.lot_number}"
                if lot_key not in epos_by_lot:
                    epos_by_lot[lot_key] = []
                epos_by_lot[lot_key].append(epo)
            
            for lot_key in sorted(epos_by_lot.keys()):
                lot_epos = epos_by_lot[lot_key]
                lines.append(f"  {lot_key}")
                for epo in lot_epos:
                    status_icon = "⚠️" if "pending" in epo.epo_status.lower() else "✓"
                    # Truncate task name if too long
                    task_display = epo.task[:30] + "..." if len(epo.task) > 30 else epo.task
                    lines.append(f"    {status_icon} {task_display}  ${epo.amount:,.2f}")
        
        if pending_epos:
            lines.append(f"\n⚠️ **ACTION NEEDED:** {len(pending_epos)} EPOs Pending Approval (${pending_amount:,.2f})")
        lines.append("")
    
    # Filter documents to monitored communities
    monitored_docs = [d for d in report.documents if is_monitored_community(d.community, config)]
    
    # Also include docs where we can infer community from lot prefix
    for doc in report.documents:
        if doc not in monitored_docs and doc.lot_number:
            inferred_community = get_community_from_lot_prefix(doc.lot_number)
            if is_monitored_community(inferred_community, config):
                doc.community = inferred_community
                monitored_docs.append(doc)
    
    if monitored_docs:
        # Filter to unviewed only
        unviewed_docs = [d for d in monitored_docs if not d.viewed]
        
        if unviewed_docs:
            lines.append("━" * 50)
            lines.append(f"**NEW DOCUMENTS (Last {config['documents_days_back']} Days)** - {len(unviewed_docs)} Unviewed")
            lines.append("━" * 50)
            
            # Group by community
            docs_by_community = {}
            for doc in unviewed_docs:
                comm = doc.community or "Unknown"
                if comm not in docs_by_community:
                    docs_by_community[comm] = []
                docs_by_community[comm].append(doc)
            
            for community in sorted(docs_by_community.keys()):
                docs = docs_by_community[community]
                lines.append(f"\n**{community}** ({len(docs)} documents)")
                
                # Group by lot
                docs_by_lot = {}
                for doc in docs:
                    lot_key = f"Lot {doc.lot_number}" if doc.lot_number else "Plan-Level"
                    if lot_key not in docs_by_lot:
                        docs_by_lot[lot_key] = []
                    docs_by_lot[lot_key].append(doc)
                
                for lot_key in sorted(docs_by_lot.keys()):
                    lot_docs = docs_by_lot[lot_key]
                    # Highlight priority docs
                    priority_docs = [d for d in lot_docs if any(
                        p.lower() in d.doc_name.lower() for p in config["priority_doc_types"]
                    )]
                    other_docs = [d for d in lot_docs if d not in priority_docs]
                    
                    if priority_docs:
                        lines.append(f"  {lot_key}")
                        for doc in priority_docs:
                            lines.append(f"    ⭐ {doc.doc_name}")
                        if other_docs:
                            lines.append(f"    + {len(other_docs)} other documents")
                    else:
                        lines.append(f"  {lot_key}: {len(lot_docs)} documents")
        
        lines.append("")
    
    # Community Totals Summary
    lines.append("━" * 50)
    lines.append("**TOTALS BY COMMUNITY**")
    lines.append("━" * 50)
    
    for community in config["monitored_communities"]:
        comm_epos = [e for e in monitored_epos if community.lower() in e.community.lower()]
        comm_docs = [d for d in monitored_docs if not d.viewed and community.lower() in (d.community or "").lower()]
        
        if comm_epos or comm_docs:
            epo_total = sum(e.amount for e in comm_epos)
            lines.append(f"  {community}")
            if comm_epos:
                lines.append(f"    EPOs: {len(comm_epos)} (${epo_total:,.2f})")
            if comm_docs:
                lines.append(f"    New Docs: {len(comm_docs)}")
    
    lines.append("━" * 50)
    
    return "\n".join(lines)

def format_console_report(report: SupplyProReport, config: dict) -> str:
    """Format the report for console output with colors"""
    # Same as Teams but with ANSI colors
    return format_teams_report(report, config)

# =============================================================================
# MOCK DATA FOR TESTING (until Playwright is set up)
# =============================================================================

def get_mock_report() -> SupplyProReport:
    """Generate mock report for testing"""
    
    report = SupplyProReport(
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
                supplier_order="1332200 - 2004640-000",
                submitted_date="11/17/2025",
                task_status="Complete",
                epo_status="Approved",
                amount=118.27
            ),
            EPORecord(
                account="Sekisui House U.S., Inc.",
                community="Luden Estates Phase 3",
                job_name="36190093 - 13008 NE 111th St - 93/",
                lot_number="93",
                address="13008 NE 111th St",
                task="Additional aero material for sider",
                supplier_order="1332200 - 2005000-000",
                submitted_date="11/17/2025",
                task_status="Complete",
                epo_status="Approved",
                amount=292.15
            ),
            EPORecord(
                account="Sekisui House U.S., Inc.",
                community="Luden Estates Phase 3",
                job_name="36190095 - 11124 NE 131st Ave - 95/",
                lot_number="95",
                address="11124 NE 131st Ave",
                task="Stolen house wrap",
                supplier_order="1332200 - 2009548-000",
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
                supplier_order="1332200 - 2003697-000",
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
                lot_number="33750127",
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
                lot_number="33750127",
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
                lot_number="33750127",
                address="1026 NW 178TH WAY",
                doc_name="FLOOR TRUSS CALCS",
                doc_type="pdf",
                size="1.17 MB",
                revision=1,
                date_added="12/5/2025",
                uploaded_by="Alyssa Munden",
                viewed=False
            ),
            DocumentRecord(
                builder="Sekisui House U.S., Inc.",
                folder="Verona Heights",
                community="Verona Heights",
                lot_number="",
                address="",
                doc_name="G601 DAYTON PLAN - CAB DRAWINGS - STD KITCHENS",
                doc_type="pdf",
                size="541.69 KB",
                revision=1,
                date_added="12/1/2025",
                uploaded_by="Carsyn Anderson",
                viewed=False
            ),
            DocumentRecord(
                builder="Sekisui House U.S., Inc.",
                folder="Luden Estates Phase 3",
                community="Luden Estates Phase 3",
                lot_number="",
                address="",
                doc_name="G603 BRADFORD - CAB DRAWINGS",
                doc_type="pdf",
                size="1.60 MB",
                revision=1,
                date_added="11/25/2025",
                uploaded_by="Carsyn Anderson",
                viewed=False
            ),
        ]
    )
    
    return report

# =============================================================================
# PLAYWRIGHT SCRAPER (to be implemented)
# =============================================================================

async def scrape_supplypro(config: dict) -> SupplyProReport:
    """
    Scrape SupplyPro portal using Playwright.
    Returns a SupplyProReport with all data.
    
    PLACEHOLDER - to be implemented when credentials are configured.
    """
    logger.info("SupplyPro scraper would run here with Playwright")
    logger.info("For now, returning mock data for testing")
    
    # TODO: Implement actual scraping:
    # 1. Login to SupplyPro
    # 2. Scrape dashboard numbers
    # 3. Navigate to Reports > EPO Report
    # 4. Run report with date filter
    # 5. Export to Excel or scrape table
    # 6. Navigate to New Documents List
    # 7. Filter by date range
    # 8. Scrape document list
    
    return get_mock_report()

# =============================================================================
# MAIN ENTRY POINTS
# =============================================================================

def run_supplypro_report(send_teams: bool = True, save_report: bool = True) -> dict:
    """
    Run the SupplyPro daily report.
    
    Args:
        send_teams: Send notification to Teams
        save_report: Save report to Operations folder
    
    Returns:
        dict with report data and status
    """
    logger.info("Starting SupplyPro Daily Report")
    
    try:
        # For now, use mock data
        # When Playwright is ready: report = asyncio.run(scrape_supplypro(SUPPLYPRO_CONFIG))
        report = get_mock_report()
        
        # Format reports
        teams_report = format_teams_report(report, SUPPLYPRO_CONFIG)
        console_report = format_console_report(report, SUPPLYPRO_CONFIG)
        
        # Print to console
        print("\n" + console_report)
        
        # Save report
        if save_report:
            report_dir = Path(os.environ.get("SUPPLYPRO_REPORT_DIR", "data/reports"))
            report_dir.mkdir(parents=True, exist_ok=True)
            
            report_file = report_dir / f"supplypro_{datetime.now().strftime('%Y-%m-%d')}.txt"
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(teams_report)
            logger.info(f"Report saved to {report_file}")
        
        # Send to Teams
        if send_teams:
            try:
                from services.teams_notify import send_teams_notification
                send_teams_notification("SupplyPro Daily Report", teams_report)
                logger.info("Teams notification sent")
            except ImportError:
                logger.warning("Teams notification module not available")
            except Exception as e:
                logger.error(f"Failed to send Teams notification: {e}")
        
        # Calculate summary stats
        monitored_epos = [e for e in report.epos 
                         if is_monitored_community(e.community, SUPPLYPRO_CONFIG)]
        pending_epos = [e for e in monitored_epos if "pending" in e.epo_status.lower()]
        
        return {
            "success": True,
            "report_date": report.report_date,
            "dashboard": {
                "new_orders": report.dashboard.new_orders,
                "to_do": report.dashboard.to_do_orders,
                "change_orders": report.dashboard.change_orders,
            },
            "epo_summary": {
                "total": len(monitored_epos),
                "total_amount": sum(e.amount for e in monitored_epos),
                "pending": len(pending_epos),
                "pending_amount": sum(e.amount for e in pending_epos),
            },
            "documents": {
                "total_unviewed": len([d for d in report.documents if not d.viewed]),
            }
        }
        
    except Exception as e:
        logger.error(f"SupplyPro report failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="SupplyPro Daily Reporter")
    parser.add_argument("--no-teams", action="store_true", help="Don't send Teams notification")
    parser.add_argument("--no-save", action="store_true", help="Don't save report to file")
    parser.add_argument("--test", action="store_true", help="Run with mock data (default for now)")
    
    args = parser.parse_args()
    
    result = run_supplypro_report(
        send_teams=not args.no_teams,
        save_report=not args.no_save
    )
    
    print("\n" + "=" * 50)
    print("RESULT SUMMARY")
    print("=" * 50)
    print(json.dumps(result, indent=2))
