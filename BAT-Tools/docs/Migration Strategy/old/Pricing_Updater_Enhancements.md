# PRICING UPDATER ENHANCEMENTS - CODE SNIPPETS
**For: holt_updater.py (and future richmond_updater.py)**

---

## 🎯 ENHANCEMENT 1: PRICE CHANGE LOG

### Add to Class __init__ (after line 47):
```python
        self.change_log = []  # Track all changes for logging
```

### Add New Method (after apply_updates method):
```python
    def create_change_log_sheet(self):
        """Create or get price change log sheet"""
        sheet_name = 'price_change_log'
        
        if sheet_name not in self.wb.sheetnames:
            ws = self.wb.create_sheet(sheet_name)
            
            # Add headers with formatting
            headers = [
                'Timestamp', 'User', 'Pricing Zone', 'Product Category',
                'Minor Category', 'Item ID', 'New Margin %', 'Price Levels',
                'Items Updated', 'Cells Modified', 'Status'
            ]
            
            for col, header in enumerate(headers, 1):
                cell = ws.cell(row=1, column=col, value=header)
                cell.font = Font(bold=True)
                cell.fill = PatternFill(start_color='4472C4', 
                                       end_color='4472C4', 
                                       fill_type='solid')
                cell.font = Font(bold=True, color='FFFFFF')
            
            # Set column widths
            widths = [20, 15, 15, 30, 30, 15, 12, 20, 12, 12, 15]
            for col, width in enumerate(widths, 1):
                ws.column_dimensions[get_column_letter(col)].width = width
        else:
            ws = self.wb[sheet_name]
        
        return ws
    
    def log_change(self, update, items_updated, cells_modified):
        """Log a price change to the change log sheet"""
        import getpass
        
        log_ws = self.create_change_log_sheet()
        next_row = log_ws.max_row + 1
        
        # Add the log entry
        log_ws.cell(row=next_row, column=1, value=datetime.now())
        log_ws.cell(row=next_row, column=2, value=getpass.getuser())
        log_ws.cell(row=next_row, column=3, value=update['zone'])
        log_ws.cell(row=next_row, column=4, value=update['category'])
        log_ws.cell(row=next_row, column=5, value=update['minor_category'])
        log_ws.cell(row=next_row, column=6, value=update['item_id'])
        log_ws.cell(row=next_row, column=7, value=update['margin'])
        log_ws.cell(row=next_row, column=7).number_format = '0.0%'
        log_ws.cell(row=next_row, column=8, value=','.join(update['price_levels']))
        log_ws.cell(row=next_row, column=9, value=items_updated)
        log_ws.cell(row=next_row, column=10, value=cells_modified)
        log_ws.cell(row=next_row, column=11, value='Applied')
```

### Modify apply_updates (add logging call around line 299):
```python
            # Existing code...
            self.items_updated += matches
            
            # NEW: Log this change
            cells_for_this_update = matches * len(update['price_levels']) * 3
            self.log_change(update, matches, cells_for_this_update)
            
            # Update status in margin sheet (existing code continues...)
```

### Add Required Import (at top of file):
```python
from openpyxl.styles import Font  # Add Font to existing imports
```

---

## 🎯 ENHANCEMENT 2: PREVIEW MODE

### Add New Method (after row_matches method):
```python
    def count_matches(self, sheet, update):
        """Count how many rows would match this update"""
        matches = 0
        for row in range(2, sheet.max_row + 1):
            if self.row_matches(sheet, row, update):
                base_cost = sheet.cell(row=row, column=self.pricing_cols['base_cost']).value
                if base_cost and isinstance(base_cost, (int, float)) and base_cost > 0:
                    matches += 1
        return matches
    
    def preview_updates(self, updates):
        """Preview what would be updated without applying changes"""
        print("\n" + "="*70)
        print("🔍 PREVIEW MODE - No changes will be applied")
        print("="*70)
        
        # Find pricing sheet
        sheet_name = None
        possible_names = ['costsheet_UnconvertedPricing', 'Unconverted', 
                         'UnconvertedPricing', 'Pricing']
        
        for name in possible_names:
            if name in self.wb.sheetnames:
                sheet_name = name
                break
        
        if not sheet_name:
            print(f"❌ Pricing sheet not found")
            return False
        
        sheet = self.wb[sheet_name]
        print(f"\nAnalyzing: {sheet_name}")
        print(f"Total rows to check: {sheet.max_row - 1:,}\n")
        
        total_items = 0
        total_cells = 0
        
        for idx, update in enumerate(updates, 1):
            matches = self.count_matches(sheet, update)
            cells = matches * len(update['price_levels']) * 3
            
            total_items += matches
            total_cells += cells
            
            print(f"\n{idx}. {update['category']}")
            print(f"   Zone: {update['zone']}")
            if update['minor_category']:
                print(f"   Minor Category: {update['minor_category']}")
            if update['item_id'] != 'ALL':
                print(f"   Item ID: {update['item_id']}")
            print(f"   New Margin: {update['margin']:.1%}")
            print(f"   Price Levels: {', '.join(update['price_levels'])}")
            print(f"   → Would update: {matches} items ({cells} cells)")
        
        print("\n" + "="*70)
        print("PREVIEW SUMMARY")
        print("="*70)
        print(f"Total items that would be updated: {total_items:,}")
        print(f"Total cells that would be modified: {total_cells:,}")
        print("\nRun without --preview to apply these changes")
        print("="*70)
        
        return True
```

### Modify run_update Method (around line 49):
```python
    def run_update(self, preview_mode=False):
        """Main update process"""
        print("\n" + "="*70)
        if preview_mode:
            print("HOLT HOMES BAT PRICING UPDATER - PREVIEW MODE")
        else:
            print("HOLT HOMES BAT PRICING UPDATER")
        print("="*70)
        print(f"File: {os.path.basename(self.file_path)}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-"*70)
        
        # Load file
        if not self.load_file():
            return False
        
        # Get updates
        updates = self.get_margin_updates()
        if not updates:
            print("⚠️ No margin updates found")
            return False
        
        # Preview or apply
        if preview_mode:
            return self.preview_updates(updates)
        else:
            # Apply updates
            if not self.apply_updates(updates):
                return False
            
            # Save file
            return self.save_file()
```

### Modify main Function (around line 366):
```python
def main():
    # Default Holt Homes file path
    default_path = r"C:\Users\corey.boser\Documents\Holt Monthly Pricing\HOLT BAT OCTOBER 2025 9-29-25.xlsm"
    
    # Parse arguments
    preview_mode = '--preview' in sys.argv or '-p' in sys.argv
    
    if len(sys.argv) > 1:
        # Get file path (skip flags)
        file_path = None
        for arg in sys.argv[1:]:
            if not arg.startswith('-'):
                file_path = arg
                break
        if not file_path:
            file_path = default_path
    else:
        file_path = default_path
        
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        print("\nUsage:")
        print("  python holt_updater.py 'path\\to\\file.xlsm'")
        print("  python holt_updater.py 'path\\to\\file.xlsm' --preview")
        sys.exit(1)
    
    # Run updater
    updater = HoltHomesUpdater(file_path)
    success = updater.run_update(preview_mode=preview_mode)
    
    sys.exit(0 if success else 1)
```

---

## 🎯 ENHANCEMENT 3: RICHMOND VERSION

### Create New File: richmond_updater.py

Copy your holt_updater.py and make these changes:

```python
#!/usr/bin/env python3
"""
RICHMOND AMERICAN HOMES BAT PRICING UPDATER
Updates pricing from margin updates sheet to Item Pricing
"""

class RichmondHomesUpdater:
    def __init__(self, file_path):
        """Initialize with Richmond BAT file"""
        self.file_path = file_path
        self.wb = None
        self.updates_applied = 0
        self.items_updated = 0
        
        # Column mappings for Richmond BAT
        # TODO: Adjust these based on actual Richmond structure
        self.pricing_cols = {
            'item_number': 1,    # A: RAH Item Number
            'description': 2,     # B: Description
            'category': 3,        # C: Category (if exists)
            'base_cost': 4        # D: Base Cost (adjust column)
        }
        
        # Richmond uses L1-L5 instead of PL01-PL12
        self.price_level_cols = {
            'L1': {'margin': 5, 'sell': 6},   # Adjust column numbers
            'L2': {'margin': 7, 'sell': 8},
            'L3': {'margin': 9, 'sell': 10},
            'L4': {'margin': 11, 'sell': 12},
            'L5': {'margin': 13, 'sell': 14}
        }
    
    # ... rest of methods similar to Holt version ...
    
    def get_margin_updates(self):
        """Read margin updates - adapted for Richmond structure"""
        # Check for the sheet
        sheet_name = None
        possible_names = ['updatetool_MarginUpdates', 'MARGINS TO CHANGE', 
                         'Richmond_Margin_Updates']
        
        # ... similar to Holt version but adjusted for Richmond columns ...
    
    def apply_updates(self, updates):
        """Apply updates to Item Pricing or similar sheet"""
        # Find pricing sheet (Richmond may have different name)
        sheet_name = None
        possible_names = ['Item Pricing', 'ItemPricing', 'Pricing', 
                         'schedule_PriceSchedule']
        
        # ... rest similar to Holt version ...


def main():
    # Default Richmond file path
    default_path = r"C:\Users\corey.boser\Documents\Richmond Monthly Pricing\RICHMOND_BAT_NOVEMBER_2025.xlsm"
    
    # ... rest same as Holt version ...
```

### Create Batch File: RUN_RICHMOND_UPDATE.bat

```batch
@echo off
REM ========================================================
REM RICHMOND AMERICAN HOMES BAT PRICING UPDATER
REM ========================================================

echo.
echo ========================================================
echo      RICHMOND AMERICAN HOMES BAT PRICING UPDATER
echo ========================================================
echo.

set "BAT_FILE=C:\Users\corey.boser\Documents\Richmond Monthly Pricing\RICHMOND_BAT_NOVEMBER_2025.xlsm"

if not exist "%BAT_FILE%" (
    echo ERROR: BAT file not found!
    echo Looking for: %BAT_FILE%
    pause
    exit /b 1
)

echo File found: RICHMOND_BAT_NOVEMBER_2025.xlsm
echo.
echo Starting update process...
echo --------------------------------------------------------

python richmond_updater.py "%BAT_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo                  UPDATE SUCCESSFUL!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo                    UPDATE FAILED
    echo ========================================================
)

echo.
pause
```

---

## 🎯 ENHANCEMENT 4: UNDO FUNCTIONALITY (Optional)

### Add to Class __init__:
```python
        self.undo_data = []  # Store data for undo
```

### Add New Methods:
```python
    def store_undo_data(self, sheet, row, update):
        """Store original values before updating"""
        undo_entry = {
            'row': row,
            'zone': str(sheet.cell(row=row, column=1).value),
            'category': str(sheet.cell(row=row, column=2).value),
            'values': {}
        }
        
        # Store original margin and sell price for each price level
        for pl in update['price_levels']:
            cols = self.price_level_cols[pl]
            undo_entry['values'][pl] = {
                'margin': sheet.cell(row=row, column=cols['margin']).value,
                'sell': sheet.cell(row=row, column=cols['sell']).value
            }
        
        self.undo_data.append(undo_entry)
    
    def create_undo_file(self):
        """Save undo data to a separate file"""
        if not self.undo_data:
            return
        
        import json
        base_name = os.path.splitext(self.file_path)[0]
        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
        undo_file = f"{base_name}_UNDO_{timestamp}.json"
        
        with open(undo_file, 'w') as f:
            json.dump(self.undo_data, f, indent=2)
        
        print(f"\n💾 Undo data saved: {os.path.basename(undo_file)}")
    
    def apply_undo(self, undo_file):
        """Restore values from undo file"""
        import json
        
        with open(undo_file, 'r') as f:
            undo_data = json.load(f)
        
        sheet_name = 'costsheet_UnconvertedPricing'  # Or find it
        sheet = self.wb[sheet_name]
        
        for entry in undo_data:
            row = entry['row']
            for pl, values in entry['values'].items():
                cols = self.price_level_cols[pl]
                sheet.cell(row=row, column=cols['margin']).value = values['margin']
                sheet.cell(row=row, column=cols['sell']).value = values['sell']
        
        print(f"✔ Restored {len(undo_data)} items")
```

### Modify apply_updates (add undo storage):
```python
            for row in range(2, sheet.max_row + 1):
                if self.row_matches(sheet, row, update):
                    base_cost = sheet.cell(row=row, column=self.pricing_cols['base_cost']).value
                    
                    if base_cost and isinstance(base_cost, (int, float)) and base_cost > 0:
                        # NEW: Store undo data before updating
                        self.store_undo_data(sheet, row, update)
                        
                        # Update price levels (existing code)...
```

---

## 🎯 ENHANCEMENT 5: BATCH PROCESSING

### Add New Method:
```python
    def process_multiple_files(self, file_list):
        """Process multiple BAT files in sequence"""
        results = []
        
        for file_path in file_list:
            print(f"\n{'='*70}")
            print(f"Processing: {os.path.basename(file_path)}")
            print(f"{'='*70}")
            
            self.file_path = file_path
            self.updates_applied = 0
            self.items_updated = 0
            
            success = self.run_update()
            results.append({
                'file': os.path.basename(file_path),
                'success': success,
                'items': self.items_updated,
                'cells': self.updates_applied
            })
        
        # Summary
        print(f"\n{'='*70}")
        print("BATCH PROCESSING SUMMARY")
        print(f"{'='*70}")
        for result in results:
            status = "✔ SUCCESS" if result['success'] else "✖ FAILED"
            print(f"{status} - {result['file']}")
            if result['success']:
                print(f"  → {result['items']} items, {result['cells']} cells")
        
        return results
```

### Usage:
```python
# In main() or separate script
files = [
    "HOLT_BAT_NOVEMBER_2025.xlsm",
    "RICHMOND_BAT_NOVEMBER_2025.xlsm"
]

updater = HoltHomesUpdater(files[0])  # Start with any file
results = updater.process_multiple_files(files)
```

---

## 📋 TESTING CHECKLIST

After adding enhancements, test each one:

### Price Change Log:
- [ ] Sheet created on first run
- [ ] Headers formatted correctly
- [ ] Each update logged with timestamp
- [ ] User name captured
- [ ] All fields populated
- [ ] Can query log for history

### Preview Mode:
- [ ] Shows what would change
- [ ] Doesn't modify file
- [ ] Counts match actual updates
- [ ] Clear summary displayed
- [ ] Easy to run preview then apply

### Richmond Version:
- [ ] Column mappings correct
- [ ] Finds correct sheets
- [ ] Updates prices correctly
- [ ] Preserves formulas
- [ ] Batch file works

### Undo Functionality:
- [ ] Undo data saved before changes
- [ ] Can restore from undo file
- [ ] All values restored correctly
- [ ] Undo file named clearly

---

## 🚀 DEPLOYMENT STEPS

1. **Backup Current Version**
   ```bash
   copy holt_updater.py holt_updater_backup_20251107.py
   ```

2. **Add Enhancements One at a Time**
   - Add price change log → Test
   - Add preview mode → Test
   - Create Richmond version → Test
   - Add undo (optional) → Test

3. **Update Documentation**
   - Update README with new features
   - Add examples for each feature
   - Update Quick Reference guide

4. **Test on Copies First**
   - Always test on backup copies
   - Verify all features work
   - Check edge cases

5. **Deploy to Production**
   - Replace old scripts
   - Update batch files
   - Notify team of new features

---

## 💡 USAGE EXAMPLES

### Example 1: Preview Before Applying
```bash
# Preview what would change
python holt_updater.py "HOLT_BAT_NOVEMBER_2025.xlsm" --preview

# Review the output, then apply
python holt_updater.py "HOLT_BAT_NOVEMBER_2025.xlsm"
```

### Example 2: Check Change Log
```python
# After running update, open the file
# Go to 'price_change_log' sheet
# Filter by date, user, or category
# Export to CSV for analysis if needed
```

### Example 3: Using Richmond Version
```bash
# Same command, different script
python richmond_updater.py "RICHMOND_BAT_NOVEMBER_2025.xlsm" --preview
python richmond_updater.py "RICHMOND_BAT_NOVEMBER_2025.xlsm"
```

### Example 4: Batch Processing
```python
# Create batch_update.py
from holt_updater import HoltHomesUpdater
from richmond_updater import RichmondHomesUpdater

# Update Holt
holt = HoltHomesUpdater("path/to/holt_bat.xlsm")
holt.run_update()

# Update Richmond
richmond = RichmondHomesUpdater("path/to/richmond_bat.xlsm")
richmond.run_update()
```

---

## 🎯 NEXT STEPS

**This Week:**
1. Test current tool on November BATs
2. Verify it works with new files

**Week 2, Day 2:**
1. Add price change log code
2. Test logging functionality

**Week 2, Day 3:**
1. Add preview mode code
2. Test preview functionality

**Week 2, Day 4:**
1. Map Richmond structure
2. Create richmond_updater.py
3. Test on Richmond BAT

**Week 2, Day 5:**
1. Update all documentation
2. Final testing
3. ✅ Enhancement complete!

---

**You already have an excellent tool. These enhancements will make it even better!** 🚀