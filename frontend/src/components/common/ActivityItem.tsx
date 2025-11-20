import React from 'react';

interface ActivityItemProps {
  type: 'po' | 'bid' | 'delivery' | 'completed';
  icon: string;
  title: string;
  detail: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, icon, title, detail, time }) => {
  return (
    <div className="activity-item">
      <div className={`activity-icon ${type}`}>{icon}</div>
      <div className="activity-content">
        <div className="activity-title">{title}</div>
        <div className="activity-detail">{detail}</div>
      </div>
      <div className="activity-time">{time}</div>
    </div>
  );
};

export default ActivityItem;
