import React from 'react';
import StatCard from '../components/common/StatCard';
import Alert from '../components/common/Alert';
import ActivityItem from '../components/common/ActivityItem';
import ScheduleItem from '../components/common/ScheduleItem';
import QuickAction from '../components/common/QuickAction';
import { useDashboardSummary, useDismissAlert } from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDashboardSummary();
  const dismissAlert = useDismissAlert();

  const handleDismissAlert = (alertId: string) => {
    dismissAlert.mutate(alertId);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Create PO':
        navigate('/purchase-orders/new');
        break;
      case 'View Reports':
        navigate('/reports');
        break;
      case 'New Job':
        navigate('/jobs/new');
        break;
      case 'Manage Team':
        navigate('/settings/team');
        break;
      case 'Import Data':
        navigate('/tools/import');
        break;
      case 'Upload Plan':
        navigate('/plans?upload=true');
        break;
      default:
        break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // Error state - show mock data as fallback
  const stats = data?.stats || {
    activeJobs: { value: 0, trend: 'No data', trendUp: false },
    materialOrders: { value: 0, formatted: '$0', trend: 'No data', trendUp: false },
    pendingApprovals: { value: 0 },
    onTimeDelivery: { value: 0, trend: 'No data', trendUp: false },
  };

  const alerts = data?.alerts || [];
  const activities = data?.activities || [];
  const deliveries = data?.deliveries || [];

  return (
    <div>
      {/* Error banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">&#9888;</span>
            <span className="text-yellow-800">
              Unable to load live data. Showing cached or default values.
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          value={String(stats.activeJobs.value)}
          label="Active Jobs"
          trend={stats.activeJobs.trend ? {
            direction: stats.activeJobs.trendUp ? 'up' : 'down',
            value: stats.activeJobs.trend,
          } : undefined}
        />
        <StatCard
          value={stats.materialOrders.formatted || `$${Math.round(stats.materialOrders.value / 1000)}K`}
          label="Material Orders"
          variant="info"
          trend={stats.materialOrders.trend ? {
            direction: stats.materialOrders.trendUp ? 'up' : 'down',
            value: stats.materialOrders.trend,
          } : undefined}
        />
        <StatCard
          value={String(stats.pendingApprovals.value)}
          label="Pending Approvals"
          variant="warning"
        />
        <StatCard
          value={`${stats.onTimeDelivery.value}%`}
          label="On-Time Delivery"
          variant="success"
          trend={stats.onTimeDelivery.trend ? {
            direction: stats.onTimeDelivery.trendUp ? 'up' : 'down',
            value: stats.onTimeDelivery.trend,
          } : undefined}
        />
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Main Content */}
        <div>
          {/* Critical Alerts */}
          <section className="section">
            <div className="section-header">
              <h3 className="section-title">Critical Alerts</h3>
              <a href="/alerts" className="view-all">View All</a>
            </div>
            <div className="alerts">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    type={alert.type}
                    icon={alert.icon}
                    title={alert.title}
                    message={alert.message}
                    time={alert.time}
                    onDismiss={() => handleDismissAlert(alert.id)}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No alerts at this time
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="section">
            <div className="section-header">
              <h3 className="section-title">Recent Activity</h3>
              <a href="/activity" className="view-all">View All</a>
            </div>
            <div className="activity-list">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    type={activity.type}
                    icon={activity.icon}
                    title={activity.title}
                    detail={activity.detail || ''}
                    time={activity.time}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No recent activity
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div>
          {/* Quick Actions */}
          <section className="section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions">
              <QuickAction icon="&#128196;" text="Upload Plan" onClick={() => handleQuickAction('Upload Plan')} />
              <QuickAction icon="&#127959;" text="New Job" onClick={() => handleQuickAction('New Job')} />
              <QuickAction icon="&#128230;" text="Create PO" onClick={() => handleQuickAction('Create PO')} />
              <QuickAction icon="&#128203;" text="Import Data" onClick={() => handleQuickAction('Import Data')} />
            </div>
          </section>

          {/* Today's Deliveries */}
          <section className="section">
            <div className="section-header">
              <h3 className="section-title">Today's Deliveries</h3>
              <a href="/deliveries" className="view-all">View Schedule</a>
            </div>
            <div className="schedule-list">
              {deliveries.length > 0 ? (
                deliveries.map((delivery) => (
                  <ScheduleItem
                    key={delivery.id}
                    time={delivery.time}
                    title={delivery.title}
                    location={delivery.location || 'Location TBD'}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No deliveries scheduled for today
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Chart Placeholder */}
      <section className="section">
        <div className="section-header">
          <h3 className="section-title">Material Cost Trends</h3>
          <a href="/reports/costs" className="view-all">Detailed Analytics</a>
        </div>
        <div className="chart-container">
          Chart visualization coming soon - Variance tracking & cost analysis
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
