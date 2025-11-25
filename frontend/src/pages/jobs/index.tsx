import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';

const Jobs: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle="Manage construction jobs and schedules"
        breadcrumbs={[
          { label: 'Operations', path: '/operations' },
          { label: 'Jobs' },
        ]}
        actions={
          <Button variant="primary">
            + Create Job
          </Button>
        }
      />

      <div className="section">
        <p>Jobs management interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include job creation, scheduling, status tracking, and variance analysis.
        </p>
      </div>
    </div>
  );
};

export default Jobs;
