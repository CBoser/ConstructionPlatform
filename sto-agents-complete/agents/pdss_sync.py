"""
PDSS Sync Agent
Synchronizes Plan Data Status Sheet with folder structure.

PDSS tracks:
- Plan status (New, In Progress, Complete)
- Takeoff status
- Quote status
- Notes and dates
"""

import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Optional
import csv

# Setup logging
logger = logging.getLogger('pdss_sync')

# Import settings
try:
    from config.settings import (
        BUILDERS, OPERATIONS, CUSTOMER_FILES,
        get_active_subdivisions, get_active_jobs
    )
except ImportError:
    logger.warning("Could not import settings, using defaults")
    BUILDERS = {}
    OPERATIONS = Path("./Operations")
    CUSTOMER_FILES = Path("./Customer Files")

# =============================================================================
# PDSS DATA STRUCTURE
# =============================================================================

PDSS_COLUMNS = [
    "job_id",
    "builder",
    "subdivision",
    "lot",
    "address",
    "plan_code",
    "plan_status",      # New, In Progress, Complete
    "takeoff_status",   # Not Started, In Progress, Complete
    "quote_status",     # Not Started, Sent, Approved
    "documents_complete",
    "assigned_to",
    "priority",         # High, Medium, Low
    "due_date",
    "notes",
    "created_date",
    "updated_date",
]

# =============================================================================
# PDSS FILE OPERATIONS
# =============================================================================

def get_pdss_path() -> Path:
    """Get path to PDSS data file"""
    pdss_dir = OPERATIONS / "PDSS"
    pdss_dir.mkdir(parents=True, exist_ok=True)
    return pdss_dir / "pdss_tracker.json"

def load_pdss_data() -> dict:
    """Load PDSS data from JSON file"""
    pdss_path = get_pdss_path()
    
    if pdss_path.exists():
        try:
            with open(pdss_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in PDSS file: {pdss_path}")
            return {"jobs": {}, "last_sync": None}
    
    return {"jobs": {}, "last_sync": None}

def save_pdss_data(data: dict) -> bool:
    """Save PDSS data to JSON file"""
    pdss_path = get_pdss_path()
    
    try:
        # Backup existing file
        if pdss_path.exists():
            backup_path = pdss_path.with_suffix('.json.bak')
            pdss_path.rename(backup_path)
        
        with open(pdss_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        logger.info(f"PDSS data saved to {pdss_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save PDSS data: {e}")
        return False

def export_pdss_csv(output_path: Path = None) -> str:
    """Export PDSS data to CSV"""
    data = load_pdss_data()
    
    if output_path is None:
        output_path = OPERATIONS / "PDSS" / f"pdss_export_{datetime.now().strftime('%Y%m%d')}.csv"
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=PDSS_COLUMNS)
        writer.writeheader()
        
        for job_id, job_data in data.get("jobs", {}).items():
            row = {col: job_data.get(col, "") for col in PDSS_COLUMNS}
            row["job_id"] = job_id
            writer.writerow(row)
    
    logger.info(f"PDSS exported to {output_path}")
    return str(output_path)

# =============================================================================
# SYNC OPERATIONS
# =============================================================================

def generate_job_id(builder: str, subdivision: str, lot: str) -> str:
    """Generate unique job ID"""
    return f"{builder[:3].upper()}-{subdivision[:10].upper().replace(' ', '_')}-{lot}"

def scan_folder_structure() -> list:
    """
    Scan Customer Files folder structure to find all jobs.
    Returns list of job dicts.
    """
    jobs = []
    
    for builder_key, builder in BUILDERS.items():
        if not builder.get("active"):
            continue
        
        customer_path = builder.get("customer_files_path")
        if not customer_path or not customer_path.exists():
            continue
        
        for subdivision_folder in customer_path.iterdir():
            if not subdivision_folder.is_dir() or subdivision_folder.name.startswith('.'):
                continue
            
            for lot_folder in subdivision_folder.iterdir():
                if not lot_folder.is_dir() or lot_folder.name.startswith('.'):
                    continue
                
                job_id = generate_job_id(builder_key, subdivision_folder.name, lot_folder.name)
                
                # Count documents
                doc_count = sum(1 for f in lot_folder.rglob("*") if f.is_file())
                
                jobs.append({
                    "job_id": job_id,
                    "builder": builder_key,
                    "subdivision": subdivision_folder.name,
                    "lot": lot_folder.name,
                    "path": lot_folder,
                    "document_count": doc_count,
                })
    
    return jobs

def sync_pdss_with_folders() -> dict:
    """
    Synchronize PDSS tracker with folder structure.
    - Add new jobs found in folders
    - Mark missing folders as archived
    - Update document counts
    """
    logger.info("Starting PDSS sync with folder structure")
    
    pdss_data = load_pdss_data()
    folder_jobs = scan_folder_structure()
    
    sync_results = {
        "new_jobs": [],
        "updated_jobs": [],
        "archived_jobs": [],
        "unchanged": 0,
    }
    
    # Track which jobs exist in folders
    folder_job_ids = set()
    
    # Process folder jobs
    for job in folder_jobs:
        job_id = job["job_id"]
        folder_job_ids.add(job_id)
        
        if job_id not in pdss_data["jobs"]:
            # New job - add to PDSS
            pdss_data["jobs"][job_id] = {
                "job_id": job_id,
                "builder": job["builder"],
                "subdivision": job["subdivision"],
                "lot": job["lot"],
                "address": "",
                "plan_code": "",
                "plan_status": "New",
                "takeoff_status": "Not Started",
                "quote_status": "Not Started",
                "documents_complete": job["document_count"] > 0,
                "assigned_to": "",
                "priority": "Medium",
                "due_date": "",
                "notes": "",
                "created_date": datetime.now().isoformat(),
                "updated_date": datetime.now().isoformat(),
            }
            sync_results["new_jobs"].append(job_id)
            logger.info(f"Added new job: {job_id}")
        else:
            # Existing job - update document count
            existing = pdss_data["jobs"][job_id]
            if existing.get("document_count", 0) != job["document_count"]:
                existing["document_count"] = job["document_count"]
                existing["documents_complete"] = job["document_count"] > 0
                existing["updated_date"] = datetime.now().isoformat()
                sync_results["updated_jobs"].append(job_id)
            else:
                sync_results["unchanged"] += 1
    
    # Check for archived jobs (in PDSS but not in folders)
    for job_id in list(pdss_data["jobs"].keys()):
        if job_id not in folder_job_ids:
            job = pdss_data["jobs"][job_id]
            if job.get("plan_status") != "Archived":
                job["plan_status"] = "Archived"
                job["updated_date"] = datetime.now().isoformat()
                sync_results["archived_jobs"].append(job_id)
                logger.info(f"Archived job (folder missing): {job_id}")
    
    # Update last sync time
    pdss_data["last_sync"] = datetime.now().isoformat()
    
    # Save updated data
    save_pdss_data(pdss_data)
    
    return sync_results

def update_job_status(job_id: str, updates: dict) -> bool:
    """
    Update status fields for a specific job.
    
    Args:
        job_id: Job identifier
        updates: dict of field:value to update
    """
    pdss_data = load_pdss_data()
    
    if job_id not in pdss_data["jobs"]:
        logger.error(f"Job not found: {job_id}")
        return False
    
    job = pdss_data["jobs"][job_id]
    
    for field, value in updates.items():
        if field in PDSS_COLUMNS:
            job[field] = value
    
    job["updated_date"] = datetime.now().isoformat()
    
    save_pdss_data(pdss_data)
    logger.info(f"Updated job {job_id}: {updates}")
    
    return True

# =============================================================================
# REPORTING
# =============================================================================

def get_pdss_summary() -> dict:
    """Get summary statistics from PDSS data"""
    pdss_data = load_pdss_data()
    jobs = pdss_data.get("jobs", {})
    
    summary = {
        "total_jobs": len(jobs),
        "by_status": {
            "New": 0,
            "In Progress": 0,
            "Complete": 0,
            "Archived": 0,
        },
        "by_builder": {},
        "by_priority": {
            "High": 0,
            "Medium": 0,
            "Low": 0,
        },
        "needs_attention": [],
    }
    
    for job_id, job in jobs.items():
        # Count by status
        status = job.get("plan_status", "New")
        if status in summary["by_status"]:
            summary["by_status"][status] += 1
        
        # Count by builder
        builder = job.get("builder", "Unknown")
        if builder not in summary["by_builder"]:
            summary["by_builder"][builder] = 0
        summary["by_builder"][builder] += 1
        
        # Count by priority
        priority = job.get("priority", "Medium")
        if priority in summary["by_priority"]:
            summary["by_priority"][priority] += 1
        
        # Flag jobs needing attention
        if job.get("priority") == "High" and job.get("plan_status") != "Complete":
            summary["needs_attention"].append({
                "job_id": job_id,
                "subdivision": job.get("subdivision"),
                "lot": job.get("lot"),
                "status": job.get("plan_status"),
            })
    
    return summary

def format_pdss_report(summary: dict) -> str:
    """Format PDSS summary for display/Teams"""
    lines = []
    
    lines.append("━" * 50)
    lines.append("📊 **PDSS Status Report**")
    lines.append(f"   {datetime.now().strftime('%B %d, %Y')}")
    lines.append("━" * 50)
    lines.append("")
    
    lines.append(f"**Total Jobs:** {summary['total_jobs']}")
    lines.append("")
    
    lines.append("**By Status:**")
    for status, count in summary["by_status"].items():
        if count > 0:
            lines.append(f"  • {status}: {count}")
    lines.append("")
    
    lines.append("**By Builder:**")
    for builder, count in summary["by_builder"].items():
        if count > 0:
            builder_name = BUILDERS.get(builder, {}).get("name", builder)
            lines.append(f"  • {builder_name}: {count}")
    lines.append("")
    
    if summary["needs_attention"]:
        lines.append("⚠️ **High Priority Jobs:**")
        for job in summary["needs_attention"][:10]:  # Limit to 10
            lines.append(f"  • {job['subdivision']} - {job['lot']} ({job['status']})")
    
    lines.append("━" * 50)
    
    return "\n".join(lines)

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def run_pdss_sync(export_csv: bool = False, send_teams: bool = True) -> dict:
    """
    Run PDSS synchronization.
    
    Args:
        export_csv: Export PDSS to CSV after sync
        send_teams: Send notification to Teams
    
    Returns:
        dict with sync results
    """
    logger.info("Starting PDSS sync")
    
    # Sync with folder structure
    sync_results = sync_pdss_with_folders()
    
    # Get summary
    summary = get_pdss_summary()
    
    # Format and display report
    report = format_pdss_report(summary)
    print("\n" + report)
    
    # Export CSV if requested
    if export_csv:
        csv_path = export_pdss_csv()
        sync_results["csv_export"] = csv_path
    
    # Send to Teams if there are updates
    if send_teams and (sync_results["new_jobs"] or sync_results["archived_jobs"]):
        try:
            from services.teams_notify import send_teams_notification, notify_pdss_updated
            
            # Use specific PDSS notification if available
            try:
                notify_pdss_updated(
                    new_jobs=len(sync_results["new_jobs"]),
                    updated_jobs=len(sync_results["updated_jobs"]),
                )
            except:
                send_teams_notification("PDSS Sync", report)
            
            logger.info("Teams notification sent")
        except ImportError:
            logger.warning("Teams notification module not available")
        except Exception as e:
            logger.error(f"Failed to send Teams notification: {e}")
    
    return {
        "sync_results": sync_results,
        "summary": summary,
    }

# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="PDSS Sync Agent")
    parser.add_argument("--sync", action="store_true", help="Run sync with folders")
    parser.add_argument("--summary", action="store_true", help="Show summary only")
    parser.add_argument("--export", action="store_true", help="Export to CSV")
    parser.add_argument("--no-teams", action="store_true", help="Skip Teams notification")
    parser.add_argument("--update", type=str, help="Update job (format: JOB_ID:field=value)")
    
    args = parser.parse_args()
    
    if args.update:
        # Parse update format: JOB_ID:field=value
        parts = args.update.split(":", 1)
        if len(parts) == 2:
            job_id = parts[0]
            field, value = parts[1].split("=", 1)
            update_job_status(job_id, {field: value})
        else:
            print("Invalid update format. Use: JOB_ID:field=value")
    elif args.summary:
        summary = get_pdss_summary()
        print(format_pdss_report(summary))
    elif args.export:
        path = export_pdss_csv()
        print(f"Exported to: {path}")
    else:
        results = run_pdss_sync(
            export_csv=args.export,
            send_teams=not args.no_teams
        )
        print(f"\nNew: {len(results['sync_results']['new_jobs'])}")
        print(f"Updated: {len(results['sync_results']['updated_jobs'])}")
        print(f"Archived: {len(results['sync_results']['archived_jobs'])}")
