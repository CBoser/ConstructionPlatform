import ExcelJS from 'exceljs';

// ============ TYPE DEFINITIONS ============

export interface CellInfo {
  address: string;
  value: unknown;
  formula?: string;
  type: 'number' | 'string' | 'boolean' | 'date' | 'formula' | 'error' | 'empty';
  numberFormat?: string;
}

export interface FormulaInfo {
  address: string;
  formula: string;
  result: unknown;
  dependencies: string[];
  functions: string[];
  isArrayFormula: boolean;
  explanation?: string;
}

export interface TableInfo {
  name: string;
  sheet: string;
  range: string;
  headers: string[];
  rowCount: number;
  hasCalculatedColumns: boolean;
  calculatedColumns: { header: string; formula: string }[];
}

export interface NamedRangeInfo {
  name: string;
  scope: 'workbook' | 'sheet';
  refersTo: string;
  value?: unknown;
  isFormula: boolean;
}

export interface SheetInfo {
  name: string;
  usedRange: string;
  rowCount: number;
  columnCount: number;
  hasFormulas: boolean;
  hasTables: boolean;
  formulaCount: number;
  cellCount: number;
}

export interface DataValidationInfo {
  range: string;
  type: string;
  formula1?: string;
  formula2?: string;
  allowedValues?: string[];
  errorMessage?: string;
}

export interface ConditionalFormatInfo {
  range: string;
  type: string;
  formula?: string;
  priority: number;
}

export interface SpreadsheetAnalysis {
  fileName: string;
  fileSize: number;
  sheets: SheetInfo[];
  formulas: FormulaInfo[];
  tables: TableInfo[];
  namedRanges: NamedRangeInfo[];
  dataValidations: DataValidationInfo[];
  conditionalFormats: ConditionalFormatInfo[];
  excelFunctions: { name: string; count: number; locations: string[] }[];
  summary: {
    totalSheets: number;
    totalFormulas: number;
    totalTables: number;
    totalNamedRanges: number;
    uniqueFunctions: string[];
    complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  };
}

// ============ HELPER FUNCTIONS ============

/**
 * Extract Excel functions from a formula
 */
function extractFunctions(formula: string): string[] {
  const functionPattern = /([A-Z_][A-Z0-9_]*)\s*\(/gi;
  const matches = formula.matchAll(functionPattern);
  const functions: string[] = [];

  for (const match of matches) {
    const funcName = match[1].toUpperCase();
    if (!functions.includes(funcName)) {
      functions.push(funcName);
    }
  }

  return functions;
}

/**
 * Extract cell references from a formula
 */
function extractCellReferences(formula: string): string[] {
  // Match cell references like A1, $A$1, Sheet1!A1, etc.
  const cellPattern = /(?:'[^']+!'|[A-Za-z0-9_]+!)?(\$?[A-Z]+\$?\d+)(?::(\$?[A-Z]+\$?\d+))?/g;
  const matches = formula.matchAll(cellPattern);
  const refs: string[] = [];

  for (const match of matches) {
    refs.push(match[0]);
  }

  return [...new Set(refs)];
}

/**
 * Determine cell type from exceljs cell object
 */
function getCellType(cell: ExcelJS.Cell): CellInfo['type'] {
  if (!cell || cell.value === null || cell.value === undefined) return 'empty';

  // Check if it's a formula
  if (cell.formula || (cell.value && typeof cell.value === 'object' && 'formula' in cell.value)) {
    return 'formula';
  }

  const value = cell.value;

  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  if (typeof value === 'object' && value !== null) {
    if ('error' in value) return 'error';
    if ('richText' in value) return 'string';
    if ('result' in value) return 'formula';
  }

  return 'empty';
}

/**
 * Get cell value safely
 */
function getCellValue(cell: ExcelJS.Cell): unknown {
  if (!cell || cell.value === null || cell.value === undefined) return undefined;

  const value = cell.value;

  if (typeof value === 'object' && value !== null) {
    if ('result' in value) return (value as { result: unknown }).result;
    if ('richText' in value) {
      return ((value as { richText: Array<{ text: string }> }).richText).map(rt => rt.text).join('');
    }
    if ('text' in value) return (value as { text: string }).text;
    if ('hyperlink' in value) {
      const hyperlinkVal = value as { hyperlink: string; text?: string };
      return hyperlinkVal.text || hyperlinkVal.hyperlink;
    }
  }

  return value;
}

/**
 * Get cell formula if present
 */
function getCellFormula(cell: ExcelJS.Cell): string | undefined {
  if (!cell) return undefined;

  if (cell.formula) return cell.formula;

  const value = cell.value;
  if (typeof value === 'object' && value !== null && 'formula' in value) {
    return (value as { formula: string }).formula;
  }

  return undefined;
}

/**
 * Check if formula is a dynamic array formula
 */
function isArrayFormula(formula: string): boolean {
  const arrayFunctions = [
    'FILTER', 'SORT', 'SORTBY', 'UNIQUE', 'SEQUENCE', 'RANDARRAY',
    'XLOOKUP', 'XMATCH', 'LET', 'LAMBDA', 'MAP', 'REDUCE', 'SCAN',
    'MAKEARRAY', 'BYROW', 'BYCOL', 'CHOOSECOLS', 'CHOOSEROWS',
    'DROP', 'TAKE', 'EXPAND', 'WRAPCOLS', 'WRAPROWS', 'TOCOL', 'TOROW',
    'TEXTSPLIT', 'TEXTBEFORE', 'TEXTAFTER', 'VSTACK', 'HSTACK'
  ];

  const upperFormula = formula.toUpperCase();
  return arrayFunctions.some(fn => upperFormula.includes(fn + '('));
}

/**
 * Calculate complexity score
 */
function calculateComplexity(analysis: Partial<SpreadsheetAnalysis>): SpreadsheetAnalysis['summary']['complexity'] {
  let score = 0;

  // Sheet count
  score += (analysis.sheets?.length || 0) * 2;

  // Formula count
  const formulaCount = analysis.formulas?.length || 0;
  if (formulaCount > 100) score += 30;
  else if (formulaCount > 50) score += 20;
  else if (formulaCount > 20) score += 10;
  else score += formulaCount * 0.5;

  // Unique functions
  const uniqueFunctions = new Set(analysis.formulas?.flatMap(f => f.functions) || []);
  score += uniqueFunctions.size * 2;

  // Array formulas
  const arrayFormulas = analysis.formulas?.filter(f => f.isArrayFormula).length || 0;
  score += arrayFormulas * 5;

  // Named ranges
  score += (analysis.namedRanges?.length || 0) * 2;

  // Tables
  score += (analysis.tables?.length || 0) * 3;

  if (score > 100) return 'very-complex';
  if (score > 50) return 'complex';
  if (score > 20) return 'moderate';
  return 'simple';
}

/**
 * Convert column number to letter (1 = A, 2 = B, etc.)
 */
function columnToLetter(col: number): string {
  let letter = '';
  while (col > 0) {
    const mod = (col - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

// ============ MAIN ANALYZER CLASS ============

export class SpreadsheetAnalyzer {
  private workbook: ExcelJS.Workbook | null = null;
  private fileName: string = '';
  private fileSize: number = 0;

  /**
   * Parse Excel file from buffer
   */
  async parseBuffer(buffer: Buffer, fileName: string): Promise<void> {
    this.workbook = new ExcelJS.Workbook();
    // ExcelJS accepts Buffer directly in Node.js environment
    await this.workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    this.fileName = fileName;
    this.fileSize = buffer.length;
  }

  /**
   * Parse Excel file from file path
   */
  async parseFile(filePath: string): Promise<void> {
    this.workbook = new ExcelJS.Workbook();
    await this.workbook.xlsx.readFile(filePath);
    this.fileName = filePath.split('/').pop() || filePath;
  }

  /**
   * Get all sheet information
   */
  getSheets(): SheetInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    return this.workbook.worksheets.map(worksheet => {
      const name = worksheet.name;

      // Get dimensions
      const rowCount = worksheet.rowCount || 0;
      const columnCount = worksheet.columnCount || 0;

      let formulaCount = 0;
      let cellCount = 0;

      // Iterate through cells
      worksheet.eachRow({ includeEmpty: false }, (row) => {
        row.eachCell({ includeEmpty: false }, (cell) => {
          cellCount++;
          if (getCellFormula(cell)) {
            formulaCount++;
          }
        });
      });

      // Build used range string
      const usedRange = rowCount > 0 && columnCount > 0
        ? `A1:${columnToLetter(columnCount)}${rowCount}`
        : 'A1';

      return {
        name,
        usedRange,
        rowCount,
        columnCount,
        hasFormulas: formulaCount > 0,
        hasTables: false, // ExcelJS doesn't expose table information in the same way
        formulaCount,
        cellCount,
      };
    });
  }

  /**
   * Extract all formulas from workbook
   */
  getFormulas(): FormulaInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    const formulas: FormulaInfo[] = [];

    for (const worksheet of this.workbook.worksheets) {
      const sheetName = worksheet.name;

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const formula = getCellFormula(cell);
          if (formula) {
            const cellAddress = `${columnToLetter(colNumber)}${rowNumber}`;
            const fullAddress = `${sheetName}!${cellAddress}`;

            formulas.push({
              address: fullAddress,
              formula: formula,
              result: getCellValue(cell),
              dependencies: extractCellReferences(formula),
              functions: extractFunctions(formula),
              isArrayFormula: isArrayFormula(formula),
            });
          }
        });
      });
    }

    return formulas;
  }

  /**
   * Extract named ranges/defined names
   * Note: ExcelJS has limited support for defined names compared to xlsx library
   */
  getNamedRanges(): NamedRangeInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    // ExcelJS definedNames API is different from xlsx
    // For now, return empty array - named ranges would require
    // accessing the internal model which varies by version
    return [];
  }

  /**
   * Extract table information
   * Note: ExcelJS has limited support for Excel tables compared to xlsx library
   * Tables would need to be detected through data patterns if required
   */
  getTables(): TableInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    // ExcelJS doesn't expose Excel tables in the same way as xlsx
    // Return empty array - table detection would require pattern-based analysis
    return [];
  }

  /**
   * Get function usage statistics
   */
  getFunctionStats(): { name: string; count: number; locations: string[] }[] {
    const formulas = this.getFormulas();
    const functionMap = new Map<string, { count: number; locations: string[] }>();

    for (const formula of formulas) {
      for (const func of formula.functions) {
        const existing = functionMap.get(func) || { count: 0, locations: [] };
        existing.count++;
        if (existing.locations.length < 5) {
          existing.locations.push(formula.address);
        }
        functionMap.set(func, existing);
      }
    }

    return Array.from(functionMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get specific sheet data as JSON
   */
  getSheetData(sheetName: string): Record<string, unknown>[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    const worksheet = this.workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const data: Record<string, unknown>[] = [];
    const headers: string[] = [];

    // Get headers from first row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const value = getCellValue(cell);
      headers[colNumber] = String(value || `Column${colNumber}`);
    });

    // Get data from remaining rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData: Record<string, unknown> = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const header = headers[colNumber] || `Column${colNumber}`;
        rowData[header] = getCellValue(cell);
      });

      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

    return data;
  }

  /**
   * Get cell details for a range
   */
  getCellDetails(sheetName: string, range?: string): CellInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    const worksheet = this.workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`);

    const cells: CellInfo[] = [];

    if (range) {
      // Parse range and iterate
      const rangeMatch = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/i);
      if (rangeMatch) {
        const startCol = rangeMatch[1].toUpperCase();
        const startRow = parseInt(rangeMatch[2]);
        const endCol = rangeMatch[3].toUpperCase();
        const endRow = parseInt(rangeMatch[4]);

        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol.charCodeAt(0) - 64; col <= endCol.charCodeAt(0) - 64; col++) {
            const cellAddress = `${String.fromCharCode(64 + col)}${row}`;
            const cell = worksheet.getCell(cellAddress);

            cells.push({
              address: cellAddress,
              value: getCellValue(cell),
              formula: getCellFormula(cell),
              type: getCellType(cell),
              numberFormat: cell.numFmt,
            });
          }
        }
      }
    } else {
      // Iterate all cells
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const cellAddress = `${columnToLetter(colNumber)}${rowNumber}`;

          cells.push({
            address: cellAddress,
            value: getCellValue(cell),
            formula: getCellFormula(cell),
            type: getCellType(cell),
            numberFormat: cell.numFmt,
          });
        });
      });
    }

    return cells;
  }

  /**
   * Perform full analysis
   */
  analyze(): SpreadsheetAnalysis {
    if (!this.workbook) throw new Error('No workbook loaded');

    const sheets = this.getSheets();
    const formulas = this.getFormulas();
    const tables = this.getTables();
    const namedRanges = this.getNamedRanges();
    const excelFunctions = this.getFunctionStats();

    const uniqueFunctions = [...new Set(formulas.flatMap(f => f.functions))];

    const analysis: SpreadsheetAnalysis = {
      fileName: this.fileName,
      fileSize: this.fileSize,
      sheets,
      formulas,
      tables,
      namedRanges,
      dataValidations: [], // ExcelJS has limited support for data validations
      conditionalFormats: [], // ExcelJS has limited support for conditional formats
      excelFunctions,
      summary: {
        totalSheets: sheets.length,
        totalFormulas: formulas.length,
        totalTables: tables.length,
        totalNamedRanges: namedRanges.length,
        uniqueFunctions,
        complexity: 'simple', // Will be calculated
      },
    };

    analysis.summary.complexity = calculateComplexity(analysis);

    return analysis;
  }

  /**
   * Generate extraction prompts based on analysis
   */
  generateContextualPrompts(analysis: SpreadsheetAnalysis): string[] {
    const prompts: string[] = [];

    // Basic overview prompt
    prompts.push(`This spreadsheet "${analysis.fileName}" has ${analysis.summary.totalSheets} sheets, ${analysis.summary.totalFormulas} formulas, and is rated as "${analysis.summary.complexity}" complexity. Please provide an overview of its purpose and structure.`);

    // Sheet-specific prompts
    for (const sheet of analysis.sheets) {
      if (sheet.hasFormulas) {
        prompts.push(`Analyze sheet "${sheet.name}" which contains ${sheet.formulaCount} formulas across ${sheet.cellCount} cells. What calculations are being performed?`);
      }
    }

    // Function-specific prompts
    const topFunctions = analysis.excelFunctions.slice(0, 5);
    if (topFunctions.length > 0) {
      const funcList = topFunctions.map(f => `${f.name} (${f.count}x)`).join(', ');
      prompts.push(`The most used Excel functions are: ${funcList}. Explain what business logic these functions are implementing.`);
    }

    // Named range prompts
    if (analysis.namedRanges.length > 0) {
      prompts.push(`There are ${analysis.namedRanges.length} named ranges/defined names. List each one and explain its business purpose.`);
    }

    // Table prompts
    for (const table of analysis.tables) {
      if (table.hasCalculatedColumns) {
        prompts.push(`Table "${table.name}" has calculated columns: ${table.calculatedColumns.map(c => c.header).join(', ')}. Document the formulas and their business meaning.`);
      }
    }

    // Complex formula prompts
    const complexFormulas = analysis.formulas.filter(f =>
      f.functions.length > 3 || f.isArrayFormula || f.formula.length > 100
    );
    for (const formula of complexFormulas.slice(0, 10)) {
      prompts.push(`Break down this complex formula at ${formula.address}: =${formula.formula}`);
    }

    return prompts;
  }
}

export const spreadsheetAnalyzer = new SpreadsheetAnalyzer();
