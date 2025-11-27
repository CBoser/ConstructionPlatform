import { useRef, useCallback, useState, useEffect } from 'react';

interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color: string;
  backgroundColor: string;
  onClick: () => void;
}

interface UseSwipeActionsOptions {
  /**
   * Actions to show on left swipe (right side of item)
   */
  leftActions?: SwipeAction[];
  /**
   * Actions to show on right swipe (left side of item)
   */
  rightActions?: SwipeAction[];
  /**
   * Minimum swipe distance to trigger action reveal
   * @default 50
   */
  threshold?: number;
  /**
   * Maximum swipe distance
   * @default 150
   */
  maxSwipe?: number;
  /**
   * Whether swipe actions are enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback when swipe state changes
   */
  onSwipeChange?: (direction: 'left' | 'right' | null) => void;
}

interface UseSwipeActionsReturn {
  /**
   * Ref to attach to the swipeable element
   */
  swipeRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Current swipe offset in pixels (negative = left, positive = right)
   */
  swipeOffset: number;
  /**
   * Whether an action is currently revealed
   */
  isActionsRevealed: boolean;
  /**
   * Direction of revealed actions
   */
  revealedDirection: 'left' | 'right' | null;
  /**
   * Reset swipe state
   */
  resetSwipe: () => void;
  /**
   * Style to apply to the swipeable content
   */
  contentStyle: React.CSSProperties;
  /**
   * Props to spread on the swipeable element
   */
  swipeHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
  };
}

/**
 * useSwipeActions - Mobile swipe gesture hook for revealing actions
 *
 * Features:
 * - Left and right swipe support
 * - Configurable action thresholds
 * - Rubber-band resistance
 * - Auto-close when tapping outside
 * - Smooth animations
 */
export function useSwipeActions({
  leftActions = [],
  rightActions = [],
  threshold = 50,
  maxSwipe = 150,
  enabled = true,
  onSwipeChange,
}: UseSwipeActionsOptions): UseSwipeActionsReturn {
  const swipeRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [revealedDirection, setRevealedDirection] = useState<'left' | 'right' | null>(null);

  // Touch tracking
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const startOffset = useRef<number>(0);

  const isActionsRevealed = revealedDirection !== null;

  // Calculate action widths
  const leftActionsWidth = leftActions.length > 0 ? Math.min(leftActions.length * 80, maxSwipe) : 0;
  const rightActionsWidth = rightActions.length > 0 ? Math.min(rightActions.length * 80, maxSwipe) : 0;

  // Apply resistance when over-swiping
  const getResistance = useCallback(
    (offset: number) => {
      const maxOffset = offset < 0 ? -leftActionsWidth : rightActionsWidth;
      if (Math.abs(offset) <= Math.abs(maxOffset)) {
        return offset;
      }
      const overpull = Math.abs(offset) - Math.abs(maxOffset);
      const resistedOverpull = overpull * 0.3;
      return offset < 0 ? -(Math.abs(maxOffset) + resistedOverpull) : Math.abs(maxOffset) + resistedOverpull;
    },
    [leftActionsWidth, rightActionsWidth]
  );

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0);
    setRevealedDirection(null);
    onSwipeChange?.(null);
  }, [onSwipeChange]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      startOffset.current = swipeOffset;
      isSwiping.current = true;
      isHorizontalSwipe.current = null;
    },
    [enabled, swipeOffset]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping.current || !enabled) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - touchStartX.current;
      const diffY = currentY - touchStartY.current;

      // Determine if this is a horizontal or vertical swipe
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
          isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
        }
        return;
      }

      // Only handle horizontal swipes
      if (!isHorizontalSwipe.current) {
        return;
      }

      // Prevent vertical scrolling during horizontal swipe
      e.preventDefault();

      const newOffset = startOffset.current + diffX;

      // Check if swipe direction is allowed
      if (newOffset < 0 && leftActions.length === 0) return;
      if (newOffset > 0 && rightActions.length === 0) return;

      setSwipeOffset(getResistance(newOffset));
    },
    [enabled, leftActions.length, rightActions.length, getResistance]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current || !enabled) return;

    isSwiping.current = false;
    isHorizontalSwipe.current = null;

    // Determine final state
    if (Math.abs(swipeOffset) < threshold) {
      // Below threshold - reset
      resetSwipe();
    } else if (swipeOffset < 0 && leftActions.length > 0) {
      // Reveal left actions (swiped left)
      setSwipeOffset(-leftActionsWidth);
      setRevealedDirection('left');
      onSwipeChange?.('left');
    } else if (swipeOffset > 0 && rightActions.length > 0) {
      // Reveal right actions (swiped right)
      setSwipeOffset(rightActionsWidth);
      setRevealedDirection('right');
      onSwipeChange?.('right');
    } else {
      resetSwipe();
    }
  }, [
    enabled,
    swipeOffset,
    threshold,
    leftActions.length,
    rightActions.length,
    leftActionsWidth,
    rightActionsWidth,
    resetSwipe,
    onSwipeChange,
  ]);

  // Close when clicking outside
  useEffect(() => {
    if (!isActionsRevealed) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (swipeRef.current && !swipeRef.current.contains(event.target as Node)) {
        resetSwipe();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isActionsRevealed, resetSwipe]);

  const contentStyle: React.CSSProperties = {
    transform: `translateX(${swipeOffset}px)`,
    transition: isSwiping.current ? 'none' : 'transform 0.3s ease',
  };

  const swipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
  };

  return {
    swipeRef,
    swipeOffset,
    isActionsRevealed,
    revealedDirection,
    resetSwipe,
    contentStyle,
    swipeHandlers,
  };
}

export default useSwipeActions;
