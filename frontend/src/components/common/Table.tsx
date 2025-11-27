import React, { useState } from 'react';

export interface Column<T> {
  key?: string;
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  /**
   * Priority for mobile card view (lower = shown first)
   * Columns with priority 1-2 are always visible in card header
   * Priority 3+ shown in expandable details
   */
  mobilePriority?: number;
  /**
   * Hide this column in mobile card view
   */
  hideOnMobile?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  /**
   * Enable responsive card view on mobile
   * Cards are touch-friendly and show key data without horizontal scroll
   */
  mobileCardView?: boolean;
  /**
   * Title accessor for mobile card view (shown prominently)
   */
  mobileCardTitle?: keyof T | ((item: T) => React.ReactNode);
  /**
   * Status accessor for mobile card view (shown as badge)
   */
  mobileCardStatus?: (item: T) => React.ReactNode;
}

/**
 * Table Component - Mobile-optimized data table
 *
 * Features:
 * - Responsive: transforms into cards on mobile
 * - Touch-friendly row/card interactions
 * - Sortable columns
 * - Loading state
 * - Empty state
 *
 * Mobile card view shows:
 * - Title prominently at top
 * - Status badge (if provided)
 * - Key data fields in label/value pairs
 */
function Table<T extends object>({
  data,
  columns,
  keyField = 'id' as keyof T,
  onRowClick,
  isLoading = false,
  mobileCardView = true,
  mobileCardTitle,
  mobileCardStatus,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  const getColumnKey = (col: Column<T>, index: number): string => {
    return col.key || col.accessor?.toString() || `col-${index}`;
  };

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal == null) return sortConfig.direction === 'asc' ? -1 : 1;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Get cell content for an item and column
  const getCellContent = (item: T, col: Column<T>): React.ReactNode => {
    if (col.cell) {
      return col.cell(item);
    } else if (col.render) {
      return col.render(item);
    } else if (col.accessor) {
      const value = item[col.accessor];
      return value != null ? String(value) : '';
    }
    return '';
  };

  // Get title for mobile card
  const getCardTitle = (item: T): React.ReactNode => {
    if (!mobileCardTitle) {
      // Default: use first column
      const firstCol = columns[0];
      return getCellContent(item, firstCol);
    }

    if (typeof mobileCardTitle === 'function') {
      return mobileCardTitle(item);
    }

    return String(item[mobileCardTitle] ?? '');
  };

  // Filter columns for mobile card display
  const mobileColumns = columns
    .filter((col) => !col.hideOnMobile)
    .sort((a, b) => (a.mobilePriority || 99) - (b.mobilePriority || 99))
    .slice(1); // Skip first column (used as title)

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Render mobile card view
  const renderMobileCards = () => (
    <div className="table-mobile-view">
      {sortedData.length === 0 ? (
        <div className="empty-state">
          <p>No data available</p>
        </div>
      ) : (
        sortedData.map((item) => (
          <div
            key={String(item[keyField])}
            className={`mobile-data-card ${onRowClick ? 'clickable' : ''}`}
            onClick={() => onRowClick?.(item)}
            role={onRowClick ? 'button' : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onRowClick(item);
              }
            }}
          >
            <div className="mobile-data-card-header">
              <h4 className="mobile-data-card-title">{getCardTitle(item)}</h4>
              {mobileCardStatus && (
                <div className="mobile-data-card-status">
                  {mobileCardStatus(item)}
                </div>
              )}
            </div>

            <div className="mobile-data-card-body">
              {mobileColumns.slice(0, 4).map((col, index) => {
                const colKey = getColumnKey(col, index);
                return (
                  <div key={colKey} className="mobile-data-card-row">
                    <span className="mobile-data-card-label">{col.header}</span>
                    <span className="mobile-data-card-value">
                      {getCellContent(item, col)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Render desktop table view
  const renderTable = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, index) => {
              const colKey = getColumnKey(col, index);
              return (
                <th
                  key={colKey}
                  style={{ width: col.width }}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={() => col.sortable && col.accessor && handleSort(col.accessor)}
                >
                  <div className="th-content">
                    {col.header}
                    {col.sortable && sortConfig && sortConfig.key === col.accessor && (
                      <span className="sort-icon">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No data available
              </td>
            </tr>
          ) : (
            sortedData.map((item) => (
              <tr
                key={String(item[keyField])}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.map((col, index) => {
                  const colKey = getColumnKey(col, index);
                  return <td key={colKey}>{getCellContent(item, col)}</td>;
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={mobileCardView ? 'table-responsive' : ''}>
      {renderTable()}
      {mobileCardView && renderMobileCards()}
    </div>
  );
}

export default Table;
