import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Plan } from '../../services/planService';

interface PlanDetailModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateJob?: (plan: Plan) => void;
  onEdit?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
}

// Format plan type for display
const formatPlanType = (type: string): string => {
  const typeMap: Record<string, string> = {
    SINGLE_STORY: 'Single Story',
    TWO_STORY: 'Two Story',
    THREE_STORY: 'Three Story',
    DUPLEX: 'Duplex',
    TOWNHOME: 'Townhome',
  };
  return typeMap[type] || type;
};

const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  plan,
  isOpen,
  onClose,
  onCreateJob,
  onEdit,
  onDelete,
}) => {
  if (!plan) return null;

  const handleCreateJob = () => {
    onCreateJob?.(plan);
    onClose();
  };

  const handleEdit = () => {
    onEdit?.(plan);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete plan "${plan.code}"? This action cannot be undone.`)) {
      onDelete?.(plan);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Plan ${plan.code}`}
      size="lg"
      footer={
        <div className="modal-footer-actions">
          <div className="modal-footer-left">
            {onDelete && (
              <Button variant="danger" onClick={handleDelete}>
                Delete Plan
              </Button>
            )}
          </div>
          <div className="modal-footer-right">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button variant="secondary" onClick={handleEdit}>
                Edit
              </Button>
            )}
            {onCreateJob && (
              <Button variant="primary" onClick={handleCreateJob}>
                + Create Job
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="plan-detail">
        {/* Header Info */}
        <div className="plan-detail-header">
          <div className="plan-detail-title-row">
            <h3 className="plan-detail-code">{plan.code}</h3>
            <span className={`badge badge-${plan.isActive ? 'success' : 'secondary'}`}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {plan.name && <p className="plan-detail-name">{plan.name}</p>}
          <div className="plan-detail-type-badge">
            {formatPlanType(plan.type)}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="plan-detail-stats">
          <div className="plan-detail-stat">
            <span className="plan-detail-stat-value">{plan.sqft?.toLocaleString() || '—'}</span>
            <span className="plan-detail-stat-label">Square Feet</span>
          </div>
          <div className="plan-detail-stat">
            <span className="plan-detail-stat-value">{plan.bedrooms ?? '—'}</span>
            <span className="plan-detail-stat-label">Bedrooms</span>
          </div>
          <div className="plan-detail-stat">
            <span className="plan-detail-stat-value">{plan.bathrooms ?? '—'}</span>
            <span className="plan-detail-stat-label">Bathrooms</span>
          </div>
          <div className="plan-detail-stat">
            <span className="plan-detail-stat-value">{plan.garage || '—'}</span>
            <span className="plan-detail-stat-label">Garage</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="plan-detail-section">
          <h4 className="plan-detail-section-title">Details</h4>
          <div className="plan-detail-grid">
            <div className="plan-detail-item">
              <span className="plan-detail-item-label">Style</span>
              <span className="plan-detail-item-value">{plan.style || '—'}</span>
            </div>
            <div className="plan-detail-item">
              <span className="plan-detail-item-label">Version</span>
              <span className="plan-detail-item-value">{plan.version}</span>
            </div>
            <div className="plan-detail-item">
              <span className="plan-detail-item-label">Elevations</span>
              <span className="plan-detail-item-value">{plan._count?.elevations ?? 0}</span>
            </div>
            <div className="plan-detail-item">
              <span className="plan-detail-item-label">Template Items</span>
              <span className="plan-detail-item-value">{plan._count?.templateItems ?? 0}</span>
            </div>
            <div className="plan-detail-item">
              <span className="plan-detail-item-label">Jobs Created</span>
              <span className="plan-detail-item-value">{plan._count?.jobs ?? 0}</span>
            </div>
            {plan.pdssUrl && (
              <div className="plan-detail-item plan-detail-item-full">
                <span className="plan-detail-item-label">PDSS Link</span>
                <a
                  href={plan.pdssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plan-detail-link"
                >
                  View PDSS Document →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {plan.notes && (
          <div className="plan-detail-section">
            <h4 className="plan-detail-section-title">Notes</h4>
            <p className="plan-detail-notes">{plan.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="plan-detail-meta">
          <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(plan.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Modal>
  );
};

export default PlanDetailModal;
