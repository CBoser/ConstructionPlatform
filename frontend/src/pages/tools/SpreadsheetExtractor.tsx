import React, { useState, useCallback, useRef } from 'react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import {
  useAnalyzeSpreadsheet,
  usePromptLibrary,
  useGeneratePrompt,
  useExportAnalysis,
} from '../../services/spreadsheetService';
import type {
  SpreadsheetAnalysis,
  PromptTemplate,
} from '../../services/spreadsheetService';

// ============================================================================
// Sub-Components
// ============================================================================

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.xlsm,.xlsb"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-4">
        <div className="text-4xl text-gray-400">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        {selectedFile ? (
          <div>
            <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-600">
              Drag and drop your Excel file here, or
            </p>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="mt-2"
            >
              Browse Files
            </Button>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Supported formats: .xlsx, .xls, .csv, .xlsm, .xlsb
        </p>
      </div>
    </div>
  );
};

interface AnalysisSummaryProps {
  analysis: SpreadsheetAnalysis;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ analysis }) => {
  const complexityColors = {
    simple: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    complex: 'bg-orange-100 text-orange-800',
    'very-complex': 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-2xl font-bold text-blue-600">{analysis.summary.totalSheets}</p>
            <p className="text-sm text-gray-600">Sheets</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-2xl font-bold text-green-600">{analysis.summary.totalFormulas}</p>
            <p className="text-sm text-gray-600">Formulas</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-2xl font-bold text-purple-600">{analysis.summary.totalTables}</p>
            <p className="text-sm text-gray-600">Tables</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-2xl font-bold text-orange-600">{analysis.summary.totalNamedRanges}</p>
            <p className="text-sm text-gray-600">Named Ranges</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Complexity:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${complexityColors[analysis.summary.complexity]}`}>
            {analysis.summary.complexity.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </Card>
  );
};

interface SheetListProps {
  sheets: SpreadsheetAnalysis['sheets'];
}

const SheetList: React.FC<SheetListProps> = ({ sheets }) => {
  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Sheets</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Formulas</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tables</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sheets.map((sheet) => (
                <tr key={sheet.name}>
                  <td className="px-4 py-2 whitespace-nowrap font-medium">{sheet.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {sheet.rowCount} x {sheet.columnCount}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {sheet.formulaCount > 0 ? (
                      <span className="text-green-600">{sheet.formulaCount}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {sheet.hasTables ? (
                      <span className="text-blue-600">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

interface FunctionStatsProps {
  functions: SpreadsheetAnalysis['excelFunctions'];
}

const FunctionStats: React.FC<FunctionStatsProps> = ({ functions }) => {
  const [showAll, setShowAll] = useState(false);
  const displayFunctions = showAll ? functions : functions.slice(0, 10);

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Excel Functions Used</h3>
        {functions.length === 0 ? (
          <p className="text-gray-500">No functions detected</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {displayFunctions.map((func) => (
                <span
                  key={func.name}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  title={`Used ${func.count} times`}
                >
                  {func.name}
                  <span className="ml-1 bg-blue-200 px-1.5 rounded-full text-xs">
                    {func.count}
                  </span>
                </span>
              ))}
            </div>
            {functions.length > 10 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                {showAll ? 'Show less' : `Show all ${functions.length} functions`}
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

interface FormulaListProps {
  formulas: SpreadsheetAnalysis['formulas'];
}

const FormulaList: React.FC<FormulaListProps> = ({ formulas }) => {
  const [filter, setFilter] = useState<'all' | 'array' | 'complex'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFormulas = formulas.filter((f) => {
    if (filter === 'array' && !f.isArrayFormula) return false;
    if (filter === 'complex' && f.functions.length < 3) return false;
    if (searchTerm && !f.formula.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">Formulas ({filteredFormulas.length})</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All</option>
              <option value="array">Array Formulas</option>
              <option value="complex">Complex (3+ functions)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredFormulas.slice(0, 50).map((formula, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-medium text-blue-600">{formula.address}</span>
                {formula.isArrayFormula && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                    Array
                  </span>
                )}
              </div>
              <code className="block bg-white p-2 rounded border text-xs overflow-x-auto">
                ={formula.formula}
              </code>
              {formula.functions.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  Functions: {formula.functions.join(', ')}
                </div>
              )}
            </div>
          ))}
          {filteredFormulas.length > 50 && (
            <p className="text-sm text-gray-500 text-center py-2">
              Showing 50 of {filteredFormulas.length} formulas
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

interface PromptLibraryPanelProps {
  analysis: SpreadsheetAnalysis | null;
  contextualPrompts: string[];
}

const PromptLibraryPanel: React.FC<PromptLibraryPanelProps> = ({ analysis, contextualPrompts }) => {
  const { data: promptLibrary, isLoading } = usePromptLibrary();
  const generatePromptMutation = useGeneratePrompt();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [customContext, setCustomContext] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'contextual'>('library');

  const handleGeneratePrompt = async (prompt: PromptTemplate) => {
    try {
      const result = await generatePromptMutation.mutateAsync({
        promptId: prompt.id,
        analysis: analysis || undefined,
        customContext: customContext || undefined,
      });
      setGeneratedPrompt(result.prompt);
    } catch (error) {
      console.error('Failed to generate prompt:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex gap-4 mb-4 border-b">
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-2 px-1 ${activeTab === 'library' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Prompt Library
          </button>
          <button
            onClick={() => setActiveTab('contextual')}
            className={`pb-2 px-1 ${activeTab === 'contextual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Contextual Prompts ({contextualPrompts.length})
          </button>
        </div>

        {activeTab === 'library' && promptLibrary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Category List */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
              {Object.entries(promptLibrary).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedCategory === key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                  <span className="text-xs text-gray-500 ml-1">
                    ({category.prompts.length})
                  </span>
                </button>
              ))}
            </div>

            {/* Prompt List */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 mb-2">Prompts</h4>
              {selectedCategory && promptLibrary[selectedCategory] ? (
                promptLibrary[selectedCategory].prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleGeneratePrompt(prompt)}
                    className="w-full text-left px-3 py-2 rounded text-sm bg-gray-50 hover:bg-gray-100"
                  >
                    {prompt.name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">Select a category</p>
              )}
            </div>

            {/* Generated Prompt */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Generated Prompt</h4>
              <div className="mb-2">
                <textarea
                  placeholder="Add custom context (optional)..."
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm h-16"
                />
              </div>
              {generatedPrompt ? (
                <div className="relative">
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                    {generatedPrompt}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(generatedPrompt)}
                    className="absolute top-2 right-2 px-2 py-1 bg-white border rounded text-xs hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                  Select a prompt to generate
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contextual' && (
          <div className="space-y-3">
            {contextualPrompts.length === 0 ? (
              <p className="text-gray-500">Upload a spreadsheet to generate contextual prompts</p>
            ) : (
              contextualPrompts.map((prompt, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded relative">
                  <p className="text-sm pr-16">{prompt}</p>
                  <button
                    onClick={() => copyToClipboard(prompt)}
                    className="absolute top-2 right-2 px-2 py-1 bg-white border rounded text-xs hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const SpreadsheetExtractor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<SpreadsheetAnalysis | null>(null);
  const [contextualPrompts, setContextualPrompts] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'upload' | 'analysis' | 'prompts'>('upload');

  const analyzeMutation = useAnalyzeSpreadsheet();
  const exportMutation = useExportAnalysis();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    try {
      const result = await analyzeMutation.mutateAsync(file);
      setAnalysis(result.analysis);
      setContextualPrompts(result.contextualPrompts);
      setActiveSection('analysis');
    } catch (error) {
      console.error('Failed to analyze spreadsheet:', error);
    }
  };

  const handleExport = async () => {
    if (!selectedFile) return;
    try {
      const result = await exportMutation.mutateAsync(selectedFile);
      // Create and download the markdown file
      const blob = new Blob([result.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analysis:', error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setContextualPrompts([]);
    setActiveSection('upload');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Spreadsheet Business Logic Extractor</h1>
        <p className="text-gray-600 mt-1">
          Upload Excel spreadsheets to analyze formulas, extract business logic, and generate prompts for documentation.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveSection('upload')}
          className={`pb-3 px-1 font-medium ${
            activeSection === 'upload'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveSection('analysis')}
          disabled={!analysis}
          className={`pb-3 px-1 font-medium ${
            activeSection === 'analysis'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : analysis
              ? 'text-gray-500 hover:text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveSection('prompts')}
          className={`pb-3 px-1 font-medium ${
            activeSection === 'prompts'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Prompt Library
        </button>
      </div>

      {/* Action Buttons */}
      {analysis && (
        <div className="flex gap-3 mb-6">
          <Button variant="secondary" onClick={handleReset}>
            Upload New File
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? 'Exporting...' : 'Export as Markdown'}
          </Button>
        </div>
      )}

      {/* Content Sections */}
      {activeSection === 'upload' && (
        <div className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            isLoading={analyzeMutation.isPending}
            selectedFile={selectedFile}
          />

          {analyzeMutation.isPending && (
            <div className="text-center py-8">
              <Loading />
              <p className="mt-2 text-gray-600">Analyzing spreadsheet...</p>
            </div>
          )}

          {analyzeMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Failed to analyze spreadsheet. Please check the file format and try again.
            </div>
          )}
        </div>
      )}

      {activeSection === 'analysis' && analysis && (
        <div className="space-y-6">
          <AnalysisSummary analysis={analysis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SheetList sheets={analysis.sheets} />
            <FunctionStats functions={analysis.excelFunctions} />
          </div>

          <FormulaList formulas={analysis.formulas} />

          {analysis.namedRanges.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Named Ranges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {analysis.namedRanges.map((range) => (
                    <div key={range.name} className="bg-gray-50 p-2 rounded text-sm">
                      <span className="font-medium">{range.name}</span>
                      <span className="text-gray-500 ml-2 text-xs">({range.scope})</span>
                      <div className="text-xs text-gray-600 truncate" title={range.refersTo}>
                        {range.refersTo}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {analysis.tables.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Tables</h3>
                <div className="space-y-3">
                  {analysis.tables.map((table) => (
                    <div key={table.name} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{table.name}</span>
                        <span className="text-xs text-gray-500">
                          Sheet: {table.sheet} | Range: {table.range}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Headers:</span> {table.headers.join(', ')}
                      </div>
                      {table.hasCalculatedColumns && (
                        <div className="text-sm text-blue-600 mt-1">
                          Calculated columns: {table.calculatedColumns.map((c) => c.header).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeSection === 'prompts' && (
        <PromptLibraryPanel analysis={analysis} contextualPrompts={contextualPrompts} />
      )}
    </div>
  );
};

export default SpreadsheetExtractor;
