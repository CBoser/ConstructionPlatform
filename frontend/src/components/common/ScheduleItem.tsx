import React from 'react';

interface ScheduleItemProps {
  time: string;
  title: string;
  location: string;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ time, title, location }) => {
  return (
    <div className="schedule-item">
      <div className="schedule-time">{time}</div>
      <div className="schedule-content">
        <div className="schedule-title">{title}</div>
        <div className="schedule-location">{location}</div>
      </div>
    </div>
  );
};

export default ScheduleItem;
