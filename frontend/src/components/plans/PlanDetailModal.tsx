import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ElevationCard from './ElevationCard';
import ElevationFormModal from './ElevationFormModal';
import type { ElevationFormData } from './ElevationFormModal';
import PlanOptionsSection from './PlanOptionsSection';
import { useToast } from '../common/Toast';
import type { Plan, PlanElevation } from '../../services/planService';
import {
  useElevations,
  useCreateElevation,
  useUpdateElevation,
  useDeleteElevation,
  useAssignedOptions,
} from '../../services/planService';
import { exportPlanDetailToExcel } from '../../utils/excelExport';

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
  const { showToast } = useToast();

  // Elevation modal state
  const [isElevationModalOpen, setIsElevationModalOpen] = useState(false);
  const [editingElevation, setEditingElevation] = useState<PlanElevation | null>(null);

  // Fetch elevations when modal is open
  const { data: elevations, isLoading: elevationsLoading } = useElevations(
    plan?.id || ''
  );

  // Fetch assigned options
  const { data: options } = useAssignedOptions(plan?.id || '');

  // Elevation mutations
  const createElevation = useCreateElevation();
  const updateElevation = useUpdateElevation();
  const deleteElevation = useDeleteElevation();

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  if (!plan) return null;

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPlanDetailToExcel(
        plan,
        elevations || [],
        options || []
      );
      showToast('Plan exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export plan', 'error');
    } finally {
      setIsExporting(false);
    }
  };

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

  // Elevation handlers
  const handleAddElevation = () => {
    setEditingElevation(null);
    setIsElevationModalOpen(true);
  };

  const handleEditElevation = (elevation: PlanElevation) => {
    setEditingElevation(elevation);
    setIsElevationModalOpen(true);
  };

  const handleCloseElevationModal = () => {
    setIsElevationModalOpen(false);
    setEditingElevation(null);
  };

  const handleSaveElevation = async (data: ElevationFormData, changeNotes?: string) => {
    try {
      if (editingElevation) {
        // Update existing elevation
        await updateElevation.mutateAsync({
          planId: plan.id,
          elevationId: editingElevation.id,
          data: {
            ...data,
            changeNotes,
          },
        });
      } else {
        // Create new elevation
        await createElevation.mutateAsync({
          planId: plan.id,
          data,
        });
      }
      handleCloseElevationModal();
    } catch (error) {
      // Error is handled by the form modal
      throw error;
    }
  };

  const handleDeleteElevation = async (elevation: PlanElevation) => {
    if (
      confirm(
        `Are you sure you want to delete elevation "${elevation.code}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteElevation.mutateAsync({
          planId: plan.id,
          elevationId: elevation.id,
        });
        showToast('Elevation deleted successfully', 'success');
      } catch (error: unknown) {
        console.error('Error deleting elevation:', error);
        const apiError = error as { data?: { error?: string }; message?: string };
        const errorMessage =
          apiError?.data?.error || apiError?.message || 'Failed to delete elevation';
        showToast(errorMessage, 'error');
      }
    }
  };

  return (
    <>
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
              <Button
                variant="secondary"
                onClick={handleExport}
                isLoading={isExporting}
              >
                Export
              </Button>
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
                <span className="plan-detail-item-label">Builder</span>
                <span className="plan-detail-item-value">{plan.builder?.customerName || '—'}</span>
              </div>
              {plan.customerPlanCode && (
                <div className="plan-detail-item">
                  <span className="plan-detail-item-label">Customer Plan Code</span>
                  <span className="plan-detail-item-value">{plan.customerPlanCode}</span>
                </div>
              )}
              <div className="plan-detail-item">
                <span className="plan-detail-item-label">Version</span>
                <span className="plan-detail-item-value">{plan.version}</span>
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

          {/* Elevations Section */}
          <div className="plan-detail-section">
            <div className="plan-detail-section-header">
              <h4 className="plan-detail-section-title">
                Elevations ({elevations?.length ?? plan._count?.elevations ?? 0})
              </h4>
              <Button variant="ghost" size="sm" onClick={handleAddElevation}>
                + Add Elevation
              </Button>
            </div>

            {elevationsLoading ? (
              <div className="elevation-loading">
                <Loading size="sm" />
              </div>
            ) : elevations && elevations.length > 0 ? (
              <div className="elevation-cards-grid">
                {elevations.map((elevation) => (
                  <ElevationCard
                    key={elevation.id}
                    elevation={elevation}
                    onEdit={() => handleEditElevation(elevation)}
                    onDelete={() => handleDeleteElevation(elevation)}
                    onClick={() => handleEditElevation(elevation)}
                  />
                ))}
              </div>
            ) : (
              <div className="elevation-empty">
                <p>No elevations defined for this plan.</p>
                <Button variant="secondary" size="sm" onClick={handleAddElevation}>
                  Add First Elevation
                </Button>
              </div>
            )}
          </div>

          {/* Plan Options Section */}
          <PlanOptionsSection
            planId={plan.id}
            elevations={elevations || []}
          />

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

      {/* Elevation Form Modal */}
      <ElevationFormModal
        isOpen={isElevationModalOpen}
        onClose={handleCloseElevationModal}
        elevation={editingElevation}
        planCode={plan.code}
        onSave={handleSaveElevation}
      />
    </>
  );
};

export default PlanDetailModal;
