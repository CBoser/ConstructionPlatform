import React, { useState, useMemo } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import { useToast } from '../../components/common/Toast';
import {
  useMaterials,
  useDeactivateMaterial,
  useActivateMaterial,
  type Material,
  type MaterialCategory,
  type ListMaterialsQuery,
} from '../../services/materialService';

const Materials: React.FC = () => {
  const { showToast } = useToast();

  // Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | ''>('');
  const [dartCategoryFilter, setDartCategoryFilter] = useState<number | ''>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [rlLinkedFilter, setRlLinkedFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 25;

  // Build query
  const query: ListMaterialsQuery = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      category: categoryFilter || undefined,
      dartCategory: dartCategoryFilter || undefined,
      isActive: isActiveFilter,
      isRLLinked: rlLinkedFilter,
      sortBy: 'sku',
      sortOrder: 'asc',
    }),
    [page, limit, search, categoryFilter, dartCategoryFilter, isActiveFilter, rlLinkedFilter]
  );

  // Fetch materials
  const { data, isLoading, error, refetch } = useMaterials(query);
  const deactivateMaterial = useDeactivateMaterial();
  const activateMaterial = useActivateMaterial();

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle filter changes
  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value as MaterialCategory | '');
    setPage(1);
  };

  const handleDartCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDartCategoryFilter(value === '' ? '' : parseInt(value));
    setPage(1);
  };

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIsActiveFilter(
      value === '' ? undefined : value === 'true' ? true : false
    );
    setPage(1);
  };

  const handleRLLinkedFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRlLinkedFilter(
      value === '' ? undefined : value === 'true' ? true : false
    );
    setPage(1);
  };

  // Handle toggle active status
  const handleToggleActive = async (material: Material) => {
    if (!confirm(
      `Are you sure you want to ${material.isActive ? 'deactivate' : 'activate'} material "${material.sku}"?`
    )) {
      return;
    }

    try {
      if (material.isActive) {
        await deactivateMaterial.mutateAsync(material.id);
        showToast('Material deactivated successfully', 'success');
      } else {
        await activateMaterial.mutateAsync(material.id);
        showToast('Material activated successfully', 'success');
      }
      refetch();
    } catch (error: unknown) {
      console.error('Error toggling material status:', error);
      const apiError = error as { data?: { error?: string }; message?: string };
      const errorMessage =
        apiError?.data?.error || apiError?.message || 'Failed to update material';
      showToast(errorMessage, 'error');
    }
  };

  // Format category for display
  const formatCategory = (category: MaterialCategory): string => {
    const categoryMap: Record<MaterialCategory, string> = {
      DIMENSIONAL_LUMBER: 'Dimensional Lumber',
      ENGINEERED_LUMBER: 'Engineered Lumber',
      SHEATHING: 'Sheathing',
      PRESSURE_TREATED: 'Pressure Treated',
      HARDWARE: 'Hardware',
      CONCRETE: 'Concrete',
      ROOFING: 'Roofing',
      SIDING: 'Siding',
      INSULATION: 'Insulation',
      DRYWALL: 'Drywall',
      OTHER: 'Other',
    };
    return categoryMap[category] || category;
  };

  // Format currency
  const formatCurrency = (value: number | null): string => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // DART category names
  const dartCategories = [
    { value: 1, label: '01-Lumber' },
    { value: 2, label: '02-Panel' },
    { value: 3, label: '03-Millwork' },
    { value: 4, label: '04-Windows' },
    { value: 5, label: '05-Ext Doors' },
    { value: 6, label: '06-Int Doors' },
    { value: 7, label: '07-Hardware' },
    { value: 8, label: '08-Roofing' },
    { value: 9, label: '09-Siding' },
    { value: 10, label: '10-Decking' },
    { value: 11, label: '11-Fencing' },
    { value: 12, label: '12-Insulation' },
    { value: 13, label: '13-Drywall' },
    { value: 14, label: '14-Other' },
    { value: 15, label: '15-Special' },
  ];

  // Table columns
  const columns = [
    {
      header: 'SKU',
      accessor: 'sku' as keyof Material,
      cell: (material: Material) => (
        <span className="font-medium font-mono">{material.sku}</span>
      ),
      sortable: true,
    },
    {
      header: 'Description',
      accessor: 'description' as keyof Material,
      cell: (material: Material) => (
        <span title={material.description}>
          {material.description.length > 40
            ? `${material.description.substring(0, 40)}...`
            : material.description}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category' as keyof Material,
      cell: (material: Material) => formatCategory(material.category),
    },
    {
      header: 'DART',
      accessor: 'dartCategory' as keyof Material,
      cell: (material: Material) =>
        material.dartCategory
          ? `${material.dartCategory.toString().padStart(2, '0')}`
          : '—',
    },
    {
      header: 'UOM',
      accessor: 'unitOfMeasure' as keyof Material,
    },
    {
      header: 'Vendor Cost',
      accessor: 'vendorCost' as keyof Material,
      cell: (material: Material) => formatCurrency(material.vendorCost),
      sortable: true,
    },
    {
      header: 'RL',
      accessor: 'isRLLinked' as keyof Material,
      cell: (material: Material) => (
        material.isRLLinked ? (
          <span className="badge badge-info" title={material.rlTag || 'Random Lengths Linked'}>
            RL
          </span>
        ) : '—'
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive' as keyof Material,
      cell: (material: Material) => (
        <span className={`badge badge-${material.isActive ? 'success' : 'secondary'}`}>
          {material.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Material,
      cell: (material: Material) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleActive(material)}
          >
            {material.isActive ? 'Deactivate' : 'Activate'}
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
        <Card>
          {/* Filters */}
          <div className="filters-bar">
            <div className="filters-row">
              <Input
                placeholder="Search SKU, description..."
                value={search}
                onChange={handleSearchChange}
                className="search-input"
              />

              <Input
                inputType="select"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'DIMENSIONAL_LUMBER', label: 'Dimensional Lumber' },
                  { value: 'ENGINEERED_LUMBER', label: 'Engineered Lumber' },
                  { value: 'SHEATHING', label: 'Sheathing' },
                  { value: 'PRESSURE_TREATED', label: 'Pressure Treated' },
                  { value: 'HARDWARE', label: 'Hardware' },
                  { value: 'CONCRETE', label: 'Concrete' },
                  { value: 'ROOFING', label: 'Roofing' },
                  { value: 'SIDING', label: 'Siding' },
                  { value: 'INSULATION', label: 'Insulation' },
                  { value: 'DRYWALL', label: 'Drywall' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />

              <Input
                inputType="select"
                value={dartCategoryFilter}
                onChange={handleDartCategoryFilterChange}
                options={[
                  { value: '', label: 'All DART' },
                  ...dartCategories.map((dc) => ({
                    value: dc.value.toString(),
                    label: dc.label,
                  })),
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

              <Input
                inputType="select"
                value={
                  rlLinkedFilter === undefined
                    ? ''
                    : rlLinkedFilter
                      ? 'true'
                      : 'false'
                }
                onChange={handleRLLinkedFilterChange}
                options={[
                  { value: '', label: 'All RL' },
                  { value: 'true', label: 'RL Linked' },
                  { value: 'false', label: 'Not RL Linked' },
                ]}
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="loading-container">
              <Loading size="lg" />
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="text-danger">
                Failed to load materials. Please try again.
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <Table columns={columns} data={data.data} />

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {(page - 1) * limit + 1} to{' '}
                    {Math.min(page * limit, data.pagination.total)} of{' '}
                    {data.pagination.total} materials
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
              <h3>No materials found</h3>
              <p>
                {search || categoryFilter || dartCategoryFilter || isActiveFilter !== undefined || rlLinkedFilter !== undefined
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first material'}
              </p>
              {!search && !categoryFilter && (
                <Button variant="primary">
                  + Add Material
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Materials;
