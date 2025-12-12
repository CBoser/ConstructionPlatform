import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/layout/PageHeader';

// ============================================================================
// Types
// ============================================================================

interface ImportType {
  type: string;
  description: string;
  expectedColumns: string[];
}

interface ImportResult {
  fileName: string;
  sheetName: string;
  importType: string;
  isDryRun: boolean;
  headers: string[];
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: { row: number; error: string }[];
  preview: Record<string, unknown>[];
}

// ============================================================================
// API Functions
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

async function fetchImportTypes(): Promise<ImportType[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/spreadsheet/import/types`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch import types');
  const data = await response.json();
  return data.data.types;
}

async function importSpreadsheet(
  file: File,
  importType?: string,
  dryRun?: boolean
): Promise<ImportResult> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  if (importType) formData.append('importType', importType);
  if (dryRun !== undefined) formData.append('dryRun', String(dryRun));

  const response = await fetch(`${API_BASE_URL}/api/v1/spreadsheet/import`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Import failed');
  }

  const data = await response.json();
  return data.data;
}

// ============================================================================
// File Upload Component
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
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {selectedFile ? (
          <div>
            <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-600">Drag and drop your Excel file here, or</p>
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

        <p className="text-sm text-gray-500">Supported formats: .xlsx, .xls, .csv, .xlsm, .xlsb</p>
      </div>
    </div>
  );
};

// ============================================================================
// Import Preview Component
// ============================================================================

interface ImportPreviewProps {
  result: ImportResult;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

const ImportPreview: React.FC<ImportPreviewProps> = ({
  result,
  onConfirm,
  onCancel,
  isImporting,
}) => {
  const importTypeLabels: Record<string, string> = {
    pride_board: 'Pride Board (Jobs)',
    pdss: 'PDSS (Plan Status)',
    epo: 'EPO (Purchase Orders)',
    subdivisions: 'Subdivisions',
    contracts: 'Contracts',
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{result.totalRows}</p>
          <p className="text-sm text-gray-600">Total Rows</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{result.imported}</p>
          <p className="text-sm text-gray-600">To Import</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
          <p className="text-sm text-gray-600">Skipped</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
          <p className="text-sm text-gray-600">Errors</p>
        </div>
      </div>

      {/* Import Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Import Details</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">File:</span>{' '}
            <span className="font-medium">{result.fileName}</span>
          </div>
          <div>
            <span className="text-gray-500">Sheet:</span>{' '}
            <span className="font-medium">{result.sheetName}</span>
          </div>
          <div>
            <span className="text-gray-500">Type:</span>{' '}
            <span className="font-medium">
              {importTypeLabels[result.importType] || result.importType}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Columns:</span>{' '}
            <span className="font-medium">{result.headers.length}</span>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {result.preview.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Data Preview (First {result.preview.length} rows)</h4>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Row
                  </th>
                  {Object.keys(result.preview[0])
                    .filter((k) => k !== 'row')
                    .map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.preview.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {row.row as number}
                    </td>
                    {Object.entries(row)
                      .filter(([k]) => k !== 'row')
                      .map(([key, value]) => (
                        <td key={key} className="px-4 py-2 whitespace-nowrap text-sm">
                          {value != null ? String(value) : '-'}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <div>
          <h4 className="font-medium text-red-600 mb-2">Errors ({result.errors.length})</h4>
          <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            {result.errors.slice(0, 10).map((error, idx) => (
              <div key={idx} className="text-sm text-red-700 mb-1">
                <span className="font-medium">Row {error.row}:</span> {error.error}
              </div>
            ))}
            {result.errors.length > 10 && (
              <p className="text-sm text-red-600 mt-2">
                ... and {result.errors.length - 10} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="secondary" onClick={onCancel} disabled={isImporting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={result.imported === 0 || isImporting}
          isLoading={isImporting}
        >
          {isImporting ? 'Importing...' : `Import ${result.imported} Records`}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const DataImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null);
  const [importComplete, setImportComplete] = useState(false);
  const [finalResult, setFinalResult] = useState<ImportResult | null>(null);

  // Fetch available import types
  const { data: importTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['importTypes'],
    queryFn: fetchImportTypes,
  });

  // Preview mutation (dry run)
  const previewMutation = useMutation({
    mutationFn: (file: File) => importSpreadsheet(file, selectedType || undefined, true),
    onSuccess: (result) => {
      setPreviewResult(result);
    },
  });

  // Import mutation (actual import)
  const importMutation = useMutation({
    mutationFn: (file: File) => importSpreadsheet(file, selectedType || undefined, false),
    onSuccess: (result) => {
      setFinalResult(result);
      setImportComplete(true);
      setPreviewResult(null);
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewResult(null);
    setImportComplete(false);
    setFinalResult(null);
    // Auto-preview
    previewMutation.mutate(file);
  };

  const handleConfirmImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedType('');
    setPreviewResult(null);
    setImportComplete(false);
    setFinalResult(null);
  };

  return (
    <div>
      <PageHeader
        title="Data Import"
        subtitle="Import data from Excel files into MindFlow"
        breadcrumbs={[{ label: 'Tools', path: '/tools' }, { label: 'Data Import' }]}
        actions={
          selectedFile && (
            <Button variant="secondary" onClick={handleReset}>
              Start Over
            </Button>
          )
        }
      />

      {/* Import Type Selection */}
      {!importComplete && (
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="font-medium mb-3">Import Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => setSelectedType('')}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedType === ''
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium block">Auto-Detect</span>
                <span className="text-xs text-gray-500">Based on columns</span>
              </button>
              {typesLoading ? (
                <div className="col-span-4 text-gray-500">Loading types...</div>
              ) : (
                importTypes?.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedType === type.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium block capitalize">
                      {type.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500 line-clamp-1">{type.description}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* File Upload */}
      {!previewResult && !importComplete && (
        <Card>
          <div className="p-4">
            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={previewMutation.isPending}
              selectedFile={selectedFile}
            />

            {previewMutation.isPending && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Analyzing file...</p>
              </div>
            )}

            {previewMutation.isError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {(previewMutation.error as Error)?.message || 'Failed to analyze file'}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Preview */}
      {previewResult && !importComplete && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Import Preview</h3>
            <ImportPreview
              result={previewResult}
              onConfirm={handleConfirmImport}
              onCancel={handleReset}
              isImporting={importMutation.isPending}
            />
          </div>
        </Card>
      )}

      {/* Import Complete */}
      {importComplete && finalResult && (
        <Card>
          <div className="p-6 text-center">
            <div className="text-green-500 text-5xl mb-4">&#10004;</div>
            <h3 className="text-xl font-semibold text-green-700 mb-2">Import Complete!</h3>
            <p className="text-gray-600 mb-6">
              Successfully imported {finalResult.imported} records from {finalResult.fileName}
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-green-50 p-3 rounded">
                <p className="text-2xl font-bold text-green-600">{finalResult.imported}</p>
                <p className="text-xs text-gray-600">Imported</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-2xl font-bold text-yellow-600">{finalResult.skipped}</p>
                <p className="text-xs text-gray-600">Skipped</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-2xl font-bold text-red-600">{finalResult.errors.length}</p>
                <p className="text-xs text-gray-600">Errors</p>
              </div>
            </div>

            <Button variant="primary" onClick={handleReset}>
              Import Another File
            </Button>
          </div>
        </Card>
      )}

      {/* Help Section */}
      {!selectedFile && (
        <Card className="mt-6">
          <div className="p-4">
            <h3 className="font-medium mb-3">Supported Import Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-blue-700">Pride Board</h4>
                <p className="text-sm text-gray-600">
                  Job schedules from the Pride Board spreadsheet. Expected columns: Job #, Builder,
                  Subdivision, Lot, Plan, Status
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-blue-700">PDSS</h4>
                <p className="text-sm text-gray-600">
                  Plan Document Status Sheet tracking. Expected columns: Plan Code, Elevation,
                  Status
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-blue-700">EPO Reports</h4>
                <p className="text-sm text-gray-600">
                  Electronic Purchase Orders from vendors. Expected columns: PO Number, Vendor,
                  Amount, Material
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-blue-700">Subdivisions</h4>
                <p className="text-sm text-gray-600">
                  Community/subdivision master data. Expected columns: Subdivision, Builder, City,
                  State
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DataImport;
