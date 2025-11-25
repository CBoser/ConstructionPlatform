import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';

const Plans: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle="Manage plan templates and takeoff items"
        breadcrumbs={[
          { label: 'Foundation', path: '/foundation' },
          { label: 'Plans' },
        ]}
        actions={
          <Button variant="primary">
            + Add Plan Template
          </Button>
        }
      />

      <div className="section">
        <p>Plan template management interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include plan template creation, takeoff items, and variance tracking.
        </p>
      </div>
    </div>
  );
};

export default Plans;
