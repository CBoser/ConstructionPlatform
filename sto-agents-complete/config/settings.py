"""
STO Agents Configuration
Sales Team One PDX | Builder's FirstSource

Central configuration for all agents and paths.
"""

import os
from pathlib import Path
from datetime import datetime

# =============================================================================
# PATH CONFIGURATION
# =============================================================================

# SharePoint sync root - update this to match your local sync path
LOCAL_SYNC_ROOT = Path(os.environ.get(
    "STO_SYNC_ROOT",
    r"C:\Users\corey.boser\OneDrive - BLDR\Sales Team One - Construction Platform"
))

# Backup destination (I: drive)
BACKUP_ROOT = Path(os.environ.get(
    "STO_BACKUP_ROOT",
    r"I:\FOREST-GROVE\SALES\STO_Backups"
))

# =============================================================================
# MINDFLOW FOLDER STRUCTURE (Workflow-Based)
# =============================================================================

# Numbered workflow folders
INTAKE_PATH = LOCAL_SYNC_ROOT / "00_Intake"
MATERIALS_PATH = LOCAL_SYNC_ROOT / "01_Materials"
PLANS_PATH = LOCAL_SYNC_ROOT / "02_Plans"
BOMS_PATH = LOCAL_SYNC_ROOT / "03_BOMs"
JOBS_PATH = LOCAL_SYNC_ROOT / "04_Jobs"
SCHEDULES_PATH = LOCAL_SYNC_ROOT / "05_Schedules"
CONTRACTS_PATH = LOCAL_SYNC_ROOT / "06_Contracts"
PURCHASE_ORDERS_PATH = LOCAL_SYNC_ROOT / "07_Purchase_Orders"
TIME_ENTRIES_PATH = LOCAL_SYNC_ROOT / "08_Time_Entries"
REPORTS_PATH = LOCAL_SYNC_ROOT / "09_Reports"
SYSTEM_BACKUPS_PATH = LOCAL_SYNC_ROOT / "10_System_Backups"
TRAINING_PATH = LOCAL_SYNC_ROOT / "11_Training"

# Active jobs location
JOBS_ACTIVE = JOBS_PATH / "Active"

# =============================================================================
# CUSTOMER FILES STRUCTURE (Job-Centric)
# =============================================================================

CUSTOMER_FILES = LOCAL_SYNC_ROOT / "Customer Files"
OPERATIONS = LOCAL_SYNC_ROOT / "Operations"
BATS_PATH = LOCAL_SYNC_ROOT / "BATs"

# =============================================================================
# BUILDER CONFIGURATIONS
# =============================================================================

BUILDERS = {
    "richmond_american": {
        "name": "Richmond American",
        "display_name": "Richmond American Homes",
        "portal": "supplypro",
        "portal_url": "https://www.hyphensolutions.com/MH2Supply/",
        "portal_account": "Sekisui House U.S., Inc. - Portland Division - Ric",
        "customer_files_path": CUSTOMER_FILES / "Richmond American",
        "intake_path": INTAKE_PATH / "Richmond American",
        "bat_path": BATS_PATH / "Richmond American",
        "lot_subfolders": ["Plans and Layouts", "POs"],
        "lot_prefixes": ["33750", "34040", "35800", "36190", "36199"],
        "active": True,
    },
    "holt_homes": {
        "name": "Holt Homes",
        "display_name": "Holt Homes",
        "portal": "hyphen",
        "portal_url": "https://www.hyphensolutions.com/",
        "customer_files_path": CUSTOMER_FILES / "Holt Homes",
        "intake_path": INTAKE_PATH / "Holt Homes",
        "bat_path": BATS_PATH / "Holt Homes",
        "lot_subfolders": ["Plans", "POs", "Vendor Docs"],
        "active": True,
    },
    "manor_homes": {
        "name": "Manor Homes",
        "display_name": "Manor Homes HSR",
        "portal": "hyphen",
        "portal_url": "https://www.hyphensolutions.com/",
        "customer_files_path": CUSTOMER_FILES / "Manor Homes",
        "intake_path": INTAKE_PATH / "Manor Homes",
        "bat_path": BATS_PATH / "Manor Homes",
        "lot_subfolders": ["Plans", "POs"],
        "active": True,
    },
    "sekisui_house": {
        "name": "Sekisui House",
        "display_name": "Sekisui House",
        "portal": "supplypro",
        "portal_url": "https://www.hyphensolutions.com/MH2Supply/",
        "customer_files_path": CUSTOMER_FILES / "Sekisui House",
        "intake_path": INTAKE_PATH / "Sekisui House",
        "lot_subfolders": ["Plans", "POs", "Specs"],
        "active": False,  # Future - using Richmond American portal currently
    },
}

# =============================================================================
# REQUIRED DOCUMENTS (for Completeness Checker)
# =============================================================================

REQUIRED_DOCUMENTS = {
    "richmond_american": {
        "required": [
            "ARCH DRAWINGS",
            "CALC PKG",
        ],
        "optional": [
            "FLOOR TRUSS CALCS",
            "FLOOR TRUSS LAYOUT",
            "ROOF TRUSS CALCS",
            "ROOF TRUSS LAYOUT",
            "PLOT PLAN",
            "JIO",
            "HCO",
        ],
        "patterns": {
            "arch": r"(?i)arch.*draw|architectural",
            "calc": r"(?i)calc.*pkg|calculation",
            "floor_truss": r"(?i)floor.*truss",
            "roof_truss": r"(?i)roof.*truss",
            "plot": r"(?i)plot.*plan|site.*plan",
        }
    },
    "holt_homes": {
        "required": [
            "Plans",
            "Structural",
        ],
        "optional": [
            "Truss Layout",
            "Plot Plan",
        ],
    },
    "manor_homes": {
        "required": [
            "Plans",
        ],
        "optional": [
            "Structural",
            "Plot Plan",
        ],
    },
}

# =============================================================================
# LOT PREFIX MAPPING (for community detection)
# =============================================================================

LOT_PREFIX_TO_COMMUNITY = {
    "33750": "North Haven Phase 4",
    "34040": "Verona Heights",
    "35800": "Reserve at Battle Creek",
    "36190": "Luden Estates Phase 3",
    "36199": "Luden Estates Phase 3",
}

# =============================================================================
# AUTO-DETECTION FUNCTIONS
# =============================================================================

def get_active_subdivisions(builder_key: str) -> list:
    """
    Auto-detect subdivisions by scanning Customer Files folder structure.
    No manual configuration needed - just create the folder!
    """
    builder = BUILDERS.get(builder_key)
    if not builder:
        return []
    
    customer_path = builder.get("customer_files_path")
    if not customer_path or not customer_path.exists():
        return []
    
    subdivisions = []
    for item in customer_path.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            subdivisions.append(item.name)
    
    return sorted(subdivisions)

def get_active_jobs(builder_key: str, subdivision: str = None) -> list:
    """
    Get list of active job folders for a builder.
    Optionally filter by subdivision.
    """
    builder = BUILDERS.get(builder_key)
    if not builder:
        return []
    
    customer_path = builder.get("customer_files_path")
    if not customer_path or not customer_path.exists():
        return []
    
    jobs = []
    
    if subdivision:
        sub_path = customer_path / subdivision
        if sub_path.exists():
            for lot in sub_path.iterdir():
                if lot.is_dir() and not lot.name.startswith('.'):
                    jobs.append({
                        "subdivision": subdivision,
                        "lot": lot.name,
                        "path": lot,
                    })
    else:
        for sub in customer_path.iterdir():
            if sub.is_dir() and not sub.name.startswith('.'):
                for lot in sub.iterdir():
                    if lot.is_dir() and not lot.name.startswith('.'):
                        jobs.append({
                            "subdivision": sub.name,
                            "lot": lot.name,
                            "path": lot,
                        })
    
    return jobs

def get_intake_files(builder_key: str = None) -> list:
    """
    Get files waiting in 00_Intake folders.
    Returns list of files with metadata.
    """
    files = []
    
    if builder_key:
        builder = BUILDERS.get(builder_key)
        if builder and builder.get("intake_path"):
            intake_path = builder["intake_path"]
            if intake_path.exists():
                for f in intake_path.rglob("*"):
                    if f.is_file():
                        files.append({
                            "builder": builder_key,
                            "path": f,
                            "name": f.name,
                            "size": f.stat().st_size,
                            "modified": datetime.fromtimestamp(f.stat().st_mtime),
                        })
    else:
        # Scan all builders
        for bkey, builder in BUILDERS.items():
            if builder.get("intake_path") and builder["intake_path"].exists():
                for f in builder["intake_path"].rglob("*"):
                    if f.is_file():
                        files.append({
                            "builder": bkey,
                            "path": f,
                            "name": f.name,
                            "size": f.stat().st_size,
                            "modified": datetime.fromtimestamp(f.stat().st_mtime),
                        })
    
    return sorted(files, key=lambda x: x["modified"], reverse=True)

def get_community_from_lot_id(lot_id: str) -> str:
    """Map a lot ID to its community based on prefix"""
    for prefix, community in LOT_PREFIX_TO_COMMUNITY.items():
        if lot_id.startswith(prefix):
            return community
    return "Unknown"

# =============================================================================
# TEAMS WEBHOOK CONFIGURATION
# =============================================================================

# Set this environment variable or update directly
TEAMS_WEBHOOK_URL = os.environ.get("TEAMS_WEBHOOK_URL", "")

# Channel-specific webhooks (optional)
TEAMS_WEBHOOKS = {
    "general": os.environ.get("TEAMS_WEBHOOK_GENERAL", TEAMS_WEBHOOK_URL),
    "alerts": os.environ.get("TEAMS_WEBHOOK_ALERTS", TEAMS_WEBHOOK_URL),
    "automation": os.environ.get("TEAMS_WEBHOOK_AUTOMATION", TEAMS_WEBHOOK_URL),
}

# =============================================================================
# PORTAL CREDENTIALS (via environment variables)
# =============================================================================

PORTAL_CREDENTIALS = {
    "supplypro": {
        "url": "https://www.hyphensolutions.com/MH2Supply/",
        "username": os.environ.get("SUPPLYPRO_USER", ""),
        "password": os.environ.get("SUPPLYPRO_PASS", ""),
    },
    "hyphen": {
        "url": "https://www.hyphensolutions.com/",
        "username": os.environ.get("HYPHEN_USER", ""),
        "password": os.environ.get("HYPHEN_PASS", ""),
    },
}

# =============================================================================
# BACKUP CONFIGURATION
# =============================================================================

BACKUP_CONFIG = {
    "nightly": {
        "retention_days": 7,
        "include_patterns": ["*.xlsx", "*.pdf", "*.json", "*.csv"],
        "exclude_patterns": ["~$*", "*.tmp"],
    },
    "weekly": {
        "retention_weeks": 4,
        "day_of_week": 6,  # Sunday = 6
    },
    "monthly": {
        "retention_months": 12,
        "day_of_month": 1,
    },
}

# =============================================================================
# EXPECTED FOLDER STRUCTURE
# =============================================================================

EXPECTED_STRUCTURE = {
    "mindflow": {
        "00_Intake": ["Richmond American", "Holt Homes", "Manor Homes", "Sekisui House"],
        "01_Materials": ["Master_Files", "Imports", "Archive"],
        "02_Plans": ["Drawings", "Plan_Specs", "Archive"],
        "03_BOMs": ["Generated", "Final", "Archive"],
        "04_Jobs": ["Active", "Complete", "Templates"],
        "05_Schedules": ["Weekly", "Monthly", "Reports"],
        "06_Contracts": ["Active_Contracts", "Amendments", "Archive"],
        "07_Purchase_Orders": ["Pending", "Approved", "Archive"],
        "08_Time_Entries": ["Current_Period", "Archive", "Reports"],
        "09_Reports": ["Weekly", "Monthly", "Custom"],
        "10_System_Backups": ["JSON_Backups", "CSV_Exports", "Archive"],
        "11_Training": ["User_Guides", "Videos", "Quick_Reference"],
    },
    "customer_files": {
        "Richmond American": [],  # Subdivisions auto-detected
        "Holt Homes": [],
        "Manor Homes": [],
        "Sekisui House": [],
    },
    "operations": {
        "PDSS": [],
        "Pride Board": [],
        "Contract Analysis": [],
        "EPO Reports": [],
    },
    "bats": {
        "Richmond American": [],
        "Holt Homes": [],
        "Manor Homes": [],
    },
}

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

LOG_CONFIG = {
    "level": os.environ.get("LOG_LEVEL", "INFO"),
    "format": "%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    "date_format": "%Y-%m-%d %H:%M:%S",
}

# =============================================================================
# FEATURE FLAGS
# =============================================================================

FEATURES = {
    "teams_notifications": True,
    "auto_backup": True,
    "portal_scraping": False,  # Enable when Playwright is configured
    "document_routing": True,
}
