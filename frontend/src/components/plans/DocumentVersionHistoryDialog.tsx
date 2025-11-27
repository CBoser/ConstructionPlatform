import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loading from '../common/Loading';
import type { PlanDocument } from '../../services/documentService';
import { useVersionHistory, downloadDocument } from '../../services/documentService';
import { useToast } from '../common/Toast';

interface DocumentVersionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  elevationId?: string;
  title?: string;
  onReplaceVersion?: (document: PlanDocument) => void;
}

const DocumentVersionHistoryDialog: React.FC<DocumentVersionHistoryDialogProps> = ({
  isOpen,
  onClose,
  planId,
  elevationId,
  title = 'Document Version History',
  onReplaceVersion,
}) => {
  const { showToast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: documents, isLoading } = useVersionHistory(planId, elevationId);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDocumentType = (type: string): string => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleDownload = async (document: PlanDocument) => {
    setDownloadingId(document.id);
    try {
      await downloadDocument(planId, document.id);
      showToast('Document downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to download document', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReplace = (document: PlanDocument) => {
    onReplaceVersion?.(document);
    onClose();
  };

  // Group documents by file type
  const groupedDocuments = documents?.reduce((acc, doc) => {
    if (!acc[doc.fileType]) {
      acc[doc.fileType] = [];
    }
    acc[doc.fileType].push(doc);
    return acc;
  }, {} as Record<string, PlanDocument[]>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="document-version-history">
        {isLoading ? (
          <div className="loading-container">
            <Loading size="md" />
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No documents found</h3>
            <p>No documents have been uploaded yet.</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedDocuments || {}).map(([fileType, docs]) => (
              <div key={fileType} className="document-type-group">
                <h3 className="document-type-header">
                  {formatDocumentType(fileType)}
                </h3>
                <div className="document-list">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`document-version-item ${doc.isArchived ? 'archived' : 'current'}`}
                    >
                      <div className="document-version-header">
                        <div className="document-version-info">
                          <div className="document-version-title">
                            <span className="document-version-name">
                              {doc.fileName}
                            </span>
                            <span className="document-version-badge">
                              v{doc.version}
                            </span>
                            {doc.isArchived && (
                              <span className="badge badge-secondary">
                                Archived
                              </span>
                            )}
                            {!doc.isArchived && doc.version > 1 && (
                              <span className="badge badge-success">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="document-version-meta">
                            <span className="document-version-size">
                              {formatFileSize(doc.fileSize)}
                            </span>
                            <span className="document-version-date">
                              Document Date: {formatDate(doc.documentDate)}
                            </span>
                            <span className="document-version-uploaded">
                              Uploaded: {formatDate(doc.createdAt)}
                            </span>
                            {doc.uploadedBy && (
                              <span className="document-version-uploader">
                                by {doc.uploadedBy}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="document-version-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingId === doc.id}
                            loading={downloadingId === doc.id}
                          >
                            Download
                          </Button>
                          {onReplaceVersion && !doc.isArchived && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReplace(doc)}
                            >
                              Replace
                            </Button>
                          )}
                        </div>
                      </div>

                      {doc.changeNotes && (
                        <div className="document-version-notes">
                          <strong>Changes:</strong> {doc.changeNotes}
                        </div>
                      )}

                      {doc.archiveNotes && (
                        <div className="document-version-archive-notes">
                          <strong>Archive Notes:</strong> {doc.archiveNotes}
                        </div>
                      )}

                      {doc.replacedBy && (
                        <div className="document-version-replaced">
                          <span className="document-version-replaced-icon">→</span>
                          Replaced by v{doc.replacedBy.version} on{' '}
                          {formatDate(doc.replacedBy.createdAt)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentVersionHistoryDialog;
