import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { DocumentType } from '../../services/documentService';

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    file: File;
    fileType: DocumentType;
    documentDate: Date;
    changeNotes?: string;
  }) => void | Promise<void>;
  title?: string;
  isReplacing?: boolean;
  defaultFileType?: DocumentType;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  title = 'Upload Document',
  isReplacing = false,
  defaultFileType = 'PLAN_DRAWING',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<DocumentType>(defaultFileType);
  const [documentDate, setDocumentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [changeNotes, setChangeNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!documentDate) {
      alert('Please select a document date');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload({
        file,
        fileType,
        documentDate: new Date(documentDate),
        changeNotes: changeNotes.trim() || undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileType(defaultFileType);
    setDocumentDate(new Date().toISOString().split('T')[0]);
    setChangeNotes('');
    setIsUploading(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="file-upload-dialog">
        {/* File Drop Zone */}
        <div
          className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <div className="file-drop-zone-icon">📄</div>
              <p className="file-drop-zone-text">
                Drag and drop a file here, or click to select
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                className="file-drop-zone-input"
                accept=".pdf,.xlsx,.xls,.docx,.doc,.csv,.zip,.png,.jpg,.jpeg"
              />
              <p className="file-drop-zone-hint">
                Supported: PDF, Excel, Word, CSV, ZIP, Images (Max 100MB)
              </p>
            </>
          ) : (
            <div className="file-drop-zone-selected">
              <div className="file-info">
                <div className="file-info-icon">📎</div>
                <div className="file-info-details">
                  <div className="file-info-name">{file.name}</div>
                  <div className="file-info-size">{formatFileSize(file.size)}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="file-upload-form">
          <Input
            label="Document Type"
            inputType="select"
            value={fileType}
            onChange={(e) => setFileType(e.target.value as DocumentType)}
            required
            options={[
              { value: 'PLAN_DRAWING', label: 'Plan Drawing' },
              { value: 'ELEVATION_DRAWING', label: 'Elevation Drawing' },
              { value: 'SPECIFICATIONS', label: 'Specifications' },
              { value: 'MATERIAL_LIST', label: 'Material List' },
              { value: 'PRICING_SHEET', label: 'Pricing Sheet' },
              { value: 'OPTION_DETAILS', label: 'Option Details' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />

          <Input
            label="Document Date"
            inputType="date"
            value={documentDate}
            onChange={(e) => setDocumentDate(e.target.value)}
            required
            helpText="The effective date of this document version"
          />

          <Input
            label={isReplacing ? 'What changed in this version?' : 'Notes (optional)'}
            inputType="textarea"
            value={changeNotes}
            onChange={(e) => setChangeNotes(e.target.value)}
            placeholder={
              isReplacing
                ? 'Describe the changes in this version...'
                : 'Add any notes about this document...'
            }
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!file || isUploading}
            loading={isUploading}
          >
            {isReplacing ? 'Replace Document' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FileUploadDialog;
