import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';

const Schedule: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="Manage delivery schedules and timelines"
        breadcrumbs={[
          { label: 'Transactions', path: '/transactions' },
          { label: 'Schedule' },
        ]}
        actions={
          <Button variant="primary">
            + Schedule Delivery
          </Button>
        }
      />

      <div className="section">
        <p>Schedule interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include delivery scheduling, calendar view, and timeline management.
        </p>
      </div>
    </div>
  );
};

export default Schedule;
