import React from 'react';

interface CustomerCardProps {
  customerName: string;
  customerType: string;
  pricingTier?: string | null;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  communityCount?: number;
  planCount?: number;
  jobCount?: number;
  isActive?: boolean;
  isSelected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
}

// Format customer type for display
const formatCustomerType = (type: string): string => {
  const typeMap: Record<string, string> = {
    PRODUCTION: 'Production',
    SEMI_CUSTOM: 'Semi-Custom',
    FULL_CUSTOM: 'Full Custom',
  };
  return typeMap[type] || type;
};

// Get badge variant based on customer type
const getTypeVariant = (type: string): string => {
  const variantMap: Record<string, string> = {
    PRODUCTION: 'primary',
    SEMI_CUSTOM: 'warning',
    FULL_CUSTOM: 'info',
  };
  return variantMap[type] || 'secondary';
};

const CustomerCard: React.FC<CustomerCardProps> = ({
  customerName,
  customerType,
  pricingTier,
  primaryContactName,
  primaryContactEmail,
  communityCount = 0,
  planCount = 0,
  jobCount = 0,
  isActive = true,
  isSelected = false,
  selectable = false,
  onClick,
}) => {
  return (
    <div
      className={`customer-card customer-card-clickable ${isSelected ? 'customer-card-selected' : ''} ${selectable ? 'customer-card-selectable' : ''}`}
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
      <div className="customer-card-header">
        <div className="customer-card-title">
          <span className="customer-card-name">{customerName}</span>
        </div>
        <span className={`badge badge-${isActive ? 'success' : 'secondary'}`}>
          {isActive ? 'Active' : 'Archived'}
        </span>
      </div>

      <div className="customer-card-type">
        <span className={`badge badge-${getTypeVariant(customerType)}`}>
          {formatCustomerType(customerType)}
        </span>
        {pricingTier && (
          <span className="customer-card-tier">{pricingTier}</span>
        )}
      </div>

      {(primaryContactName || primaryContactEmail) && (
        <div className="customer-card-contact">
          {primaryContactName && (
            <span className="customer-card-contact-name">{primaryContactName}</span>
          )}
          {primaryContactEmail && (
            <span className="customer-card-contact-email">{primaryContactEmail}</span>
          )}
        </div>
      )}

      <div className="customer-card-details">
        <div className="customer-card-detail">
          <span className="customer-card-detail-label">Communities</span>
          <span className="customer-card-detail-value">{communityCount}</span>
        </div>
        <div className="customer-card-detail">
          <span className="customer-card-detail-label">Plans</span>
          <span className="customer-card-detail-value">{planCount}</span>
        </div>
        <div className="customer-card-detail">
          <span className="customer-card-detail-label">Jobs</span>
          <span className="customer-card-detail-value">{jobCount}</span>
        </div>
      </div>

      <div className="customer-card-footer">
        <div className="customer-card-stats">
          <span className="customer-card-stat">View Details</span>
        </div>
        <span className="customer-card-arrow">→</span>
      </div>

      {selectable && isSelected && (
        <div className="customer-card-check">
          <span className="customer-card-check-icon">✓</span>
        </div>
      )}
    </div>
  );
};

export default CustomerCard;
