import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Material } from '../../services/materialService';

interface MaterialDetailModalProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (material: Material) => void;
  onToggleActive?: (material: Material) => void;
}

// Format category for display
const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    DIMENSIONAL_LUMBER: 'Dimensional Lumber',
    ENGINEERED_LUMBER: 'Engineered Lumber',
    SHEATHING: 'Sheathing',
    PRESSURE_TREATED: 'Pressure Treated',
    HARDWARE: 'Hardware',
    CONCRETE: 'Concrete',
    ROOFING: 'Roofing',
    SIDING: 'Siding',
    INSULATION: 'Insulation',
    DRYWALL: 'Drywall',
    OTHER: 'Other',
  };
  return categoryMap[category] || category;
};

// Format currency
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  isOpen,
  onClose,
  onEdit,
  onToggleActive,
}) => {
  if (!material) return null;

  const handleEdit = () => {
    onEdit?.(material);
  };

  const handleToggleActive = () => {
    onToggleActive?.(material);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Material: ${material.sku}`}
      size="lg"
      footer={
        <div className="modal-footer-actions">
          <div className="modal-footer-left">
            {onToggleActive && (
              <Button
                variant={material.isActive ? 'danger' : 'success'}
                onClick={handleToggleActive}
              >
                {material.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </div>
          <div className="modal-footer-right">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button variant="primary" onClick={handleEdit}>
                Edit Material
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="material-detail">
        {/* Header Info */}
        <div className="material-detail-header">
          <div className="material-detail-title-row">
            <h3 className="material-detail-sku">{material.sku}</h3>
            <span className={`badge badge-${material.isActive ? 'success' : 'secondary'}`}>
              {material.isActive ? 'Active' : 'Inactive'}
            </span>
            {material.isRLLinked && (
              <span className="badge badge-info" title={material.rlTag || 'Random Lengths Linked'}>
                RL Linked
              </span>
            )}
          </div>
          <p className="material-detail-description">{material.description}</p>
          <div className="material-detail-category-badges">
            <span className="material-detail-category-badge">
              {formatCategory(material.category)}
            </span>
            {material.dartCategory && (
              <span className="material-detail-dart-badge">
                DART {material.dartCategory.toString().padStart(2, '0')}
                {material.dartCategoryName && ` - ${material.dartCategoryName}`}
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="material-detail-stats">
          <div className="material-detail-stat">
            <span className="material-detail-stat-value">{formatCurrency(material.vendorCost)}</span>
            <span className="material-detail-stat-label">Vendor Cost</span>
          </div>
          <div className="material-detail-stat">
            <span className="material-detail-stat-value">{formatCurrency(material.freight)}</span>
            <span className="material-detail-stat-label">Freight</span>
          </div>
          <div className="material-detail-stat">
            <span className="material-detail-stat-value">{material.unitOfMeasure}</span>
            <span className="material-detail-stat-label">Unit of Measure</span>
          </div>
          <div className="material-detail-stat">
            <span className="material-detail-stat-value">{material._count?.templateItems ?? 0}</span>
            <span className="material-detail-stat-label">Template Uses</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="material-detail-section">
          <h4 className="material-detail-section-title">Details</h4>
          <div className="material-detail-grid">
            <div className="material-detail-item">
              <span className="material-detail-item-label">Subcategory</span>
              <span className="material-detail-item-value">{material.subcategory || '—'}</span>
            </div>
            <div className="material-detail-item">
              <span className="material-detail-item-label">Vendor</span>
              <span className="material-detail-item-value">{material.vendor?.name || '—'}</span>
            </div>
            <div className="material-detail-item">
              <span className="material-detail-item-label">Pricing History</span>
              <span className="material-detail-item-value">{material._count?.pricingHistory ?? 0} records</span>
            </div>
          </div>
        </div>

        {/* Random Lengths Info */}
        {material.isRLLinked && (
          <div className="material-detail-section">
            <h4 className="material-detail-section-title">Random Lengths Data</h4>
            <div className="material-detail-grid">
              <div className="material-detail-item">
                <span className="material-detail-item-label">RL Tag</span>
                <span className="material-detail-item-value">{material.rlTag || '—'}</span>
              </div>
              <div className="material-detail-item">
                <span className="material-detail-item-label">RL Base Price</span>
                <span className="material-detail-item-value">{formatCurrency(material.rlBasePrice)}</span>
              </div>
              <div className="material-detail-item">
                <span className="material-detail-item-label">Last Updated</span>
                <span className="material-detail-item-value">
                  {material.rlLastUpdated
                    ? new Date(material.rlLastUpdated).toLocaleDateString()
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="material-detail-meta">
          <span>Created: {new Date(material.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(material.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Modal>
  );
};

export default MaterialDetailModal;
