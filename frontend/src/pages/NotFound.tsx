import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound: React.FC = () => {
  return (
    <div className="loading-fullscreen">
      <div className="loading-content" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6em', marginBottom: '20px' }}>404</div>
        <h1 style={{ fontSize: '2em', marginBottom: '16px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--gray)', marginBottom: '32px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
