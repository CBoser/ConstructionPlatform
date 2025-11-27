import { useRef, useCallback, useEffect, useState } from 'react';

interface UsePullToRefreshOptions {
  /**
   * Callback when refresh is triggered
   */
  onRefresh: () => Promise<void>;
  /**
   * Distance in pixels required to trigger refresh
   * @default 80
   */
  threshold?: number;
  /**
   * Maximum pull distance
   * @default 150
   */
  maxPull?: number;
  /**
   * Whether pull-to-refresh is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Element to attach to (if not using ref)
   */
  element?: HTMLElement | null;
}

interface UsePullToRefreshReturn {
  /**
   * Ref to attach to the scrollable container
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Whether refresh is in progress
   */
  isRefreshing: boolean;
  /**
   * Current pull progress (0-1)
   */
  pullProgress: number;
  /**
   * Whether user has pulled past threshold
   */
  isPulledPastThreshold: boolean;
  /**
   * Current pull distance in pixels
   */
  pullDistance: number;
}

/**
 * usePullToRefresh - Mobile-friendly pull-to-refresh gesture hook
 *
 * Features:
 * - Touch gesture recognition
 * - Smooth rubber-band effect
 * - Progress indicator support
 * - Haptic feedback ready
 * - Works with scrollable containers
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 150,
  enabled = true,
  element,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Touch tracking state
  const touchStartY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const startScrollTop = useRef<number>(0);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const isPulledPastThreshold = pullDistance >= threshold;

  // Apply rubber-band effect to pull distance
  const getResistance = useCallback(
    (distance: number) => {
      // Logarithmic resistance for rubber-band effect
      if (distance <= threshold) {
        return distance;
      }
      const overpull = distance - threshold;
      const resistance = threshold + overpull * 0.4;
      return Math.min(resistance, maxPull);
    },
    [threshold, maxPull]
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing) return;

      const container = element || containerRef.current;
      if (!container) return;

      // Only start pull if at top of scroll
      if (container.scrollTop <= 0) {
        touchStartY.current = e.touches[0].clientY;
        startScrollTop.current = container.scrollTop;
        isPulling.current = true;
      }
    },
    [enabled, isRefreshing, element]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling.current || !enabled || isRefreshing) return;

      const container = element || containerRef.current;
      if (!container) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY.current;

      // Only activate pull-to-refresh when pulling down at top of scroll
      if (diff > 0 && container.scrollTop <= 0) {
        // Prevent default scroll behavior
        e.preventDefault();

        const resistedPull = getResistance(diff);
        setPullDistance(resistedPull);
      } else {
        // User scrolled up or we're not at top anymore
        if (pullDistance > 0) {
          setPullDistance(0);
        }
        isPulling.current = false;
      }
    },
    [enabled, isRefreshing, pullDistance, getResistance, element]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || !enabled) return;

    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      // Keep some visual feedback while refreshing
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
      // Animate back to 0
      setPullDistance(0);
    }
  }, [enabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Attach touch listeners
  useEffect(() => {
    const container = element || containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [element, enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    isRefreshing,
    pullProgress,
    isPulledPastThreshold,
    pullDistance,
  };
}

export default usePullToRefresh;
