# BAT-Tools (Business Analysis Tools)

This folder contains the BAT (Business Analysis Tools) system - a collection of Excel-based business analysis workbooks and supporting Python utilities for construction project estimation and analysis.

## Purpose

The BAT system is designed to be separated into its own repository, independent from the MindFlow ConstructionPlatform web application. This folder contains all BAT-related files that can be extracted to create a standalone BAT-Tools repository.

## Directory Structure

```
BAT-Tools/
├── excel-workbooks/           # Excel BAT workbooks
│   ├── *.xlsm                 # Active BAT workbooks (HOLT, Richmond)
│   ├── *.bas                  # VBA modules
│   ├── *.xlsx                 # Reference sheets
│   └── Archive/               # Previous versions
│
├── python-system/             # Python BAT system (v2)
│   ├── bat_system_v2/         # Main Python package
│   │   ├── database/          # Database connections
│   │   ├── models/            # Data models
│   │   └── services/          # Business logic
│   ├── cli/                   # Command-line interface
│   ├── services/              # Utility services
│   └── docs/                  # System documentation
│
├── tools/                     # Python utilities
│   ├── auto_import_bat.py     # Automated BAT import
│   ├── create_improved_bat.py # BAT workbook generation
│   ├── create_improved_holt_bat.py
│   ├── create_complete_improved_bat.py
│   ├── add_unified_codes_to_excel.py
│   └── create_excel_improvement_guide.py
│
└── docs/                      # Documentation
    ├── Migration Strategy/    # Migration guides & legacy files
    ├── analysis/              # System analysis documents
    ├── lessons-learned/       # Development lessons
    ├── migration/             # Migration planning & testing
    ├── planning/              # Integration strategies
    ├── sessions/              # Session notes
    └── skills/                # Claude skills for BAT
```

## Key Components

### Excel Workbooks
- **IMPROVED_HOLT_BAT_NOVEMBER_2025.xlsm** - Current production HOLT BAT
- **IMPROVED_HOLT_BAT_WITH_CODES_NOVEMBER_2025.xlsm** - HOLT BAT with unified codes
- **IMPROVED_RICHMOND_BAT_NOVEMBER_2025.xlsm** - Richmond variant
- **HOLT_VBA_MODULE.bas** - VBA macro module
- **HOLT_UNIFIED_CODE_CROSS_REFERENCE.xlsx** - Code cross-reference

### Python System
The Python system provides:
- Data models for bids, customers, materials, plans, pricing, suppliers
- CLI tools for code, material, plan, and pricing management
- Database integration with SQLAlchemy
- Unified code system parsing

### Utility Tools
- **auto_import_bat.py** - Import BAT workbook data
- **create_improved_bat.py** - Generate BAT workbooks
- **add_unified_codes_to_excel.py** - Add unified code system

## Creating a Separate Repository

To extract this into its own repository:

1. Copy the entire `BAT-Tools/` folder to a new location
2. Initialize a new git repository
3. Update Python import paths if necessary
4. Create appropriate `.gitignore` and configuration files
5. Set up any required dependencies (see python-system requirements)

## Dependencies

### Python System
- Python 3.8+
- SQLAlchemy
- openpyxl
- See `python-system/` for full requirements

### Excel Workbooks
- Microsoft Excel with macro support (xlsm)
- VBA enabled

## Related Documentation

- `docs/Migration Strategy/` - Comprehensive migration guides
- `python-system/docs/` - System overview and CLI usage
- `docs/CODE_SYSTEM_IMPLEMENTATION_GUIDE.md` - Unified code system guide

## Notes

This folder was separated from the ConstructionPlatform repository to allow:
- Independent version control for BAT workbooks
- Separate deployment and maintenance cycles
- Clearer separation of concerns between web platform and analysis tools
