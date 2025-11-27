import React from 'react';
import Button from './Button';

interface PlanCardProps {
  code: string;
  name?: string | null;
  type: string;
  sqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  garage?: string | null;
  elevationCount?: number;
  templateItemCount?: number;
  jobCount?: number;
  isActive?: boolean;
  isSelected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  onView?: () => void;
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

const PlanCard: React.FC<PlanCardProps> = ({
  code,
  name,
  type,
  sqft,
  bedrooms,
  bathrooms,
  garage,
  elevationCount = 0,
  templateItemCount = 0,
  jobCount = 0,
  isActive = true,
  isSelected = false,
  selectable = false,
  onClick,
  onDelete,
  onView,
}) => {
  const handleClick = () => {
    if (onClick && selectable) {
      onClick();
    }
  };

  return (
    <div
      className={`plan-card ${isSelected ? 'plan-card-selected' : ''} ${selectable ? 'plan-card-selectable' : ''}`}
      onClick={handleClick}
    >
      <div className="plan-card-header">
        <div className="plan-card-title">
          <span className="plan-card-code">{code}</span>
          {name && <span className="plan-card-name">{name}</span>}
        </div>
        <span className={`badge badge-${isActive ? 'success' : 'secondary'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="plan-card-type">
        {formatPlanType(type)}
      </div>

      <div className="plan-card-details">
        <div className="plan-card-detail">
          <span className="plan-card-detail-label">Sq Ft</span>
          <span className="plan-card-detail-value">
            {sqft ? sqft.toLocaleString() : '—'}
          </span>
        </div>
        <div className="plan-card-detail">
          <span className="plan-card-detail-label">Bed/Bath</span>
          <span className="plan-card-detail-value">
            {bedrooms ?? '—'} / {bathrooms ?? '—'}
          </span>
        </div>
        <div className="plan-card-detail">
          <span className="plan-card-detail-label">Garage</span>
          <span className="plan-card-detail-value">{garage || '—'}</span>
        </div>
        <div className="plan-card-detail">
          <span className="plan-card-detail-label">Elevations</span>
          <span className="plan-card-detail-value">{elevationCount}</span>
        </div>
      </div>

      {!selectable && (
        <div className="plan-card-footer">
          <div className="plan-card-stats">
            <span className="plan-card-stat">
              <strong>{templateItemCount}</strong> Items
            </span>
            <span className="plan-card-stat">
              <strong>{jobCount}</strong> Jobs
            </span>
          </div>
          <div className="plan-card-actions">
            {onView && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }}>
                View
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {selectable && isSelected && (
        <div className="plan-card-check">
          <span className="plan-card-check-icon">✓</span>
        </div>
      )}
    </div>
  );
};

export default PlanCard;
