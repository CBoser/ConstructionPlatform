import React, { useRef, useCallback, useState, useEffect } from 'react';

interface PullToRefreshProps {
  /**
   * Callback when refresh is triggered
   */
  onRefresh: () => Promise<void>;
  /**
   * Children to render inside the pull-to-refresh container
   */
  children: React.ReactNode;
  /**
   * Whether pull-to-refresh is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Distance in pixels required to trigger refresh
   * @default 80
   */
  threshold?: number;
  /**
   * Custom loading indicator
   */
  loadingIndicator?: React.ReactNode;
  /**
   * Custom pull indicator (receives progress 0-1)
   */
  pullIndicator?: (progress: number) => React.ReactNode;
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * PullToRefresh - Mobile pull-to-refresh wrapper component
 *
 * Features:
 * - Touch gesture recognition
 * - Visual feedback during pull
 * - Spinner during refresh
 * - Smooth animations
 */
const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  enabled = true,
  threshold = 80,
  loadingIndicator,
  pullIndicator,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Touch tracking
  const touchStartY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const maxPull = 150;

  // Rubber-band resistance
  const getResistance = useCallback(
    (distance: number) => {
      if (distance <= threshold) {
        return distance;
      }
      const overpull = distance - threshold;
      return Math.min(threshold + overpull * 0.4, maxPull);
    },
    [threshold]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      if (container.scrollTop <= 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    },
    [enabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || !enabled || isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;

      if (diff > 0 && container.scrollTop <= 0) {
        e.preventDefault();
        setPullDistance(getResistance(diff));
      } else {
        if (pullDistance > 0) {
          setPullDistance(0);
        }
        isPulling.current = false;
      }
    },
    [enabled, isRefreshing, pullDistance, getResistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || !enabled) return;

    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [enabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Prevent scroll during pull
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: TouchEvent) => {
      if (pullDistance > 0) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', preventScroll, { passive: false });
    return () => container.removeEventListener('touchmove', preventScroll);
  }, [pullDistance]);

  const defaultPullIndicator = (progress: number) => (
    <div
      className="ptr-indicator"
      style={{
        transform: `rotate(${progress * 360}deg)`,
        opacity: progress,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    </div>
  );

  const defaultLoadingIndicator = (
    <div className="ptr-spinner">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ptr-spinner-icon"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`ptr-container ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove as unknown as React.TouchEventHandler}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={`ptr-header ${isRefreshing ? 'ptr-refreshing' : ''}`}
        style={{
          height: pullDistance,
          opacity: pullProgress,
        }}
      >
        {isRefreshing
          ? loadingIndicator || defaultLoadingIndicator
          : pullIndicator?.(pullProgress) || defaultPullIndicator(pullProgress)}
        {!isRefreshing && pullDistance >= threshold && (
          <span className="ptr-text">Release to refresh</span>
        )}
        {!isRefreshing && pullDistance > 0 && pullDistance < threshold && (
          <span className="ptr-text">Pull to refresh</span>
        )}
        {isRefreshing && <span className="ptr-text">Refreshing...</span>}
      </div>

      {/* Content */}
      <div
        className="ptr-content"
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance : 0}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
