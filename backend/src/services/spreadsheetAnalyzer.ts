import * as XLSX from 'xlsx';

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
 * Determine cell type from xlsx cell object
 */
function getCellType(cell: XLSX.CellObject | undefined): CellInfo['type'] {
  if (!cell) return 'empty';
  if (cell.f) return 'formula';

  switch (cell.t) {
    case 'n': return 'number';
    case 's': return 'string';
    case 'b': return 'boolean';
    case 'd': return 'date';
    case 'e': return 'error';
    default: return 'empty';
  }
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

// ============ MAIN ANALYZER CLASS ============

export class SpreadsheetAnalyzer {
  private workbook: XLSX.WorkBook | null = null;
  private fileName: string = '';
  private fileSize: number = 0;

  /**
   * Parse Excel file from buffer
   */
  parseBuffer(buffer: Buffer, fileName: string): void {
    this.workbook = XLSX.read(buffer, {
      cellFormula: true,
      cellNF: true,
      cellStyles: true,
      cellDates: true,
      sheetStubs: true,
    });
    this.fileName = fileName;
    this.fileSize = buffer.length;
  }

  /**
   * Parse Excel file from file path
   */
  parseFile(filePath: string): void {
    this.workbook = XLSX.readFile(filePath, {
      cellFormula: true,
      cellNF: true,
      cellStyles: true,
      cellDates: true,
      sheetStubs: true,
    });
    this.fileName = filePath.split('/').pop() || filePath;
  }

  /**
   * Get all sheet information
   */
  getSheets(): SheetInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    return this.workbook.SheetNames.map(name => {
      const sheet = this.workbook!.Sheets[name];
      const range = sheet['!ref'] || 'A1';
      const decodedRange = XLSX.utils.decode_range(range);

      let formulaCount = 0;
      let cellCount = 0;

      for (const cellAddress in sheet) {
        if (cellAddress.startsWith('!')) continue;
        cellCount++;
        const cell = sheet[cellAddress] as XLSX.CellObject;
        if (cell.f) formulaCount++;
      }

      return {
        name,
        usedRange: range,
        rowCount: decodedRange.e.r - decodedRange.s.r + 1,
        columnCount: decodedRange.e.c - decodedRange.s.c + 1,
        hasFormulas: formulaCount > 0,
        hasTables: !!sheet['!tables']?.length,
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

    for (const sheetName of this.workbook.SheetNames) {
      const sheet = this.workbook.Sheets[sheetName];

      for (const cellAddress in sheet) {
        if (cellAddress.startsWith('!')) continue;

        const cell = sheet[cellAddress] as XLSX.CellObject;
        if (cell.f) {
          const fullAddress = `${sheetName}!${cellAddress}`;
          formulas.push({
            address: fullAddress,
            formula: cell.f,
            result: cell.v,
            dependencies: extractCellReferences(cell.f),
            functions: extractFunctions(cell.f),
            isArrayFormula: isArrayFormula(cell.f),
          });
        }
      }
    }

    return formulas;
  }

  /**
   * Extract named ranges/defined names
   */
  getNamedRanges(): NamedRangeInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    const namedRanges: NamedRangeInfo[] = [];
    const definedNames = this.workbook.Workbook?.Names || [];

    for (const name of definedNames) {
      if (name.Name && name.Ref) {
        const isFormula = name.Ref.startsWith('=') || /[+\-*/()]/.test(name.Ref);
        namedRanges.push({
          name: name.Name,
          scope: name.Sheet !== undefined ? 'sheet' : 'workbook',
          refersTo: name.Ref,
          isFormula,
        });
      }
    }

    return namedRanges;
  }

  /**
   * Extract table information
   */
  getTables(): TableInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    const tables: TableInfo[] = [];

    for (const sheetName of this.workbook.SheetNames) {
      const sheet = this.workbook.Sheets[sheetName];
      const sheetTables = sheet['!tables'] || [];

      for (const table of sheetTables) {
        const range = XLSX.utils.decode_range(table.ref || 'A1:A1');
        const headers: string[] = [];
        const calculatedColumns: { header: string; formula: string }[] = [];

        // Extract headers from first row
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddr = XLSX.utils.encode_cell({ r: range.s.r, c: col });
          const cell = sheet[cellAddr] as XLSX.CellObject;
          headers.push(cell?.v?.toString() || `Column${col + 1}`);
        }

        // Check for calculated columns
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddr = XLSX.utils.encode_cell({ r: range.s.r + 1, c: col });
          const cell = sheet[cellAddr] as XLSX.CellObject;
          if (cell?.f) {
            calculatedColumns.push({
              header: headers[col - range.s.c],
              formula: cell.f,
            });
          }
        }

        tables.push({
          name: table.name || `Table_${sheetName}`,
          sheet: sheetName,
          range: table.ref || '',
          headers,
          rowCount: range.e.r - range.s.r,
          hasCalculatedColumns: calculatedColumns.length > 0,
          calculatedColumns,
        });
      }
    }

    return tables;
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

    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    return XLSX.utils.sheet_to_json(sheet);
  }

  /**
   * Get cell details for a range
   */
  getCellDetails(sheetName: string, range?: string): CellInfo[] {
    if (!this.workbook) throw new Error('No workbook loaded');

    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const targetRange = range || sheet['!ref'] || 'A1';
    const decodedRange = XLSX.utils.decode_range(targetRange);
    const cells: CellInfo[] = [];

    for (let row = decodedRange.s.r; row <= decodedRange.e.r; row++) {
      for (let col = decodedRange.s.c; col <= decodedRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[cellAddr] as XLSX.CellObject;

        cells.push({
          address: cellAddr,
          value: cell?.v,
          formula: cell?.f,
          type: getCellType(cell),
          numberFormat: cell?.z != null ? String(cell.z) : undefined,
        });
      }
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
      dataValidations: [], // XLSX library has limited support
      conditionalFormats: [], // XLSX library has limited support
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
