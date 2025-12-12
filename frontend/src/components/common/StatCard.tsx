import React from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'warning' | 'success' | 'info';
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, variant = 'default', trend, isLoading }) => {
  return (
    <div className={`stat-card ${variant !== 'default' ? variant : ''} ${isLoading ? 'loading' : ''}`}>
      {isLoading ? (
        <div className="stat-loading">
          <div className="stat-loading-spinner" />
        </div>
      ) : (
        <>
          <div className={`stat-value ${variant !== 'default' ? variant : ''}`}>
            {value}
          </div>
          <div className="stat-label">{label}</div>
          {trend && (
            <div className={`stat-trend trend-${trend.direction}`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatCard;
