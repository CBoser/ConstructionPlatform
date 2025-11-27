import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface NetworkStatusIndicatorProps {
  className?: string;
}

/**
 * NetworkStatusIndicator - Shows a banner when the user is offline
 * or when the connection is restored after being offline.
 *
 * Mobile-optimized:
 * - Fixed position at top of screen
 * - Touch-friendly dismiss button
 * - Auto-dismisses after reconnection
 */
const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ className = '' }) => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show "reconnected" message briefly when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      setDismissed(false);

      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Reset dismissed state when going offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // Don't show anything if online and not showing reconnected message
  if (isOnline && !showReconnected) {
    return null;
  }

  // Don't show if user dismissed while offline
  if (!isOnline && dismissed) {
    return null;
  }

  return (
    <div
      className={`network-status-indicator ${isOnline ? 'online' : 'offline'} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="network-status-content">
        <span className="network-status-icon">
          {isOnline ? '✓' : '⚠'}
        </span>
        <span className="network-status-message">
          {isOnline
            ? 'Connection restored'
            : 'You\'re offline. Some features may be limited.'}
        </span>
      </div>
      {!isOnline && (
        <button
          className="network-status-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss offline notification"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;
