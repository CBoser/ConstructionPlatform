"""
Intake Processor Agent
======================
Processes new project intake JSON files to create folder structure and PDSS tracking.

Usage:
    python -m agents.intake_processor
    python -m agents.intake_processor --file intake_CoyoteRidge_2025-12-10.json
    
Features:
- Reads intake JSON files from 00_Intake/_NewProjects/
- Creates Customer Files/{Builder}/{Subdivision}/ folder with subfolders
- Creates 00_Intake/{Builder}/{Subdivision}/ landing zone
- Adds entry to PDSS tracker
- Sends Teams notification about new project
- Logs all actions
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.settings import (
    LOCAL_SYNC_ROOT,
    BUILDER_CONFIGS,
    get_path
)
from services.teams_notify import send_teams_notification

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('intake_processor')


# ==============================================================================
# CONFIGURATION
# ==============================================================================

# Default subfolders to create for each lot
LOT_SUBFOLDERS = [
    "Plans and Layouts",
    "POs"
]

# Additional subfolders by builder
BUILDER_SUBFOLDERS = {
    'richmond_american': ["Plans and Layouts", "POs", "ECIRs"],
    'holt_homes': ["Plans and Layouts", "POs"],
    'manor_hsr': ["Plans and Layouts", "POs"],
    'sekisui_house': ["Plans and Layouts", "POs", "Specs"]
}

# Intake JSON folder
INTAKE_JSON_FOLDER = "_NewProjects"


# ==============================================================================
# FOLDER CREATION
# ==============================================================================

def create_subdivision_folders(intake_data: dict, dry_run: bool = False) -> dict:
    """
    Create all folders for a new subdivision based on intake data.
    
    Args:
        intake_data: Parsed intake JSON
        dry_run: If True, only report what would be created
        
    Returns:
        Dictionary with creation results
    """
    results = {
        'folders_created': [],
        'folders_existed': [],
        'errors': []
    }
    
    builder = intake_data['project']['builder']
    builder_display = intake_data['project']['builder_display']
    subdivision = intake_data['project']['subdivision']
    
    root = Path(LOCAL_SYNC_ROOT)
    
    # 1. Create Customer Files path
    customer_files_path = root / "Customer Files" / builder_display / subdivision
    
    if dry_run:
        logger.info(f"[DRY RUN] Would create: {customer_files_path}")
        results['folders_created'].append(str(customer_files_path))
    else:
        try:
            if customer_files_path.exists():
                logger.info(f"Already exists: {customer_files_path}")
                results['folders_existed'].append(str(customer_files_path))
            else:
                customer_files_path.mkdir(parents=True, exist_ok=True)
                logger.info(f"Created: {customer_files_path}")
                results['folders_created'].append(str(customer_files_path))
        except Exception as e:
            logger.error(f"Failed to create {customer_files_path}: {e}")
            results['errors'].append(str(e))
    
    # 2. Create 00_Intake path
    intake_path = root / "00_Intake" / builder_display / subdivision
    
    if dry_run:
        logger.info(f"[DRY RUN] Would create: {intake_path}")
        results['folders_created'].append(str(intake_path))
    else:
        try:
            if intake_path.exists():
                logger.info(f"Already exists: {intake_path}")
                results['folders_existed'].append(str(intake_path))
            else:
                intake_path.mkdir(parents=True, exist_ok=True)
                logger.info(f"Created: {intake_path}")
                results['folders_created'].append(str(intake_path))
        except Exception as e:
            logger.error(f"Failed to create {intake_path}: {e}")
            results['errors'].append(str(e))
    
    # 3. Create sample lot folder if lot range provided
    lots = intake_data.get('lots', {})
    first_lot = lots.get('first_lot')
    
    if first_lot:
        lot_folder_name = f"Lot {first_lot}"
        lot_path = customer_files_path / lot_folder_name
        
        # Get builder-specific subfolders
        subfolders = BUILDER_SUBFOLDERS.get(builder, LOT_SUBFOLDERS)
        
        if dry_run:
            logger.info(f"[DRY RUN] Would create lot folder: {lot_path}")
            for subfolder in subfolders:
                logger.info(f"[DRY RUN] Would create: {lot_path / subfolder}")
        else:
            try:
                lot_path.mkdir(parents=True, exist_ok=True)
                results['folders_created'].append(str(lot_path))
                
                for subfolder in subfolders:
                    subfolder_path = lot_path / subfolder
                    subfolder_path.mkdir(exist_ok=True)
                    results['folders_created'].append(str(subfolder_path))
                    
                logger.info(f"Created lot folder with subfolders: {lot_path}")
            except Exception as e:
                logger.error(f"Failed to create lot folder: {e}")
                results['errors'].append(str(e))
    
    return results


# ==============================================================================
# PDSS INTEGRATION
# ==============================================================================

def add_to_pdss(intake_data: dict, dry_run: bool = False) -> dict:
    """
    Add new project to PDSS tracker.
    
    Args:
        intake_data: Parsed intake JSON
        dry_run: If True, only report what would be added
        
    Returns:
        Dictionary with PDSS results
    """
    pdss_path = Path(LOCAL_SYNC_ROOT) / "Operations" / "PDSS" / "pdss_tracker.json"
    
    # Create PDSS entry from intake
    pdss_entry = intake_data.get('pdss_entry', {})
    pdss_entry.update({
        'subdivision': intake_data['project']['subdivision'],
        'builder': intake_data['project']['builder'],
        'builder_display': intake_data['project']['builder_display'],
        'city': intake_data['project'].get('city'),
        'state': intake_data['project'].get('state'),
        'lot_range': f"{intake_data['lots'].get('first_lot', '?')}-{intake_data['lots'].get('last_lot', '?')}",
        'lot_prefix': intake_data['lots'].get('lot_prefix'),
        'expected_plans': intake_data['plans'].get('expected_codes', []),
        'superintendent': intake_data['contacts'].get('superintendent', {}).get('name'),
        'super_phone': intake_data['contacts'].get('superintendent', {}).get('phone'),
        'pm_name': intake_data['contacts'].get('project_manager', {}).get('name'),
        'pm_email': intake_data['contacts'].get('project_manager', {}).get('email'),
        'expected_documents': intake_data['documents'].get('expected', []),
        'required_documents': intake_data['documents'].get('required', []),
        'start_date': intake_data['timeline'].get('start_date'),
        'priority': intake_data['timeline'].get('priority', 'normal'),
        'notes': intake_data.get('notes'),
        'created_at': datetime.now().isoformat(),
        'status': 'new',
        'jobs': {}
    })
    
    if dry_run:
        logger.info(f"[DRY RUN] Would add to PDSS: {pdss_entry['subdivision']}")
        return {'added': True, 'entry': pdss_entry}
    
    # Load existing PDSS data
    pdss_data = {'subdivisions': {}}
    if pdss_path.exists():
        try:
            with open(pdss_path, 'r', encoding='utf-8') as f:
                pdss_data = json.load(f)
        except Exception as e:
            logger.warning(f"Could not load existing PDSS data: {e}")
    
    # Add new subdivision
    sub_key = f"{pdss_entry['builder']}_{pdss_entry['subdivision'].replace(' ', '_').lower()}"
    
    if sub_key in pdss_data.get('subdivisions', {}):
        logger.warning(f"Subdivision {pdss_entry['subdivision']} already exists in PDSS")
        return {'added': False, 'reason': 'already_exists', 'entry': pdss_entry}
    
    pdss_data.setdefault('subdivisions', {})[sub_key] = pdss_entry
    pdss_data['last_updated'] = datetime.now().isoformat()
    
    # Save updated PDSS
    try:
        pdss_path.parent.mkdir(parents=True, exist_ok=True)
        with open(pdss_path, 'w', encoding='utf-8') as f:
            json.dump(pdss_data, f, indent=2)
        logger.info(f"Added {pdss_entry['subdivision']} to PDSS tracker")
        return {'added': True, 'entry': pdss_entry}
    except Exception as e:
        logger.error(f"Failed to update PDSS: {e}")
        return {'added': False, 'reason': str(e), 'entry': pdss_entry}


# ==============================================================================
# TEAMS NOTIFICATION
# ==============================================================================

def notify_new_project(intake_data: dict, folder_results: dict) -> bool:
    """
    Send Teams notification about new project intake.
    """
    subdivision = intake_data['project']['subdivision']
    builder = intake_data['project']['builder_display']
    
    # Build summary
    lots = intake_data.get('lots', {})
    lot_info = ""
    if lots.get('first_lot') and lots.get('last_lot'):
        lot_info = f"Lots {lots['first_lot']}-{lots['last_lot']} ({lots.get('total_lots', '?')} total)"
    elif lots.get('first_lot'):
        lot_info = f"Starting at Lot {lots['first_lot']}"
    
    plans = intake_data['plans'].get('expected_codes', [])
    plan_info = ', '.join(plans) if plans else 'Not specified'
    
    super_info = intake_data['contacts'].get('superintendent', {})
    super_name = super_info.get('name', 'Not specified')
    
    priority = intake_data['timeline'].get('priority', 'normal')
    priority_emoji = {'rush': '🔴', 'high': '🟡', 'normal': '🟢'}.get(priority, '⚪')
    
    message = f"""📋 **New Project Intake: {subdivision}**

**Builder:** {builder}
**Location:** {intake_data['project'].get('city', 'TBD')}, {intake_data['project'].get('state', 'OR')}
**Lots:** {lot_info or 'Not specified'}
**Plans:** {plan_info}
**Superintendent:** {super_name}
**Priority:** {priority_emoji} {priority.title()}

**Folders Created:** {len(folder_results.get('folders_created', []))}
**Status:** ✅ Ready for intake

Drop files in `00_Intake/{builder}/{subdivision}/` to begin processing."""

    try:
        return send_teams_notification(
            message,
            title=f"New Project: {subdivision}",
            color="0078D4"  # Blue for info
        )
    except Exception as e:
        logger.error(f"Failed to send Teams notification: {e}")
        return False


# ==============================================================================
# FILE PROCESSING
# ==============================================================================

def find_intake_files() -> list:
    """
    Find all intake JSON files in the _NewProjects folder.
    """
    intake_folder = Path(LOCAL_SYNC_ROOT) / "00_Intake" / INTAKE_JSON_FOLDER
    
    if not intake_folder.exists():
        logger.info(f"Creating intake JSON folder: {intake_folder}")
        intake_folder.mkdir(parents=True, exist_ok=True)
        return []
    
    json_files = list(intake_folder.glob("intake_*.json"))
    logger.info(f"Found {len(json_files)} intake file(s)")
    return json_files


def process_intake_file(filepath: Path, dry_run: bool = False) -> dict:
    """
    Process a single intake JSON file.
    
    Args:
        filepath: Path to intake JSON file
        dry_run: If True, only simulate actions
        
    Returns:
        Processing results dictionary
    """
    logger.info(f"Processing intake file: {filepath.name}")
    
    results = {
        'file': str(filepath),
        'success': False,
        'folders': {},
        'pdss': {},
        'notification_sent': False,
        'errors': []
    }
    
    # Load and validate JSON
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            intake_data = json.load(f)
    except json.JSONDecodeError as e:
        results['errors'].append(f"Invalid JSON: {e}")
        return results
    except Exception as e:
        results['errors'].append(f"Could not read file: {e}")
        return results
    
    # Validate required fields
    if 'project' not in intake_data:
        results['errors'].append("Missing 'project' section")
        return results
    if not intake_data['project'].get('builder'):
        results['errors'].append("Missing builder")
        return results
    if not intake_data['project'].get('subdivision'):
        results['errors'].append("Missing subdivision name")
        return results
    
    subdivision = intake_data['project']['subdivision']
    logger.info(f"Processing new project: {subdivision}")
    
    # 1. Create folders
    folder_results = create_subdivision_folders(intake_data, dry_run=dry_run)
    results['folders'] = folder_results
    
    if folder_results['errors']:
        results['errors'].extend(folder_results['errors'])
    
    # 2. Add to PDSS
    pdss_results = add_to_pdss(intake_data, dry_run=dry_run)
    results['pdss'] = pdss_results
    
    # 3. Send notification (skip if dry run)
    if not dry_run and not folder_results['errors']:
        results['notification_sent'] = notify_new_project(intake_data, folder_results)
    
    # 4. Archive the intake file (move to processed)
    if not dry_run and not results['errors']:
        try:
            processed_folder = filepath.parent / "processed"
            processed_folder.mkdir(exist_ok=True)
            
            new_name = f"{filepath.stem}_processed_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            new_path = processed_folder / new_name
            
            filepath.rename(new_path)
            logger.info(f"Archived intake file to: {new_path}")
            results['archived_to'] = str(new_path)
        except Exception as e:
            logger.warning(f"Could not archive intake file: {e}")
    
    results['success'] = len(results['errors']) == 0
    return results


# ==============================================================================
# MAIN ENTRY POINTS
# ==============================================================================

def process_all_intakes(dry_run: bool = False) -> dict:
    """
    Process all pending intake files.
    """
    logger.info("=" * 60)
    logger.info("Starting Intake Processor - Processing all pending intakes")
    logger.info("=" * 60)
    
    results = {
        'start_time': datetime.now().isoformat(),
        'files_found': 0,
        'files_processed': 0,
        'files_failed': 0,
        'details': [],
        'errors': []
    }
    
    # Find intake files
    intake_files = find_intake_files()
    results['files_found'] = len(intake_files)
    
    if not intake_files:
        logger.info("No intake files to process")
        results['end_time'] = datetime.now().isoformat()
        return results
    
    # Process each file
    for filepath in intake_files:
        try:
            file_result = process_intake_file(filepath, dry_run=dry_run)
            results['details'].append(file_result)
            
            if file_result['success']:
                results['files_processed'] += 1
            else:
                results['files_failed'] += 1
                
        except Exception as e:
            logger.error(f"Error processing {filepath.name}: {e}")
            results['files_failed'] += 1
            results['errors'].append(f"{filepath.name}: {str(e)}")
    
    results['end_time'] = datetime.now().isoformat()
    
    logger.info("=" * 60)
    logger.info(f"Intake Processing Complete: {results['files_processed']}/{results['files_found']} successful")
    logger.info("=" * 60)
    
    return results


def process_single_file(filepath: str, dry_run: bool = False) -> dict:
    """
    Process a specific intake file.
    """
    path = Path(filepath)
    if not path.exists():
        return {'success': False, 'error': f'File not found: {filepath}'}
    
    return process_intake_file(path, dry_run=dry_run)


# ==============================================================================
# CLI
# ==============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Process new project intake files')
    parser.add_argument('--file', '-f', help='Process a specific intake JSON file')
    parser.add_argument('--dry-run', '-d', action='store_true', 
                        help='Simulate actions without making changes')
    parser.add_argument('--json', '-j', action='store_true',
                        help='Output results as JSON')
    
    args = parser.parse_args()
    
    if args.file:
        results = process_single_file(args.file, dry_run=args.dry_run)
    else:
        results = process_all_intakes(dry_run=args.dry_run)
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        # Print summary
        print("\n" + "=" * 60)
        print("INTAKE PROCESSOR RESULTS")
        print("=" * 60)
        
        if 'files_found' in results:
            print(f"Files Found: {results['files_found']}")
            print(f"Processed: {results['files_processed']}")
            print(f"Failed: {results['files_failed']}")
        else:
            print(f"Success: {results.get('success', False)}")
            if results.get('folders', {}).get('folders_created'):
                print(f"Folders Created: {len(results['folders']['folders_created'])}")
        
        if results.get('errors'):
            print(f"\nErrors: {len(results['errors'])}")
            for error in results['errors']:
                print(f"  - {error}")
