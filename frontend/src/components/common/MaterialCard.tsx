import React from 'react';
import Button from './Button';

interface MaterialCardProps {
  sku: string;
  description: string;
  category: string;
  dartCategory?: number | null;
  unitOfMeasure: string;
  vendorCost?: number | null;
  isRLLinked?: boolean;
  rlTag?: string | null;
  isActive?: boolean;
  templateItemCount?: number;
  isSelected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  onToggleActive?: () => void;
  onView?: () => void;
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

const MaterialCard: React.FC<MaterialCardProps> = ({
  sku,
  description,
  category,
  dartCategory,
  unitOfMeasure,
  vendorCost,
  isRLLinked = false,
  rlTag,
  isActive = true,
  templateItemCount = 0,
  isSelected = false,
  selectable = false,
  onClick,
  onToggleActive,
  onView,
}) => {
  const handleClick = () => {
    if (onClick && selectable) {
      onClick();
    }
  };

  return (
    <div
      className={`material-card ${isSelected ? 'material-card-selected' : ''} ${selectable ? 'material-card-selectable' : ''}`}
      onClick={handleClick}
    >
      <div className="material-card-header">
        <div className="material-card-title">
          <span className="material-card-sku">{sku}</span>
          {isRLLinked && (
            <span className="badge badge-info" title={rlTag || 'Random Lengths Linked'}>
              RL
            </span>
          )}
        </div>
        <span className={`badge badge-${isActive ? 'success' : 'secondary'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="material-card-description">
        {description}
      </div>

      <div className="material-card-category">
        {formatCategory(category)}
        {dartCategory && (
          <span className="material-card-dart">
            DART {dartCategory.toString().padStart(2, '0')}
          </span>
        )}
      </div>

      <div className="material-card-details">
        <div className="material-card-detail">
          <span className="material-card-detail-label">UOM</span>
          <span className="material-card-detail-value">{unitOfMeasure}</span>
        </div>
        <div className="material-card-detail">
          <span className="material-card-detail-label">Vendor Cost</span>
          <span className="material-card-detail-value">{formatCurrency(vendorCost)}</span>
        </div>
      </div>

      {!selectable && (
        <div className="material-card-footer">
          <div className="material-card-stats">
            <span className="material-card-stat">
              <strong>{templateItemCount}</strong> Template Uses
            </span>
          </div>
          <div className="material-card-actions">
            {onView && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }}>
                View
              </Button>
            )}
            {onToggleActive && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleActive(); }}>
                {isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </div>
        </div>
      )}

      {selectable && isSelected && (
        <div className="material-card-check">
          <span className="material-card-check-icon">✓</span>
        </div>
      )}
    </div>
  );
};

export default MaterialCard;
