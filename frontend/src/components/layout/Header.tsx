import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
        <button
          type="button"
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          <span className="menu-icon" aria-hidden="true">☰</span>
        </button>

        {/* Center - Logo and title */}
        <div className="app-header-brand">
          <h1 className="app-header-title">MindFlow Construction Platform</h1>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="app-header-actions">
          {/* Notifications */}
          <button
            type="button"
            className="header-icon-btn"
            aria-label="Notifications, 3 unread"
          >
            <span className="notification-icon" aria-hidden="true">🔔</span>
            <span className="notification-badge" aria-hidden="true">3</span>
          </button>

          {/* User menu */}
          <div className="user-menu">
            <button
              type="button"
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label={`User menu for ${user?.firstName || 'Guest'}`}
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
