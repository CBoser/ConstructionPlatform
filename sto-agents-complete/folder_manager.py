"""
Folder Manager Tool
Manages the hybrid MindFlow + Customer Files folder structure.

Features:
- Auto-detects subdivisions from folder structure
- Creates missing folders in hybrid structure
- Adds new subdivisions and job folders
- Shows intake queue status
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# =============================================================================
# CONFIGURATION
# =============================================================================

# Default SharePoint sync root - update for your system
DEFAULT_SYNC_ROOT = r"C:\Users\corey.boser\OneDrive - BLDR\Sales Team One - Construction Platform"

# Try to import from settings, fall back to default
try:
    from config.settings import LOCAL_SYNC_ROOT
except ImportError:
    LOCAL_SYNC_ROOT = Path(os.environ.get("STO_SYNC_ROOT", DEFAULT_SYNC_ROOT))

# =============================================================================
# PATH DEFINITIONS (Hybrid Structure)
# =============================================================================

# MindFlow numbered folders
MINDFLOW_FOLDERS = {
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
}

# Customer Files structure
CUSTOMER_FILES_BUILDERS = [
    "Richmond American",
    "Holt Homes",
    "Manor Homes",
    "Sekisui House",
]

# Operations folders
OPERATIONS_FOLDERS = [
    "PDSS",
    "Pride Board",
    "Contract Analysis",
    "EPO Reports",
]

# BATs folders
BATS_FOLDERS = [
    "Richmond American",
    "Holt Homes",
    "Manor Homes",
]

# Builder-specific lot subfolders
BUILDER_LOT_SUBFOLDERS = {
    "Richmond American": ["Plans and Layouts", "POs"],
    "Holt Homes": ["Plans", "POs", "Vendor Docs"],
    "Manor Homes": ["Plans", "POs"],
    "Sekisui House": ["Plans", "POs", "Specs"],
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_root_path() -> Path:
    """Get the configured root path"""
    return Path(LOCAL_SYNC_ROOT)

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """Print the tool header"""
    print("=" * 60)
    print("  STO FOLDER MANAGER")
    print("  Sales Team One PDX | Hybrid Structure")
    print("=" * 60)
    print(f"  Root: {get_root_path()}")
    print("=" * 60)
    print()

def auto_detect_subdivisions(builder: str) -> list:
    """Auto-detect subdivisions from Customer Files folder"""
    root = get_root_path()
    builder_path = root / "Customer Files" / builder
    
    if not builder_path.exists():
        return []
    
    subdivisions = []
    for item in builder_path.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            subdivisions.append(item.name)
    
    return sorted(subdivisions)

# =============================================================================
# STRUCTURE CHECK
# =============================================================================

def check_structure() -> dict:
    """Check current folder structure against expected"""
    root = get_root_path()
    
    results = {
        "root_exists": root.exists(),
        "mindflow": {},
        "customer_files": {},
        "operations": {},
        "bats": {},
        "data": {},
        "missing": [],
        "found": [],
    }
    
    if not root.exists():
        print(f"⚠️  Root path does not exist: {root}")
        return results
    
    # Check MindFlow folders
    print("\n📁 MindFlow Folders:")
    for folder, subfolders in MINDFLOW_FOLDERS.items():
        folder_path = root / folder
        exists = folder_path.exists()
        results["mindflow"][folder] = {
            "exists": exists,
            "subfolders": {}
        }
        
        status = "✓" if exists else "✗"
        print(f"  {status} {folder}")
        
        if exists:
            results["found"].append(folder)
            for sub in subfolders:
                sub_exists = (folder_path / sub).exists()
                results["mindflow"][folder]["subfolders"][sub] = sub_exists
                if not sub_exists:
                    results["missing"].append(f"{folder}/{sub}")
        else:
            results["missing"].append(folder)
    
    # Check Customer Files
    print("\n📁 Customer Files:")
    customer_path = root / "Customer Files"
    if customer_path.exists():
        results["found"].append("Customer Files")
        for builder in CUSTOMER_FILES_BUILDERS:
            builder_path = customer_path / builder
            exists = builder_path.exists()
            subdivisions = auto_detect_subdivisions(builder) if exists else []
            
            results["customer_files"][builder] = {
                "exists": exists,
                "subdivisions": subdivisions,
            }
            
            status = "✓" if exists else "✗"
            sub_count = f"({len(subdivisions)} subdivisions)" if subdivisions else ""
            print(f"  {status} {builder} {sub_count}")
    else:
        print("  ✗ Customer Files folder not found")
        results["missing"].append("Customer Files")
    
    # Check Operations
    print("\n📁 Operations:")
    ops_path = root / "Operations"
    if ops_path.exists():
        results["found"].append("Operations")
        for folder in OPERATIONS_FOLDERS:
            exists = (ops_path / folder).exists()
            results["operations"][folder] = exists
            status = "✓" if exists else "✗"
            print(f"  {status} {folder}")
            if not exists:
                results["missing"].append(f"Operations/{folder}")
    else:
        print("  ✗ Operations folder not found")
        results["missing"].append("Operations")
    
    # Check BATs
    print("\n📁 BATs:")
    bats_path = root / "BATs"
    if bats_path.exists():
        results["found"].append("BATs")
        for folder in BATS_FOLDERS:
            exists = (bats_path / folder).exists()
            results["bats"][folder] = exists
            status = "✓" if exists else "✗"
            print(f"  {status} {folder}")
            if not exists:
                results["missing"].append(f"BATs/{folder}")
    else:
        print("  ✗ BATs folder not found")
        results["missing"].append("BATs")
    
    # Check data folder
    print("\n📁 Data:")
    data_path = root / "data"
    if data_path.exists():
        results["found"].append("data")
        for folder in ["data", "logs"]:
            exists = (data_path / folder).exists() or (root / folder).exists()
            results["data"][folder] = exists
    else:
        results["missing"].append("data")
    
    # Summary
    print("\n" + "-" * 40)
    print(f"Found: {len(results['found'])} top-level folders")
    print(f"Missing: {len(results['missing'])} folders/subfolders")
    
    return results

# =============================================================================
# CREATE STRUCTURE
# =============================================================================

def create_missing_folders():
    """Create all missing folders in the hybrid structure"""
    root = get_root_path()
    created = []
    
    print("\n📁 Creating missing folders...")
    
    # Create MindFlow folders
    for folder, subfolders in MINDFLOW_FOLDERS.items():
        folder_path = root / folder
        if not folder_path.exists():
            folder_path.mkdir(parents=True)
            created.append(str(folder_path))
            print(f"  ✓ Created {folder}")
        
        for sub in subfolders:
            sub_path = folder_path / sub
            if not sub_path.exists():
                sub_path.mkdir(parents=True)
                created.append(str(sub_path))
    
    # Create Customer Files
    customer_path = root / "Customer Files"
    customer_path.mkdir(exist_ok=True)
    for builder in CUSTOMER_FILES_BUILDERS:
        builder_path = customer_path / builder
        if not builder_path.exists():
            builder_path.mkdir()
            created.append(str(builder_path))
            print(f"  ✓ Created Customer Files/{builder}")
    
    # Create Operations
    ops_path = root / "Operations"
    ops_path.mkdir(exist_ok=True)
    for folder in OPERATIONS_FOLDERS:
        folder_path = ops_path / folder
        if not folder_path.exists():
            folder_path.mkdir()
            created.append(str(folder_path))
            print(f"  ✓ Created Operations/{folder}")
    
    # Create BATs
    bats_path = root / "BATs"
    bats_path.mkdir(exist_ok=True)
    for folder in BATS_FOLDERS:
        folder_path = bats_path / folder
        if not folder_path.exists():
            folder_path.mkdir()
            created.append(str(folder_path))
            print(f"  ✓ Created BATs/{folder}")
    
    # Create data folders
    (root / "data" / "logs").mkdir(parents=True, exist_ok=True)
    
    print(f"\n✓ Created {len(created)} folders")
    return created

# =============================================================================
# SUBDIVISION & JOB MANAGEMENT
# =============================================================================

def add_subdivision(builder: str, subdivision: str):
    """Add a new subdivision folder"""
    root = get_root_path()
    
    # Create in Customer Files
    customer_path = root / "Customer Files" / builder / subdivision
    if not customer_path.exists():
        customer_path.mkdir(parents=True)
        print(f"  ✓ Created Customer Files/{builder}/{subdivision}")
    
    # Create in 00_Intake
    intake_path = root / "00_Intake" / builder / subdivision
    if not intake_path.exists():
        intake_path.mkdir(parents=True)
        print(f"  ✓ Created 00_Intake/{builder}/{subdivision}")
    
    return True

def add_job_folder(builder: str, subdivision: str, lot_name: str):
    """Add a new job (lot) folder with subfolders"""
    root = get_root_path()
    
    lot_path = root / "Customer Files" / builder / subdivision / lot_name
    
    if lot_path.exists():
        print(f"  ⚠️  Folder already exists: {lot_path}")
        return False
    
    lot_path.mkdir(parents=True)
    print(f"  ✓ Created {lot_name}")
    
    # Create builder-specific subfolders
    subfolders = BUILDER_LOT_SUBFOLDERS.get(builder, ["Plans", "POs"])
    for sub in subfolders:
        (lot_path / sub).mkdir()
        print(f"    ✓ Created {sub}")
    
    return True

# =============================================================================
# INTAKE QUEUE
# =============================================================================

def show_intake_queue():
    """Show files waiting in 00_Intake"""
    root = get_root_path()
    intake_path = root / "00_Intake"
    
    if not intake_path.exists():
        print("  ⚠️  00_Intake folder not found")
        return
    
    print("\n📥 Intake Queue:")
    print("-" * 50)
    
    total_files = 0
    
    for builder_folder in intake_path.iterdir():
        if not builder_folder.is_dir():
            continue
        
        builder_files = list(builder_folder.rglob("*"))
        builder_files = [f for f in builder_files if f.is_file()]
        
        if builder_files:
            print(f"\n  {builder_folder.name}: {len(builder_files)} files")
            for f in builder_files[:5]:
                rel_path = f.relative_to(builder_folder)
                print(f"    • {rel_path}")
            if len(builder_files) > 5:
                print(f"    ... and {len(builder_files) - 5} more")
            total_files += len(builder_files)
    
    if total_files == 0:
        print("  ✓ Intake queue is empty")
    else:
        print(f"\n  Total: {total_files} files waiting to be routed")

# =============================================================================
# SUMMARY
# =============================================================================

def show_summary():
    """Show summary of all builders and jobs"""
    root = get_root_path()
    
    print("\n📊 Structure Summary:")
    print("=" * 50)
    
    customer_path = root / "Customer Files"
    if not customer_path.exists():
        print("  ⚠️  Customer Files not found")
        return
    
    total_subdivisions = 0
    total_jobs = 0
    
    for builder in CUSTOMER_FILES_BUILDERS:
        builder_path = customer_path / builder
        if not builder_path.exists():
            continue
        
        subdivisions = auto_detect_subdivisions(builder)
        job_count = 0
        
        for sub in subdivisions:
            sub_path = builder_path / sub
            lots = [d for d in sub_path.iterdir() if d.is_dir()]
            job_count += len(lots)
        
        total_subdivisions += len(subdivisions)
        total_jobs += job_count
        
        print(f"\n  {builder}:")
        print(f"    Subdivisions: {len(subdivisions)}")
        print(f"    Active Jobs: {job_count}")
        
        if subdivisions:
            for sub in subdivisions[:5]:
                sub_path = builder_path / sub
                lots = [d for d in sub_path.iterdir() if d.is_dir()]
                print(f"      • {sub} ({len(lots)} lots)")
            if len(subdivisions) > 5:
                print(f"      ... and {len(subdivisions) - 5} more")
    
    print("\n" + "-" * 50)
    print(f"  Total Subdivisions: {total_subdivisions}")
    print(f"  Total Jobs: {total_jobs}")

# =============================================================================
# INTERACTIVE MENU
# =============================================================================

def interactive_menu():
    """Run interactive menu"""
    while True:
        clear_screen()
        print_header()
        
        print("Options:")
        print("  [1] Check Current Structure")
        print("  [2] Create Missing Folders")
        print("  [3] Show Summary")
        print("  [4] Add New Subdivision")
        print("  [5] Add New Job Folder")
        print("  [6] Check Intake Queue")
        print("  [7] Update Root Path")
        print("  [0] Exit")
        print()
        
        choice = input("Enter choice: ").strip()
        
        if choice == "1":
            clear_screen()
            print_header()
            check_structure()
            input("\nPress Enter to continue...")
            
        elif choice == "2":
            clear_screen()
            print_header()
            create_missing_folders()
            input("\nPress Enter to continue...")
            
        elif choice == "3":
            clear_screen()
            print_header()
            show_summary()
            input("\nPress Enter to continue...")
            
        elif choice == "4":
            clear_screen()
            print_header()
            print("Add New Subdivision")
            print("-" * 40)
            print("Builders:")
            for i, builder in enumerate(CUSTOMER_FILES_BUILDERS, 1):
                print(f"  [{i}] {builder}")
            
            try:
                builder_idx = int(input("\nSelect builder: ")) - 1
                builder = CUSTOMER_FILES_BUILDERS[builder_idx]
                subdivision = input("Enter subdivision name: ").strip()
                
                if subdivision:
                    add_subdivision(builder, subdivision)
                    print(f"\n✓ Added subdivision: {builder}/{subdivision}")
            except (ValueError, IndexError):
                print("Invalid selection")
            
            input("\nPress Enter to continue...")
            
        elif choice == "5":
            clear_screen()
            print_header()
            print("Add New Job Folder")
            print("-" * 40)
            print("Builders:")
            for i, builder in enumerate(CUSTOMER_FILES_BUILDERS, 1):
                print(f"  [{i}] {builder}")
            
            try:
                builder_idx = int(input("\nSelect builder: ")) - 1
                builder = CUSTOMER_FILES_BUILDERS[builder_idx]
                
                subdivisions = auto_detect_subdivisions(builder)
                if not subdivisions:
                    print(f"No subdivisions found for {builder}")
                    input("\nPress Enter to continue...")
                    continue
                
                print(f"\nSubdivisions for {builder}:")
                for i, sub in enumerate(subdivisions, 1):
                    print(f"  [{i}] {sub}")
                
                sub_idx = int(input("\nSelect subdivision: ")) - 1
                subdivision = subdivisions[sub_idx]
                
                lot_name = input("Enter lot folder name (e.g., 'Lot 127'): ").strip()
                
                if lot_name:
                    add_job_folder(builder, subdivision, lot_name)
                    print(f"\n✓ Added job folder: {builder}/{subdivision}/{lot_name}")
            except (ValueError, IndexError):
                print("Invalid selection")
            
            input("\nPress Enter to continue...")
            
        elif choice == "6":
            clear_screen()
            print_header()
            show_intake_queue()
            input("\nPress Enter to continue...")
            
        elif choice == "7":
            clear_screen()
            print_header()
            print(f"Current root: {get_root_path()}")
            new_path = input("\nEnter new root path (or press Enter to keep current): ").strip()
            
            if new_path:
                if Path(new_path).exists():
                    global LOCAL_SYNC_ROOT
                    LOCAL_SYNC_ROOT = Path(new_path)
                    print(f"✓ Updated root to: {new_path}")
                else:
                    print(f"⚠️  Path does not exist: {new_path}")
            
            input("\nPress Enter to continue...")
            
        elif choice == "0":
            print("\nGoodbye!")
            break
        
        else:
            print("Invalid choice")
            input("\nPress Enter to continue...")

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="STO Folder Manager")
    parser.add_argument("--check", action="store_true", help="Check structure only")
    parser.add_argument("--create", action="store_true", help="Create missing folders")
    parser.add_argument("--summary", action="store_true", help="Show summary")
    parser.add_argument("--intake", action="store_true", help="Show intake queue")
    
    args = parser.parse_args()
    
    if args.check:
        print_header()
        check_structure()
    elif args.create:
        print_header()
        create_missing_folders()
    elif args.summary:
        print_header()
        show_summary()
    elif args.intake:
        print_header()
        show_intake_queue()
    else:
        interactive_menu()
