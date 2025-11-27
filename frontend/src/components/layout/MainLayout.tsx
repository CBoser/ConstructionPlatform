import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import NetworkStatusIndicator from '../common/NetworkStatusIndicator';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout - Main application layout wrapper
 *
 * Mobile-first design with:
 * - Collapsible sidebar (off-canvas on mobile)
 * - Sticky header with hamburger menu
 * - Bottom navigation for mobile (thumb-friendly)
 * - Network status indicator for offline awareness
 * - Safe area handling for notched devices
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Network Status Banner - shows when offline */}
      <NetworkStatusIndicator />

      {/* Side Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="app-content">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
