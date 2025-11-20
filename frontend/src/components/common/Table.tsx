import React, { useState } from 'react';

export interface Column<T> {
  key?: string;
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  keyField = 'id' as keyof T,
  onRowClick,
  isLoading = false,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const getColumnKey = (col: Column<T>, index: number): string => {
    return col.key || col.accessor?.toString() || `col-${index}`;
  };

  const handleSort = (key: string) => {
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

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

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

  return (
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
                  onClick={() => col.sortable && handleSort(colKey)}
                >
                  <div className="th-content">
                    {col.header}
                    {col.sortable && sortConfig?.key === colKey && (
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
                  let content: React.ReactNode;

                  if (col.cell) {
                    content = col.cell(item);
                  } else if (col.render) {
                    content = col.render(item);
                  } else if (col.accessor) {
                    content = item[col.accessor];
                  } else {
                    content = '';
                  }

                  return <td key={colKey}>{content}</td>;
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
