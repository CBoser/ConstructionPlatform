import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../common/Toast';

interface PlanImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

const PlanImportDialog: React.FC<PlanImportDialogProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setImportResult(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setImportResult(null);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type)) {
      showToast('Please select an Excel file (.xlsx or .xls)', 'error');
      return false;
    }

    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      showToast('File size must be less than 50MB', 'error');
      return false;
    }

    return true;
  };

  const handleImport = async () => {
    if (!file) {
      showToast('Please select a file to import', 'error');
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/v1/plans/import', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import plans');
      }

      setImportResult(data.data);
      showToast(data.message || 'Plans imported successfully', 'success');
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to import plans',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setDragActive(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Plans from Excel">
      <div className="modal-body">
        <div
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="upload-dropzone-content">
            <div className="upload-icon">📊</div>
            {file ? (
              <>
                <p className="upload-filename">{file.name}</p>
                <p className="upload-filesize">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="upload-text">
                  <strong>Click to select</strong> or drag and drop
                </p>
                <p className="upload-hint">Excel files (.xlsx, .xls) up to 50MB</p>
              </>
            )}
          </div>
        </div>

        {importResult && (
          <div className="import-result">
            <h4>Import Results:</h4>
            <ul>
              <li>✅ {importResult.created} plans created</li>
              <li>🔄 {importResult.updated} plans updated</li>
              <li>⏭️ {importResult.skipped} rows skipped</li>
              {importResult.errors.length > 0 && (
                <li>❌ {importResult.errors.length} errors</li>
              )}
            </ul>

            {importResult.errors.length > 0 && (
              <div className="import-errors">
                <h5>Errors:</h5>
                <ul>
                  {importResult.errors.map((error, index) => (
                    <li key={index}>
                      Row {error.row}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="import-instructions">
          <h4>Instructions:</h4>
          <ol>
            <li>Export your plans to Excel using the "Export All Plans" button</li>
            <li>Make any necessary changes to the Excel file</li>
            <li>Upload the modified file here to import the plans</li>
            <li>
              Plans with matching codes will be <strong>updated</strong>
            </li>
            <li>
              New plan codes will be <strong>created</strong>
            </li>
          </ol>
        </div>
      </div>

      <div className="modal-actions">
        <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
          {importResult ? 'Close' : 'Cancel'}
        </Button>
        {!importResult && (
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={!file}
            isLoading={isUploading}
          >
            Import Plans
          </Button>
        )}
      </div>

      <style>{`
        .upload-dropzone {
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f7fafc;
          margin-bottom: 1.5rem;
        }

        .upload-dropzone:hover {
          border-color: #4299e1;
          background: #ebf8ff;
        }

        .upload-dropzone.drag-active {
          border-color: #3182ce;
          background: #bee3f8;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-filename {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .upload-filesize {
          color: #718096;
          font-size: 0.875rem;
        }

        .upload-text {
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .upload-hint {
          color: #a0aec0;
          font-size: 0.875rem;
        }

        .import-result {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .import-result h4 {
          margin: 0 0 0.75rem 0;
          color: #0c4a6e;
          font-size: 1rem;
        }

        .import-result ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #0c4a6e;
        }

        .import-result li {
          margin-bottom: 0.5rem;
        }

        .import-errors {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #bae6fd;
        }

        .import-errors h5 {
          margin: 0 0 0.5rem 0;
          color: #991b1b;
          font-size: 0.875rem;
        }

        .import-errors ul {
          color: #991b1b;
          font-size: 0.875rem;
          max-height: 150px;
          overflow-y: auto;
        }

        .import-instructions {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          padding: 1rem;
        }

        .import-instructions h4 {
          margin: 0 0 0.75rem 0;
          color: #78350f;
          font-size: 1rem;
        }

        .import-instructions ol {
          margin: 0;
          padding-left: 1.5rem;
          color: #78350f;
        }

        .import-instructions li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Modal>
  );
};

export default PlanImportDialog;
