#!/usr/bin/env python3
"""
================================================================================
SALES TEAM ONE PDX - Excel Sync Agent
================================================================================

Continuously syncs data from Excel workbooks to JSON files for the platform.
Designed to run as a scheduled task or background service.

EXCEL SOURCES:
- Pride Board (ST1_Prideboard_Schedule_Extractor) → jobs.json
- PDSS → pdss.json  
- Contract Analysis → contracts.json
- Richmond Subdivisions → subdivisions.json
- EPO Reports → epo_reports.json

USAGE:
    python sto_excel_sync.py              # Run once
    python sto_excel_sync.py --watch      # Continuous monitoring
    python sto_excel_sync.py --daemon     # Run as background service

================================================================================
"""

import os
import sys
import json
import time
import hashlib
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Try imports
try:
    import pandas as pd
    from openpyxl import load_workbook
except ImportError:
    print("Install dependencies: pip install pandas openpyxl watchdog")
    sys.exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class ExcelSource:
    """Excel file source configuration."""
    name: str
    path: str
    sheet: str = None  # None = first sheet
    output_file: str = None
    key_columns: List[str] = None
    transform: str = None  # 'jobs', 'contracts', 'epo', 'pdss', 'subdivisions'

# Configure your Excel sources
EXCEL_SOURCES = [
    ExcelSource(
        name="Pride Board",
        path=r"C:\Users\corey.boser\OneDrive - BLDR\Organizational Tools\PrideBoard\ST1_Prideboard_Schedule_Extractor_06-06-25.xlsm",
        output_file="pride_board.json",
        transform="jobs"
    ),
    ExcelSource(
        name="PDSS",
        path=r"C:\Users\corey.boser\OneDrive - BLDR\Organizational Tools\PDSS\PDSS 8-5-25.xlsm",
        output_file="pdss.json",
        transform="pdss"
    ),
    ExcelSource(
        name="Contract Analysis",
        path=r"C:\Users\corey.boser\OneDrive - BLDR\Contract Analysis.xlsm",
        output_file="contracts.json",
        transform="contracts"
    ),
    ExcelSource(
        name="Richmond Subdivisions",
        path=r"C:\Users\corey.boser\OneDrive - BLDR\Richmond Subdivision Spreadsheet.xlsx",
        output_file="richmond_subs.json",
        transform="subdivisions"
    ),
    ExcelSource(
        name="EPO Reports",
        path=r"C:\Users\corey.boser\OneDrive - BLDR\EPO Report\EPO Reports.xlsx",
        output_file="epo_reports.json",
        transform="epo"
    ),
]

# Output directory for JSON files
OUTPUT_DIR = r"C:\Users\corey.boser\Documents\STO_Platform\data"

# OneDrive sync folder (optional - files here auto-sync)
ONEDRIVE_SYNC = r"C:\Users\corey.boser\OneDrive - BLDR\Construction_Data\Database"

# =============================================================================
# LOGGING
# =============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# =============================================================================
# EXCEL TRANSFORMERS
# =============================================================================

class ExcelTransformer:
    """Transform Excel data to JSON format."""
    
    @staticmethod
    def transform_jobs(df: pd.DataFrame) -> Dict:
        """Transform Pride Board data to jobs format."""
        jobs = []
        
        # Common column name variations
        col_map = {
            'job_number': ['Job #', 'Job Number', 'JobNumber', 'Job', 'JOB #'],
            'builder': ['Builder', 'BUILDER', 'Builder Name'],
            'subdivision': ['Subdivision', 'Community', 'SUBDIVISION', 'Sub'],
            'lot': ['Lot', 'Lot #', 'LOT', 'Lot Number'],
            'plan': ['Plan', 'Plan Code', 'PLAN', 'Plan Name'],
            'status': ['Status', 'STATUS', 'Job Status'],
            'address': ['Address', 'ADDRESS', 'Street Address'],
        }
        
        # Find actual column names
        actual_cols = {}
        for key, variations in col_map.items():
            for var in variations:
                if var in df.columns:
                    actual_cols[key] = var
                    break
        
        for idx, row in df.iterrows():
            job = {
                'id': f"JOB-{idx}",
                'jobNumber': str(row.get(actual_cols.get('job_number', ''), '')).strip(),
                'builder': str(row.get(actual_cols.get('builder', ''), '')).strip(),
                'subdivision': str(row.get(actual_cols.get('subdivision', ''), '')).strip(),
                'lot': str(row.get(actual_cols.get('lot', ''), '')).strip(),
                'plan': str(row.get(actual_cols.get('plan', ''), '')).strip(),
                'status': str(row.get(actual_cols.get('status', ''), 'Active')).strip(),
                'address': str(row.get(actual_cols.get('address', ''), '')).strip(),
            }
            
            # Skip empty rows
            if job['jobNumber'] and job['jobNumber'] != 'nan':
                # Identify builder code
                job['builderCode'] = ExcelTransformer._get_builder_code(job['builder'])
                
                # Generate unique ID
                job['id'] = f"{job['builderCode']}-{job['subdivision'][:4].upper()}-{job['lot']}"
                
                jobs.append(job)
        
        return {
            'metadata': {
                'source': 'Pride Board',
                'extracted': datetime.now().isoformat(),
                'recordCount': len(jobs)
            },
            'jobs': jobs
        }
    
    @staticmethod
    def transform_contracts(df: pd.DataFrame) -> Dict:
        """Transform Contract Analysis data."""
        contracts = []
        
        for idx, row in df.iterrows():
            contract = {}
            for col in df.columns:
                val = row[col]
                if pd.notna(val):
                    contract[str(col)] = str(val) if not isinstance(val, (int, float)) else val
            
            if contract:
                contract['id'] = f"CONTRACT-{idx}"
                contracts.append(contract)
        
        return {
            'metadata': {
                'source': 'Contract Analysis',
                'extracted': datetime.now().isoformat(),
                'recordCount': len(contracts),
                'columns': list(df.columns)
            },
            'contracts': contracts
        }
    
    @staticmethod
    def transform_epo(df: pd.DataFrame) -> Dict:
        """Transform EPO Reports data."""
        epos = []
        
        for idx, row in df.iterrows():
            epo = {}
            for col in df.columns:
                val = row[col]
                if pd.notna(val):
                    epo[str(col)] = str(val) if not isinstance(val, (int, float)) else val
            
            if epo:
                epo['id'] = f"EPO-{idx}"
                epos.append(epo)
        
        return {
            'metadata': {
                'source': 'EPO Reports',
                'extracted': datetime.now().isoformat(),
                'recordCount': len(epos)
            },
            'epos': epos
        }
    
    @staticmethod
    def transform_pdss(df: pd.DataFrame) -> Dict:
        """Transform PDSS data."""
        records = []
        
        for idx, row in df.iterrows():
            record = {}
            for col in df.columns:
                val = row[col]
                if pd.notna(val):
                    record[str(col)] = str(val) if not isinstance(val, (int, float)) else val
            
            if record:
                record['id'] = f"PDSS-{idx}"
                records.append(record)
        
        return {
            'metadata': {
                'source': 'PDSS',
                'extracted': datetime.now().isoformat(),
                'recordCount': len(records)
            },
            'records': records
        }
    
    @staticmethod
    def transform_subdivisions(df: pd.DataFrame) -> Dict:
        """Transform Richmond Subdivisions data."""
        subdivisions = []
        
        for idx, row in df.iterrows():
            sub = {}
            for col in df.columns:
                val = row[col]
                if pd.notna(val):
                    sub[str(col)] = str(val) if not isinstance(val, (int, float)) else val
            
            if sub:
                sub['id'] = f"SUB-{idx}"
                subdivisions.append(sub)
        
        return {
            'metadata': {
                'source': 'Richmond Subdivision Spreadsheet',
                'extracted': datetime.now().isoformat(),
                'recordCount': len(subdivisions)
            },
            'subdivisions': subdivisions
        }
    
    @staticmethod
    def _get_builder_code(builder_name: str) -> str:
        """Get builder code from name."""
        name = builder_name.lower()
        if 'richmond' in name:
            return 'RAH'
        elif 'holt' in name:
            return 'HOLT'
        elif 'manor' in name:
            return 'MANOR'
        elif 'sekisui' in name:
            return 'SEKISUI'
        return 'OTHER'

# =============================================================================
# SYNC ENGINE
# =============================================================================

class ExcelSyncEngine:
    """Main sync engine for Excel to JSON conversion."""
    
    def __init__(self, sources: List[ExcelSource], output_dir: str):
        self.sources = sources
        self.output_dir = output_dir
        self.file_hashes = {}
        self.transformer = ExcelTransformer()
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
    
    def sync_all(self) -> Dict[str, bool]:
        """Sync all configured Excel sources."""
        results = {}
        
        for source in self.sources:
            logger.info(f"Syncing: {source.name}")
            try:
                success = self.sync_source(source)
                results[source.name] = success
                if success:
                    logger.info(f"  ✓ {source.name} synced")
                else:
                    logger.warning(f"  ✗ {source.name} failed")
            except Exception as e:
                logger.error(f"  ✗ {source.name} error: {e}")
                results[source.name] = False
        
        return results
    
    def sync_source(self, source: ExcelSource) -> bool:
        """Sync a single Excel source."""
        if not os.path.exists(source.path):
            logger.warning(f"File not found: {source.path}")
            return False
        
        # Check if file has changed
        current_hash = self._get_file_hash(source.path)
        if current_hash == self.file_hashes.get(source.name):
            logger.info(f"  No changes detected in {source.name}")
            return True
        
        # Read Excel file
        try:
            df = pd.read_excel(
                source.path,
                sheet_name=source.sheet if source.sheet else 0,
                engine='openpyxl'
            )
        except Exception as e:
            logger.error(f"Failed to read Excel: {e}")
            return False
        
        # Transform data
        transform_method = getattr(self.transformer, f"transform_{source.transform}", None)
        if transform_method:
            data = transform_method(df)
        else:
            # Generic transform
            data = {
                'metadata': {
                    'source': source.name,
                    'extracted': datetime.now().isoformat()
                },
                'data': df.to_dict(orient='records')
            }
        
        # Save JSON
        output_path = os.path.join(self.output_dir, source.output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        
        # Update hash
        self.file_hashes[source.name] = current_hash
        
        logger.info(f"  Saved: {output_path} ({data['metadata'].get('recordCount', '?')} records)")
        return True
    
    def _get_file_hash(self, file_path: str) -> str:
        """Get MD5 hash of file for change detection."""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return ""

# =============================================================================
# FILE WATCHER
# =============================================================================

class ExcelChangeHandler(FileSystemEventHandler):
    """Handle Excel file changes."""
    
    def __init__(self, sync_engine: ExcelSyncEngine, sources: List[ExcelSource]):
        self.sync_engine = sync_engine
        self.watched_files = {s.path.lower(): s for s in sources}
        self.last_sync = {}
        self.debounce_seconds = 5  # Prevent rapid re-syncs
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        file_path = event.src_path.lower()
        
        # Check if this is a watched file
        source = self.watched_files.get(file_path)
        if not source:
            return
        
        # Debounce
        now = time.time()
        last = self.last_sync.get(source.name, 0)
        if now - last < self.debounce_seconds:
            return
        
        logger.info(f"Change detected: {source.name}")
        self.sync_engine.sync_source(source)
        self.last_sync[source.name] = now

# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="STO Excel Sync Agent")
    parser.add_argument("--watch", action="store_true", help="Watch for file changes")
    parser.add_argument("--daemon", action="store_true", help="Run as background daemon")
    parser.add_argument("--interval", type=int, default=300, help="Sync interval in seconds (default: 300)")
    parser.add_argument("--output", type=str, default=OUTPUT_DIR, help="Output directory")
    args = parser.parse_args()
    
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║   🌲  SALES TEAM ONE PDX - Excel Sync Agent                       ║
║       Builder's FirstSource — PNW Region                          ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    # Initialize sync engine
    engine = ExcelSyncEngine(EXCEL_SOURCES, args.output)
    
    # Initial sync
    logger.info("Starting initial sync...")
    results = engine.sync_all()
    
    success_count = sum(1 for v in results.values() if v)
    logger.info(f"Initial sync complete: {success_count}/{len(results)} sources")
    
    if args.watch or args.daemon:
        # Set up file watcher
        logger.info(f"Starting file watcher (interval: {args.interval}s)...")
        
        observer = Observer()
        handler = ExcelChangeHandler(engine, EXCEL_SOURCES)
        
        # Watch directories containing source files
        watched_dirs = set()
        for source in EXCEL_SOURCES:
            dir_path = os.path.dirname(source.path)
            if os.path.exists(dir_path) and dir_path not in watched_dirs:
                observer.schedule(handler, dir_path, recursive=False)
                watched_dirs.add(dir_path)
                logger.info(f"Watching: {dir_path}")
        
        observer.start()
        
        try:
            while True:
                time.sleep(args.interval)
                logger.info("Periodic sync...")
                engine.sync_all()
        except KeyboardInterrupt:
            logger.info("Stopping...")
            observer.stop()
        
        observer.join()
    else:
        logger.info("One-time sync complete. Use --watch for continuous monitoring.")

if __name__ == "__main__":
    main()
