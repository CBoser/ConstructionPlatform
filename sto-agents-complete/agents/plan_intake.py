"""
Plan Intake Monitor Agent
Monitors 00_Intake folders and routes files to Customer Files structure.

For manual intake workflow:
1. Download files from portals manually
2. Drop them in 00_Intake/{Builder}/{Subdivision}/
3. Run this agent to route to Customer Files/{Builder}/{Subdivision}/{Lot}/
"""

import logging
import shutil
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

# Setup logging
logger = logging.getLogger('plan_intake')

# Import settings
try:
    from config.settings import (
        BUILDERS, INTAKE_PATH, CUSTOMER_FILES,
        get_intake_files, get_active_subdivisions
    )
except ImportError:
    logger.warning("Could not import settings, using defaults")
    BUILDERS = {}
    INTAKE_PATH = Path("./00_Intake")
    CUSTOMER_FILES = Path("./Customer Files")

# =============================================================================
# FILE ROUTING LOGIC
# =============================================================================

def parse_filename(filename: str) -> dict:
    """
    Parse a filename to extract lot number, document type, subdivision, etc.
    
    Common patterns:
    - "33750127 JIO.pdf" -> lot=33750127, type=JIO
    - "ARCH DRAWINGS LOT 127.pdf" -> lot=127, type=ARCH DRAWINGS
    - "G892 - Ironwood.pdf" -> plan=G892, name=Ironwood
    - "13601047 - Coyote Ridge Lot 47 - Spec Home Report.pdf" -> lot_id=13601047, subdivision=Coyote Ridge, lot=47
    """
    result = {
        "lot_number": None,
        "lot_id": None,
        "doc_type": None,
        "plan_code": None,
        "subdivision": None,
        "original_name": filename,
    }
    
    name = Path(filename).stem
    
    # Words that indicate document types, not subdivision names
    DOC_TYPE_WORDS = {
        'approved', 'combined', 'plans', 'plan', 'drawings', 'drawing', 
        'arch', 'structural', 'struct', 'calcs', 'calc', 'truss', 
        'layout', 'layouts', 'spec', 'specs', 'report', 'reports',
        'jio', 'hco', 'plot', 'foundation', 'framing', 'roof',
        'floor', 'elevations', 'sections', 'details', 'schedules',
        'colorizations', 'renderings', 'permit', 'permits'
    }
    
    def looks_like_subdivision(text: str) -> bool:
        """Check if text looks like a subdivision name vs document type"""
        words = text.lower().split()
        # If all words are doc type words, it's not a subdivision
        if all(w in DOC_TYPE_WORDS for w in words):
            return False
        # If it's just 1-2 generic words, probably not a subdivision
        if len(words) <= 2 and any(w in DOC_TYPE_WORDS for w in words):
            return False
        # Subdivision names usually have proper nouns (capitalized)
        # or location-type words (Ridge, Heights, Estates, etc.)
        subdivision_indicators = {'ridge', 'heights', 'estates', 'meadows', 'landing', 
                                  'crossing', 'grove', 'hills', 'park', 'village',
                                  'place', 'creek', 'haven', 'springs', 'woods',
                                  'reserve', 'phase'}
        if any(w in subdivision_indicators for w in words):
            return True
        # Check for proper capitalization pattern (Title Case)
        if text != text.lower() and text != text.upper():
            return True
        return False
    
    # Pattern 0: Lot ID with subdivision name
    # "13601047 - Coyote Ridge Lot 47 - Spec Home Report"
    match = re.match(r'^(\d{7,8})\s*[-_]\s*([A-Za-z][A-Za-z\s]+?)\s+[Ll]ot\s*(\d+)', name)
    if match:
        result["lot_id"] = match.group(1)
        potential_sub = match.group(2).strip()
        result["lot_number"] = match.group(3)
        
        # Get doc type from rest of string
        rest = name[match.end():].strip(' -_')
        if rest:
            result["doc_type"] = rest
        
        # Only set subdivision if it looks like one
        if looks_like_subdivision(potential_sub):
            result["subdivision"] = potential_sub
        else:
            # It was probably a doc type, so include it
            if result["doc_type"]:
                result["doc_type"] = f"{potential_sub} {result['doc_type']}"
            else:
                result["doc_type"] = potential_sub
        
        return result
    
    # Pattern 0b: Lot ID with text but no clear subdivision
    # "13601047 - APPROVED Combined plans lot 47"
    match = re.match(r'^(\d{7,8})\s*[-_]\s*(.+?)\s+[Ll]ot\s*(\d+)', name)
    if match:
        result["lot_id"] = match.group(1)
        result["lot_number"] = match.group(3)
        potential_text = match.group(2).strip()
        
        if looks_like_subdivision(potential_text):
            result["subdivision"] = potential_text
        else:
            result["doc_type"] = potential_text
        return result
    
    # Pattern 1: Lot ID at start (e.g., "33750127 JIO")
    match = re.match(r'^(\d{8})\s*[-_]?\s*(.+)$', name)
    if match:
        result["lot_id"] = match.group(1)
        result["lot_number"] = match.group(1)
        result["doc_type"] = match.group(2).strip()
        return result
    
    # Pattern 2: LOT keyword (e.g., "ARCH DRAWINGS LOT 127")
    match = re.search(r'LOT\s*[-_]?\s*(\d+)', name, re.IGNORECASE)
    if match:
        result["lot_number"] = match.group(1)
        result["doc_type"] = re.sub(r'LOT\s*[-_]?\s*\d+', '', name, flags=re.IGNORECASE).strip()
        return result
    
    # Pattern 3: Plan code (e.g., "G892 - Ironwood")
    match = re.match(r'^([A-Z]\d{2,4}[A-Z]?)\s*[-_]?\s*(.+)$', name, re.IGNORECASE)
    if match:
        result["plan_code"] = match.group(1).upper()
        result["doc_type"] = match.group(2).strip()
        return result
    
    # Pattern 4: Just lot number
    match = re.match(r'^(\d{5,8})$', name)
    if match:
        result["lot_number"] = match.group(1)
        return result
    
    # No pattern matched - use full name as doc type
    result["doc_type"] = name
    return result


def detect_subdivision_from_files(files: list) -> dict:
    """
    Analyze files without subdivision folders to detect subdivision names.
    
    Returns dict mapping detected subdivision names to file info.
    """
    detected = {}
    
    for file_info in files:
        if file_info.get("subdivision"):
            continue  # Already has subdivision
            
        parsed = parse_filename(file_info["filename"])
        
        if parsed.get("subdivision"):
            sub_name = parsed["subdivision"]
            if sub_name not in detected:
                detected[sub_name] = {
                    "name": sub_name,
                    "builder": file_info["builder"],
                    "files": [],
                    "lots": set(),
                    "lot_prefix": None,
                }
            
            detected[sub_name]["files"].append(file_info)
            if parsed.get("lot_number"):
                detected[sub_name]["lots"].add(parsed["lot_number"])
            if parsed.get("lot_id"):
                # Extract prefix (first 5 digits typically)
                detected[sub_name]["lot_prefix"] = parsed["lot_id"][:5]
    
    # Convert sets to lists for JSON serialization
    for sub in detected.values():
        sub["lots"] = sorted(list(sub["lots"]))
    
    return detected


def prompt_create_subdivision(subdivision_info: dict, auto_create: bool = False) -> dict:
    """
    Prompt user to create subdivision folder structure.
    
    Returns dict with action taken.
    """
    sub_name = subdivision_info.get("name")
    builder = subdivision_info["builder"]
    files = subdivision_info["files"]
    lots = subdivision_info.get("lots", [])
    
    builder_config = BUILDERS.get(builder, {})
    builder_display = builder_config.get("name", builder)
    
    print("\n" + "=" * 60)
    print(f"🆕 NEW SUBDIVISION DETECTED: {sub_name or '(Unknown)'}")
    print("=" * 60)
    print(f"Builder: {builder_display}")
    print(f"Files waiting: {len(files)}")
    if lots:
        print(f"Lots detected: {', '.join(str(l) for l in lots)}")
    if subdivision_info.get("lot_prefix"):
        print(f"Lot ID prefix: {subdivision_info['lot_prefix']}")
    print()
    
    if auto_create and sub_name:
        response = 'q'  # Quick create
    else:
        print("Options:")
        print("  [Q] Quick create (just folders, use detected name)")
        print("  [F] Full intake form (add contacts, timeline, etc.)")
        print("  [S] Skip for now")
        print("  [X] Exit intake processing")
        print()
        response = input("Choice [Q/f/s/x]: ").strip().lower()
    
    if response == 'x':
        return {"action": "quit"}
    
    if response == 's':
        print(f"\n⏭️  Skipped")
        return {"action": "skipped", "subdivision": sub_name}
    
    if response == 'f':
        # Launch full interactive intake
        try:
            from agents.interactive_intake import run_intake_for_files
            result = run_intake_for_files(subdivision_info)
            
            if result.get('success'):
                # Move files to the new intake folder
                intake = result['intake']
                new_sub_name = intake['project']['subdivision']
                intake_path = builder_config.get("intake_path") / new_sub_name
                
                moved = 0
                for file_info in files:
                    try:
                        src = file_info["path"]
                        dst = intake_path / src.name
                        shutil.move(str(src), str(dst))
                        logger.info(f"Moved to intake: {src.name}")
                        moved += 1
                    except Exception as e:
                        logger.error(f"Failed to move {src.name}: {e}")
                
                return {
                    "action": "created",
                    "subdivision": new_sub_name,
                    "folders_created": result['folders']['folders_created'],
                    "files_moved": moved,
                }
            else:
                return {"action": "skipped", "reason": "intake_cancelled"}
                
        except ImportError as e:
            logger.error(f"Could not import interactive_intake: {e}")
            print("⚠️  Interactive intake not available, using quick create...")
            response = 'q'
    
    if response in ('q', 'y', 'yes', ''):
        # Quick create - just make folders with detected info
        if not sub_name:
            sub_name = input("Enter subdivision name: ").strip()
            if not sub_name:
                return {"action": "skipped", "reason": "no_name_provided"}
        
        customer_path = builder_config.get("customer_files_path")
        intake_path = builder_config.get("intake_path")
        
        if not customer_path:
            return {"action": "error", "error": "No customer files path configured"}
        
        try:
            # Create Customer Files path
            sub_customer_path = customer_path / sub_name
            sub_customer_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created: {sub_customer_path}")
            
            # Create Intake path
            sub_intake_path = intake_path / sub_name
            sub_intake_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created: {sub_intake_path}")
            
            # Create first lot folder if we detected one
            if lots:
                first_lot = lots[0]
                lot_path = sub_customer_path / f"Lot {first_lot}"
                lot_path.mkdir(parents=True, exist_ok=True)
                (lot_path / "Plans and Layouts").mkdir(exist_ok=True)
                (lot_path / "POs").mkdir(exist_ok=True)
                logger.info(f"Created lot folder: {lot_path}")
            
            # Move files to the intake subdivision folder
            moved = 0
            for file_info in files:
                try:
                    src = file_info["path"]
                    dst = sub_intake_path / src.name
                    shutil.move(str(src), str(dst))
                    logger.info(f"Moved to intake: {src.name}")
                    moved += 1
                except Exception as e:
                    logger.error(f"Failed to move {src.name}: {e}")
            
            print(f"\n✅ Created folders for {sub_name}")
            print(f"   Moved {moved} files to 00_Intake/{builder_display}/{sub_name}/")
            print(f"   Run Plan Intake again to route to Customer Files")
            
            return {
                "action": "created",
                "subdivision": sub_name,
                "folders_created": [str(sub_customer_path), str(sub_intake_path)],
                "files_moved": moved,
            }
            
        except Exception as e:
            logger.error(f"Failed to create folders: {e}")
            return {"action": "error", "error": str(e)}
    
    return {"action": "skipped", "subdivision": sub_name}

def determine_destination(file_path: Path, builder_key: str, subdivision: str = None) -> Optional[Path]:
    """
    Determine the destination path for a file.
    
    Returns Customer Files/{Builder}/{Subdivision}/{Lot}/ path
    or None if cannot determine.
    """
    builder = BUILDERS.get(builder_key)
    if not builder:
        return None
    
    customer_path = builder.get("customer_files_path")
    if not customer_path:
        return None
    
    parsed = parse_filename(file_path.name)
    
    # If we have a lot number, try to find or create the lot folder
    if parsed["lot_number"]:
        lot_id = parsed["lot_number"]
        
        # If subdivision provided, use it
        if subdivision:
            return customer_path / subdivision / f"Lot {lot_id}"
        
        # Try to find existing lot folder
        for sub in customer_path.iterdir():
            if sub.is_dir():
                for lot_folder in sub.iterdir():
                    if lot_folder.is_dir() and lot_id in lot_folder.name:
                        return lot_folder
        
        # Could not find existing - need subdivision
        logger.warning(f"Could not determine subdivision for lot {lot_id}")
        return None
    
    # Plan-level document (no lot number)
    if parsed["plan_code"] and subdivision:
        return customer_path / subdivision
    
    return None

def categorize_document(filename: str) -> str:
    """
    Categorize document into subfolder based on filename.
    Returns subfolder name: "Plans and Layouts", "POs", etc.
    """
    name_lower = filename.lower()
    
    # Plans category
    plan_keywords = ['arch', 'drawing', 'plan', 'truss', 'calc', 'structural', 
                     'floor', 'roof', 'elevation', 'layout']
    if any(kw in name_lower for kw in plan_keywords):
        return "Plans and Layouts"
    
    # PO category
    po_keywords = ['po', 'purchase', 'order', 'jio', 'hco', 'epo']
    if any(kw in name_lower for kw in po_keywords):
        return "POs"
    
    # Default to Plans
    return "Plans and Layouts"

def route_file(file_path: Path, builder_key: str, subdivision: str, lot_folder: str = None) -> dict:
    """
    Route a single file from Intake to Customer Files.
    
    Args:
        file_path: Source file in Intake folder
        builder_key: Builder identifier
        subdivision: Subdivision name
        lot_folder: Optional lot folder name (e.g., "Lot 127")
    
    Returns:
        dict with success status and destination
    """
    result = {
        "source": str(file_path),
        "success": False,
        "destination": None,
        "error": None,
    }
    
    builder = BUILDERS.get(builder_key)
    if not builder:
        result["error"] = f"Unknown builder: {builder_key}"
        return result
    
    customer_path = builder.get("customer_files_path")
    if not customer_path:
        result["error"] = "No customer files path configured"
        return result
    
    # Determine destination
    if lot_folder:
        dest_folder = customer_path / subdivision / lot_folder
    else:
        # Try to parse lot from filename
        parsed = parse_filename(file_path.name)
        if parsed["lot_number"]:
            dest_folder = customer_path / subdivision / f"Lot {parsed['lot_number']}"
        else:
            # Plan-level document
            dest_folder = customer_path / subdivision
    
    # Create destination folder if needed
    dest_folder.mkdir(parents=True, exist_ok=True)
    
    # Categorize into subfolder
    subfolder = categorize_document(file_path.name)
    final_dest = dest_folder / subfolder
    final_dest.mkdir(parents=True, exist_ok=True)
    
    # Copy file
    dest_file = final_dest / file_path.name
    
    try:
        # Check if file already exists
        if dest_file.exists():
            # Add timestamp to avoid overwrite
            stem = dest_file.stem
            suffix = dest_file.suffix
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            dest_file = final_dest / f"{stem}_{timestamp}{suffix}"
        
        shutil.copy2(file_path, dest_file)
        result["success"] = True
        result["destination"] = str(dest_file)
        
        # Remove from intake after successful copy
        file_path.unlink()
        logger.info(f"Routed: {file_path.name} -> {dest_file}")
        
    except Exception as e:
        result["error"] = str(e)
        logger.error(f"Failed to route {file_path.name}: {e}")
    
    return result

# =============================================================================
# INTAKE SCANNING
# =============================================================================

def scan_intake_folder(builder_key: str = None) -> list:
    """
    Scan intake folders for files to process.
    
    Returns list of files with metadata.
    """
    files = []
    
    builders_to_scan = [builder_key] if builder_key else BUILDERS.keys()
    
    for bkey in builders_to_scan:
        builder = BUILDERS.get(bkey)
        if not builder or not builder.get("active"):
            continue
        
        intake_path = builder.get("intake_path")
        if not intake_path or not intake_path.exists():
            continue
        
        # Scan intake folder (may have subdivision subfolders)
        for item in intake_path.rglob("*"):
            if item.is_file() and not item.name.startswith('.'):
                # Determine subdivision from folder structure
                rel_path = item.relative_to(intake_path)
                subdivision = rel_path.parent.name if rel_path.parent != Path('.') else None
                
                files.append({
                    "path": item,
                    "builder": bkey,
                    "subdivision": subdivision,
                    "filename": item.name,
                    "size": item.stat().st_size,
                    "modified": datetime.fromtimestamp(item.stat().st_mtime),
                })
    
    return files

def process_intake_queue(builder_key: str = None, dry_run: bool = False, auto_create: bool = False) -> dict:
    """
    Process all files in intake queue.
    
    Args:
        builder_key: Optional - only process this builder
        dry_run: If True, don't actually move files
        auto_create: If True, auto-create detected subdivisions without prompting
    
    Returns:
        dict with processing results
    """
    results = {
        "start_time": datetime.now().isoformat(),
        "files_found": 0,
        "files_routed": 0,
        "files_skipped": 0,
        "files_failed": 0,
        "subdivisions_created": [],
        "details": [],
    }
    
    files = scan_intake_folder(builder_key)
    results["files_found"] = len(files)
    
    # First pass: detect files without subdivision folders
    orphan_files = [f for f in files if not f.get("subdivision")]
    
    if orphan_files:
        # Try to detect subdivision names from filenames
        detected = detect_subdivision_from_files(orphan_files)
        
        if detected:
            print(f"\n📁 Found {len(orphan_files)} file(s) without subdivision folders")
            print(f"   Detected {len(detected)} potential subdivision(s) from filenames\n")
            
            for sub_name, sub_info in detected.items():
                prompt_result = prompt_create_subdivision(sub_info, auto_create=auto_create)
                
                if prompt_result["action"] == "quit":
                    results["details"].append({
                        "status": "user_quit",
                        "message": "User cancelled intake processing"
                    })
                    results["end_time"] = datetime.now().isoformat()
                    return results
                
                elif prompt_result["action"] == "created":
                    results["subdivisions_created"].append(prompt_result)
                    # Remove these files from orphan list since they were moved
                    orphan_files = [f for f in orphan_files 
                                   if f["filename"] not in [fi["filename"] for fi in sub_info["files"]]]
                
                elif prompt_result["action"] == "error":
                    results["details"].append({
                        "subdivision": sub_name,
                        "status": "error",
                        "error": prompt_result.get("error")
                    })
        
        # Any remaining orphan files that couldn't be detected
        remaining_orphans = [f for f in orphan_files 
                           if not any(f["filename"] in [fi["filename"] for fi in sub["files"]] 
                                     for sub in detected.values())]
        
        if remaining_orphans:
            print(f"\n⚠️  {len(remaining_orphans)} file(s) could not be auto-detected:")
            for f in remaining_orphans[:5]:  # Show first 5
                print(f"   - {f['filename']}")
            if len(remaining_orphans) > 5:
                print(f"   ... and {len(remaining_orphans) - 5} more")
            
            print("\nOptions:")
            print("  [F] Fill out intake form for these files")
            print("  [S] Skip (move files manually later)")
            choice = input("\nChoice [F/s]: ").strip().lower()
            
            if choice in ('f', ''):
                # Group orphans by builder and offer intake
                by_builder = {}
                for f in remaining_orphans:
                    b = f['builder']
                    if b not in by_builder:
                        by_builder[b] = []
                    by_builder[b].append(f)
                
                for builder_key, builder_files in by_builder.items():
                    # Create a pseudo-detection info for the interactive intake
                    orphan_info = {
                        'name': None,  # Will prompt for name
                        'builder': builder_key,
                        'files': builder_files,
                        'lots': [],
                        'lot_prefix': None
                    }
                    
                    # Extract any lot info we can
                    for bf in builder_files:
                        parsed = parse_filename(bf['filename'])
                        if parsed.get('lot_number'):
                            orphan_info['lots'].append(parsed['lot_number'])
                        if parsed.get('lot_id') and not orphan_info['lot_prefix']:
                            orphan_info['lot_prefix'] = parsed['lot_id'][:5]
                    
                    orphan_info['lots'] = sorted(set(orphan_info['lots']))
                    
                    prompt_result = prompt_create_subdivision(orphan_info, auto_create=False)
                    
                    if prompt_result["action"] == "quit":
                        results["details"].append({
                            "status": "user_quit",
                            "message": "User cancelled intake processing"
                        })
                        results["end_time"] = datetime.now().isoformat()
                        return results
                    
                    elif prompt_result["action"] == "created":
                        results["subdivisions_created"].append(prompt_result)
            else:
                print("\n   Skipped - move files into subdivision folders manually")
                
            for f in remaining_orphans:
                # Only mark as skipped if not handled
                if not any(f["filename"] in [fi["filename"] for fi in sub.get("files", []) 
                          for sub in results.get("subdivisions_created", [])] 
                          for _ in [1]):
                    results["files_skipped"] += 1
                    results["details"].append({
                        "file": f["filename"],
                        "status": "skipped",
                        "reason": "No subdivision folder - could not auto-detect",
                    })
    
    # Rescan if we created new folders
    if results["subdivisions_created"]:
        print("\n🔄 Re-scanning intake folders after creating subdivisions...\n")
        files = scan_intake_folder(builder_key)
    
    # Second pass: process files that have subdivision folders
    for file_info in files:
        if not file_info.get("subdivision"):
            # Already handled above
            continue
        
        if dry_run:
            results["details"].append({
                "file": file_info["filename"],
                "status": "dry_run",
                "would_route_to": f"Customer Files/{file_info['builder']}/{file_info['subdivision']}/",
            })
            continue
        
        # Route the file
        route_result = route_file(
            file_path=file_info["path"],
            builder_key=file_info["builder"],
            subdivision=file_info["subdivision"],
        )
        
        if route_result["success"]:
            results["files_routed"] += 1
        else:
            results["files_failed"] += 1
        
        results["details"].append({
            "file": file_info["filename"],
            "status": "routed" if route_result["success"] else "failed",
            "destination": route_result.get("destination"),
            "error": route_result.get("error"),
        })
    
    results["end_time"] = datetime.now().isoformat()
    
    return results

# =============================================================================
# PORTAL CHECKING (Placeholder)
# =============================================================================

def check_portal(portal_name: str) -> dict:
    """
    Check a builder portal for new documents.
    
    PLACEHOLDER - actual implementation requires Playwright.
    """
    logger.info(f"{portal_name.title()} check would run here with Playwright")
    
    return {
        "portal": portal_name,
        "checked": True,
        "new_documents": 0,
        "downloaded": [],
    }

def check_all_portals() -> dict:
    """Check all configured portals"""
    results = {
        "start_time": datetime.now().isoformat(),
        "portals_checked": [],
        "plans_downloaded": [],
        "errors": [],
    }
    
    portals = set()
    for builder in BUILDERS.values():
        if builder.get("active") and builder.get("portal"):
            portals.add(builder["portal"])
    
    for portal in portals:
        logger.info(f"Checking portal: {portal}")
        try:
            portal_result = check_portal(portal)
            results["portals_checked"].append(portal)
            results["plans_downloaded"].extend(portal_result.get("downloaded", []))
        except Exception as e:
            logger.error(f"Portal check failed for {portal}: {e}")
            results["errors"].append(f"{portal}: {str(e)}")
    
    results["end_time"] = datetime.now().isoformat()
    
    return results

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def run_plan_intake(check_portals: bool = True, process_queue: bool = True) -> dict:
    """
    Run the plan intake monitor.
    
    Args:
        check_portals: Check builder portals for new documents
        process_queue: Process files waiting in intake folders
    
    Returns:
        dict with results
    """
    logger.info(f"Starting Plan Intake Monitor - checking {len(BUILDERS)} builder(s)")
    
    results = {
        "start_time": datetime.now().isoformat(),
        "portals_checked": [],
        "plans_downloaded": [],
        "intake_processed": {},
        "errors": [],
    }
    
    # Check portals (placeholder - needs Playwright)
    if check_portals:
        portal_results = check_all_portals()
        results["portals_checked"] = portal_results.get("portals_checked", [])
        results["plans_downloaded"] = portal_results.get("plans_downloaded", [])
        results["errors"].extend(portal_results.get("errors", []))
    
    # Process intake queue
    if process_queue:
        intake_results = process_intake_queue()
        results["intake_processed"] = intake_results
    
    results["end_time"] = datetime.now().isoformat()
    duration = (datetime.fromisoformat(results["end_time"]) - 
                datetime.fromisoformat(results["start_time"])).total_seconds()
    
    logger.info(f"Plan Intake complete: {len(results['plans_downloaded'])} plans downloaded, "
                f"{results.get('intake_processed', {}).get('files_routed', 0)} files routed")
    
    return results

# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description="Plan Intake Monitor")
    parser.add_argument("--scan", action="store_true", help="Scan intake folders only")
    parser.add_argument("--process", action="store_true", help="Process intake queue")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    parser.add_argument("--builder", type=str, help="Process only this builder")
    
    args = parser.parse_args()
    
    if args.scan:
        files = scan_intake_folder(args.builder)
        print(f"\nFound {len(files)} files in intake:")
        for f in files:
            print(f"  [{f['builder']}] {f['subdivision'] or 'root'}/{f['filename']}")
    elif args.process or args.dry_run:
        results = process_intake_queue(args.builder, dry_run=args.dry_run)
        print(json.dumps(results, indent=2, default=str))
    else:
        results = run_plan_intake()
        print(json.dumps(results, indent=2, default=str))
