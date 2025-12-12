import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import {
  usePDSSDashboard,
  usePDSSJobs,
  useUpdatePDSSJob,
  PDSS_STATUS_LABELS,
  PDSS_TAKEOFF_LABELS,
  PDSS_QUOTE_LABELS,
  PDSS_PRIORITY_LABELS,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  formatAssignee,
} from '../../services/pdssService';
import type {
  PDSSJobStatus,
  PDSSStatus,
  PDSSTakeoffStatus,
  PDSSQuoteStatus,
  PDSSPriority,
  PDSSListQuery,
} from '../../services/pdssService';

const PDSSTracker: React.FC = () => {
  const [query, setQuery] = useState<PDSSListQuery>({ page: 1, limit: 20 });
  const [selectedJob, setSelectedJob] = useState<PDSSJobStatus | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'jobs' | 'plans'>('jobs');

  // Data queries
  const { data: dashboard, isLoading: dashboardLoading } = usePDSSDashboard();
  const { data: jobsData, isLoading: jobsLoading } = usePDSSJobs(query);
  const updateJob = useUpdatePDSSJob();

  // Edit form state
  const [editForm, setEditForm] = useState({
    planStatus: 'NEW' as PDSSStatus,
    takeoffStatus: 'NOT_STARTED' as PDSSTakeoffStatus,
    quoteStatus: 'NOT_STARTED' as PDSSQuoteStatus,
    priority: 'MEDIUM' as PDSSPriority,
    notes: '',
  });

  const handleEditClick = (job: PDSSJobStatus) => {
    setSelectedJob(job);
    setEditForm({
      planStatus: job.planStatus,
      takeoffStatus: job.takeoffStatus,
      quoteStatus: job.quoteStatus,
      priority: job.priority,
      notes: job.notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedJob) return;
    try {
      await updateJob.mutateAsync({
        jobId: selectedJob.jobId,
        data: editForm,
      });
      setShowEditModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Failed to update PDSS status:', error);
    }
  };

  const handleFilterChange = (key: keyof PDSSListQuery, value: string) => {
    setQuery((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  // Calculate stats from dashboard
  const totalNew = dashboard?.jobStats.find((s) => s.status === 'NEW')?.count || 0;
  const totalInProgress = dashboard?.jobStats.find((s) => s.status === 'IN_PROGRESS')?.count || 0;
  const totalComplete = dashboard?.jobStats.find((s) => s.status === 'COMPLETE')?.count || 0;
  const totalJobs = dashboard?.jobStats.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <div>
      <PageHeader
        title="PDSS Tracker"
        subtitle="Plan Data Status Sheet - Track plan and job document status"
        breadcrumbs={[{ label: 'Operations', path: '/operations' }, { label: 'PDSS Tracker' }]}
      />

      {/* Stats Section */}
      <div className="stats-grid mb-6">
        <StatCard
          value={totalJobs.toString()}
          label="Total Tracked"
          isLoading={dashboardLoading}
        />
        <StatCard
          value={totalNew.toString()}
          label="New"
          variant="info"
          isLoading={dashboardLoading}
        />
        <StatCard
          value={totalInProgress.toString()}
          label="In Progress"
          variant="warning"
          isLoading={dashboardLoading}
        />
        <StatCard
          value={totalComplete.toString()}
          label="Complete"
          variant="success"
          isLoading={dashboardLoading}
        />
      </div>

      {/* My Assignments */}
      {dashboard?.myAssignments && (dashboard.myAssignments.plans > 0 || dashboard.myAssignments.jobs > 0) && (
        <Card className="mb-6">
          <div className="p-4 flex items-center gap-4">
            <span className="text-gray-600">My Assignments:</span>
            <span className="font-medium">{dashboard.myAssignments.jobs} jobs</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium">{dashboard.myAssignments.plans} plans</span>
          </div>
        </Card>
      )}

      {/* Critical Items Alert */}
      {dashboard?.criticalItems && dashboard.criticalItems.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="p-4">
            <h3 className="font-medium text-red-700 mb-2">Critical Items ({dashboard.criticalItems.length})</h3>
            <div className="space-y-2">
              {dashboard.criticalItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm bg-white rounded p-2"
                >
                  <span>
                    <span className="font-medium">{item.job?.jobNumber}</span>
                    {' - '}
                    {item.job?.customer?.customerName}
                    {item.job?.community && ` | ${item.job.community.name}`}
                    {item.job?.lot && ` Lot ${item.job.lot.lotNumber}`}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityBadgeClass(item.priority)}`}>
                    {PDSS_PRIORITY_LABELS[item.priority]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('jobs')}
        >
          Job PDSS
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'plans'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('plans')}
        >
          Plan PDSS
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={query.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={query.planStatus || ''}
              onChange={(e) => handleFilterChange('planStatus', e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.entries(PDSS_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={query.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              {Object.entries(PDSS_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Job PDSS Table */}
      {activeTab === 'jobs' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Job
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer / Community
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Takeoff
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Docs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobsLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : jobsData?.data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No PDSS records found
                    </td>
                  </tr>
                ) : (
                  jobsData?.data.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-blue-600">{job.job?.jobNumber}</span>
                        {job.job?.lot && (
                          <span className="text-gray-500 text-sm ml-1">
                            Lot {job.job.lot.lotNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{job.job?.customer?.customerName}</div>
                        {job.job?.community && (
                          <div className="text-xs text-gray-500">{job.job.community.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{job.job?.plan?.code}</span>
                        {job.job?.elevation && (
                          <span className="text-gray-500 text-sm ml-1">
                            / {job.job.elevation.code}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                            job.planStatus
                          )}`}
                        >
                          {PDSS_STATUS_LABELS[job.planStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{PDSS_TAKEOFF_LABELS[job.takeoffStatus]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${getPriorityBadgeClass(
                            job.priority
                          )}`}
                        >
                          {PDSS_PRIORITY_LABELS[job.priority]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {job.documentsComplete ? (
                          <span className="text-green-600">Complete</span>
                        ) : (
                          <span className="text-red-600">Incomplete</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{formatAssignee(job.assignedTo)}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="secondary" onClick={() => handleEditClick(job)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {jobsData?.pagination && jobsData.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <span className="text-sm text-gray-600">
                Page {jobsData.pagination.page} of {jobsData.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={jobsData.pagination.page <= 1}
                  onClick={() => setQuery((q) => ({ ...q, page: (q.page || 1) - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={jobsData.pagination.page >= jobsData.pagination.totalPages}
                  onClick={() => setQuery((q) => ({ ...q, page: (q.page || 1) + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Plan PDSS Tab - Placeholder */}
      {activeTab === 'plans' && (
        <Card>
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">Plan-level PDSS tracking</p>
            <p className="text-sm">Track status at the plan/elevation level before jobs are created.</p>
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedJob(null);
        }}
        title={`Edit PDSS: ${selectedJob?.job?.jobNumber}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={editForm.planStatus}
              onChange={(e) => setEditForm((f) => ({ ...f, planStatus: e.target.value as PDSSStatus }))}
            >
              {Object.entries(PDSS_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Takeoff Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={editForm.takeoffStatus}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, takeoffStatus: e.target.value as PDSSTakeoffStatus }))
              }
            >
              {Object.entries(PDSS_TAKEOFF_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={editForm.quoteStatus}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, quoteStatus: e.target.value as PDSSQuoteStatus }))
              }
            >
              {Object.entries(PDSS_QUOTE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={editForm.priority}
              onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value as PDSSPriority }))}
            >
              {Object.entries(PDSS_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedJob(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveStatus} isLoading={updateJob.isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PDSSTracker;
