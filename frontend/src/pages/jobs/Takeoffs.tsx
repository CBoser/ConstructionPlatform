import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';

const Takeoffs: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Takeoffs"
        subtitle="Manage material takeoffs and estimates"
        breadcrumbs={[
          { label: 'Operations', path: '/operations' },
          { label: 'Takeoffs' },
        ]}
        actions={
          <Button variant="primary">
            + New Takeoff
          </Button>
        }
      />

      <div className="section">
        <p>Takeoffs interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include takeoff creation, material calculations, and bid generation.
        </p>
      </div>
    </div>
  );
};

export default Takeoffs;
