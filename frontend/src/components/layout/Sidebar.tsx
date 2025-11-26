import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  {
    path: '/foundation',
    label: 'Foundation',
    icon: '🏗️',
    children: [
      { path: '/foundation/customers', label: 'Customers', icon: '👥' },
      { path: '/foundation/plans', label: 'Plans', icon: '📋' },
      { path: '/foundation/materials', label: 'Materials', icon: '📦' },
    ],
  },
  {
    path: '/operations',
    label: 'Operations',
    icon: '⚙️',
    children: [
      { path: '/operations/jobs', label: 'Jobs', icon: '🏗️' },
      { path: '/operations/takeoffs', label: 'Takeoffs', icon: '📐' },
    ],
  },
  {
    path: '/transactions',
    label: 'Transactions',
    icon: '💼',
    children: [
      { path: '/transactions/purchase-orders', label: 'Purchase Orders', icon: '📋' },
      { path: '/transactions/schedule', label: 'Schedule', icon: '📅' },
    ],
  },
  {
    path: '/tools',
    label: 'Tools',
    icon: '🛠️',
    children: [
      { path: '/tools/spreadsheet-extractor', label: 'Spreadsheet Extractor', icon: '📊' },
    ],
  },
  { path: '/reports', label: 'Reports', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const active = isActive(item.path);
    const expanded = expandedItems.includes(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.path}>
        {hasChildren ? (
          <button
            className={`nav-item ${active ? 'active' : ''}`}
            style={{ paddingLeft: `${level * 16 + 16}px` }}
            onClick={() => toggleExpand(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className={`nav-expand ${expanded ? 'expanded' : ''}`}>
              {expanded ? '▼' : '▶'}
            </span>
          </button>
        ) : (
          <Link
            to={item.path}
            className={`nav-item ${active ? 'active' : ''}`}
            style={{ paddingLeft: `${level * 16 + 16}px` }}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        )}

        {hasChildren && expanded && (
          <div className="nav-children">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">MindFlow</h2>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">v1.0.0</div>
          <div className="sidebar-copyright">© 2025 MindFlow</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
