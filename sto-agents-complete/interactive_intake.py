"""
Interactive Intake Form
=======================
CLI-based intake form that pre-fills from detected file information
and directly creates folders/tracking.

Can also launch the HTML form and watch for saved JSON files.
"""

import os
import sys
import json
import time
import webbrowser
import subprocess
from pathlib import Path
from datetime import datetime

# Add parent directory for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from config.settings import LOCAL_SYNC_ROOT, BUILDERS
except ImportError:
    LOCAL_SYNC_ROOT = Path(".")
    BUILDERS = {}


# ==============================================================================
# CONFIGURATION
# ==============================================================================

INTAKE_JSON_FOLDER = "_NewProjects"
PENDING_INTAKE_FILE = "pending_intake.json"

# Builder display names
BUILDER_NAMES = {
    'richmond_american': 'Richmond American',
    'holt_homes': 'Holt Homes',
    'manor_hsr': 'Manor HSR',
    'sekisui_house': 'Sekisui House'
}

# Document type options
DOC_TYPES = [
    ('1', 'ARCH_DRAWINGS', 'Architectural Drawings'),
    ('2', 'CALC_PKG', 'Calc Package'),
    ('3', 'TRUSS_CALCS', 'Truss Calcs/Layout'),
    ('4', 'FLOOR_TRUSS', 'Floor Truss Calcs'),
    ('5', 'IJOIST_LAYOUT', 'I-Joist Layout'),
    ('6', 'PLOT_PLAN', 'Plot Plan'),
    ('7', 'JIO', 'JIO'),
    ('8', 'HCO', 'HCO'),
    ('9', 'SPEC_REPORT', 'Spec Report'),
]


# ==============================================================================
# INTERACTIVE FORM
# ==============================================================================

def print_header():
    """Print form header"""
    print()
    print("╔" + "═" * 58 + "╗")
    print("║" + " 📋 NEW PROJECT INTAKE FORM ".center(58) + "║")
    print("║" + " Sales Team One PDX ".center(58) + "║")
    print("╚" + "═" * 58 + "╝")
    print()


def prompt(label: str, default: str = None, required: bool = False) -> str:
    """Prompt for input with optional default"""
    if default:
        display = f"{label} [{default}]: "
    else:
        display = f"{label}: "
    
    if required:
        display = f"{label} *: " if not default else f"{label} * [{default}]: "
    
    while True:
        value = input(display).strip()
        if not value and default:
            return default
        if not value and required:
            print("  ⚠️  This field is required")
            continue
        return value


def prompt_builder(default: str = None) -> str:
    """Prompt for builder selection"""
    print("\nSelect Builder:")
    builders = list(BUILDER_NAMES.items())
    for i, (key, name) in enumerate(builders, 1):
        marker = " *" if key == default else ""
        print(f"  [{i}] {name}{marker}")
    
    while True:
        choice = input("\nBuilder [1-4]: ").strip()
        if not choice and default:
            return default
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(builders):
                return builders[idx][0]
        except ValueError:
            pass
        print("  ⚠️  Enter a number 1-4")


def prompt_documents() -> list:
    """Prompt for expected document types"""
    print("\nExpected Documents (enter numbers separated by commas):")
    for num, code, name in DOC_TYPES:
        print(f"  [{num}] {name}")
    
    print("\nDefault: 1,2,3 (Arch, Calc, Truss)")
    choice = input("Documents [1,2,3]: ").strip()
    
    if not choice:
        return ['ARCH_DRAWINGS', 'CALC_PKG', 'TRUSS_CALCS']
    
    selected = []
    for num in choice.split(','):
        num = num.strip()
        for doc_num, code, name in DOC_TYPES:
            if num == doc_num:
                selected.append(code)
    
    return selected if selected else ['ARCH_DRAWINGS', 'CALC_PKG', 'TRUSS_CALCS']


def prompt_priority() -> str:
    """Prompt for priority level"""
    print("\nPriority:")
    print("  [1] Normal")
    print("  [2] High")
    print("  [3] Rush")
    
    choice = input("Priority [1]: ").strip()
    return {'1': 'normal', '2': 'high', '3': 'rush'}.get(choice, 'normal')


def run_interactive_intake(prefill: dict = None) -> dict:
    """
    Run interactive intake form.
    
    Args:
        prefill: Dict with pre-filled values from file detection
        
    Returns:
        Complete intake data dict, or None if cancelled
    """
    prefill = prefill or {}
    
    print_header()
    
    if prefill:
        print("ℹ️  Pre-filled from detected file information")
        print("   Press Enter to accept defaults, or type new values\n")
    
    print("─" * 60)
    print(" BUILDER & PROJECT")
    print("─" * 60)
    
    # Builder
    builder = prompt_builder(prefill.get('builder'))
    builder_display = BUILDER_NAMES.get(builder, builder)
    
    # Subdivision
    subdivision = prompt(
        "Subdivision Name",
        default=prefill.get('subdivision'),
        required=True
    )
    
    # Location
    print()
    city = prompt("City", default=prefill.get('city'))
    county = prompt("County")
    state = prompt("State", default="OR")
    
    print()
    print("─" * 60)
    print(" LOT & PLAN INFORMATION")
    print("─" * 60)
    
    # Lot info
    lot_start = prompt("First Lot Number", default=prefill.get('lot_number'))
    lot_end = prompt("Last Lot Number (if known)")
    lot_prefix = prompt("Lot ID Prefix (for portals)", default=prefill.get('lot_prefix'))
    
    # Plans
    print()
    plan_codes = prompt("Expected Plan Codes (comma-separated)")
    
    print()
    print("─" * 60)
    print(" CONTACTS")
    print("─" * 60)
    
    super_name = prompt("Superintendent Name")
    super_phone = prompt("Superintendent Phone") if super_name else ""
    pm_name = prompt("Project Manager Name")
    pm_email = prompt("PM Email") if pm_name else ""
    
    print()
    print("─" * 60)
    print(" DOCUMENTS & TIMELINE")
    print("─" * 60)
    
    # Documents
    expected_docs = prompt_documents()
    
    # Priority
    priority = prompt_priority()
    
    # Notes
    print()
    notes = prompt("Notes (optional)")
    
    # Build intake package
    intake = {
        'metadata': {
            'created_at': datetime.now().isoformat(),
            'created_by': 'interactive_intake',
            'version': '1.0'
        },
        'project': {
            'builder': builder,
            'builder_display': builder_display,
            'subdivision': subdivision,
            'city': city or None,
            'county': county or None,
            'state': state
        },
        'lots': {
            'first_lot': int(lot_start) if lot_start and lot_start.isdigit() else None,
            'last_lot': int(lot_end) if lot_end and lot_end.isdigit() else None,
            'lot_prefix': lot_prefix or None,
            'total_lots': None
        },
        'plans': {
            'expected_codes': [c.strip() for c in plan_codes.split(',') if c.strip()] if plan_codes else []
        },
        'contacts': {
            'superintendent': {
                'name': super_name or None,
                'phone': super_phone or None
            },
            'project_manager': {
                'name': pm_name or None,
                'email': pm_email or None
            }
        },
        'documents': {
            'expected': expected_docs,
            'required': ['ARCH_DRAWINGS', 'CALC_PKG', 'TRUSS_CALCS']
        },
        'timeline': {
            'start_date': datetime.now().strftime('%Y-%m-%d'),
            'first_delivery': None,
            'priority': priority
        },
        'notes': notes or None,
        'folders_to_create': [
            f"Customer Files/{builder_display}/{subdivision}",
            f"00_Intake/{builder_display}/{subdivision}"
        ],
        'pdss_entry': {
            'subdivision': subdivision,
            'builder': builder,
            'status': 'new',
            'plan_status': 'pending',
            'takeoff_status': 'not_started',
            'quote_status': 'not_started',
            'documents_complete': False
        }
    }
    
    # Calculate total lots
    if intake['lots']['first_lot'] and intake['lots']['last_lot']:
        intake['lots']['total_lots'] = intake['lots']['last_lot'] - intake['lots']['first_lot'] + 1
    
    # Confirm
    print()
    print("═" * 60)
    print(" SUMMARY")
    print("═" * 60)
    print(f"  Builder:      {builder_display}")
    print(f"  Subdivision:  {subdivision}")
    print(f"  Location:     {city or 'TBD'}, {state}")
    if intake['lots']['first_lot']:
        lot_range = f"Lot {intake['lots']['first_lot']}"
        if intake['lots']['last_lot']:
            lot_range += f" - {intake['lots']['last_lot']}"
        print(f"  Lots:         {lot_range}")
    if lot_prefix:
        print(f"  Lot Prefix:   {lot_prefix}")
    print(f"  Priority:     {priority.title()}")
    print()
    
    confirm = input("Create folders and save intake? [Y/n]: ").strip().lower()
    if confirm in ('n', 'no'):
        print("\n❌ Cancelled")
        return None
    
    return intake


# ==============================================================================
# FILE OPERATIONS
# ==============================================================================

def save_intake_json(intake: dict) -> Path:
    """Save intake data to JSON file"""
    intake_folder = Path(LOCAL_SYNC_ROOT) / "00_Intake" / INTAKE_JSON_FOLDER
    intake_folder.mkdir(parents=True, exist_ok=True)
    
    subdivision = intake['project']['subdivision'].replace(' ', '_')
    filename = f"intake_{subdivision}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = intake_folder / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(intake, f, indent=2)
    
    return filepath


def create_folders_from_intake(intake: dict) -> dict:
    """Create folder structure from intake data"""
    results = {
        'folders_created': [],
        'folders_existed': [],
        'errors': []
    }
    
    builder_display = intake['project']['builder_display']
    subdivision = intake['project']['subdivision']
    
    root = Path(LOCAL_SYNC_ROOT)
    
    # Customer Files path
    customer_path = root / "Customer Files" / builder_display / subdivision
    try:
        if customer_path.exists():
            results['folders_existed'].append(str(customer_path))
        else:
            customer_path.mkdir(parents=True, exist_ok=True)
            results['folders_created'].append(str(customer_path))
    except Exception as e:
        results['errors'].append(str(e))
    
    # Intake path
    intake_path = root / "00_Intake" / builder_display / subdivision
    try:
        if intake_path.exists():
            results['folders_existed'].append(str(intake_path))
        else:
            intake_path.mkdir(parents=True, exist_ok=True)
            results['folders_created'].append(str(intake_path))
    except Exception as e:
        results['errors'].append(str(e))
    
    # Create first lot folder if specified
    first_lot = intake['lots'].get('first_lot')
    if first_lot:
        lot_path = customer_path / f"Lot {first_lot}"
        try:
            lot_path.mkdir(parents=True, exist_ok=True)
            (lot_path / "Plans and Layouts").mkdir(exist_ok=True)
            (lot_path / "POs").mkdir(exist_ok=True)
            results['folders_created'].append(str(lot_path))
        except Exception as e:
            results['errors'].append(str(e))
    
    return results


def write_pending_intake(prefill: dict) -> Path:
    """Write pending intake file for HTML form to read"""
    pending_path = Path(LOCAL_SYNC_ROOT) / "00_Intake" / INTAKE_JSON_FOLDER / PENDING_INTAKE_FILE
    pending_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(pending_path, 'w', encoding='utf-8') as f:
        json.dump(prefill, f, indent=2)
    
    return pending_path


def watch_for_intake_json(timeout: int = 300) -> Path:
    """
    Watch the intake folder for new JSON files.
    
    Args:
        timeout: Max seconds to wait
        
    Returns:
        Path to new intake file, or None if timeout
    """
    intake_folder = Path(LOCAL_SYNC_ROOT) / "00_Intake" / INTAKE_JSON_FOLDER
    intake_folder.mkdir(parents=True, exist_ok=True)
    
    # Get existing files
    existing = set(intake_folder.glob("intake_*.json"))
    
    print(f"\n⏳ Waiting for intake JSON file (timeout: {timeout}s)...")
    print(f"   Save to: {intake_folder}")
    
    start = time.time()
    while time.time() - start < timeout:
        current = set(intake_folder.glob("intake_*.json"))
        new_files = current - existing
        
        if new_files:
            # Return the newest one
            newest = max(new_files, key=lambda p: p.stat().st_mtime)
            return newest
        
        time.sleep(1)
    
    return None


# ==============================================================================
# MAIN WORKFLOW
# ==============================================================================

def launch_html_intake(prefill: dict = None) -> dict:
    """
    Launch HTML intake form and wait for JSON.
    
    Args:
        prefill: Dict with pre-filled values
        
    Returns:
        Intake data from saved JSON, or None
    """
    # Write prefill data for HTML to read
    if prefill:
        write_pending_intake(prefill)
    
    # Find HTML file
    html_path = Path(__file__).parent.parent / "NewProjectIntake.html"
    if not html_path.exists():
        print(f"⚠️  HTML form not found: {html_path}")
        return None
    
    # Launch browser
    print("\n🌐 Opening intake form in browser...")
    webbrowser.open(f'file://{html_path.absolute()}')
    
    # Wait for JSON
    json_path = watch_for_intake_json(timeout=300)
    
    if json_path:
        print(f"\n✅ Found intake file: {json_path.name}")
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        print("\n⏰ Timeout waiting for intake file")
        return None


def run_intake_for_files(detected_info: dict, use_html: bool = False) -> dict:
    """
    Run intake process for detected files.
    
    Args:
        detected_info: Info from file detection (subdivision, builder, lot_id, etc.)
        use_html: If True, launch HTML form; else use CLI
        
    Returns:
        Results dict
    """
    # Build prefill from detection
    prefill = {
        'builder': detected_info.get('builder'),
        'subdivision': detected_info.get('name'),
        'lot_number': detected_info.get('lots', [None])[0] if detected_info.get('lots') else None,
        'lot_prefix': detected_info.get('lot_prefix'),
    }
    
    # Get intake data
    if use_html:
        intake = launch_html_intake(prefill)
    else:
        intake = run_interactive_intake(prefill)
    
    if not intake:
        return {'success': False, 'reason': 'cancelled'}
    
    # Create folders
    folder_results = create_folders_from_intake(intake)
    
    # Save JSON
    json_path = save_intake_json(intake)
    
    # Print results
    print()
    print("═" * 60)
    print(" ✅ INTAKE COMPLETE")
    print("═" * 60)
    print(f"  Subdivision:  {intake['project']['subdivision']}")
    print(f"  Folders:      {len(folder_results['folders_created'])} created")
    print(f"  JSON saved:   {json_path.name}")
    print()
    
    return {
        'success': True,
        'intake': intake,
        'folders': folder_results,
        'json_path': str(json_path)
    }


# ==============================================================================
# CLI
# ==============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Interactive new project intake')
    parser.add_argument('--html', action='store_true', help='Use HTML form instead of CLI')
    parser.add_argument('--builder', '-b', help='Pre-fill builder (richmond_american, holt_homes, etc.)')
    parser.add_argument('--subdivision', '-s', help='Pre-fill subdivision name')
    parser.add_argument('--lot', '-l', help='Pre-fill lot number')
    parser.add_argument('--prefix', '-p', help='Pre-fill lot ID prefix')
    
    args = parser.parse_args()
    
    prefill = {}
    if args.builder:
        prefill['builder'] = args.builder
    if args.subdivision:
        prefill['subdivision'] = args.subdivision
    if args.lot:
        prefill['lot_number'] = args.lot
    if args.prefix:
        prefill['lot_prefix'] = args.prefix
    
    if args.html:
        result = launch_html_intake(prefill if prefill else None)
    else:
        intake = run_interactive_intake(prefill if prefill else None)
        if intake:
            folder_results = create_folders_from_intake(intake)
            json_path = save_intake_json(intake)
            print(f"\n✅ Saved to: {json_path}")
            print(f"   Created {len(folder_results['folders_created'])} folders")
