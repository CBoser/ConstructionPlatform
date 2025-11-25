import React from 'react';
import PageHeader from '../../components/layout/PageHeader';

const Reports: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="View insights and performance metrics"
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <div className="section">
        <p>Reports and analytics interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include variance analysis, cost tracking, performance metrics, and custom reports.
        </p>
      </div>
    </div>
  );
};

export default Reports;
