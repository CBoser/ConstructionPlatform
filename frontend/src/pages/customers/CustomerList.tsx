import React, { useState, useMemo } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import CustomerCard from '../../components/common/CustomerCard';
import { useToast } from '../../components/common/Toast';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import CustomerDetailModal from '../../components/customers/CustomerDetailModal';
import {
  useCustomers,
  useDeleteCustomer,
  fetchCustomerById,
} from '../../services/customerService';
import type {
  Customer,
  CustomerFull,
  CustomerType,
  ListCustomersQuery,
} from '../../../../shared/types/customer';

type ViewMode = 'cards' | 'table';

const CustomerList: React.FC = () => {
  const { showToast } = useToast();

  // Filter state
  const [search, setSearch] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<
    CustomerType | ''
  >('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    true
  );
  const [page, setPage] = useState(1);
  const limit = 20;

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerFull | null>(
    null
  );

  // Detail modal state
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<CustomerFull | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Build query
  const query: ListCustomersQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      customerType: customerTypeFilter || undefined,
      isActive: isActiveFilter,
    }),
    [page, limit, search, customerTypeFilter, isActiveFilter]
  );

  // Fetch customers
  const { data, isLoading, error, refetch } = useCustomers(query);
  const deleteCustomer = useDeleteCustomer();

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  // Handle filter changes
  const handleTypeFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCustomerTypeFilter(e.target.value as CustomerType | '');
    setPage(1);
  };

  const handleActiveFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setIsActiveFilter(
      value === '' ? undefined : value === 'true' ? true : false
    );
    setPage(1);
  };

  // Handle add customer
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  // Handle click on customer card/row to open detail modal
  const handleCustomerClick = async (customer: Customer) => {
    try {
      // Fetch full customer details for the modal
      const fullCustomer = await fetchCustomerById(customer.id);
      setSelectedDetailCustomer(fullCustomer);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      showToast('Failed to load customer details', 'error');
    }
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailCustomer(null);
  };

  // Handle edit from detail modal
  const handleEditFromModal = (customer: Customer) => {
    setSelectedCustomer(customer as CustomerFull);
    setIsModalOpen(true);
    setIsDetailModalOpen(false);
  };

  // Handle archive/activate customer
  const handleArchiveCustomer = async (customer: Customer) => {
    if (
      !confirm(
        `Are you sure you want to ${customer.isActive ? 'archive' : 'activate'} "${customer.customerName}"?`
      )
    ) {
      return;
    }

    try {
      await deleteCustomer.mutateAsync({
        id: customer.id,
        hardDelete: false,
      });

      showToast(
        `Customer ${customer.isActive ? 'archived' : 'activated'} successfully`,
        'success'
      );
      refetch();
    } catch (error: unknown) {
      console.error('Error archiving customer:', error);
      const apiError = error as { data?: { error?: string }; message?: string };
      const errorMessage =
        apiError?.data?.error || apiError?.message || 'Failed to archive customer';
      showToast(errorMessage, 'error');
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    refetch();
  };

  // Format customer type for display
  const formatCustomerType = (type: CustomerType): string => {
    const typeMap: Record<CustomerType, string> = {
      PRODUCTION: 'Production',
      SEMI_CUSTOM: 'Semi-Custom',
      FULL_CUSTOM: 'Full Custom',
    };
    return typeMap[type] || type;
  };

  // Table columns
  const columns = [
    {
      header: 'Customer Name',
      accessor: 'customerName' as keyof Customer,
      cell: (customer: Customer) => (
        <button
          className="link-button"
          onClick={() => handleCustomerClick(customer)}
        >
          {customer.customerName}
        </button>
      ),
    },
    {
      header: 'Type',
      accessor: 'customerType' as keyof Customer,
      cell: (customer: Customer) => (
        <span className={`badge badge-${getTypeVariant(customer.customerType)}`}>
          {formatCustomerType(customer.customerType)}
        </span>
      ),
    },
    {
      header: 'Pricing Tier',
      accessor: 'pricingTier' as keyof Customer,
      cell: (customer: Customer) => customer.pricingTier || '—',
    },
    {
      header: 'Status',
      accessor: 'isActive' as keyof Customer,
      cell: (customer: Customer) => (
        <span className={`badge badge-${customer.isActive ? 'success' : 'secondary'}`}>
          {customer.isActive ? 'Active' : 'Archived'}
        </span>
      ),
    },
  ];

  // Get badge variant based on customer type
  const getTypeVariant = (type: string): string => {
    const variantMap: Record<string, string> = {
      PRODUCTION: 'primary',
      SEMI_CUSTOM: 'warning',
      FULL_CUSTOM: 'info',
    };
    return variantMap[type] || 'secondary';
  };

  // Compute stats from data
  const stats = useMemo(() => {
    if (!data?.data) {
      return { total: 0, active: 0, production: 0, semiCustom: 0, fullCustom: 0 };
    }
    const customers = data.data;
    return {
      total: data.pagination.total,
      active: customers.filter((c) => c.isActive).length,
      production: customers.filter((c) => c.customerType === 'PRODUCTION').length,
      semiCustom: customers.filter((c) => c.customerType === 'SEMI_CUSTOM').length,
      fullCustom: customers.filter((c) => c.customerType === 'FULL_CUSTOM').length,
    };
  }, [data]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <PageHeader
        title="Builders"
        subtitle="Manage your builder/customer database"
        breadcrumbs={[
          { label: 'Foundation', path: '/foundation' },
          { label: 'Builders' },
        ]}
        actions={
          <Button variant="primary" onClick={handleAddCustomer}>
            + Add Builder
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Builders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.production}</div>
          <div className="stat-label">Production</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.semiCustom}</div>
          <div className="stat-label">Semi-Custom</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.fullCustom}</div>
          <div className="stat-label">Full Custom</div>
        </div>
      </div>

      <div className="section">
        <Card>
          {/* Filters */}
          <div className="filters-bar">
            <div className="filters-row">
              <Input
                placeholder="Search builders..."
                value={search}
                onChange={handleSearchChange}
                className="search-input"
              />

              <Input
                inputType="select"
                value={customerTypeFilter}
                onChange={handleTypeFilterChange}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'PRODUCTION', label: 'Production' },
                  { value: 'SEMI_CUSTOM', label: 'Semi-Custom' },
                  { value: 'FULL_CUSTOM', label: 'Full Custom' },
                ]}
              />

              <Input
                inputType="select"
                value={
                  isActiveFilter === undefined
                    ? ''
                    : isActiveFilter
                      ? 'true'
                      : 'false'
                }
                onChange={handleActiveFilterChange}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Archived' },
                ]}
              />

              {/* View Toggle */}
              <div className="view-toggle">
                <Button
                  variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  title="Card View"
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  Table
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="loading-container">
              <Loading size="lg" />
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="text-danger">
                Failed to load builders. Please try again.
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              {viewMode === 'cards' ? (
                <div className="cards-grid">
                  {data.data.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      customerName={customer.customerName}
                      customerType={customer.customerType}
                      pricingTier={customer.pricingTier}
                      isActive={customer.isActive}
                      onClick={() => handleCustomerClick(customer)}
                    />
                  ))}
                </div>
              ) : (
                <Table columns={columns} data={data.data} />
              )}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {(page - 1) * limit + 1} to{' '}
                    {Math.min(page * limit, data.pagination.total)} of{' '}
                    {data.pagination.total} builders
                  </div>

                  <div className="pagination-controls">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>

                    <div className="pagination-pages">
                      {Array.from(
                        { length: data.pagination.totalPages },
                        (_, i) => i + 1
                      )
                        .filter((p) => {
                          // Show first page, last page, current page, and adjacent pages
                          return (
                            p === 1 ||
                            p === data.pagination.totalPages ||
                            Math.abs(p - page) <= 1
                          );
                        })
                        .map((p, i, arr) => (
                          <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="pagination-ellipsis">...</span>
                            )}
                            <Button
                              variant={p === page ? 'primary' : 'ghost'}
                              size="sm"
                              onClick={() => handlePageChange(p)}
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h3>No builders found</h3>
              <p>
                {search || customerTypeFilter || isActiveFilter !== undefined
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first builder'}
              </p>
              {!search && !customerTypeFilter && (
                <Button variant="primary" onClick={handleAddCustomer}>
                  + Add Builder
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        customer={selectedCustomer}
        onSuccess={handleModalSuccess}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedDetailCustomer}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromModal}
        onArchive={handleArchiveCustomer}
      />
    </div>
  );
};

export default CustomerList;
