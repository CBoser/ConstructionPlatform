# HOLT HOMES BAT PRICING UPDATER - SETUP GUIDE

## 📁 File Information
- **File**: `HOLT BAT OCTOBER 2025 9-29-25.xlsm`
- **Location**: `C:\Users\corey.boser\Documents\Holt Monthly Pricing\`
- **Type**: Macro-enabled Excel workbook (.xlsm)

## 🚀 Quick Setup (One-Time)

### Step 1: Copy Files
Copy these files to your BAT folder:
```
C:\Users\corey.boser\Documents\Holt Monthly Pricing\
├── holt_updater.py          (Main Python script)
├── RUN_HOLT_UPDATE.bat       (Double-click to run)
└── RUN_HOLT_UPDATE.ps1       (Alternative runner)
```

### Step 2: Verify Python Installation
Open Command Prompt and type:
```
python --version
```
You should see Python 3.x.x. If not, install Python from python.org

### Step 3: Install Required Library
Open Command Prompt and run:
```
pip install openpyxl
```

## ✅ Daily Usage

### Option 1: Using Batch File (Easiest)
1. Double-click `RUN_HOLT_UPDATE.bat`
2. Watch the update progress
3. Find your updated file with timestamp

### Option 2: Using PowerShell
1. Right-click `RUN_HOLT_UPDATE.ps1`
2. Select "Run with PowerShell"
3. Follow the prompts

### Option 3: Direct Python (Most Control)
```
python holt_updater.py "C:\Users\corey.boser\Documents\Holt Monthly Pricing\HOLT BAT OCTOBER 2025 9-29-25.xlsm"
```

## 📊 Required Excel Structure

### Sheet: `updatetool_MarginUpdates` (or `MARGINS TO CHANGE`)
| Column | Content | Example |
|--------|---------|---------|
| A | Pricing Zone | PORTOR |
| B | Product Category | 20 - ENGINEERED LBR |
| C | Minor Category | 2001 - I JOISTS |
| D | Item ID | ALL or specific |
| F | New Margin % | 0.17 or 17% |
| H | Price Levels | PL10 or PL01,PL05 |
| I | Status | (Auto-filled) |

### Sheet: `costsheet_UnconvertedPricing`
| Column | Content |
|--------|---------|
| A | Pricing Zone |
| B | Product Category |
| C | Minor Category |
| D | Item ID |
| R (18) | Base Cost |
| T (20) | PL01 Sell Price |
| W (23) | PL02 Sell Price |
| Z (26) | PL03 Sell Price |
| AC (29) | PL04 Sell Price |
| AF (32) | PL05 Sell Price |
| AI (35) | PL06 Sell Price |
| AL (38) | PL07 Sell Price |
| AO (41) | PL08 Sell Price |
| AR (44) | PL09 Sell Price |
| AU (47) | PL10 Sell Price |
| AX (50) | PL11 Sell Price |
| BA (53) | PL12 Sell Price |

## 💡 Price Level Options

In the Price Levels column, you can specify:
- **Single**: `PL10` - Updates only PL10
- **Multiple**: `PL01,PL05,PL09` - Updates these three
- **Range**: `PL01-PL05` - Updates PL01 through PL05
- **All**: `ALL` or leave blank - Updates all 12 levels

## 📋 What the Script Does

1. **Preserves Macros**: Keeps all VBA code intact in .xlsm file
2. **Reads Updates**: From `updatetool_MarginUpdates` sheet
3. **Finds Matches**: Searches through all pricing rows
4. **Updates Selectively**: Only specified price levels
5. **Highlights Changes**: Light green background
6. **Creates Backup**: Saves with timestamp (e.g., `..._UPDATED_20241028_1430.xlsm`)

## ✨ Output Example
```
========================================================
HOLT HOMES BAT PRICING UPDATER
========================================================
File: HOLT BAT OCTOBER 2025 9-29-25.xlsm
Time: 2024-10-28 14:30:00
--------------------------------------------------------
📂 Loading BAT file...
✔ File loaded successfully
📋 Reading from: updatetool_MarginUpdates
✔ Found 46 margin updates

📊 Update Summary:
   1. 20 - ENGINEERED LBR → 17.0% [PL10]
   2. 25 - LUMBER → 16.0% [PL09]
   3. 39 - SIDING → 16.0% [PL09]
   ... and 43 more

⚙️ Updating: costsheet_UnconvertedPricing
   Processing 15,273 pricing rows...

✅ Update Results:
   Items updated: 3,692
   Cells modified: 11,076

💾 Saving updated file...
   Output: HOLT BAT OCTOBER 2025 9-29-25_UPDATED_20241028_1430.xlsm

========================================================
UPDATE COMPLETE!
========================================================
Original: HOLT BAT OCTOBER 2025 9-29-25.xlsm
Updated:  HOLT BAT OCTOBER 2025 9-29-25_UPDATED_20241028_1430.xlsm
Items:    3,692 items updated
Cells:    11,076 cells modified
```

## 🔧 Troubleshooting

### "Python not found"
- Install Python from https://python.org
- Check "Add Python to PATH" during installation

### "openpyxl not found"
- Run: `pip install openpyxl`

### "File not found"
- Check file path is correct
- Ensure you have read/write permissions

### Updates not applying
- Verify Pricing Zone matches exactly
- Check Product Category spelling
- Ensure Base Cost exists and > 0
- Confirm margin format (0.17 or 17%)

## 📞 Support

If you encounter issues:
1. Check this README first
2. Verify Excel structure matches requirements
3. Run with direct Python for detailed error messages
4. Save a copy of any error messages

## 🎯 Best Practices

1. **Always backup** your BAT file before major updates
2. **Test first** with a few items before full update
3. **Review the Status column** after updates
4. **Check highlighted cells** (light green) to verify changes
5. **Use specific price levels** when possible for faster processing

---

**Version**: 1.0
**Created for**: Holt Homes
**File**: HOLT BAT OCTOBER 2025
**Last Updated**: September 2025
