import { useMutation, useQuery } from '@tanstack/react-query';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Types
// ============================================================================

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

export interface FormulaInfo {
  address: string;
  formula: string;
  result: unknown;
  dependencies: string[];
  functions: string[];
  isArrayFormula: boolean;
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
  isFormula: boolean;
}

export interface FunctionStat {
  name: string;
  count: number;
  locations: string[];
}

export interface SpreadsheetAnalysis {
  fileName: string;
  fileSize: number;
  sheets: SheetInfo[];
  formulas: FormulaInfo[];
  tables: TableInfo[];
  namedRanges: NamedRangeInfo[];
  excelFunctions: FunctionStat[];
  summary: {
    totalSheets: number;
    totalFormulas: number;
    totalTables: number;
    totalNamedRanges: number;
    uniqueFunctions: string[];
    complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
}

export interface PromptCategory {
  name: string;
  prompts: PromptTemplate[];
}

export interface PromptLibrary {
  [key: string]: PromptCategory;
}

export interface AnalyzeResponse {
  success: boolean;
  data: {
    analysis: SpreadsheetAnalysis;
    contextualPrompts: string[];
    promptLibrary: PromptLibrary;
  };
}

export interface GeneratePromptResponse {
  success: boolean;
  data: {
    promptId: string;
    promptName: string;
    prompt: string;
  };
}

export interface ExportAnalysisResponse {
  success: boolean;
  data: {
    markdown: string;
    fileName: string;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Upload and analyze a spreadsheet
 */
export async function analyzeSpreadsheet(file: File): Promise<AnalyzeResponse['data']> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/spreadsheet/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  const result: AnalyzeResponse = await response.json();
  return result.data;
}

/**
 * Get the prompt library
 */
export async function getPromptLibrary(): Promise<PromptLibrary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/spreadsheet/prompts`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate a customized prompt
 */
export async function generatePrompt(
  promptId: string,
  analysis?: SpreadsheetAnalysis,
  customContext?: string
): Promise<GeneratePromptResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/api/v1/spreadsheet/generate-prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      promptId,
      analysis,
      customContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  const result: GeneratePromptResponse = await response.json();
  return result.data;
}

/**
 * Export analysis as markdown
 */
export async function exportAnalysis(file: File): Promise<ExportAnalysisResponse['data']> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/spreadsheet/export-analysis`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  const result: ExportAnalysisResponse = await response.json();
  return result.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

export const spreadsheetKeys = {
  all: ['spreadsheet'] as const,
  prompts: () => [...spreadsheetKeys.all, 'prompts'] as const,
  analysis: (fileName: string) => [...spreadsheetKeys.all, 'analysis', fileName] as const,
};

/**
 * Hook: Get prompt library
 */
export function usePromptLibrary() {
  return useQuery({
    queryKey: spreadsheetKeys.prompts(),
    queryFn: getPromptLibrary,
    staleTime: 1000 * 60 * 60, // 1 hour - prompts don't change often
  });
}

/**
 * Hook: Analyze spreadsheet
 */
export function useAnalyzeSpreadsheet() {
  return useMutation({
    mutationFn: analyzeSpreadsheet,
  });
}

/**
 * Hook: Generate prompt
 */
export function useGeneratePrompt() {
  return useMutation({
    mutationFn: ({
      promptId,
      analysis,
      customContext,
    }: {
      promptId: string;
      analysis?: SpreadsheetAnalysis;
      customContext?: string;
    }) => generatePrompt(promptId, analysis, customContext),
  });
}

/**
 * Hook: Export analysis
 */
export function useExportAnalysis() {
  return useMutation({
    mutationFn: exportAnalysis,
  });
}
