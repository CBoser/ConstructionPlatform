import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { SpreadsheetAnalyzer, SpreadsheetAnalysis } from '../services/spreadsheetAnalyzer';

const router = Router();

// Configure multer for file uploads (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv',
    ];
    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.xlsm', '.xlsb'];

    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV.'));
    }
  },
});

// ============ PROMPT LIBRARY ============

const PROMPT_LIBRARY = {
  discovery: {
    name: 'Discovery & Overview',
    prompts: [
      {
        id: 'purpose',
        name: 'Spreadsheet Purpose',
        prompt: `Analyze this spreadsheet and describe:
1. What is the primary purpose of this spreadsheet?
2. Who are the intended users?
3. What are the main inputs and outputs?
4. What business process does it support?`,
      },
      {
        id: 'inventory',
        name: 'Sheet Inventory',
        prompt: `List all sheets/tabs in this workbook and for each one:
1. Sheet name and purpose
2. Is it for input, calculation, output, or reference data?
3. How does it relate to other sheets?
4. Is it user-facing or hidden/backend?`,
      },
    ],
  },
  formulas: {
    name: 'Formula & Calculation Analysis',
    prompts: [
      {
        id: 'formula-extraction',
        name: 'Formula Extraction',
        prompt: `For this sheet/range, extract all formulas and document:
1. Cell reference and the raw formula
2. Plain English explanation of what it calculates
3. All cell dependencies (inputs it relies on)
4. The data type of the result (currency, percentage, count, etc.)
5. Any error handling (IFERROR, IFNA, etc.)`,
      },
      {
        id: 'calc-chain',
        name: 'Calculation Chains',
        prompt: `Identify the calculation flow in this spreadsheet:
1. What are the initial input cells (no formula dependencies)?
2. What is the order of calculations (dependency chain)?
3. What are the final output cells?
4. Are there any circular references?
5. Create a flowchart or dependency diagram of the calculation logic.`,
      },
      {
        id: 'complex-formula',
        name: 'Complex Formula Breakdown',
        prompt: `Break down this complex formula into its component parts:
[PASTE FORMULA HERE]

1. Explain each nested function from innermost to outermost
2. What conditions/logic does it evaluate?
3. What are all possible output values?
4. What edge cases might cause unexpected results?
5. Rewrite the logic as pseudocode or step-by-step rules.`,
      },
      {
        id: 'dynamic-array',
        name: 'Dynamic Array Analysis',
        prompt: `For each dynamic array formula (FILTER, SORT, UNIQUE, SEQUENCE, etc.):
1. What data set does it operate on?
2. What filtering/sorting criteria are applied?
3. How does the output size vary based on input?
4. What happens when there are no matching results?
5. Express this as a database query or filter operation.`,
      },
    ],
  },
  tables: {
    name: 'Table & Data Structure',
    prompts: [
      {
        id: 'table-doc',
        name: 'Table Documentation',
        prompt: `For each Excel Table (ListObject) in this workbook:
1. Table name and location
2. Column names and data types
3. Primary key or unique identifier (if any)
4. Calculated columns and their formulas
5. Total row calculations
6. How is this table referenced by other formulas?`,
      },
      {
        id: 'relationships',
        name: 'Data Relationships',
        prompt: `Identify relationships between tables/ranges:
1. What lookup relationships exist (VLOOKUP, XLOOKUP, INDEX/MATCH)?
2. Which fields are used as keys to connect data?
3. Is it one-to-one, one-to-many, or many-to-many?
4. Create an entity-relationship diagram of the data model.`,
      },
      {
        id: 'named-ranges',
        name: 'Named Ranges & Constants',
        prompt: `Document all named ranges and defined names:
1. Name and scope (workbook or sheet level)
2. What it refers to (cell, range, formula, or constant)
3. How it's used throughout the workbook
4. Business meaning of the value`,
      },
    ],
  },
  businessRules: {
    name: 'Business Rules & Validation',
    prompts: [
      {
        id: 'conditional-logic',
        name: 'Conditional Logic Extraction',
        prompt: `Extract all business rules expressed through conditional logic:
1. IF statements and their conditions
2. SWITCH/IFS/CHOOSE logic
3. Conditional formatting rules and what they indicate
4. Express each as a business rule in plain English:
   "IF [condition] THEN [action/result] ELSE [alternative]"`,
      },
      {
        id: 'validation',
        name: 'Data Validation Rules',
        prompt: `Document all data validation:
1. Which cells have validation?
2. What type (list, number range, date, custom formula)?
3. What are the allowed values?
4. What error messages are shown?
5. Express as business constraints.`,
      },
      {
        id: 'thresholds',
        name: 'Threshold & Tier Logic',
        prompt: `Identify any tiered pricing, thresholds, or bracket logic:
1. What are the tier breakpoints?
2. What rates/values apply to each tier?
3. Is it marginal (each tier separately) or flat (whole amount at one rate)?
4. Document as a pricing/rate table with rules.`,
      },
    ],
  },
  lookups: {
    name: 'Lookup & Reference Data',
    prompts: [
      {
        id: 'conversion-charts',
        name: 'Conversion Chart Analysis',
        prompt: `For each conversion or reference table:
1. What is being converted from/to?
2. What are all the mapping pairs?
3. Is it a direct lookup or interpolated?
4. What happens for values not in the table?
5. How frequently does this reference data change?`,
      },
      {
        id: 'rate-tables',
        name: 'Rate Tables',
        prompt: `Document all rate/pricing tables:
1. What dimensions affect the rate (size, material, location, etc.)?
2. What is the structure (simple list, matrix, multi-dimensional)?
3. What are all the rate values?
4. What units are the rates in?
5. When were rates last updated and how often do they change?`,
      },
      {
        id: 'material-lists',
        name: 'Material/Product Lists',
        prompt: `Extract product/material master data:
1. Item codes/IDs
2. Descriptions
3. Units of measure
4. Associated pricing or cost data
5. Categories or groupings
6. Any attributes or specifications`,
      },
    ],
  },
  pricing: {
    name: 'Pricing & Cost Calculations',
    prompts: [
      {
        id: 'cost-buildup',
        name: 'Cost Buildup',
        prompt: `Document the cost calculation methodology:
1. What are all the cost components?
2. How is each component calculated?
3. What markup/margin is applied and how?
4. What's the formula for final price?
5. Are there minimums, maximums, or rounding rules?`,
      },
      {
        id: 'quantity-takeoff',
        name: 'Quantity Takeoff Logic',
        prompt: `For quantity/measurement calculations:
1. What inputs are required (dimensions, counts, etc.)?
2. What formulas convert inputs to quantities?
3. What waste factors or allowances are applied?
4. How are partial units handled (round up, exact, etc.)?`,
      },
      {
        id: 'labor-calc',
        name: 'Labor Calculations',
        prompt: `Document labor estimating logic:
1. What productivity rates are used?
2. How are crew sizes determined?
3. How is duration calculated?
4. What factors affect labor (complexity, conditions, etc.)?
5. How are labor costs calculated from hours?`,
      },
    ],
  },
  construction: {
    name: 'Construction & Bidding',
    prompts: [
      {
        id: 'bid-item',
        name: 'Bid Item Analysis',
        prompt: `For each bid item or line item in this spreadsheet:
1. What is the item code/number and description?
2. What unit of measure is used?
3. How is the quantity determined?
4. What components make up the unit price?
   - Material cost
   - Labor cost
   - Equipment cost
   - Subcontractor cost
   - Overhead allocation
   - Profit margin
5. Are there any adjustments or factors applied?`,
      },
      {
        id: 'markup',
        name: 'Markup & Burden Analysis',
        prompt: `Document all markup, burden, and overhead calculations:
1. What is the base cost before markups?
2. What overhead rates are applied (field, home office)?
3. What burden rates are applied (labor burden, insurance)?
4. What profit margin is used?
5. Are markups applied sequentially or on the base?
6. What is the formula for total markup percentage?`,
      },
      {
        id: 'unit-price',
        name: 'Unit Price Buildup',
        prompt: `For each priced item, document the unit price buildup:
1. Direct material cost per unit
2. Direct labor hours and cost per unit
3. Equipment hours and cost per unit
4. Production rate assumptions
5. Crew composition
6. All factors and multipliers applied
7. Final unit price calculation`,
      },
    ],
  },
  codeConversion: {
    name: 'Code Conversion Preparation',
    prompts: [
      {
        id: 'function-inventory',
        name: 'Function Inventory',
        prompt: `Create an inventory of all Excel functions used:
1. List each unique function
2. How many times is it used?
3. What's the programming equivalent?
4. Are there any Excel-specific functions that need special handling?`,
      },
      {
        id: 'pseudocode',
        name: 'Pseudocode Generation',
        prompt: `Convert this spreadsheet logic to pseudocode:
1. Define all inputs as variables
2. Define all constants and lookup tables
3. Write the calculation steps as functions
4. Show the order of operations
5. Define the outputs`,
      },
      {
        id: 'data-model',
        name: 'Data Model Design',
        prompt: `Design a database schema to support this spreadsheet:
1. What entities/tables are needed?
2. What fields does each table need?
3. What are the relationships between tables?
4. What should be stored vs. calculated?`,
      },
      {
        id: 'api-contract',
        name: 'API Contract',
        prompt: `If this spreadsheet were an API, define:
1. What would the input payload look like (JSON)?
2. What would the output payload look like (JSON)?
3. What validation would the API perform?
4. What error responses are possible?`,
      },
    ],
  },
  testing: {
    name: 'Testing & Validation',
    prompts: [
      {
        id: 'test-cases',
        name: 'Test Case Generation',
        prompt: `Generate test cases for this spreadsheet:
1. Create test inputs that exercise normal conditions
2. Create test inputs for boundary conditions
3. Create test inputs for error conditions
4. What are the expected outputs for each test case?
5. What known examples can serve as validation?`,
      },
      {
        id: 'reasonableness',
        name: 'Reasonableness Checks',
        prompt: `Identify reasonableness checks and validation:
1. What sanity checks exist in the spreadsheet?
2. What ranges are "reasonable" for key values?
3. What ratios or metrics indicate problems?
4. How would you validate the output is correct?`,
      },
    ],
  },
};

// ============ ROUTES ============

/**
 * GET /api/v1/spreadsheet/prompts
 * Get the full prompt library
 */
router.get('/prompts', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: PROMPT_LIBRARY,
  });
});

/**
 * POST /api/v1/spreadsheet/analyze
 * Upload and analyze a spreadsheet
 */
router.post(
  '/analyze',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const analyzer = new SpreadsheetAnalyzer();
      analyzer.parseBuffer(req.file.buffer, req.file.originalname);

      const analysis = analyzer.analyze();
      const contextualPrompts = analyzer.generateContextualPrompts(analysis);

      res.json({
        success: true,
        data: {
          analysis,
          contextualPrompts,
          promptLibrary: PROMPT_LIBRARY,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/spreadsheet/analyze/sheet
 * Get detailed analysis for a specific sheet
 */
router.post(
  '/analyze/sheet',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const { sheetName, range } = req.body;

      if (!sheetName) {
        res.status(400).json({
          success: false,
          error: 'sheetName is required',
        });
        return;
      }

      const analyzer = new SpreadsheetAnalyzer();
      analyzer.parseBuffer(req.file.buffer, req.file.originalname);

      const cells = analyzer.getCellDetails(sheetName, range);
      const data = analyzer.getSheetData(sheetName);

      res.json({
        success: true,
        data: {
          sheetName,
          cells,
          data: data.slice(0, 100), // Limit to first 100 rows
          totalRows: data.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/spreadsheet/generate-prompt
 * Generate a customized prompt based on analysis and selected template
 */
router.post('/generate-prompt', (req: Request, res: Response) => {
  const { promptId, analysis, customContext } = req.body;

  if (!promptId) {
    res.status(400).json({
      success: false,
      error: 'promptId is required',
    });
    return;
  }

  // Find the prompt template
  let promptTemplate: { id: string; name: string; prompt: string } | undefined;

  for (const category of Object.values(PROMPT_LIBRARY)) {
    const found = category.prompts.find((p) => p.id === promptId);
    if (found) {
      promptTemplate = found;
      break;
    }
  }

  if (!promptTemplate) {
    res.status(404).json({
      success: false,
      error: 'Prompt template not found',
    });
    return;
  }

  // Build contextualized prompt
  let fullPrompt = promptTemplate.prompt;

  if (analysis) {
    const contextHeader = `
## Spreadsheet Context
- File: ${analysis.fileName}
- Sheets: ${analysis.summary?.totalSheets || 'Unknown'}
- Formulas: ${analysis.summary?.totalFormulas || 'Unknown'}
- Complexity: ${analysis.summary?.complexity || 'Unknown'}
- Functions Used: ${analysis.summary?.uniqueFunctions?.join(', ') || 'None detected'}

## Analysis Task
`;
    fullPrompt = contextHeader + fullPrompt;
  }

  if (customContext) {
    fullPrompt += `\n\n## Additional Context\n${customContext}`;
  }

  res.json({
    success: true,
    data: {
      promptId,
      promptName: promptTemplate.name,
      prompt: fullPrompt,
    },
  });
});

/**
 * POST /api/v1/spreadsheet/export-analysis
 * Export analysis as markdown documentation
 */
router.post(
  '/export-analysis',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const analyzer = new SpreadsheetAnalyzer();
      analyzer.parseBuffer(req.file.buffer, req.file.originalname);
      const analysis = analyzer.analyze();

      // Generate markdown documentation
      let markdown = `# Spreadsheet Analysis: ${analysis.fileName}

## Summary
- **File Size:** ${(analysis.fileSize / 1024).toFixed(2)} KB
- **Sheets:** ${analysis.summary.totalSheets}
- **Formulas:** ${analysis.summary.totalFormulas}
- **Tables:** ${analysis.summary.totalTables}
- **Named Ranges:** ${analysis.summary.totalNamedRanges}
- **Complexity:** ${analysis.summary.complexity}

## Sheets

| Sheet Name | Rows | Columns | Formulas | Has Tables |
|------------|------|---------|----------|------------|
${analysis.sheets.map((s) => `| ${s.name} | ${s.rowCount} | ${s.columnCount} | ${s.formulaCount} | ${s.hasTables ? 'Yes' : 'No'} |`).join('\n')}

## Excel Functions Used

| Function | Count | Example Locations |
|----------|-------|-------------------|
${analysis.excelFunctions.slice(0, 20).map((f) => `| ${f.name} | ${f.count} | ${f.locations.slice(0, 2).join(', ')} |`).join('\n')}

## Named Ranges

${analysis.namedRanges.length > 0 ? `| Name | Scope | Refers To |
|------|-------|-----------|
${analysis.namedRanges.map((n) => `| ${n.name} | ${n.scope} | ${n.refersTo} |`).join('\n')}` : 'No named ranges found.'}

## Tables

${analysis.tables.length > 0 ? analysis.tables.map((t) => `### ${t.name}
- **Sheet:** ${t.sheet}
- **Range:** ${t.range}
- **Rows:** ${t.rowCount}
- **Headers:** ${t.headers.join(', ')}
${t.hasCalculatedColumns ? `- **Calculated Columns:** ${t.calculatedColumns.map((c) => c.header).join(', ')}` : ''}`).join('\n\n') : 'No tables found.'}

## Formulas (Sample)

${analysis.formulas.slice(0, 30).map((f) => `### ${f.address}
\`\`\`
=${f.formula}
\`\`\`
- **Functions:** ${f.functions.join(', ') || 'None'}
- **Dependencies:** ${f.dependencies.slice(0, 5).join(', ') || 'None'}
- **Array Formula:** ${f.isArrayFormula ? 'Yes' : 'No'}`).join('\n\n')}

---
*Generated by Spreadsheet Business Logic Extractor*
`;

      res.json({
        success: true,
        data: {
          markdown,
          fileName: `${analysis.fileName.replace(/\.[^.]+$/, '')}_analysis.md`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
