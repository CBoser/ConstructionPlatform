import React, { useState } from 'react';
import Button from '../common/Button';
import Table from '../common/Table';
import Card from '../common/Card';
import { useToast } from '../common/Toast';
import ExternalIdFormModal from './ExternalIdFormModal';
import {
  useCustomerExternalIds,
  useDeleteExternalId,
} from '../../services/customerService';
import type { CustomerExternalId } from '../../../../shared/types/customer';

interface ExternalIdManagerProps {
  customerId: string;
  onRefresh?: () => void;
}

const ExternalIdManager: React.FC<ExternalIdManagerProps> = ({
  customerId,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExternalId, setSelectedExternalId] =
    useState<CustomerExternalId | null>(null);

  // Fetch external IDs
  const { data: externalIds, isLoading, error, refetch } = useCustomerExternalIds(customerId);

  // Delete mutation
  const deleteExternalId = useDeleteExternalId();

  // Format system name for display
  const formatSystemName = (system: string): string => {
    const systemMap: Record<string, string> = {
      SALES_1440: 'Sales 1440',
      HYPHEN_BUILDPRO: 'Hyphen BuildPro',
      HOLT_BUILDER_PORTAL: 'Holt Builder Portal',
      OTHER: 'Other',
    };
    return systemMap[system] || system;
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle add mapping
  const handleAddMapping = () => {
    setSelectedExternalId(null);
    setIsModalOpen(true);
  };

  // Handle edit mapping
  const handleEditMapping = (externalId: CustomerExternalId) => {
    setSelectedExternalId(externalId);
    setIsModalOpen(true);
  };

  // Handle delete mapping
  const handleDeleteMapping = async (externalId: CustomerExternalId) => {
    if (
      !confirm(
        `Are you sure you want to delete the mapping for ${formatSystemName(externalId.externalSystem)}?`
      )
    ) {
      return;
    }

    try {
      await deleteExternalId.mutateAsync({
        customerId,
        externalIdId: externalId.id,
      });

      showToast('External ID mapping deleted successfully', 'success');
      refetch();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error deleting external ID mapping:', error);
      const errorMessage =
        error.data?.error || error.message || 'Failed to delete external ID mapping';
      showToast(errorMessage, 'error');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedExternalId(null);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    refetch();
    onRefresh?.();
  };

  // Table columns
  const columns = [
    {
      header: 'System',
      accessor: 'externalSystem' as keyof CustomerExternalId,
      cell: (externalId: CustomerExternalId) => (
        <div className="external-system-cell">
          <strong>{formatSystemName(externalId.externalSystem)}</strong>
          {externalId.isPrimary && (
            <span className="badge badge-primary ml-2">Primary</span>
          )}
        </div>
      ),
    },
    {
      header: 'External ID',
      accessor: 'externalCustomerId' as keyof CustomerExternalId,
      cell: (externalId: CustomerExternalId) => (
        <span className="monospace">{externalId.externalCustomerId}</span>
      ),
    },
    {
      header: 'External Name',
      accessor: 'externalCustomerName' as keyof CustomerExternalId,
      cell: (externalId: CustomerExternalId) =>
        externalId.externalCustomerName || '—',
    },
    {
      header: 'Date Added',
      accessor: 'createdAt' as keyof CustomerExternalId,
      cell: (externalId: CustomerExternalId) =>
        formatDate(externalId.createdAt),
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof CustomerExternalId,
      cell: (externalId: CustomerExternalId) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditMapping(externalId)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteMapping(externalId)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div className="error-container">
          <p className="text-danger">
            Failed to load external ID mappings. Please try again.
          </p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="card-header-with-actions">
          <div>
            <h3 className="card-title">External System Mappings</h3>
            <p className="card-description">
              Link this customer to external systems for bidirectional synchronization
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleAddMapping}>
            + Add Mapping
          </Button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : externalIds && externalIds.length > 0 ? (
          <Table columns={columns} data={externalIds} />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <h3>No external mappings yet</h3>
            <p>
              Connect this customer to external systems like Hyphen BuildPro or
              Holt Builder Portal to enable automatic synchronization
            </p>
            <Button variant="primary" onClick={handleAddMapping}>
              + Add First Mapping
            </Button>
          </div>
        )}

        <div className="external-id-help">
          <h4>💡 Why External ID Mappings?</h4>
          <ul>
            <li>
              <strong>Bidirectional Sync:</strong> Automatically sync customer data
              between MindFlow and external systems
            </li>
            <li>
              <strong>Avoid Duplicates:</strong> Ensure the same customer isn't created
              multiple times in different systems
            </li>
            <li>
              <strong>Track Changes:</strong> Know which external records correspond to
              which customers in MindFlow
            </li>
          </ul>
          <p className="text-gray-600 mt-2">
            <strong>Example:</strong> If Richmond American Homes is customer "RICH-001"
            in Hyphen BuildPro, create a mapping here so data stays in sync.
          </p>
        </div>
      </Card>

      {/* External ID Form Modal */}
      <ExternalIdFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        customerId={customerId}
        externalId={selectedExternalId}
        existingMappings={externalIds || []}
        onSuccess={handleModalSuccess}
      />
    </>
  );
};

export default ExternalIdManager;
