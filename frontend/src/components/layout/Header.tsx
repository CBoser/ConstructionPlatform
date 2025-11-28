import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanStats } from '../../services/planService';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);

  // Fetch plan stats for quick access
  const { data: planStats } = usePlanStats();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="app-header">
      <div className="app-header-content">
        {/* Left side - Menu button */}
        <button className="menu-toggle" onClick={onMenuClick}>
          <span className="menu-icon">☰</span>
        </button>

        {/* Center - Logo and title */}
        <div className="app-header-brand">
          <h1 className="app-header-title">MindFlow Construction Platform</h1>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="app-header-actions">
          {/* Quick Stats - Plans */}
          <div className="header-quick-stats">
            <button
              className="header-icon-btn"
              title="Plans Overview"
              onClick={() => setShowQuickStats(!showQuickStats)}
            >
              <span className="stats-icon">📋</span>
              {planStats && planStats.total > 0 && (
                <span className="stats-badge">{planStats.total}</span>
              )}
            </button>

            {showQuickStats && (
              <div className="quick-stats-dropdown">
                <div className="quick-stats-header">
                  <span>Plans Overview</span>
                </div>
                <div className="quick-stats-content">
                  <div className="quick-stat-item">
                    <span className="quick-stat-label">Total Plans</span>
                    <span className="quick-stat-value">{planStats?.total ?? 0}</span>
                  </div>
                  <div className="quick-stat-item">
                    <span className="quick-stat-label">Active Plans</span>
                    <span className="quick-stat-value">{planStats?.activeCount ?? 0}</span>
                  </div>
                  {planStats?.byType && planStats.byType.length > 0 && (
                    <div className="quick-stats-breakdown">
                      <span className="quick-stat-sublabel">By Type:</span>
                      {planStats.byType.slice(0, 3).map((item) => (
                        <div key={item.type} className="quick-stat-type">
                          <span>{item.type.replace(/_/g, ' ')}</span>
                          <span>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="quick-stats-actions">
                  <button
                    className="quick-stats-link"
                    onClick={() => {
                      navigate('/plans');
                      setShowQuickStats(false);
                    }}
                  >
                    View All Plans
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="header-icon-btn" title="Notifications">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>

          {/* User menu */}
          <div className="user-menu">
            <button
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">{getInitials()}</div>
              <div className="user-info">
                <div className="user-name">
                  {user?.firstName || 'Guest User'}
                </div>
                <div className="user-role">{user?.role || 'Visitor'}</div>
              </div>
              <span className="user-menu-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-menu-name">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="user-menu-email">{user?.email || 'Not logged in'}</div>
                </div>
                <div className="user-menu-divider" />
                <a href="/settings" className="user-menu-item">
                  <span>⚙️</span> Settings
                </a>
                <a href="/settings/profile" className="user-menu-item">
                  <span>👤</span> Profile
                </a>
                <div className="user-menu-divider" />
                {user ? (
                  <button className="user-menu-item" onClick={logout}>
                    <span>🚪</span> Logout
                  </button>
                ) : (
                  <a href="/login" className="user-menu-item">
                    <span>🔐</span> Login
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
