"""
Spreadsheet Analyzer Module
Extracts formulas, structure, and metadata from Excel files.
"""

import re
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set
from pathlib import Path

try:
    import openpyxl
    from openpyxl.utils import get_column_letter, column_index_from_string
except ImportError:
    openpyxl = None

try:
    import xlrd
except ImportError:
    xlrd = None


@dataclass
class CellInfo:
    address: str
    value: Any
    formula: Optional[str] = None
    data_type: str = "unknown"
    number_format: Optional[str] = None


@dataclass
class FormulaInfo:
    address: str
    sheet: str
    formula: str
    result: Any = None
    dependencies: List[str] = field(default_factory=list)
    functions: List[str] = field(default_factory=list)
    is_array_formula: bool = False


@dataclass
class SheetInfo:
    name: str
    used_range: str
    row_count: int
    column_count: int
    formula_count: int
    cell_count: int
    has_tables: bool = False


@dataclass
class NamedRangeInfo:
    name: str
    scope: str  # 'workbook' or sheet name
    refers_to: str
    is_formula: bool = False


@dataclass
class TableInfo:
    name: str
    sheet: str
    range: str
    headers: List[str] = field(default_factory=list)
    row_count: int = 0
    has_calculated_columns: bool = False


@dataclass
class AnalysisResult:
    file_name: str
    file_size: int
    sheets: List[SheetInfo] = field(default_factory=list)
    formulas: List[FormulaInfo] = field(default_factory=list)
    named_ranges: List[NamedRangeInfo] = field(default_factory=list)
    tables: List[TableInfo] = field(default_factory=list)
    function_stats: Dict[str, int] = field(default_factory=dict)
    complexity: str = "simple"
    errors: List[str] = field(default_factory=list)


# Excel functions that indicate dynamic arrays
ARRAY_FUNCTIONS = {
    'FILTER', 'SORT', 'SORTBY', 'UNIQUE', 'SEQUENCE', 'RANDARRAY',
    'XLOOKUP', 'XMATCH', 'LET', 'LAMBDA', 'MAP', 'REDUCE', 'SCAN',
    'MAKEARRAY', 'BYROW', 'BYCOL', 'CHOOSECOLS', 'CHOOSEROWS',
    'DROP', 'TAKE', 'EXPAND', 'WRAPCOLS', 'WRAPROWS', 'TOCOL', 'TOROW',
    'TEXTSPLIT', 'TEXTBEFORE', 'TEXTAFTER', 'VSTACK', 'HSTACK'
}


def extract_functions(formula: str) -> List[str]:
    """Extract Excel function names from a formula."""
    pattern = r'([A-Z_][A-Z0-9_]*)\s*\('
    matches = re.findall(pattern, formula.upper())
    return list(set(matches))


def extract_cell_references(formula: str) -> List[str]:
    """Extract cell references from a formula."""
    # Match cell refs like A1, $A$1, Sheet1!A1, 'Sheet Name'!A1
    pattern = r"(?:'[^']+!'?|[A-Za-z0-9_]+!)?\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?"
    matches = re.findall(pattern, formula.upper())
    return list(set(matches))


def is_array_formula(formula: str) -> bool:
    """Check if formula uses dynamic array functions."""
    upper_formula = formula.upper()
    return any(f'{func}(' in upper_formula for func in ARRAY_FUNCTIONS)


def calculate_complexity(result: AnalysisResult) -> str:
    """Calculate overall complexity score."""
    score = 0

    # Sheet count
    score += len(result.sheets) * 2

    # Formula count
    formula_count = len(result.formulas)
    if formula_count > 100:
        score += 30
    elif formula_count > 50:
        score += 20
    elif formula_count > 20:
        score += 10
    else:
        score += formula_count * 0.5

    # Unique functions
    score += len(result.function_stats) * 2

    # Array formulas
    array_count = sum(1 for f in result.formulas if f.is_array_formula)
    score += array_count * 5

    # Named ranges
    score += len(result.named_ranges) * 2

    # Tables
    score += len(result.tables) * 3

    if score > 100:
        return "very-complex"
    elif score > 50:
        return "complex"
    elif score > 20:
        return "moderate"
    return "simple"


class SpreadsheetAnalyzer:
    """Analyzes Excel spreadsheets to extract business logic."""

    def __init__(self):
        self.workbook = None
        self.file_path: Optional[Path] = None

    def analyze(self, file_path: str) -> AnalysisResult:
        """Analyze an Excel file and return structured results."""
        self.file_path = Path(file_path)

        if not self.file_path.exists():
            return AnalysisResult(
                file_name=self.file_path.name,
                file_size=0,
                errors=[f"File not found: {file_path}"]
            )

        file_size = self.file_path.stat().st_size
        suffix = self.file_path.suffix.lower()

        result = AnalysisResult(
            file_name=self.file_path.name,
            file_size=file_size
        )

        try:
            if suffix in ['.xlsx', '.xlsm', '.xlsb']:
                self._analyze_xlsx(result)
            elif suffix == '.xls':
                self._analyze_xls(result)
            elif suffix == '.csv':
                self._analyze_csv(result)
            else:
                result.errors.append(f"Unsupported file format: {suffix}")
        except Exception as e:
            result.errors.append(f"Error analyzing file: {str(e)}")

        # Calculate complexity
        result.complexity = calculate_complexity(result)

        return result

    def _analyze_xlsx(self, result: AnalysisResult):
        """Analyze .xlsx/.xlsm files using openpyxl."""
        if openpyxl is None:
            result.errors.append("openpyxl not installed. Run: pip install openpyxl")
            return

        try:
            wb = openpyxl.load_workbook(
                self.file_path,
                data_only=False,  # Get formulas, not just values
                read_only=False
            )
        except Exception as e:
            result.errors.append(f"Failed to open workbook: {str(e)}")
            return

        # Analyze each sheet
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]

            formula_count = 0
            cell_count = 0

            # Get dimensions
            if ws.dimensions:
                try:
                    min_col, min_row, max_col, max_row = openpyxl.utils.range_boundaries(ws.dimensions)
                    row_count = max_row - min_row + 1
                    col_count = max_col - min_col + 1
                except:
                    row_count = ws.max_row or 0
                    col_count = ws.max_column or 0
            else:
                row_count = ws.max_row or 0
                col_count = ws.max_column or 0

            # Scan cells for formulas
            for row in ws.iter_rows():
                for cell in row:
                    if cell.value is not None:
                        cell_count += 1

                    # Check for formula
                    if cell.data_type == 'f' or (isinstance(cell.value, str) and cell.value.startswith('=')):
                        formula_str = cell.value if isinstance(cell.value, str) else str(cell.value)
                        if formula_str.startswith('='):
                            formula_str = formula_str[1:]  # Remove leading =

                        formula_count += 1

                        # Extract formula info
                        functions = extract_functions(formula_str)
                        dependencies = extract_cell_references(formula_str)

                        formula_info = FormulaInfo(
                            address=cell.coordinate,
                            sheet=sheet_name,
                            formula=formula_str,
                            result=None,  # Would need data_only=True for this
                            dependencies=dependencies,
                            functions=functions,
                            is_array_formula=is_array_formula(formula_str)
                        )
                        result.formulas.append(formula_info)

                        # Update function stats
                        for func in functions:
                            result.function_stats[func] = result.function_stats.get(func, 0) + 1

            sheet_info = SheetInfo(
                name=sheet_name,
                used_range=ws.dimensions or "A1",
                row_count=row_count,
                column_count=col_count,
                formula_count=formula_count,
                cell_count=cell_count,
                has_tables=len(ws.tables) > 0 if hasattr(ws, 'tables') else False
            )
            result.sheets.append(sheet_info)

            # Extract tables
            if hasattr(ws, 'tables'):
                for table_name, table in ws.tables.items():
                    table_info = TableInfo(
                        name=table_name,
                        sheet=sheet_name,
                        range=table.ref,
                        row_count=0  # Would need to parse range
                    )
                    result.tables.append(table_info)

        # Extract named ranges
        if wb.defined_names:
            for name in wb.defined_names.definedName:
                named_range = NamedRangeInfo(
                    name=name.name,
                    scope='workbook' if name.localSheetId is None else wb.sheetnames[name.localSheetId],
                    refers_to=name.attr_text,
                    is_formula='(' in name.attr_text if name.attr_text else False
                )
                result.named_ranges.append(named_range)

        wb.close()

    def _analyze_xls(self, result: AnalysisResult):
        """Analyze .xls files using xlrd."""
        if xlrd is None:
            result.errors.append("xlrd not installed. Run: pip install xlrd")
            return

        try:
            wb = xlrd.open_workbook(self.file_path, formatting_info=False)
        except Exception as e:
            result.errors.append(f"Failed to open workbook: {str(e)}")
            return

        for sheet_idx in range(wb.nsheets):
            ws = wb.sheet_by_index(sheet_idx)

            sheet_info = SheetInfo(
                name=ws.name,
                used_range=f"A1:{get_column_letter(ws.ncols)}{ws.nrows}",
                row_count=ws.nrows,
                column_count=ws.ncols,
                formula_count=0,  # xlrd doesn't easily expose formulas
                cell_count=ws.nrows * ws.ncols
            )
            result.sheets.append(sheet_info)

        # Note: xlrd has limited formula support
        result.errors.append("Note: .xls format has limited formula extraction. Consider converting to .xlsx")

    def _analyze_csv(self, result: AnalysisResult):
        """Analyze CSV files."""
        import csv

        try:
            with open(self.file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.reader(f)
                rows = list(reader)
        except Exception as e:
            result.errors.append(f"Failed to read CSV: {str(e)}")
            return

        row_count = len(rows)
        col_count = max(len(row) for row in rows) if rows else 0

        sheet_info = SheetInfo(
            name="Sheet1",
            used_range=f"A1:{get_column_letter(col_count) if col_count else 'A'}{row_count}",
            row_count=row_count,
            column_count=col_count,
            formula_count=0,
            cell_count=sum(len(row) for row in rows)
        )
        result.sheets.append(sheet_info)

        result.errors.append("Note: CSV files do not contain formulas")


def get_column_letter(col_idx: int) -> str:
    """Convert column index to letter (1=A, 2=B, etc.)."""
    result = ""
    while col_idx > 0:
        col_idx, remainder = divmod(col_idx - 1, 26)
        result = chr(65 + remainder) + result
    return result or "A"


# Convenience function
def analyze_spreadsheet(file_path: str) -> AnalysisResult:
    """Analyze a spreadsheet and return results."""
    analyzer = SpreadsheetAnalyzer()
    return analyzer.analyze(file_path)
