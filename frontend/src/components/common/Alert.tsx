import React from 'react';

interface AlertProps {
  type: 'critical' | 'warning' | 'info';
  icon: string;
  title: string;
  message: string;
  time?: string;
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, icon, title, message, time, onDismiss }) => {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-icon">{icon}</div>
      <div className="alert-content">
        <div className="alert-title">{title}</div>
        <div>{message}</div>
        {time && <div className="alert-time">{time}</div>}
      </div>
      {onDismiss && (
        <button className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
