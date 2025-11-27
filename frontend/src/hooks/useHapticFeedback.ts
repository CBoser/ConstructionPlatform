import { useCallback, useRef } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface UseHapticFeedbackOptions {
  /**
   * Whether haptic feedback is enabled
   * @default true
   */
  enabled?: boolean;
}

interface UseHapticFeedbackReturn {
  /**
   * Trigger haptic feedback
   */
  trigger: (pattern?: HapticPattern) => void;
  /**
   * Whether haptic feedback is supported
   */
  isSupported: boolean;
  /**
   * Vibrate with custom pattern (array of on/off durations in ms)
   */
  vibrate: (pattern: number | number[]) => void;
}

// Vibration patterns in milliseconds [on, off, on, off, ...]
const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 50, 20, 50, 20],
  error: [50, 50, 50],
  selection: 5,
};

/**
 * useHapticFeedback - Touch feedback for mobile interactions
 *
 * Features:
 * - Multiple feedback patterns
 * - Fallback for unsupported devices
 * - Debounced to prevent spam
 * - Works with Vibration API
 *
 * Usage:
 * const { trigger } = useHapticFeedback();
 * <button onClick={() => { trigger('light'); doSomething(); }}>Click</button>
 */
export function useHapticFeedback({
  enabled = true,
}: UseHapticFeedbackOptions = {}): UseHapticFeedbackReturn {
  const lastTrigger = useRef<number>(0);
  const minInterval = 50; // Minimum ms between triggers

  const isSupported =
    typeof window !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function';

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!enabled || !isSupported) return;

      // Debounce rapid triggers
      const now = Date.now();
      if (now - lastTrigger.current < minInterval) return;
      lastTrigger.current = now;

      try {
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail if vibration fails
        console.debug('Haptic feedback failed:', error);
      }
    },
    [enabled, isSupported]
  );

  const trigger = useCallback(
    (pattern: HapticPattern = 'light') => {
      const vibrationPattern = PATTERNS[pattern] || PATTERNS.light;
      vibrate(vibrationPattern);
    },
    [vibrate]
  );

  return {
    trigger,
    isSupported,
    vibrate,
  };
}

/**
 * Higher-order function to wrap event handlers with haptic feedback
 *
 * Usage:
 * const { withHaptic } = useHapticFeedback();
 * <button onClick={withHaptic(handleClick, 'light')}>Click</button>
 */
export function withHapticFeedback<T extends (...args: unknown[]) => unknown>(
  handler: T,
  pattern: HapticPattern = 'light'
): T {
  return ((...args: Parameters<T>) => {
    // Trigger haptic
    if (
      typeof window !== 'undefined' &&
      'vibrate' in navigator &&
      typeof navigator.vibrate === 'function'
    ) {
      try {
        navigator.vibrate(PATTERNS[pattern] || PATTERNS.light);
      } catch {
        // Silently fail
      }
    }

    return handler(...args);
  }) as T;
}

export default useHapticFeedback;
