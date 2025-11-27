import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/operations/jobs', label: 'Jobs', icon: '🏗️' },
  { path: '/transactions/purchase-orders', label: 'Orders', icon: '📋' },
  { path: '/foundation/customers', label: 'Builders', icon: '👥' },
];

interface BottomNavProps {
  alertCount?: number;
}

/**
 * BottomNav - Mobile-optimized bottom navigation bar
 *
 * Designed for field workers who need quick access to key features
 * while holding their phone with one hand.
 *
 * Features:
 * - Thumb-friendly 56px+ touch targets
 * - Shows only essential navigation items
 * - Active state indicator
 * - Badge support for notifications
 * - Safe area inset handling for notched devices
 */
const BottomNav: React.FC<BottomNavProps> = ({ alertCount = 0 }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav" aria-label="Primary mobile navigation">
      <ul className="bottom-nav-items">
        {navItems.map((item) => (
          <li key={item.path} className="bottom-nav-item">
            <Link
              to={item.path}
              className={`bottom-nav-link ${isActive(item.path) ? 'active' : ''}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span className="bottom-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="bottom-nav-label">{item.label}</span>
              {item.label === 'Alerts' && alertCount > 0 && (
                <span className="bottom-nav-badge" aria-label={`${alertCount} alerts`}>
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
