import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'spinner-small',
    md: 'spinner',
    lg: 'spinner-large',
  };

  const content = (
    <div className="loading-content">
      <div className={sizeClasses[size]}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {content}
      </div>
    );
  }

  return (
    <div className="loading-container">
      {content}
    </div>
  );
};

export default Loading;
