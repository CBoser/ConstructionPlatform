# QUICK_MARGIN_CHANGER.xlsm Structure

This file describes the structure that should be implemented in the QUICK_MARGIN_CHANGER.xlsm file.
Since we can't directly create or modify Excel files here, use this as a guide to set up your file.

## Sheets Required

1. Margin Input
2. Help & Instructions
3. About

## Margin Input Sheet Structure

### Row 1-3: Title and Instructions
- A1 (merged across columns): "QUICK MARGIN CHANGER - Pricing Generator"
- A2 (merged): "Enter margin changes below. Run the RUN_QUICK_MARGIN_CHANGER.bat file to generate output."
- A3 (merged): "All fields with * are required."

### Row 4: Column Headers
- A4: "Pricing Zone *" 
- B4: "Product Category *"
- C4: "Minor Category"
- D4: "Item ID"
- E4: "Description"
- F4: "New Margin % *"
- G4: "Notes"
- H4: "Price Levels"
- I4: "Status"

### Row 5 and below: Data Entry
- Starting from row 5, users enter their margin changes
- Example data:
  - A5: "FG" (Pricing Zone)
  - B5: "LUMBER" (Category) 
  - C5: "DIMENSIONAL" (Minor Category)
  - D5: "" (blank for ALL items)
  - E5: "All Dimensional Lumber" (Description)
  - F5: "30%" (New Margin)
  - G5: "Monthly update" (Notes)
  - H5: "ALL" (Price Levels)
  - I5: "" (Status - filled by script)

## Help & Instructions Sheet

Include detailed instructions on how to use the tool:

1. How to enter margin changes
2. How to run the tool
3. How to apply the output to BAT files
4. Example use cases
5. Troubleshooting tips

## About Sheet

Include information about:

1. Tool version and creation date
2. Author contact information
3. Purpose of the tool
4. Compatibility information
5. Change log for future updates

## VBA Macros (Optional)

If desired, you can include these basic macros:

1. A button to clear all entries
2. A button to run the Python script directly (requires Shell command setup)
3. Basic data validation for required fields

## Recommended Excel Features

1. Data validation for Pricing Zone and Product Category (dropdown lists)
2. Conditional formatting to highlight required fields
3. Cell protection for non-editable cells
4. Custom number formatting for the margin column

## File Location

The file should be saved at:
C:\Users\corey.boser\Documents\Holt Monthly Pricing\QUICK_MARGIN_CHANGER.xlsm
