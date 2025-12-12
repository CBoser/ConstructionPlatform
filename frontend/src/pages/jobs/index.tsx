import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import type { Column } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  useJobs,
  useJobStats,
  useCreateJob,
  useUpdateJobStatus,
  useDeleteJob,
  JOB_STATUS_LABELS,
  getStatusBadgeClass,
  formatJobDate,
  getDaysUntilStart,
} from '../../services/jobService';
import type { Job, JobStatus, ListJobsQuery } from '../../services/jobService';
import { usePlans } from '../../services/planService';
import { useCustomers } from '../../services/customerService';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<ListJobsQuery>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Data queries
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useJobs(query);
  const { data: stats, isLoading: statsLoading } = useJobStats();
  const { data: plansData } = usePlans({ limit: 100, isActive: true });
  const { data: customersData } = useCustomers({ limit: 100, isActive: true });

  // Mutations
  const createJob = useCreateJob();
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();

  // Create job form state
  const [createForm, setCreateForm] = useState({
    customerId: '',
    planId: '',
    elevationId: '',
    startDate: '',
    notes: '',
  });

  const handleSearch = (search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (status: JobStatus | '') => {
    setQuery((prev) => ({
      ...prev,
      status: status || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleCreateJob = async () => {
    if (!createForm.customerId || !createForm.planId) return;

    try {
      await createJob.mutateAsync({
        customerId: createForm.customerId,
        planId: createForm.planId,
        elevationId: createForm.elevationId || undefined,
        startDate: createForm.startDate ? new Date(createForm.startDate).toISOString() : undefined,
        notes: createForm.notes || undefined,
      });
      setShowCreateModal(false);
      setCreateForm({ customerId: '', planId: '', elevationId: '', startDate: '', notes: '' });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!selectedJob) return;

    try {
      await updateStatus.mutateAsync({ id: selectedJob.id, status: newStatus });
      setShowStatusModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    if (!confirm(`Are you sure you want to cancel job ${job.jobNumber}?`)) return;

    try {
      await deleteJob.mutateAsync({ id: job.id });
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  // Table columns
  const columns: Column<Job>[] = useMemo(
    () => [
      {
        header: 'Job #',
        accessor: 'jobNumber',
        sortable: true,
        mobilePriority: 1,
        cell: (job) => (
          <span className="font-medium text-blue-600 cursor-pointer hover:underline">
            {job.jobNumber}
          </span>
        ),
      },
      {
        header: 'Customer',
        key: 'customer',
        mobilePriority: 2,
        cell: (job) => job.customer?.customerName || '-',
      },
      {
        header: 'Plan',
        key: 'plan',
        mobilePriority: 3,
        cell: (job) => (
          <span>
            {job.plan?.code}
            {job.elevation && <span className="text-gray-500"> / {job.elevation.code}</span>}
          </span>
        ),
      },
      {
        header: 'Community',
        key: 'community',
        mobilePriority: 4,
        cell: (job) => (
          <span>
            {job.community?.name || '-'}
            {job.lot && <span className="text-gray-500"> - Lot {job.lot.lotNumber}</span>}
          </span>
        ),
      },
      {
        header: 'Status',
        accessor: 'status',
        sortable: true,
        mobilePriority: 1,
        cell: (job) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
              job.status
            )}`}
          >
            {JOB_STATUS_LABELS[job.status]}
          </span>
        ),
      },
      {
        header: 'Start Date',
        accessor: 'startDate',
        sortable: true,
        mobilePriority: 3,
        cell: (job) => {
          const days = getDaysUntilStart(job.startDate);
          return (
            <div>
              <span>{formatJobDate(job.startDate)}</span>
              {days !== null && days >= 0 && days <= 14 && (
                <span
                  className={`ml-2 text-xs ${
                    days <= 3 ? 'text-red-600' : days <= 7 ? 'text-yellow-600' : 'text-gray-500'
                  }`}
                >
                  ({days === 0 ? 'Today' : `${days}d`})
                </span>
              )}
            </div>
          );
        },
      },
      {
        header: 'Actions',
        key: 'actions',
        hideOnMobile: true,
        cell: (job) => (
          <div className="flex gap-2">
            <button
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedJob(job);
                setShowStatusModal(true);
              }}
            >
              Status
            </button>
            <button
              className="text-red-600 hover:text-red-800 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteJob(job);
              }}
            >
              Cancel
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const jobs = jobsData?.data || [];
  const pagination = jobsData?.pagination;

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle="Manage construction jobs and schedules"
        breadcrumbs={[{ label: 'Operations', path: '/operations' }, { label: 'Jobs' }]}
        actions={
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Create Job
          </Button>
        }
      />

      {/* Stats Section */}
      <div className="stats-grid mb-6">
        <StatCard
          value={stats?.total.toString() || '0'}
          label="Total Jobs"
          isLoading={statsLoading}
        />
        <StatCard
          value={stats?.activeCount.toString() || '0'}
          label="Active Jobs"
          variant="info"
          isLoading={statsLoading}
        />
        <StatCard
          value={stats?.upcomingStarts.toString() || '0'}
          label="Starting Soon"
          variant="warning"
          isLoading={statsLoading}
        />
        <StatCard
          value={stats?.recentlyCompleted.toString() || '0'}
          label="Completed (30d)"
          variant="success"
          isLoading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="section mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search jobs..."
              value={query.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query.status || ''}
            onChange={(e) => handleStatusFilter(e.target.value as JobStatus | '')}
          >
            <option value="">All Statuses</option>
            {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {jobsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">&#9888;</span>
            <span className="text-red-800">Failed to load jobs. Please try again.</span>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="section">
        <Table
          data={jobs}
          columns={columns}
          keyField="id"
          isLoading={jobsLoading}
          onRowClick={(job) => navigate(`/jobs/${job.id}`)}
          mobileCardView={true}
          mobileCardTitle="jobNumber"
          mobileCardStatus={(job) => (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                job.status
              )}`}
            >
              {JOB_STATUS_LABELS[job.status]}
            </span>
          )}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Job"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={createForm.customerId}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, customerId: e.target.value }))}
            >
              <option value="">Select Customer</option>
              {customersData?.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customerName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={createForm.planId}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, planId: e.target.value }))}
            >
              <option value="">Select Plan</option>
              {plansData?.data.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.code} {plan.name && `- ${plan.name}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={createForm.startDate}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={createForm.notes}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateJob}
              disabled={!createForm.customerId || !createForm.planId}
              isLoading={createJob.isPending}
            >
              Create Job
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedJob(null);
        }}
        title={`Update Status: ${selectedJob?.jobNumber}`}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Current status:{' '}
            <span className="font-medium">{selectedJob && JOB_STATUS_LABELS[selectedJob.status]}</span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(JOB_STATUS_LABELS) as JobStatus[]).map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedJob?.status === status
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : `${getStatusBadgeClass(status)} hover:opacity-80`
                }`}
                disabled={selectedJob?.status === status || updateStatus.isPending}
                onClick={() => handleStatusChange(status)}
              >
                {JOB_STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedJob(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jobs;
