import React, { useState, useMemo } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import PlanCard from '../../components/common/PlanCard';
import { useToast } from '../../components/common/Toast';
import {
  usePlans,
  useDeletePlan,
  usePlanStats,
  type Plan,
  type PlanType,
  type ListPlansQuery,
} from '../../services/planService';

type ViewMode = 'table' | 'cards';

const Plans: React.FC = () => {
  const { showToast } = useToast();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PlanType | ''>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [page, setPage] = useState(1);
  const limit = viewMode === 'cards' ? 12 : 20;

  // Build query
  const query: ListPlansQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      type: typeFilter || undefined,
      isActive: isActiveFilter,
      sortBy: 'code',
      sortOrder: 'asc',
    }),
    [page, limit, search, typeFilter, isActiveFilter]
  );

  // Fetch plans and stats
  const { data, isLoading, error, refetch } = usePlans(query);
  const { data: stats } = usePlanStats();
  const deletePlan = useDeletePlan();

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle filter changes
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as PlanType | '');
    setPage(1);
  };

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIsActiveFilter(
      value === '' ? undefined : value === 'true' ? true : false
    );
    setPage(1);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(1);
  };

  // Handle delete plan
  const handleDeletePlan = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete plan "${plan.code}"?`)) {
      return;
    }

    try {
      await deletePlan.mutateAsync(plan.id);
      showToast('Plan deleted successfully', 'success');
      refetch();
    } catch (error: unknown) {
      console.error('Error deleting plan:', error);
      const apiError = error as { data?: { error?: string }; message?: string };
      const errorMessage =
        apiError?.data?.error || apiError?.message || 'Failed to delete plan';
      showToast(errorMessage, 'error');
    }
  };

  // Format plan type for display
  const formatPlanType = (type: PlanType): string => {
    const typeMap: Record<PlanType, string> = {
      SINGLE_STORY: 'Single Story',
      TWO_STORY: 'Two Story',
      THREE_STORY: 'Three Story',
      DUPLEX: 'Duplex',
      TOWNHOME: 'Townhome',
    };
    return typeMap[type] || type;
  };

  // Table columns
  const columns = [
    {
      header: 'Plan Code',
      accessor: 'code' as keyof Plan,
      cell: (plan: Plan) => (
        <span className="font-medium">{plan.code}</span>
      ),
      sortable: true,
    },
    {
      header: 'Name',
      accessor: 'name' as keyof Plan,
      cell: (plan: Plan) => plan.name || '—',
    },
    {
      header: 'Type',
      accessor: 'type' as keyof Plan,
      cell: (plan: Plan) => formatPlanType(plan.type),
    },
    {
      header: 'Sq Ft',
      accessor: 'sqft' as keyof Plan,
      cell: (plan: Plan) =>
        plan.sqft ? plan.sqft.toLocaleString() : '—',
      sortable: true,
    },
    {
      header: 'Bed/Bath',
      accessor: 'bedrooms' as keyof Plan,
      cell: (plan: Plan) => {
        const bed = plan.bedrooms ?? '—';
        const bath = plan.bathrooms ?? '—';
        return `${bed} / ${bath}`;
      },
    },
    {
      header: 'Garage',
      accessor: 'garage' as keyof Plan,
      cell: (plan: Plan) => plan.garage || '—',
    },
    {
      header: 'Elevations',
      accessor: '_count' as keyof Plan,
      cell: (plan: Plan) => plan._count?.elevations ?? 0,
    },
    {
      header: 'Status',
      accessor: 'isActive' as keyof Plan,
      cell: (plan: Plan) => (
        <span className={`badge badge-${plan.isActive ? 'success' : 'secondary'}`}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Plan,
      cell: (plan: Plan) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeletePlan(plan)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get stats display data
  const statsData = useMemo(() => {
    if (!stats) {
      return {
        total: 0,
        active: 0,
        singleStory: 0,
        twoStory: 0,
      };
    }
    const singleStory = stats.byType.find(t => t.type === 'SINGLE_STORY')?.count ?? 0;
    const twoStory = stats.byType.find(t => t.type === 'TWO_STORY')?.count ?? 0;
    return {
      total: stats.total,
      active: stats.activeCount,
      singleStory,
      twoStory,
    };
  }, [stats]);

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

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          value={statsData.total}
          label="Total Plans"
        />
        <StatCard
          value={statsData.active}
          label="Active Plans"
          variant="success"
        />
        <StatCard
          value={statsData.singleStory}
          label="Single Story"
          variant="info"
        />
        <StatCard
          value={statsData.twoStory}
          label="Two Story"
          variant="info"
        />
      </div>

      <div className="section">
        <Card>
          {/* Filters */}
          <div className="filters-bar">
            <div className="filters-bar-header">
              <span className="filters-bar-title">Filter Plans</span>
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('cards')}
                  title="Card View"
                >
                  <span className="view-toggle-icon">▦</span>
                  <span className="view-toggle-label">Cards</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('table')}
                  title="Table View"
                >
                  <span className="view-toggle-icon">☰</span>
                  <span className="view-toggle-label">Table</span>
                </button>
              </div>
            </div>

            <div className="filters-row">
              <Input
                placeholder="Search plans..."
                value={search}
                onChange={handleSearchChange}
                className="search-input"
              />

              <Input
                inputType="select"
                value={typeFilter}
                onChange={handleTypeFilterChange}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'SINGLE_STORY', label: 'Single Story' },
                  { value: 'TWO_STORY', label: 'Two Story' },
                  { value: 'THREE_STORY', label: 'Three Story' },
                  { value: 'DUPLEX', label: 'Duplex' },
                  { value: 'TOWNHOME', label: 'Townhome' },
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
                  { value: 'false', label: 'Inactive' },
                ]}
              />
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
                Failed to load plans. Please try again.
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              {/* Card View */}
              {viewMode === 'cards' && (
                <div className="plan-cards-grid">
                  {data.data.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      code={plan.code}
                      name={plan.name}
                      type={plan.type}
                      sqft={plan.sqft}
                      bedrooms={plan.bedrooms}
                      bathrooms={plan.bathrooms}
                      garage={plan.garage}
                      elevationCount={plan._count?.elevations}
                      templateItemCount={plan._count?.templateItems}
                      jobCount={plan._count?.jobs}
                      isActive={plan.isActive}
                      onDelete={() => handleDeletePlan(plan)}
                    />
                  ))}
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <Table columns={columns} data={data.data} />
              )}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {(page - 1) * limit + 1} to{' '}
                    {Math.min(page * limit, data.pagination.total)} of{' '}
                    {data.pagination.total} plans
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
              <div className="empty-state-icon">📋</div>
              <h3>No plans found</h3>
              <p>
                {search || typeFilter || isActiveFilter !== undefined
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first plan template'}
              </p>
              {!search && !typeFilter && (
                <Button variant="primary">
                  + Add Plan Template
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Plans;
