================================================================================
QUICK MARGIN CHANGER - PRICING GENERATOR
================================================================================
Updated for Local Path: C:\Users\corey.boser\Documents\Holt Monthly Pricing\
================================================================================

OVERVIEW
--------
The Quick Margin Changer is a standalone tool that generates pricing data in formats 
compatible with both Holt and Richmond BAT files. Instead of directly updating BAT files,
this tool creates an output file with properly formatted data that you can copy and paste
into your BAT files.

KEY BENEFITS
-----------
✓ Works with multiple BAT formats (Holt & Richmond)
✓ Generates ready-to-paste data
✓ Preserves your original BAT files
✓ Includes lookup table for price verification
✓ Simpler workflow with less risk

================================================================================

STEP 1: SETUP (One-Time Only)
-----------------------------
1. Copy ALL these files to your local folder:
   C:\Users\corey.boser\Documents\Holt Monthly Pricing\

   Files to copy:
   ✓ quick_margin_changer.py       - Main generator script
   ✓ RUN_QUICK_MARGIN_CHANGER.bat  - One-click batch runner
   ✓ RUN_QUICK_MARGIN_CHANGER.ps1  - PowerShell alternative
   ✓ QUICK_MARGIN_CHANGER.xlsm     - Excel input file
   ✓ QUICK_MARGIN_CHANGER_README.txt - This documentation

2. Make sure Python is installed:
   - Run SETUP_PYTHON.bat if you haven't already
   - This will install the required openpyxl library

================================================================================

STEP 2: PREPARE YOUR DATA
-------------------------
1. Open QUICK_MARGIN_CHANGER.xlsm

2. In the "Margin Input" sheet, enter your margin changes:
   - Column A: Pricing Zone
   - Column B: Product Category
   - Column C: Minor Category (optional)
   - Column D: Item ID (optional, use "ALL" or leave blank for all items)
   - Column E: Description (optional)
   - Column F: New Margin % (required)
   - Column G: Notes (optional)
   - Column H: Price Levels (use "ALL" or specific levels like "PL01,PL02")

3. Save the file

================================================================================

STEP 3: GENERATE PRICING DATA
-----------------------------
1. Double-click RUN_QUICK_MARGIN_CHANGER.bat

2. The script will:
   - Read your margin inputs
   - Generate an output file with timestamp
   - Create formatted sheets for Holt and Richmond BATs
   - Include a lookup table for reference

3. Find the output file:
   C:\Users\corey.boser\Documents\Holt Monthly Pricing\PRICING_OUTPUT_[TIMESTAMP].xlsx

================================================================================

STEP 4: APPLY TO YOUR BAT FILES
-------------------------------
FOR HOLT BAT:
1. Open the output file
2. Go to "Holt BAT Format" sheet
3. Select all data rows INCLUDING headers (click first cell, shift+arrow to last row)
4. Copy (Ctrl+C)
5. Open your Holt BAT file
6. Go to "updatetool_MarginUpdates" sheet
7. Paste (Ctrl+V) starting at cell A4 (or where headers begin)
8. Save your Holt BAT file
9. Run the built-in update process in Holt BAT

FOR RICHMOND BAT:
1. Open the output file
2. Go to "Richmond BAT Format" sheet
3. Select all data rows INCLUDING headers
4. Copy (Ctrl+C)
5. Open your Richmond BAT file
6. Go to "MARGINS TO CHANGE" sheet
7. Paste (Ctrl+V) starting at cell A4 (or where headers begin)
8. Save your Richmond BAT file
9. Run the built-in update process in Richmond BAT

================================================================================

USING THE LOOKUP TABLE
---------------------
The output file includes a "Lookup Table" sheet for reference:
- Enter base costs in column F to see calculated sell prices
- This helps verify pricing before updating your BAT files
- The lookup table is for reference only and is not copied to BAT files

================================================================================

ADVANCED USAGE
-------------
CUSTOMIZING THE SCRIPT:
- Edit quick_margin_changer.py to modify column mappings if needed
- Adjust formatting and output options to match your preferences

COMMAND LINE USAGE:
- Open Command Prompt in your folder and run:
  python quick_margin_changer.py "QUICK_MARGIN_CHANGER.xlsm"

================================================================================

TROUBLESHOOTING
--------------
"Python not found":
→ Run SETUP_PYTHON.bat

"File not found":
→ Check if QUICK_MARGIN_CHANGER.xlsm exists in:
  C:\Users\corey.boser\Documents\Holt Monthly Pricing\

"No margin updates found":
→ Check that you've entered values in the Margin Input sheet
→ Make sure the required columns have data

"Copy-paste not working properly":
→ Make sure to include the header row when copying
→ Paste to the correct starting row in your BAT file
→ Check that column headers match in your BAT file

================================================================================

READY TO USE!
------------
1. Enter margin changes in QUICK_MARGIN_CHANGER.xlsm
2. Run RUN_QUICK_MARGIN_CHANGER.bat
3. Copy-paste from output file to your BAT files
4. Run the normal update process in your BAT files

================================================================================
Version: 1.0 | Updated: September 2025 | For: Holt & Richmond BAT Files
================================================================================
