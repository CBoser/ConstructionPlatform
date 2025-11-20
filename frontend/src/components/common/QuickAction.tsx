import React from 'react';

interface QuickActionProps {
  icon: string;
  text: string;
  onClick?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, text, onClick }) => {
  return (
    <button className="action-btn" onClick={onClick}>
      <span className="action-icon">{icon}</span>
      <span className="action-text">{text}</span>
    </button>
  );
};

export default QuickAction;
