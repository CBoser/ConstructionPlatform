import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number | null;
  rtt: number | null;
}

interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

/**
 * Hook to monitor network connectivity status
 * Provides real-time updates on online/offline state and connection quality
 */
export function useNetworkStatus(): NetworkStatus {
  const getConnection = (): NetworkInformation | null => {
    return (
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      null
    );
  };

  const getNetworkStatus = useCallback((): NetworkStatus => {
    const connection = getConnection();

    return {
      isOnline: navigator.onLine,
      wasOffline: false,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink ?? null,
      rtt: connection?.rtt ?? null,
    };
  }, []);

  const [status, setStatus] = useState<NetworkStatus>(getNetworkStatus);

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({
        ...getNetworkStatus(),
        wasOffline: !prev.isOnline, // Track if we just came back online
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
      }));
    };

    const handleConnectionChange = () => {
      setStatus((prev) => ({
        ...getNetworkStatus(),
        wasOffline: prev.wasOffline,
      }));
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection quality changes
    const connection = getConnection();
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [getNetworkStatus]);

  return status;
}

/**
 * Utility to check if connection is slow (2G or worse)
 */
export function isSlowConnection(status: NetworkStatus): boolean {
  return status.effectiveType === 'slow-2g' || status.effectiveType === '2g';
}

/**
 * Utility to check if we should defer non-essential requests
 */
export function shouldDeferRequests(status: NetworkStatus): boolean {
  if (!status.isOnline) return true;
  if (isSlowConnection(status)) return true;
  // High latency (>500ms RTT)
  if (status.rtt !== null && status.rtt > 500) return true;
  return false;
}

export default useNetworkStatus;
