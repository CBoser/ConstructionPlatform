import React from 'react';
import StatCard from '../components/common/StatCard';
import Alert from '../components/common/Alert';
import ActivityItem from '../components/common/ActivityItem';
import ScheduleItem from '../components/common/ScheduleItem';
import QuickAction from '../components/common/QuickAction';

const Dashboard: React.FC = () => {
  return (
    <div>
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            value="23"
            label="Active Jobs"
            trend={{ direction: 'up', value: '+3 this week' }}
          />
          <StatCard
            value="$127K"
            label="Material Orders"
            variant="info"
            trend={{ direction: 'up', value: '+$14K today' }}
          />
          <StatCard
            value="8"
            label="Pending Approvals"
            variant="warning"
          />
          <StatCard
            value="94%"
            label="On-Time Delivery"
            variant="success"
            trend={{ direction: 'down', value: '-2% vs target' }}
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
                <a href="#" className="view-all">View All</a>
              </div>
              <div className="alerts">
                <Alert
                  type="critical"
                  icon="🚨"
                  title="Material Shortage - Oak Ridge Community"
                  message="2x4 studs inventory critically low. Expected delivery delayed 3 days."
                  time="10 minutes ago"
                />
                <Alert
                  type="warning"
                  icon="⚠️"
                  title="Budget Variance Alert - Maple Heights Lot 14"
                  message="Material costs 18% over estimate. Review recommended."
                  time="2 hours ago"
                />
                <Alert
                  type="info"
                  icon="ℹ️"
                  title="New Bid Request - Pine Valley Phase 3"
                  message="Bid request from Johnson Construction for 50-unit development."
                  time="4 hours ago"
                />
              </div>
            </section>

            {/* Recent Activity */}
            <section className="section">
              <div className="section-header">
                <h3 className="section-title">Recent Activity</h3>
                <a href="#" className="view-all">View All</a>
              </div>
              <div className="activity-list">
                <ActivityItem
                  type="po"
                  icon="📋"
                  title="PO #2847 Approved"
                  detail="Lumber order for Willow Creek - $12,450"
                  time="15 min"
                />
                <ActivityItem
                  type="bid"
                  icon="💼"
                  title="New Bid Submitted"
                  detail="Riverside Estates Phase 2 - 25 units"
                  time="1 hr"
                />
                <ActivityItem
                  type="delivery"
                  icon="🚚"
                  title="Delivery Scheduled"
                  detail="Oak Ridge Lot 7 - Drywall delivery 8:00 AM"
                  time="2 hrs"
                />
                <ActivityItem
                  type="completed"
                  icon="✅"
                  title="Job Completed"
                  detail="Maple Heights Lot 12 - Final inspection passed"
                  time="3 hrs"
                />
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Quick Actions */}
            <section className="section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="quick-actions">
                <QuickAction icon="📦" text="Create PO" />
                <QuickAction icon="📊" text="View Reports" />
                <QuickAction icon="🏗️" text="New Job" />
                <QuickAction icon="👥" text="Manage Team" />
              </div>
            </section>

            {/* Today's Deliveries */}
            <section className="section">
              <div className="section-header">
                <h3 className="section-title">Today's Deliveries</h3>
                <a href="#" className="view-all">View Schedule</a>
              </div>
              <div className="schedule-list">
                <ScheduleItem
                  time="8:00 AM"
                  title="Drywall & Insulation"
                  location="Oak Ridge - Lot 7"
                />
                <ScheduleItem
                  time="10:30 AM"
                  title="Lumber Package"
                  location="Willow Creek - Lot 3"
                />
                <ScheduleItem
                  time="2:00 PM"
                  title="Roofing Materials"
                  location="Maple Heights - Lot 14"
                />
              </div>
            </section>
          </div>
        </div>

        {/* Chart Placeholder */}
        <section className="section">
          <div className="section-header">
            <h3 className="section-title">Material Cost Trends</h3>
            <a href="#" className="view-all">Detailed Analytics</a>
          </div>
          <div className="chart-container">
            Chart visualization coming soon - Variance tracking & cost analysis
          </div>
        </section>
    </div>
  );
};

export default Dashboard;
