"""
Backup Agent
Backs up STO data to I: drive with retention policies.

Backup types:
- Nightly: Essential files, 7-day retention
- Weekly: Full backup, 4-week retention  
- Monthly: Archive, 12-month retention
"""

import logging
import shutil
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

# Setup logging
logger = logging.getLogger('backup_agent')

# Import settings
try:
    from config.settings import (
        LOCAL_SYNC_ROOT, BACKUP_ROOT, BACKUP_CONFIG,
        CUSTOMER_FILES, OPERATIONS, BATS_PATH
    )
except ImportError:
    logger.warning("Could not import settings, using defaults")
    LOCAL_SYNC_ROOT = Path(".")
    BACKUP_ROOT = Path("./backups")
    BACKUP_CONFIG = {
        "nightly": {"retention_days": 7},
        "weekly": {"retention_weeks": 4},
        "monthly": {"retention_months": 12},
    }
    CUSTOMER_FILES = Path("./Customer Files")
    OPERATIONS = Path("./Operations")
    BATS_PATH = Path("./BATs")

# =============================================================================
# BACKUP CONFIGURATION
# =============================================================================

BACKUP_SOURCES = {
    "nightly": [
        # Essential files only
        {"path": OPERATIONS, "patterns": ["*.xlsx", "*.json", "*.csv"]},
        {"path": BATS_PATH, "patterns": ["*.xlsx", "*.xlsm"]},
    ],
    "weekly": [
        # Full backup
        {"path": CUSTOMER_FILES, "patterns": ["*"]},
        {"path": OPERATIONS, "patterns": ["*"]},
        {"path": BATS_PATH, "patterns": ["*"]},
    ],
    "monthly": [
        # Full archive
        {"path": LOCAL_SYNC_ROOT, "patterns": ["*"]},
    ],
}

EXCLUDE_PATTERNS = [
    "~$*",      # Office temp files
    "*.tmp",    # Temp files
    "*.bak",    # Backup files
    ".DS_Store",
    "Thumbs.db",
    "__pycache__",
    "*.pyc",
]

# =============================================================================
# BACKUP OPERATIONS
# =============================================================================

def get_backup_destination(backup_type: str) -> Path:
    """Get destination path for backup type"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    if backup_type == "nightly":
        return BACKUP_ROOT / "Nightly" / timestamp
    elif backup_type == "weekly":
        return BACKUP_ROOT / "Weekly" / timestamp
    elif backup_type == "monthly":
        return BACKUP_ROOT / "Monthly" / timestamp
    else:
        return BACKUP_ROOT / backup_type / timestamp

def should_exclude(path: Path) -> bool:
    """Check if path should be excluded from backup"""
    name = path.name
    
    for pattern in EXCLUDE_PATTERNS:
        if pattern.startswith("*"):
            if name.endswith(pattern[1:]):
                return True
        elif pattern.endswith("*"):
            if name.startswith(pattern[:-1]):
                return True
        elif name == pattern:
            return True
    
    return False

def copy_with_structure(source: Path, dest: Path, patterns: list = None) -> dict:
    """
    Copy files from source to destination maintaining folder structure.
    
    Args:
        source: Source folder
        dest: Destination folder
        patterns: List of glob patterns to include (None = all)
    
    Returns:
        dict with copy statistics
    """
    stats = {
        "files_copied": 0,
        "files_skipped": 0,
        "bytes_copied": 0,
        "errors": [],
    }
    
    if not source.exists():
        logger.warning(f"Source not found: {source}")
        return stats
    
    # Determine files to copy
    if patterns and patterns != ["*"]:
        files_to_copy = []
        for pattern in patterns:
            files_to_copy.extend(source.rglob(pattern))
    else:
        files_to_copy = list(source.rglob("*"))
    
    # Copy files
    for src_file in files_to_copy:
        if not src_file.is_file():
            continue
        
        if should_exclude(src_file):
            stats["files_skipped"] += 1
            continue
        
        # Calculate destination path
        try:
            rel_path = src_file.relative_to(source)
            dest_file = dest / source.name / rel_path
        except ValueError:
            # File is not under source (shouldn't happen)
            continue
        
        try:
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dest_file)
            stats["files_copied"] += 1
            stats["bytes_copied"] += src_file.stat().st_size
        except Exception as e:
            logger.error(f"Failed to copy {src_file}: {e}")
            stats["errors"].append(str(e))
    
    return stats

def run_backup(backup_type: str = "nightly") -> dict:
    """
    Run a backup operation.
    
    Args:
        backup_type: Type of backup (nightly, weekly, monthly)
    
    Returns:
        dict with backup results
    """
    logger.info(f"Starting {backup_type} backup")
    
    results = {
        "type": backup_type,
        "start_time": datetime.now().isoformat(),
        "destination": None,
        "sources_backed_up": [],
        "total_files": 0,
        "total_bytes": 0,
        "errors": [],
    }
    
    # Check backup root exists
    if not BACKUP_ROOT.exists():
        try:
            BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"Cannot create backup root: {e}")
            results["errors"].append(f"Cannot create backup root: {e}")
            return results
    
    # Get destination
    dest = get_backup_destination(backup_type)
    results["destination"] = str(dest)
    
    try:
        dest.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        logger.error(f"Cannot create backup destination: {e}")
        results["errors"].append(f"Cannot create destination: {e}")
        return results
    
    # Get sources for this backup type
    sources = BACKUP_SOURCES.get(backup_type, BACKUP_SOURCES["nightly"])
    
    # Copy each source
    for source_config in sources:
        source_path = source_config["path"]
        patterns = source_config.get("patterns", ["*"])
        
        logger.info(f"Backing up: {source_path}")
        
        stats = copy_with_structure(source_path, dest, patterns)
        
        results["sources_backed_up"].append({
            "source": str(source_path),
            "files": stats["files_copied"],
            "bytes": stats["bytes_copied"],
        })
        results["total_files"] += stats["files_copied"]
        results["total_bytes"] += stats["bytes_copied"]
        results["errors"].extend(stats["errors"])
    
    # Create backup manifest
    manifest = {
        "backup_type": backup_type,
        "timestamp": results["start_time"],
        "sources": results["sources_backed_up"],
        "total_files": results["total_files"],
        "total_bytes": results["total_bytes"],
    }
    
    manifest_path = dest / "backup_manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    results["end_time"] = datetime.now().isoformat()
    duration = (datetime.fromisoformat(results["end_time"]) - 
                datetime.fromisoformat(results["start_time"])).total_seconds()
    results["duration_seconds"] = duration
    
    logger.info(f"Backup complete: {results['total_files']} files, "
                f"{results['total_bytes'] / 1024 / 1024:.1f} MB")
    
    # Run cleanup for this backup type
    cleanup_old_backups(backup_type)
    
    return results

# =============================================================================
# RETENTION / CLEANUP
# =============================================================================

def cleanup_old_backups(backup_type: str) -> dict:
    """
    Remove old backups based on retention policy.
    
    Returns:
        dict with cleanup statistics
    """
    config = BACKUP_CONFIG.get(backup_type, {})
    backup_dir = BACKUP_ROOT / backup_type.title()
    
    if not backup_dir.exists():
        return {"removed": 0}
    
    results = {
        "removed": 0,
        "kept": 0,
        "removed_paths": [],
    }
    
    # Calculate cutoff date
    if backup_type == "nightly":
        retention_days = config.get("retention_days", 7)
        cutoff = datetime.now() - timedelta(days=retention_days)
    elif backup_type == "weekly":
        retention_weeks = config.get("retention_weeks", 4)
        cutoff = datetime.now() - timedelta(weeks=retention_weeks)
    elif backup_type == "monthly":
        retention_months = config.get("retention_months", 12)
        cutoff = datetime.now() - timedelta(days=retention_months * 30)
    else:
        return results
    
    # Check each backup folder
    for backup_folder in backup_dir.iterdir():
        if not backup_folder.is_dir():
            continue
        
        # Parse timestamp from folder name (YYYYMMDD_HHMMSS)
        try:
            folder_date = datetime.strptime(backup_folder.name[:8], "%Y%m%d")
        except ValueError:
            continue
        
        if folder_date < cutoff:
            try:
                shutil.rmtree(backup_folder)
                results["removed"] += 1
                results["removed_paths"].append(str(backup_folder))
                logger.info(f"Removed old backup: {backup_folder}")
            except Exception as e:
                logger.error(f"Failed to remove {backup_folder}: {e}")
        else:
            results["kept"] += 1
    
    return results

# =============================================================================
# BACKUP HISTORY
# =============================================================================

def get_backup_history() -> list:
    """Get list of all backups with metadata"""
    history = []
    
    for backup_type in ["Nightly", "Weekly", "Monthly"]:
        type_dir = BACKUP_ROOT / backup_type
        if not type_dir.exists():
            continue
        
        for backup_folder in sorted(type_dir.iterdir(), reverse=True):
            if not backup_folder.is_dir():
                continue
            
            # Try to load manifest
            manifest_path = backup_folder / "backup_manifest.json"
            if manifest_path.exists():
                with open(manifest_path, 'r') as f:
                    manifest = json.load(f)
            else:
                manifest = {}
            
            # Calculate size
            total_size = sum(f.stat().st_size for f in backup_folder.rglob("*") if f.is_file())
            
            history.append({
                "type": backup_type.lower(),
                "path": str(backup_folder),
                "timestamp": backup_folder.name,
                "files": manifest.get("total_files", "?"),
                "size_mb": total_size / 1024 / 1024,
            })
    
    return history

def format_backup_history(history: list) -> str:
    """Format backup history for display"""
    lines = []
    
    lines.append("━" * 60)
    lines.append("📦 **Backup History**")
    lines.append("━" * 60)
    
    current_type = None
    for backup in history[:20]:  # Limit to 20 most recent
        if backup["type"] != current_type:
            current_type = backup["type"]
            lines.append(f"\n**{current_type.title()} Backups:**")
        
        lines.append(f"  • {backup['timestamp']} - {backup['files']} files, {backup['size_mb']:.1f} MB")
    
    lines.append("")
    lines.append("━" * 60)
    
    return "\n".join(lines)

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def run_scheduled_backup() -> dict:
    """
    Run appropriate backup based on schedule.
    - Nightly: Every night
    - Weekly: Sunday
    - Monthly: 1st of month
    """
    today = datetime.now()
    
    if today.day == 1:
        return run_backup("monthly")
    elif today.weekday() == 6:  # Sunday
        return run_backup("weekly")
    else:
        return run_backup("nightly")

# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Backup Agent")
    parser.add_argument("--type", type=str, 
                        choices=["nightly", "weekly", "monthly", "auto"],
                        default="auto",
                        help="Backup type (auto = based on schedule)")
    parser.add_argument("--history", action="store_true", help="Show backup history")
    parser.add_argument("--cleanup", action="store_true", help="Run cleanup only")
    
    args = parser.parse_args()
    
    if args.history:
        history = get_backup_history()
        print(format_backup_history(history))
    elif args.cleanup:
        for backup_type in ["nightly", "weekly", "monthly"]:
            results = cleanup_old_backups(backup_type)
            print(f"{backup_type}: Removed {results['removed']}, Kept {results['kept']}")
    elif args.type == "auto":
        results = run_scheduled_backup()
        print(f"\nBackup complete: {results['type']}")
        print(f"Files: {results['total_files']}")
        print(f"Size: {results['total_bytes'] / 1024 / 1024:.1f} MB")
    else:
        results = run_backup(args.type)
        print(f"\nBackup complete: {results['type']}")
        print(f"Files: {results['total_files']}")
        print(f"Size: {results['total_bytes'] / 1024 / 1024:.1f} MB")
        print(f"Destination: {results['destination']}")
