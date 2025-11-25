import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';

const PurchaseOrders: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage purchase orders and vendor transactions"
        breadcrumbs={[
          { label: 'Transactions', path: '/transactions' },
          { label: 'Purchase Orders' },
        ]}
        actions={
          <Button variant="primary">
            + Create PO
          </Button>
        }
      />

      <div className="section">
        <p>Purchase Orders interface coming soon...</p>
        <p className="text-gray-500 mt-4">
          This will include PO creation, approval workflow, vendor management, and delivery tracking.
        </p>
      </div>
    </div>
  );
};

export default PurchaseOrders;
