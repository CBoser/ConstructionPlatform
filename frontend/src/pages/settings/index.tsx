import React from 'react';
import PageHeader from '../components/layout/PageHeader';

const Settings: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure system preferences and user profile"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <div className="section">
        <h3 className="section-title">User Profile</h3>
        <p>Profile settings coming soon...</p>
      </div>

      <div className="section">
        <h3 className="section-title">System Configuration</h3>
        <p>System configuration coming soon...</p>
      </div>
    </div>
  );
};

export default Settings;
