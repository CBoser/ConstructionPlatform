import React from 'react';

interface Elevation {
  id: string;
  code: string;
  name?: string | null;
}

interface PlanCardProps {
  code: string;
  name?: string | null;
  type: string;
  builderName?: string | null;
  sqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  garage?: string | null;
  style?: string | null;
  elevationCount?: number;
  elevations?: Elevation[];
  templateItemCount?: number;
  jobCount?: number;
  isActive?: boolean;
  isSelected?: boolean;
  selectable?: boolean;
  showElevations?: boolean;
  onClick?: () => void;
  onEdit?: (e: React.MouseEvent) => void;
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
  builderName,
  sqft,
  bedrooms,
  bathrooms,
  garage,
  style,
  elevationCount = 0,
  elevations = [],
  templateItemCount = 0,
  jobCount = 0,
  isActive = true,
  isSelected = false,
  selectable = false,
  showElevations = false,
  onClick,
  onEdit,
}) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(e);
  };

  return (
    <div
      className={`plan-card plan-card-clickable ${isSelected ? 'plan-card-selected' : ''} ${selectable ? 'plan-card-selectable' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="plan-card-header">
        <div className="plan-card-title">
          <span className="plan-card-code">{code}</span>
          {name && <span className="plan-card-name">{name}</span>}
        </div>
        <div className="plan-card-header-actions">
          {onEdit && (
            <button
              className="plan-card-edit-btn"
              onClick={handleEditClick}
              title="Edit plan"
              aria-label="Edit plan"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          <span className={`badge badge-${isActive ? 'success' : 'secondary'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="plan-card-type">
        {formatPlanType(type)}
        {style && <span className="plan-card-style">{style}</span>}
        {builderName && (
          <span className="plan-card-builder">{builderName}</span>
        )}
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

      {/* Show elevation codes if available */}
      {showElevations && elevations.length > 0 && (
        <div className="plan-card-elevations">
          <span className="plan-card-elevations-label">Elevations:</span>
          <div className="plan-card-elevation-tags">
            {elevations.map((elev) => (
              <span key={elev.id} className="plan-card-elevation-tag" title={elev.name || elev.code}>
                {elev.code}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="plan-card-footer">
        <div className="plan-card-stats">
          <span className="plan-card-stat">
            <strong>{templateItemCount}</strong> Items
          </span>
          <span className="plan-card-stat">
            <strong>{jobCount}</strong> Jobs
          </span>
        </div>
        <span className="plan-card-arrow">→</span>
      </div>

      {selectable && isSelected && (
        <div className="plan-card-check">
          <span className="plan-card-check-icon">✓</span>
        </div>
      )}
    </div>
  );
};

export default PlanCard;
