---
name: construction-data-migration
description: Specialized skill for migrating Excel-based construction project management data to web platform. Use when the user needs to transform, validate, or migrate data from Excel systems including Plan Start Sheets (40 plans, 567 options), PDSS workflows, job coordination data, contract tracking, time entries (3,355+ records), or subdivision data (31 subdivisions). Also use for data structure design, ETL pipeline creation, and data validation for construction workflows.
---

# Construction Data Migration

This skill provides specialized knowledge for migrating construction project management data from Excel-based systems to the integrated web platform.

## Core Data Sources

### 1. Plan Start Sheets
- 40 house plans with detailed specifications
- Plan codes, elevations, base configurations
- Option compatibility matrices

### 2. Plan Options Database
- 567 distinct options across all plans
- Compatibility relationships between options
- Requirements and dependencies
- Pricing tiers and availability rules

### 3. PDSS (Plan Distribution Status System)
- Document status tracking
- Review cycles and approvals
- Revision history
- Stakeholder notifications

### 4. Job Coordination Data
- Job lifecycle stages
- Resource assignments
- Milestone tracking
- Status updates and flags

### 5. Contract & PO Tracking
- HOLT SDSS-style contract management
- Purchase order workflows
- Vendor relationships
- Payment milestones

### 6. Time Tracking Database
- 3,355+ historical time entries
- Task categorization (0.65 hrs avg)
- Resource utilization patterns
- Estimation baselines

### 7. Subdivision Portfolio
- 31 active subdivisions
- Builder relationships
- Specification requirements
- Geographic and regulatory data

## Data Migration Strategy

### Phase 1: Assessment & Planning
1. **Inventory existing Excel files**
   - Document all spreadsheet locations
   - Identify version control issues
   - Map data relationships
   - Note data quality issues

2. **Define target schema**
   - Design normalized database structure
   - Plan for referential integrity
   - Define validation rules
   - Create data dictionaries

3. **Establish data quality baseline**
   - Run completeness checks
   - Identify duplicates
   - Document inconsistencies
   - Create data quality report

### Phase 2: Extraction & Transformation

#### Excel Data Extraction Pattern
```python
import pandas as pd
from pathlib import Path

def extract_excel_data(file_path, sheet_name=None):
    """
    Extract data from Excel with error handling
    """
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        # Log extraction details
        print(f"Extracted {len(df)} rows from {file_path}")
        
        # Basic validation
        if df.empty:
            print(f"WARNING: Empty dataset from {file_path}")
        
        return df
    except Exception as e:
        print(f"ERROR extracting {file_path}: {str(e)}")
        return None

def extract_all_plan_data(excel_directory):
    """
    Extract all plan-related data from directory
    """
    plan_data = {}
    
    for file_path in Path(excel_directory).glob('**/*.xlsx'):
        if 'Plan' in file_path.stem or 'Option' in file_path.stem:
            df = extract_excel_data(file_path)
            if df is not None:
                plan_data[file_path.stem] = df
    
    return plan_data
```

#### Data Transformation Rules

**Plan Options Transformation:**
```python
def transform_plan_options(raw_df):
    """
    Transform plan options from Excel format to API format
    """
    transformed = raw_df.copy()
    
    # Standardize column names
    column_mapping = {
        'Plan Code': 'planCode',
        'Option Code': 'optionCode',
        'Option Name': 'optionName',
        'Elevation': 'elevation',
        'Compatible With': 'compatibleOptions',
        'Requirements': 'requirements',
        'Category': 'category',
        'Price Tier': 'priceTier'
    }
    transformed.rename(columns=column_mapping, inplace=True)
    
    # Parse compatibility lists
    transformed['compatibleOptions'] = transformed['compatibleOptions'].apply(
        lambda x: [opt.strip() for opt in str(x).split(',')] if pd.notna(x) else []
    )
    
    # Parse requirements
    transformed['requirements'] = transformed['requirements'].apply(
        lambda x: [req.strip() for req in str(x).split(';')] if pd.notna(x) else []
    )
    
    # Add metadata
    transformed['migrationDate'] = pd.Timestamp.now()
    transformed['source'] = 'Excel Migration'
    
    return transformed
```

**Time Entry Transformation:**
```python
def transform_time_entries(raw_df):
    """
    Transform 3,355+ time entries for analytics
    """
    transformed = raw_df.copy()
    
    # Standardize date formats
    transformed['date'] = pd.to_datetime(transformed['Date'])
    
    # Parse duration (handle various formats: "0.65", "45min", "1hr 30min")
    transformed['hoursDecimal'] = transformed['Duration'].apply(parse_duration)
    
    # Categorize tasks
    transformed['taskCategory'] = transformed['Task'].apply(categorize_task)
    
    # Link to jobs (if job reference exists)
    transformed['jobId'] = transformed['Job Reference'].apply(extract_job_id)
    
    # Calculate aggregates for estimation
    transformed['complexity'] = calculate_complexity(transformed)
    
    return transformed
```

### Phase 3: Validation & Quality Assurance

#### Validation Checks
```python
def validate_migrated_data(transformed_df, source_df):
    """
    Comprehensive validation of migrated data
    """
    validation_report = {
        'record_count_match': len(transformed_df) == len(source_df),
        'null_checks': {},
        'data_type_checks': {},
        'relationship_integrity': {},
        'business_rule_violations': []
    }
    
    # Check for required fields
    required_fields = ['planCode', 'optionCode', 'category']
    for field in required_fields:
        null_count = transformed_df[field].isnull().sum()
        validation_report['null_checks'][field] = {
            'null_count': null_count,
            'pass': null_count == 0
        }
    
    # Validate plan code format (e.g., "PL-1234")
    invalid_plan_codes = transformed_df[
        ~transformed_df['planCode'].str.match(r'^PL-\d{4}$')
    ]
    if not invalid_plan_codes.empty:
        validation_report['business_rule_violations'].append({
            'rule': 'Plan Code Format',
            'violations': len(invalid_plan_codes),
            'examples': invalid_plan_codes['planCode'].head().tolist()
        })
    
    # Check option compatibility references
    all_option_codes = set(transformed_df['optionCode'].unique())
    for idx, row in transformed_df.iterrows():
        for compat_option in row['compatibleOptions']:
            if compat_option not in all_option_codes:
                validation_report['relationship_integrity'].setdefault(
                    'invalid_compatibility_refs', []
                ).append({
                    'optionCode': row['optionCode'],
                    'invalid_ref': compat_option
                })
    
    return validation_report
```

### Phase 4: Loading Data

#### Batch Upload Strategy
```python
async def batch_upload_to_api(data, endpoint, batch_size=100):
    """
    Upload data in batches to prevent timeouts
    """
    total_records = len(data)
    successful = 0
    failed = []
    
    for i in range(0, total_records, batch_size):
        batch = data[i:i + batch_size]
        
        try:
            response = await api_client.post(
                endpoint,
                json={'records': batch.to_dict('records')}
            )
            
            if response.status_code == 200:
                successful += len(batch)
                print(f"✓ Uploaded batch {i//batch_size + 1}: {len(batch)} records")
            else:
                failed.extend(batch.to_dict('records'))
                print(f"✗ Failed batch {i//batch_size + 1}: {response.text}")
                
        except Exception as e:
            failed.extend(batch.to_dict('records'))
            print(f"✗ Error uploading batch {i//batch_size + 1}: {str(e)}")
    
    return {
        'total': total_records,
        'successful': successful,
        'failed': len(failed),
        'failed_records': failed
    }
```

## Data Relationships

### Critical Relationships to Maintain
1. **Plans → Options**: One-to-many (1 plan → many options)
2. **Options → Compatible Options**: Many-to-many (options reference each other)
3. **Jobs → Plans**: Many-to-one (many jobs use same plan)
4. **Jobs → Subdivisions**: Many-to-one (many jobs in one subdivision)
5. **Time Entries → Jobs**: Many-to-one (many time entries per job)
6. **Contracts → Jobs**: One-to-one (each job has one contract)

### Referential Integrity Script
```python
def verify_referential_integrity(datasets):
    """
    Verify all foreign key relationships are valid
    """
    issues = []
    
    # Check: Every job references a valid plan
    valid_plans = set(datasets['plans']['planCode'])
    for job in datasets['jobs']:
        if job['planCode'] not in valid_plans:
            issues.append(f"Job {job['jobId']} references invalid plan {job['planCode']}")
    
    # Check: Every option compatibility reference exists
    valid_options = set(datasets['options']['optionCode'])
    for option in datasets['options']:
        for compat in option['compatibleOptions']:
            if compat not in valid_options:
                issues.append(f"Option {option['optionCode']} references invalid option {compat}")
    
    # Check: Every time entry references a valid job
    valid_jobs = set(datasets['jobs']['jobId'])
    for entry in datasets['timeEntries']:
        if entry['jobId'] and entry['jobId'] not in valid_jobs:
            issues.append(f"Time entry {entry['id']} references invalid job {entry['jobId']}")
    
    return issues
```

## Migration Execution Checklist

### Pre-Migration
- [ ] Backup all Excel files with timestamps
- [ ] Document current Excel file locations
- [ ] Create data dictionary for all fields
- [ ] Establish baseline metrics (record counts, key aggregates)
- [ ] Set up migration database/staging environment
- [ ] Create rollback plan

### During Migration
- [ ] Extract data with error logging
- [ ] Transform data per defined rules
- [ ] Validate transformed data
- [ ] Generate data quality report
- [ ] Review validation report with stakeholders
- [ ] Fix critical data issues
- [ ] Upload in batches with progress tracking
- [ ] Verify referential integrity post-upload

### Post-Migration
- [ ] Reconcile record counts (source vs. target)
- [ ] Spot-check critical records manually
- [ ] Run end-to-end workflow tests
- [ ] Generate migration summary report
- [ ] Archive Excel files with "MIGRATED" suffix
- [ ] Document any data transformation decisions
- [ ] Create data lineage documentation

## Key Metrics to Track

### Migration Health Metrics
- **Completeness**: Records migrated / Total source records
- **Accuracy**: Records passing validation / Total migrated records
- **Timeliness**: Actual migration time vs. planned
- **Data Quality**: Critical field null rate, duplicate rate

### Business Impact Metrics
- **Coverage**: Plans migrated (target: 40/40)
- **Option Coverage**: Options migrated (target: 567/567)
- **Historical Data**: Time entries migrated (target: 3,355+)
- **Subdivision Coverage**: Subdivisions migrated (target: 31/31)

## Common Migration Challenges

### Challenge 1: Inconsistent Option Codes
**Problem**: Excel sheets use different naming conventions
**Solution**: Create master mapping table, standardize during transformation

### Challenge 2: Circular Option Dependencies
**Problem**: Option A requires Option B, Option B requires Option A
**Solution**: Detect cycles, flag for manual review, implement dependency ordering

### Challenge 3: Missing Time Entry References
**Problem**: Time entries reference job IDs that don't exist
**Solution**: Create "Unassigned" bucket, allow later reconciliation through admin UI

### Challenge 4: Duplicate Plan Definitions
**Problem**: Same plan appears in multiple Excel files with slight variations
**Solution**: Implement master data management, designate single source of truth

## Helper Functions

### Duration Parsing
```python
import re

def parse_duration(duration_str):
    """
    Parse various duration formats to decimal hours
    Examples: "0.65", "45min", "1hr 30min", "1.5h"
    """
    if pd.isna(duration_str):
        return 0
    
    duration_str = str(duration_str).strip().lower()
    
    # Already decimal
    if re.match(r'^\d+\.?\d*$', duration_str):
        return float(duration_str)
    
    # Hours and minutes
    hours = 0
    match = re.search(r'(\d+)\s*h(?:r|our)?', duration_str)
    if match:
        hours = int(match.group(1))
    
    minutes = 0
    match = re.search(r'(\d+)\s*m(?:in)?', duration_str)
    if match:
        minutes = int(match.group(1))
    
    return hours + (minutes / 60)
```

### Task Categorization
```python
def categorize_task(task_description):
    """
    Categorize time entry tasks for analytics
    """
    task_lower = str(task_description).lower()
    
    categories = {
        'plan_review': ['review', 'plan check', 'pdss', 'drawing'],
        'coordination': ['coordinate', 'meeting', 'call', 'email'],
        'option_selection': ['option', 'selection', 'upgrade', 'choose'],
        'contract_mgmt': ['contract', 'po', 'purchase order', 'agreement'],
        'site_work': ['site', 'field', 'inspection', 'walkthrough'],
        'admin': ['admin', 'filing', 'documentation', 'data entry']
    }
    
    for category, keywords in categories.items():
        if any(keyword in task_lower for keyword in keywords):
            return category
    
    return 'other'
```

## Data Migration Timeline

### Week 1: Preparation (40 hours)
- Inventory and backup Excel files
- Design target schema
- Set up staging environment
- Create extraction scripts

### Week 2: Extraction & Transformation (60 hours)
- Extract all Excel data
- Transform to target format
- Initial validation
- Quality report generation

### Week 3: Validation & Correction (40 hours)
- Review validation reports
- Fix critical issues
- Stakeholder review
- Approve for migration

### Week 4: Loading & Verification (40 hours)
- Batch upload to platform
- Verify referential integrity
- Reconciliation checks
- Final sign-off

**Total Effort: ~180 hours (4-5 weeks with dedicated resources)**

## Success Criteria

Migration is considered successful when:
- ✓ 100% of records from Excel sources are accounted for
- ✓ <1% data quality issues remain (documented and scheduled for cleanup)
- ✓ All referential integrity constraints are satisfied
- ✓ End-to-end workflows function with migrated data
- ✓ Users can access all historical data through new platform
- ✓ Performance meets requirements (<2s dashboard load)
- ✓ Excel files archived with clear "DO NOT USE" marking
