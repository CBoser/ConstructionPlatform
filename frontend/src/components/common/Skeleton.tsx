import React from 'react';

interface SkeletonProps {
  /**
   * Type of skeleton to render
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /**
   * Width of the skeleton (CSS value)
   */
  width?: string | number;
  /**
   * Height of the skeleton (CSS value)
   */
  height?: string | number;
  /**
   * Animation type
   */
  animation?: 'pulse' | 'wave' | 'none';
  /**
   * Additional CSS class
   */
  className?: string;
  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Skeleton - Loading placeholder component
 *
 * Features:
 * - Multiple variants (text, circular, rectangular, rounded)
 * - Pulse and wave animations
 * - Customizable dimensions
 * - Accessible (aria-hidden)
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  style,
}) => {
  const variantClass = `skeleton-${variant}`;
  const animationClass = animation !== 'none' ? `skeleton-${animation}` : '';

  const computedStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={`skeleton ${variantClass} ${animationClass} ${className}`}
      style={computedStyle}
      aria-hidden="true"
    />
  );
};

// ============================================================================
// Pre-built skeleton patterns for common use cases
// ============================================================================

interface SkeletonCardProps {
  className?: string;
}

/**
 * Skeleton card matching the card component layout
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`} aria-hidden="true">
    <div className="skeleton-card-header">
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="rounded" width={60} height={24} />
    </div>
    <Skeleton variant="text" width="80%" height={16} />
    <Skeleton variant="text" width="40%" height={14} />
    <div className="skeleton-card-details">
      <Skeleton variant="text" width="30%" height={14} />
      <Skeleton variant="text" width="30%" height={14} />
      <Skeleton variant="text" width="30%" height={14} />
    </div>
    <div className="skeleton-card-footer">
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="circular" width={24} height={24} />
    </div>
  </div>
);

/**
 * Skeleton table row
 */
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({
  columns = 5,
}) => (
  <tr className="skeleton-table-row" aria-hidden="true">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index}>
        <Skeleton variant="text" width="80%" height={16} />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton list item
 */
export const SkeletonListItem: React.FC = () => (
  <div className="skeleton-list-item" aria-hidden="true">
    <Skeleton variant="circular" width={40} height={40} />
    <div className="skeleton-list-item-content">
      <Skeleton variant="text" width="70%" height={16} />
      <Skeleton variant="text" width="50%" height={14} />
    </div>
  </div>
);

/**
 * Skeleton for form fields
 */
export const SkeletonFormField: React.FC = () => (
  <div className="skeleton-form-field" aria-hidden="true">
    <Skeleton variant="text" width={100} height={14} />
    <Skeleton variant="rounded" width="100%" height={44} />
  </div>
);

/**
 * Skeleton for stats/metric cards
 */
export const SkeletonStatCard: React.FC = () => (
  <div className="skeleton-stat-card" aria-hidden="true">
    <Skeleton variant="text" width="60%" height={14} />
    <Skeleton variant="text" width="40%" height={32} />
    <Skeleton variant="text" width="30%" height={12} />
  </div>
);

/**
 * Skeleton for page header
 */
export const SkeletonPageHeader: React.FC = () => (
  <div className="skeleton-page-header" aria-hidden="true">
    <div className="skeleton-page-header-left">
      <Skeleton variant="text" width={200} height={28} />
      <Skeleton variant="text" width={300} height={16} />
    </div>
    <div className="skeleton-page-header-right">
      <Skeleton variant="rounded" width={120} height={44} />
    </div>
  </div>
);

/**
 * Full page skeleton loader
 */
interface SkeletonPageProps {
  /**
   * Show header skeleton
   */
  showHeader?: boolean;
  /**
   * Number of card skeletons to show
   */
  cardCount?: number;
  /**
   * Number of table rows to show
   */
  tableRows?: number;
  /**
   * Type of content skeleton
   */
  type?: 'cards' | 'table' | 'list' | 'form';
}

export const SkeletonPage: React.FC<SkeletonPageProps> = ({
  showHeader = true,
  cardCount = 6,
  tableRows = 5,
  type = 'cards',
}) => (
  <div className="skeleton-page" aria-label="Loading content" role="status">
    {showHeader && <SkeletonPageHeader />}

    {type === 'cards' && (
      <div className="skeleton-card-grid">
        {Array.from({ length: cardCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )}

    {type === 'table' && (
      <div className="skeleton-table-container">
        <table className="skeleton-table">
          <tbody>
            {Array.from({ length: tableRows }).map((_, index) => (
              <SkeletonTableRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    )}

    {type === 'list' && (
      <div className="skeleton-list">
        {Array.from({ length: cardCount }).map((_, index) => (
          <SkeletonListItem key={index} />
        ))}
      </div>
    )}

    {type === 'form' && (
      <div className="skeleton-form">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonFormField key={index} />
        ))}
      </div>
    )}
  </div>
);

export default Skeleton;
