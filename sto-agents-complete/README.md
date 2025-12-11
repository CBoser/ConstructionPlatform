# STO Agents

**Sales Team One PDX | Builder's FirstSource**

Automation agents for Richmond American, Holt Homes, Manor Homes, and Sekisui House operations.

## Quick Start

1. Extract to `C:\Users\YOUR_USER\sto-agents\`
2. Update `config\settings.py` with your SharePoint sync path
3. Double-click `run.bat`
4. Press `[F]` to run Folder Manager and create structure
5. Press `[1]` to run Morning Routine

## Features

### Daily Routines
- **Morning Routine** `[1]`: Portal check + Completeness + PDSS + SupplyPro Report
- **Evening Routine** `[2]`: PDSS sync + Nightly backup

### Portal Reports
- **SupplyPro Report** `[S]`: EPOs, documents, dashboard data for Richmond American

### Individual Agents
- **Plan Intake** `[3]`: Routes files from 00_Intake to Customer Files
- **Completeness Checker** `[4,5]`: Validates job folders have required documents
- **PDSS Sync** `[6]`: Syncs tracking sheet with folder structure
- **Backup Agent** `[7,8,9]`: Nightly/Weekly/Monthly backups to I: drive

### Folder Management
- **Folder Manager** `[F]`: Create/check hybrid folder structure

## Folder Structure

```
Sales Team One - Construction Platform/
├── 00_Intake/              # Landing zone for new files
│   ├── Richmond American/
│   ├── Holt Homes/
│   └── Manor Homes/
├── 01_Materials/           # Master material files
├── 02_Plans/               # Plan drawings
├── 03_BOMs/                # Generated BOMs
├── 04_Jobs/                # Active BATs
│   └── Active/
├── 05_Schedules/           # Schedules
├── 06_Contracts/           # Contracts
├── 07_Purchase_Orders/     # POs
├── 08_Time_Entries/        # Time tracking
├── 09_Reports/             # Generated reports
├── 10_System_Backups/      # JSON/CSV exports
├── 11_Training/            # Documentation
├── Customer Files/         # Job-centric organization
│   ├── Richmond American/
│   │   ├── North Haven Phase 4/
│   │   │   └── Lot 127/
│   │   │       ├── Plans and Layouts/
│   │   │       └── POs/
│   │   └── Luden Estates Phase 3/
│   ├── Holt Homes/
│   └── Manor Homes/
├── Operations/             # Operational tracking
│   ├── PDSS/
│   ├── Pride Board/
│   ├── Contract Analysis/
│   └── EPO Reports/
└── BATs/                   # BAT Excel files
    ├── Richmond American/
    ├── Holt Homes/
    └── Manor Homes/
```

## Configuration

### SharePoint Path
Update `config/settings.py`:
```python
LOCAL_SYNC_ROOT = Path(r"C:\Users\YOUR_USER\OneDrive - BLDR\Sales Team One - Construction Platform")
```

### Teams Webhook
Set environment variable:
```
set TEAMS_WEBHOOK_URL=https://your-webhook-url
```

Or update `config/settings.py`:
```python
TEAMS_WEBHOOK_URL = "https://your-webhook-url"
```

### SupplyPro Communities
Edit `config/supplypro_config.py` to change monitored communities:
```python
MONITORED_COMMUNITIES = [
    "Luden Estates Phase 3",
    "North Haven Phase 4",
    "Reserve at Battle Creek",
    "Verona Heights",
]
```

## Workflow

### New Project Intake (Unknown Subdivisions)

When you receive plans for a **new subdivision** that doesn't exist yet:

1. **Open the Intake Form**: `NewProjectIntake.html`
2. **Fill in project details**:
   - Builder & subdivision name (required)
   - Location, lot range, plan codes
   - Contacts (superintendent, PM)
   - Expected documents
3. **Generate & Download** the JSON intake package
4. **Save JSON** to `00_Intake/_NewProjects/`
5. **Run the Intake Processor**: Menu option `[I]`

This will:
- Create `Customer Files/{Builder}/{Subdivision}/` folder
- Create `00_Intake/{Builder}/{Subdivision}/` landing zone  
- Add the project to PDSS tracking
- Send a Teams notification

### File Intake
1. Download files from SupplyPro/Hyphen manually
2. Drop in `00_Intake/{Builder}/{Subdivision}/`
3. Run Plan Intake agent
4. Files are routed to `Customer Files/{Builder}/{Subdivision}/{Lot}/`

### Daily Operations
- **7:00 AM**: Run Morning Routine
- **During Day**: Manual downloads → 00_Intake
- **5:00 PM**: Run Evening Routine

## Files

```
sto-agents/
├── run.bat                 # Windows launcher
├── run.py                  # Main orchestrator
├── folder_manager.py       # Folder structure tool
├── NewProjectIntake.html   # Intake form for new subdivisions
├── agents/
│   ├── plan_intake.py      # File routing
│   ├── completeness_checker.py
│   ├── pdss_sync.py        # PDSS tracker
│   ├── backup_agent.py     # Backup operations
│   ├── supplypro_reporter.py
│   └── intake_processor.py # New project intake processor
├── config/
│   ├── settings.py         # Main configuration
│   └── supplypro_config.py # SupplyPro settings
├── services/
│   └── teams_notify.py     # Teams notifications
└── data/
    └── logs/               # Log files
```

## Requirements

- Python 3.8+
- Windows 10/11
- OneDrive sync active
- Network access to I: drive (for backups)

## Support

Contact: Corey Boser | Sales Team One PDX
