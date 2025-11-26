# Spreadsheet Business Logic Extractor

A standalone Python GUI tool for extracting business logic from Excel spreadsheets. Point-and-click interface for analyzing formulas, generating prompts, and documenting spreadsheet logic.

## Features

- **File Analysis**: Parse .xlsx, .xls, .xlsm, and .csv files
- **Formula Extraction**: Find all formulas with dependencies and functions used
- **Function Statistics**: See which Excel functions are used and how often
- **Prompt Library**: 30+ categorized prompts for LLM-assisted extraction
- **Contextual Prompts**: Auto-generated prompts based on your specific spreadsheet
- **Formula Editor**: Find and replace formulas across multiple sheets
- **Formula-to-Code**: Convert Excel formulas to Python and JavaScript code
- **Data Dictionary**: Auto-generate documentation of named ranges, tables, and columns
- **Markdown Export**: Export full analysis as documentation
- **Copy to Clipboard**: One-click copy for prompts

## Installation

```bash
# Navigate to the tool directory
cd tools/spreadsheet-extractor

# Install dependencies
pip install -r requirements.txt

# On Linux, you may also need tkinter:
# sudo apt-get install python3-tk
```

## Usage

### Launch the GUI

```bash
python run.py
```

Or directly:

```bash
python gui.py
```

### Workflow

1. **Open a Spreadsheet**: Click "Open File..." or press Ctrl+O
2. **Review Analysis**: Check the Analysis tab for summary, sheets, functions, and formulas
3. **Select Prompts**: Go to Prompt Library tab, choose a category and prompt
4. **Generate with Context**: Click "Generate with Context" to add spreadsheet info
5. **Copy & Use**: Copy the prompt and paste into your LLM (ChatGPT, Claude, etc.)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+O | Open spreadsheet |
| Ctrl+E | Export analysis as Markdown |
| Ctrl+C | Copy generated prompt |
| Double-click formula | Copy formula to clipboard |

## Prompt Categories

| Category | Description |
|----------|-------------|
| Discovery & Overview | Initial analysis prompts |
| Formula & Calculation | Deep formula analysis |
| Table & Data Structure | Table and relationship mapping |
| Business Rules & Validation | Extract conditional logic |
| Lookup & Reference Data | Conversion charts and rate tables |
| Pricing & Cost Calculations | Cost buildup and labor |
| Construction & Bidding | Bid items, markup, unit prices |
| Code Conversion Preparation | Pseudocode and API design |
| Testing & Validation | Test case generation |
| Location & Regional Factors | Location adjustments and taxes |

## Example Prompts

### Cost Buildup Analysis
```
Document the cost calculation methodology:
1. What are all the cost components?
2. How is each component calculated?
3. What markup/margin is applied and how?
4. What's the formula for final price?
5. Are there minimums, maximums, or rounding rules?
```

### Dynamic Array Analysis
```
For each dynamic array formula (FILTER, SORT, UNIQUE, SEQUENCE, etc.):
1. What data set does it operate on?
2. What filtering/sorting criteria are applied?
3. How does the output size vary based on input?
4. What happens when there are no matching results?
5. Express this as a database query or filter operation.
```

## Formula-to-Code Conversion

The Formula → Code tab converts Excel formulas to both Python and JavaScript:

- **Single Formula**: Enter any formula and click Convert
- **Batch Conversion**: Convert all analyzed formulas at once
- **Python Module Export**: Generate a complete Python module with calculator classes
- **Supported Functions**: 60+ Excel functions including:
  - Math: SUM, AVERAGE, MIN, MAX, ROUND, etc.
  - Logical: IF, AND, OR, IFERROR, IFS
  - Text: LEFT, RIGHT, MID, CONCATENATE, SUBSTITUTE
  - Lookup: VLOOKUP, XLOOKUP, INDEX, MATCH
  - Date: TODAY, NOW, YEAR, MONTH, DAY
  - Array: FILTER, SORT, UNIQUE, SEQUENCE

## Data Dictionary Generation

The Data Dictionary tab auto-documents your spreadsheet structure:

- **Named Ranges**: All defined names with their references and sample values
- **Tables**: Excel tables with headers, row counts, and column details
- **Columns**: Individual table columns with inferred data types
- **Sheets**: Sheet dimensions and formula counts
- **Formula Patterns**: Common function combinations used throughout

Export options:
- **Markdown**: Formatted documentation ready for wikis
- **JSON**: Structured data for programmatic use
- **Clipboard**: Quick copy for pasting anywhere

## Files

| File | Description |
|------|-------------|
| `run.py` | Main launcher script |
| `gui.py` | Tkinter GUI application |
| `analyzer.py` | Spreadsheet parsing and analysis |
| `prompts.py` | Prompt library and generation |
| `requirements.txt` | Python dependencies |

## Troubleshooting

### "No module named 'openpyxl'"
```bash
pip install openpyxl
```

### "No module named 'tkinter'" (Linux)
```bash
sudo apt-get install python3-tk
```

### "Failed to open workbook"
- Ensure the file isn't open in Excel
- Check file isn't corrupted
- For .xls files, install xlrd: `pip install xlrd`

## Integration with LLMs

This tool is designed to work with any LLM:

1. **ChatGPT/GPT-4**: Paste prompts directly
2. **Claude**: Works great with structured prompts
3. **Local LLMs**: Copy prompts to your interface
4. **API Integration**: Use the `analyzer.py` and `prompts.py` modules programmatically

## Programmatic Usage

```python
from analyzer import (
    analyze_spreadsheet,
    FormulaToCodeConverter,
    DataDictionaryGenerator,
    generate_data_dictionary,
    export_data_dictionary_markdown
)
from prompts import generate_contextual_prompts, export_analysis_markdown

# Analyze a file
analysis = analyze_spreadsheet("path/to/file.xlsx")

# Get contextual prompts
prompts = generate_contextual_prompts(analysis)

# Export as markdown
markdown = export_analysis_markdown(analysis)

# Convert formulas to code
converter = FormulaToCodeConverter()
result = converter.convert_formula("=IF(A1>10, SUM(B1:B10), 0)")
print(result.python_code)
print(result.javascript_code)

# Generate data dictionary
data_dict = generate_data_dictionary("path/to/file.xlsx")
print(f"Found {data_dict.summary['total_entries']} entries")

# Export data dictionary as markdown
md = export_data_dictionary_markdown("path/to/file.xlsx")
```

## License

Part of the MindFlow Construction Platform.
