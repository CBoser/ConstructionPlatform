# HOLT HOMES BAT - QUICK REFERENCE

## 📁 Your BAT File
```
C:\Users\corey.boser\Documents\Holt Monthly Pricing\
HOLT BAT OCTOBER 2025 9-29-25.xlsm
```

---

## 🚀 THREE WAYS TO UPDATE

### 1️⃣ UPDATE FROM EXCEL (Margin updates already in BAT)
```
Double-click: RUN_HOLT_UPDATE.bat
```
✅ Reads from `updatetool_MarginUpdates` sheet  
✅ Updates `costsheet_UnconvertedPricing`  
✅ Creates timestamped backup  

### 2️⃣ IMPORT FROM CSV THEN UPDATE
```
Double-click: IMPORT_CSV_TO_BAT.bat
```
✅ Imports `Price_Update.csv`  
✅ Creates margin updates table  
✅ Applies all updates  
✅ Two files created with timestamps  

### 3️⃣ COMMAND LINE (Most control)
```python
# Update from Excel
python holt_updater.py "C:\Users\corey.boser\Documents\Holt Monthly Pricing\HOLT BAT OCTOBER 2025 9-29-25.xlsm"

# Import CSV then update
python holt_csv_importer.py Price_Update.csv "C:\Users\corey.boser\Documents\Holt Monthly Pricing\HOLT BAT OCTOBER 2025 9-29-25.xlsm"

# Simple universal updater
python simple_updater.py "C:\Users\corey.boser\Documents\Holt Monthly Pricing\HOLT BAT OCTOBER 2025 9-29-25.xlsm"
```

---

## 📊 PRICE LEVEL OPTIONS

| Entry | Updates | Use Case |
|-------|---------|----------|
| `PL10` | Only PL10 | Single level |
| `PL09` | Only PL09 | Custom quotes |
| `PL01,PL05,PL09` | Three levels | Multiple specific |
| `PL01-PL05` | PL01 thru PL05 | Range |
| `ALL` or blank | All 12 levels | Everything |

---

## 📋 FILES PROVIDED

| File | Purpose |
|------|---------|
| **holt_updater.py** | Main updater for your BAT |
| **holt_csv_importer.py** | CSV import + update |
| **simple_updater.py** | Universal simple version |
| **RUN_HOLT_UPDATE.bat** | One-click Excel update |
| **IMPORT_CSV_TO_BAT.bat** | One-click CSV import |
| **RUN_HOLT_UPDATE.ps1** | PowerShell alternative |

---

## ✨ KEY FEATURES

- ✅ **Preserves .xlsm macros** - Your VBA code stays intact
- ✅ **Selective updates** - Only specified price levels
- ✅ **15,000+ rows** - Handles large datasets
- ✅ **Light green highlighting** - Visual confirmation
- ✅ **Timestamped backups** - Never lose original
- ✅ **Status tracking** - See what was updated

---

## 📝 OUTPUT FILES

Original:
```
HOLT BAT OCTOBER 2025 9-29-25.xlsm
```

After update:
```
HOLT BAT OCTOBER 2025 9-29-25_UPDATED_20241028_1430.xlsm
```

With CSV import:
```
HOLT BAT OCTOBER 2025 9-29-25_WITH_CSV_20241028_1430.xlsm
HOLT BAT OCTOBER 2025 9-29-25_UPDATED_20241028_1431.xlsm
```

---

## 🔧 ONE-TIME SETUP

1. **Copy scripts** to your Holt Monthly Pricing folder
2. **Install Python** if needed (python.org)
3. **Install openpyxl**: `pip install openpyxl`

---

## 📞 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Python not found | Install from python.org |
| openpyxl error | Run: `pip install openpyxl` |
| File not found | Check file path is correct |
| No updates | Verify zone/category match exactly |

---

**That's it! Double-click a .bat file and watch it work!** 🎯
