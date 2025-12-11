"""
Document Completeness Checker Agent
Validates that job folders have all required documents before estimating.

Checks Customer Files/{Builder}/{Subdivision}/{Lot}/ folders for:
- Required documents (ARCH DRAWINGS, CALC PKG, etc.)
- Optional documents (TRUSS CALCS, PLOT PLAN, etc.)

Generates reports of incomplete jobs needing attention.
"""

import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field

# Setup logging
logger = logging.getLogger('completeness_checker')

# Import settings
try:
    from config.settings import (
        BUILDERS, REQUIRED_DOCUMENTS, CUSTOMER_FILES,
        get_active_subdivisions, get_active_jobs
    )
except ImportError:
    logger.warning("Could not import settings, using defaults")
    BUILDERS = {}
    REQUIRED_DOCUMENTS = {}
    CUSTOMER_FILES = Path("./Customer Files")
    
    def get_active_subdivisions(builder_key):
        return []
    
    def get_active_jobs(builder_key, subdivision=None):
        return []

# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class DocumentCheck:
    """Result of checking for a specific document"""
    doc_type: str
    required: bool
    found: bool
    file_path: Optional[Path] = None
    file_name: Optional[str] = None

@dataclass
class JobCompleteness:
    """Completeness status of a single job folder"""
    builder: str
    subdivision: str
    lot: str
    path: Path
    documents: list = field(default_factory=list)
    is_complete: bool = False
    missing_required: list = field(default_factory=list)
    missing_optional: list = field(default_factory=list)
    found_documents: list = field(default_factory=list)

# =============================================================================
# DOCUMENT DETECTION
# =============================================================================

def find_document(folder: Path, doc_type: str, patterns: dict = None) -> Optional[Path]:
    """
    Search for a document type in a folder.
    
    Args:
        folder: Folder to search (recursively)
        doc_type: Document type name (e.g., "ARCH DRAWINGS")
        patterns: Optional regex patterns for matching
    
    Returns:
        Path to found document, or None
    """
    if not folder.exists():
        return None
    
    doc_lower = doc_type.lower()
    
    # Check if we have a custom pattern
    if patterns:
        for pattern_name, pattern in patterns.items():
            if pattern_name.lower() in doc_lower or doc_lower in pattern_name.lower():
                regex = re.compile(pattern, re.IGNORECASE)
                for f in folder.rglob("*"):
                    if f.is_file() and regex.search(f.name):
                        return f
    
    # Default: look for doc_type in filename
    for f in folder.rglob("*"):
        if f.is_file():
            # Exact match
            if doc_lower in f.stem.lower():
                return f
            # Word boundary match
            if re.search(rf'\b{re.escape(doc_lower)}\b', f.stem, re.IGNORECASE):
                return f
    
    return None

def check_job_completeness(job_path: Path, builder_key: str) -> JobCompleteness:
    """
    Check a single job folder for required documents.
    
    Args:
        job_path: Path to the job folder (e.g., Customer Files/Richmond American/North Haven/Lot 127)
        builder_key: Builder identifier for requirements lookup
    
    Returns:
        JobCompleteness object with results
    """
    # Parse folder structure
    parts = job_path.parts
    lot = parts[-1] if len(parts) > 0 else "Unknown"
    subdivision = parts[-2] if len(parts) > 1 else "Unknown"
    
    result = JobCompleteness(
        builder=builder_key,
        subdivision=subdivision,
        lot=lot,
        path=job_path,
    )
    
    # Get requirements for this builder
    requirements = REQUIRED_DOCUMENTS.get(builder_key, {})
    required_docs = requirements.get("required", [])
    optional_docs = requirements.get("optional", [])
    patterns = requirements.get("patterns", {})
    
    # Check required documents
    for doc_type in required_docs:
        found_path = find_document(job_path, doc_type, patterns)
        check = DocumentCheck(
            doc_type=doc_type,
            required=True,
            found=found_path is not None,
            file_path=found_path,
            file_name=found_path.name if found_path else None,
        )
        result.documents.append(check)
        
        if found_path:
            result.found_documents.append(doc_type)
        else:
            result.missing_required.append(doc_type)
    
    # Check optional documents
    for doc_type in optional_docs:
        found_path = find_document(job_path, doc_type, patterns)
        check = DocumentCheck(
            doc_type=doc_type,
            required=False,
            found=found_path is not None,
            file_path=found_path,
            file_name=found_path.name if found_path else None,
        )
        result.documents.append(check)
        
        if found_path:
            result.found_documents.append(doc_type)
        else:
            result.missing_optional.append(doc_type)
    
    # Determine completeness (all required docs present)
    result.is_complete = len(result.missing_required) == 0
    
    return result

# =============================================================================
# BATCH CHECKING
# =============================================================================

def check_subdivision(builder_key: str, subdivision: str) -> list:
    """
    Check all jobs in a subdivision.
    
    Returns list of JobCompleteness objects.
    """
    builder = BUILDERS.get(builder_key)
    if not builder:
        logger.error(f"Unknown builder: {builder_key}")
        return []
    
    customer_path = builder.get("customer_files_path")
    if not customer_path:
        logger.error(f"No customer files path for builder: {builder_key}")
        return []
    
    sub_path = customer_path / subdivision
    if not sub_path.exists():
        logger.warning(f"Subdivision folder not found: {sub_path}")
        return []
    
    results = []
    
    # Find all lot folders
    for lot_folder in sub_path.iterdir():
        if lot_folder.is_dir() and not lot_folder.name.startswith('.'):
            result = check_job_completeness(lot_folder, builder_key)
            results.append(result)
    
    return results

def check_all_active(builder_key: str = None) -> dict:
    """
    Check all active subdivisions for all builders (or specific builder).
    
    Returns dict with results organized by builder and subdivision.
    """
    results = {
        "timestamp": datetime.now().isoformat(),
        "builders": {},
        "summary": {
            "total_jobs": 0,
            "complete": 0,
            "incomplete": 0,
        }
    }
    
    builders_to_check = [builder_key] if builder_key else BUILDERS.keys()
    
    for bkey in builders_to_check:
        builder = BUILDERS.get(bkey)
        if not builder or not builder.get("active"):
            continue
        
        builder_results = {
            "name": builder["name"],
            "subdivisions": {},
            "total_jobs": 0,
            "complete": 0,
            "incomplete": 0,
        }
        
        # Auto-detect subdivisions
        subdivisions = get_active_subdivisions(bkey)
        logger.info(f"Checking {builder['name']}: {len(subdivisions)} subdivisions")
        
        for subdivision in subdivisions:
            sub_results = check_subdivision(bkey, subdivision)
            
            if sub_results:
                complete_count = sum(1 for r in sub_results if r.is_complete)
                incomplete_count = len(sub_results) - complete_count
                
                builder_results["subdivisions"][subdivision] = {
                    "total": len(sub_results),
                    "complete": complete_count,
                    "incomplete": incomplete_count,
                    "incomplete_jobs": [
                        {
                            "lot": r.lot,
                            "missing_required": r.missing_required,
                            "missing_optional": r.missing_optional,
                            "found": r.found_documents,
                        }
                        for r in sub_results if not r.is_complete
                    ]
                }
                
                builder_results["total_jobs"] += len(sub_results)
                builder_results["complete"] += complete_count
                builder_results["incomplete"] += incomplete_count
        
        results["builders"][bkey] = builder_results
        results["summary"]["total_jobs"] += builder_results["total_jobs"]
        results["summary"]["complete"] += builder_results["complete"]
        results["summary"]["incomplete"] += builder_results["incomplete"]
    
    return results

# =============================================================================
# REPORTING
# =============================================================================

def format_completeness_report(results: dict) -> str:
    """Format completeness results for display/Teams"""
    lines = []
    
    lines.append("━" * 50)
    lines.append("📋 **Document Completeness Report**")
    lines.append(f"   {results['timestamp'][:10]}")
    lines.append("━" * 50)
    lines.append("")
    
    summary = results["summary"]
    lines.append(f"**SUMMARY**")
    lines.append(f"• Total Jobs: {summary['total_jobs']}")
    lines.append(f"• Complete: {summary['complete']} ✓")
    lines.append(f"• Incomplete: {summary['incomplete']} ⚠️")
    lines.append("")
    
    for builder_key, builder_data in results["builders"].items():
        if builder_data["total_jobs"] == 0:
            continue
        
        lines.append("━" * 50)
        lines.append(f"**{builder_data['name']}**")
        lines.append(f"Complete: {builder_data['complete']}/{builder_data['total_jobs']}")
        lines.append("")
        
        for subdivision, sub_data in builder_data["subdivisions"].items():
            if sub_data["incomplete"] > 0:
                lines.append(f"  **{subdivision}** ({sub_data['incomplete']} incomplete)")
                
                for job in sub_data["incomplete_jobs"]:
                    lines.append(f"    • {job['lot']}")
                    if job["missing_required"]:
                        lines.append(f"      Missing: {', '.join(job['missing_required'])}")
                lines.append("")
    
    lines.append("━" * 50)
    
    return "\n".join(lines)

def generate_csv_report(results: dict, output_path: Path = None) -> str:
    """Generate CSV report of incomplete jobs"""
    lines = ["Builder,Subdivision,Lot,Missing Required,Missing Optional,Found Documents"]
    
    for builder_key, builder_data in results["builders"].items():
        for subdivision, sub_data in builder_data["subdivisions"].items():
            for job in sub_data.get("incomplete_jobs", []):
                lines.append(",".join([
                    builder_data["name"],
                    subdivision,
                    job["lot"],
                    "|".join(job["missing_required"]),
                    "|".join(job["missing_optional"]),
                    "|".join(job["found"]),
                ]))
    
    csv_content = "\n".join(lines)
    
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(csv_content)
        logger.info(f"CSV report saved to {output_path}")
    
    return csv_content

# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def run_completeness_check(builder_key: str = None, send_teams: bool = True) -> dict:
    """
    Run completeness check on all active jobs.
    
    Args:
        builder_key: Optional - only check this builder
        send_teams: Send notification to Teams
    
    Returns:
        dict with results
    """
    logger.info("Starting completeness check")
    
    results = check_all_active(builder_key)
    
    # Format report
    report = format_completeness_report(results)
    print("\n" + report)
    
    # Send to Teams
    if send_teams and results["summary"]["incomplete"] > 0:
        try:
            from services.teams_notify import send_teams_notification
            send_teams_notification("Completeness Check", report)
            logger.info("Teams notification sent")
        except ImportError:
            logger.warning("Teams notification module not available")
        except Exception as e:
            logger.error(f"Failed to send Teams notification: {e}")
    
    return {
        "total": results["summary"]["total_jobs"],
        "complete": results["summary"]["complete"],
        "incomplete": results["summary"]["incomplete"],
        "details": results,
    }

# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description="Document Completeness Checker")
    parser.add_argument("--builder", type=str, 
                        choices=["richmond_american", "holt_homes", "manor_homes"],
                        help="Check specific builder only")
    parser.add_argument("--subdivision", type=str, help="Check specific subdivision")
    parser.add_argument("--csv", type=str, help="Output CSV report to file")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    parser.add_argument("--no-teams", action="store_true", help="Skip Teams notification")
    
    args = parser.parse_args()
    
    if args.subdivision and args.builder:
        # Check specific subdivision
        results = check_subdivision(args.builder, args.subdivision)
        for r in results:
            status = "✓" if r.is_complete else "⚠️"
            print(f"{status} {r.lot}: {len(r.found_documents)} docs, missing: {r.missing_required}")
    else:
        # Full check
        results = check_all_active(args.builder)
        
        if args.csv:
            generate_csv_report(results, Path(args.csv))
        
        if args.json:
            print(json.dumps(results, indent=2, default=str))
        else:
            print(format_completeness_report(results))
