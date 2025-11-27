import React from 'react';
import Loading from '../common/Loading';
import type { ElevationVersion } from '../../services/planService';
import { useElevationVersions } from '../../services/planService';

interface ElevationVersionHistoryProps {
  planId: string;
  elevationId: string;
  elevationCode: string;
}

// Format date for display
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

// Get summary of vendor changes in a version
const getVersionSummary = (version: ElevationVersion): string[] => {
  const changes: string[] = [];

  if (version.architectDesigner) {
    changes.push(`Architect: ${version.architectDesigner}`);
  }
  if (version.structuralEngineer) {
    changes.push(`Structural Engineer: ${version.structuralEngineer}`);
  }
  if (version.iJoistCompany) {
    changes.push(`I-Joist: ${version.iJoistCompany}`);
  }
  if (version.floorTrussCompany) {
    changes.push(`Floor Truss: ${version.floorTrussCompany}`);
  }
  if (version.roofTrussCompany) {
    changes.push(`Roof Truss: ${version.roofTrussCompany}`);
  }
  if (version.customDetails?.length) {
    version.customDetails.forEach((detail) => {
      if (detail.label && detail.value) {
        changes.push(`${detail.label}: ${detail.value}`);
      }
    });
  }

  return changes;
};

const ElevationVersionHistory: React.FC<ElevationVersionHistoryProps> = ({
  planId,
  elevationId,
  elevationCode,
}) => {
  const { data: versions, isLoading, error } = useElevationVersions(planId, elevationId);

  if (isLoading) {
    return (
      <div className="version-history-loading">
        <Loading size="sm" />
        <span>Loading version history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="version-history-error">
        <p>Failed to load version history.</p>
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="version-history-empty">
        <p>No version history available for this elevation.</p>
      </div>
    );
  }

  return (
    <div className="version-history">
      <div className="version-history-header">
        <h4 className="version-history-title">
          Version History - Elevation {elevationCode}
        </h4>
        <span className="version-history-count">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      <div className="version-history-timeline">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className={`version-history-item ${index === 0 ? 'version-history-item-current' : ''}`}
          >
            <div className="version-history-marker">
              <span className="version-history-dot" />
              {index < versions.length - 1 && <span className="version-history-line" />}
            </div>

            <div className="version-history-content">
              <div className="version-history-item-header">
                <span className="version-history-version">
                  v{version.version}
                  {index === 0 && <span className="version-history-badge">Current</span>}
                </span>
                <span className="version-history-date">
                  {formatDateTime(version.createdAt)}
                </span>
              </div>

              {version.changedBy && (
                <div className="version-history-changed-by">
                  Changed by: {version.changedBy}
                </div>
              )}

              {version.changeNotes && (
                <div className="version-history-notes">
                  <strong>Notes:</strong> {version.changeNotes}
                </div>
              )}

              <div className="version-history-details">
                {getVersionSummary(version).map((change, i) => (
                  <span key={i} className="version-history-detail">
                    {change}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElevationVersionHistory;
