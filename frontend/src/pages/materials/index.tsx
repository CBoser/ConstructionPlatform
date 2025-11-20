import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';

const Materials: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Materials"
        subtitle="Manage materials catalog and pricing"
        breadcrumbs={[
          { label: 'Foundation', path: '/foundation' },
          { label: 'Materials' },
        ]}
        actions={
          <Button variant="primary">
            + Add Material
          </Button>
        }
      />

      <div className="section">
        <p>Materials management interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include materials catalog, pricing history, vendor relationships, and unit conversions.
        </p>
      </div>
    </div>
  );
};

export default Materials;
