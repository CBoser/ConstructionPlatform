import React from 'react';
import type { PlanElevation } from '../../services/planService';

interface ElevationCardProps {
  elevation: PlanElevation;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Format date for display
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

// Count how many vendor fields are filled
const getVendorCount = (elevation: PlanElevation): number => {
  let count = 0;
  if (elevation.architectDesigner) count++;
  if (elevation.structuralEngineer) count++;
  if (elevation.iJoistCompany) count++;
  if (elevation.floorTrussCompany) count++;
  if (elevation.roofTrussCompany) count++;
  if (elevation.customDetails?.length) count += elevation.customDetails.length;
  return count;
};

const ElevationCard: React.FC<ElevationCardProps> = ({
  elevation,
  onClick,
  onEdit,
  onDelete,
}) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const vendorCount = getVendorCount(elevation);

  return (
    <div
      className="elevation-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="elevation-card-header">
        <div className="elevation-card-title">
          <span className="elevation-card-code">{elevation.code}</span>
          {elevation.name && (
            <span className="elevation-card-name">{elevation.name}</span>
          )}
        </div>
        <div className="elevation-card-header-actions">
          {onEdit && (
            <button
              className="elevation-card-edit-btn"
              onClick={handleEditClick}
              title="Edit elevation"
              aria-label="Edit elevation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              className="elevation-card-delete-btn"
              onClick={handleDeleteClick}
              title="Delete elevation"
              aria-label="Delete elevation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
          <span className="elevation-card-version">v{elevation.currentVersion}</span>
        </div>
      </div>

      {elevation.description && (
        <p className="elevation-card-description">{elevation.description}</p>
      )}

      {/* Vendor Summary */}
      <div className="elevation-card-vendors">
        <div className="elevation-card-vendor-summary">
          <span className="elevation-card-vendor-count">{vendorCount}</span>
          <span className="elevation-card-vendor-label">
            {vendorCount === 1 ? 'Vendor' : 'Vendors'} assigned
          </span>
        </div>

        {/* Quick vendor list preview */}
        <div className="elevation-card-vendor-list">
          {elevation.architectDesigner && (
            <div className="elevation-card-vendor-item">
              <span className="elevation-card-vendor-type">Architect:</span>
              <span className="elevation-card-vendor-name">{elevation.architectDesigner}</span>
              <span className="elevation-card-vendor-date">{formatDate(elevation.architectDesignerDate)}</span>
            </div>
          )}
          {elevation.structuralEngineer && (
            <div className="elevation-card-vendor-item">
              <span className="elevation-card-vendor-type">Structural:</span>
              <span className="elevation-card-vendor-name">{elevation.structuralEngineer}</span>
              <span className="elevation-card-vendor-date">{formatDate(elevation.structuralEngineerDate)}</span>
            </div>
          )}
          {elevation.iJoistCompany && (
            <div className="elevation-card-vendor-item">
              <span className="elevation-card-vendor-type">I-Joist:</span>
              <span className="elevation-card-vendor-name">{elevation.iJoistCompany}</span>
              <span className="elevation-card-vendor-date">{formatDate(elevation.iJoistCompanyDate)}</span>
            </div>
          )}
          {elevation.floorTrussCompany && (
            <div className="elevation-card-vendor-item">
              <span className="elevation-card-vendor-type">Floor Truss:</span>
              <span className="elevation-card-vendor-name">{elevation.floorTrussCompany}</span>
              <span className="elevation-card-vendor-date">{formatDate(elevation.floorTrussCompanyDate)}</span>
            </div>
          )}
          {elevation.roofTrussCompany && (
            <div className="elevation-card-vendor-item">
              <span className="elevation-card-vendor-type">Roof Truss:</span>
              <span className="elevation-card-vendor-name">{elevation.roofTrussCompany}</span>
              <span className="elevation-card-vendor-date">{formatDate(elevation.roofTrussCompanyDate)}</span>
            </div>
          )}
          {elevation.customDetails?.map((detail, index) => (
            <div key={index} className="elevation-card-vendor-item">
              <span className="elevation-card-vendor-type">{detail.label}:</span>
              <span className="elevation-card-vendor-name">{detail.value}</span>
              {detail.date && (
                <span className="elevation-card-vendor-date">{formatDate(detail.date)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="elevation-card-footer">
        <span className="elevation-card-updated">
          Updated {formatDate(elevation.updatedAt)}
        </span>
        {onClick && <span className="elevation-card-arrow">→</span>}
      </div>
    </div>
  );
};

export default ElevationCard;
