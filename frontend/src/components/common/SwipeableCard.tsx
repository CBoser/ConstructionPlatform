import React from 'react';
import { useSwipeActions } from '../../hooks/useSwipeActions';

interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  onClick: () => void;
}

interface SwipeableCardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Actions revealed on left swipe (appear on right)
   */
  leftActions?: SwipeAction[];
  /**
   * Actions revealed on right swipe (appear on left)
   */
  rightActions?: SwipeAction[];
  /**
   * Whether swipe is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Click handler for the card content
   */
  onClick?: () => void;
}

/**
 * SwipeableCard - Card component with swipe-to-reveal actions
 *
 * Features:
 * - Left and right swipe actions
 * - Touch gesture support
 * - Auto-close on outside tap
 * - Smooth animations
 * - Accessible action buttons
 */
const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  enabled = true,
  className = '',
  onClick,
}) => {
  // Enhance actions with default colors
  const enhancedLeftActions = leftActions.map((action) => ({
    ...action,
    color: action.color || '#ffffff',
    backgroundColor: action.backgroundColor || 'var(--danger)',
  }));

  const enhancedRightActions = rightActions.map((action) => ({
    ...action,
    color: action.color || '#ffffff',
    backgroundColor: action.backgroundColor || 'var(--primary)',
  }));

  const {
    swipeRef,
    isActionsRevealed,
    resetSwipe,
    contentStyle,
    swipeHandlers,
  } = useSwipeActions({
    leftActions: enhancedLeftActions,
    rightActions: enhancedRightActions,
    enabled,
  });

  const handleActionClick = (action: SwipeAction) => {
    resetSwipe();
    action.onClick();
  };

  const handleContentClick = () => {
    if (isActionsRevealed) {
      resetSwipe();
    } else if (onClick) {
      onClick();
    }
  };

  // Calculate action container widths
  const leftActionsWidth = Math.min(enhancedLeftActions.length * 80, 150);
  const rightActionsWidth = Math.min(enhancedRightActions.length * 80, 150);

  return (
    <div
      ref={swipeRef}
      className={`swipeable-card ${className} ${isActionsRevealed ? 'swipeable-card-revealed' : ''}`}
    >
      {/* Right actions (revealed on right swipe) */}
      {enhancedRightActions.length > 0 && (
        <div
          className="swipeable-actions swipeable-actions-left"
          style={{ width: rightActionsWidth }}
        >
          {enhancedRightActions.map((action) => (
            <button
              key={action.id}
              className="swipeable-action"
              onClick={() => handleActionClick(action)}
              aria-label={action.label}
              style={{
                backgroundColor: action.backgroundColor,
                color: action.color,
              }}
            >
              {action.icon && <span className="swipeable-action-icon">{action.icon}</span>}
              <span className="swipeable-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Swipeable content */}
      <div
        className="swipeable-content"
        style={contentStyle}
        onClick={handleContentClick}
        {...swipeHandlers}
      >
        {children}
      </div>

      {/* Left actions (revealed on left swipe) */}
      {enhancedLeftActions.length > 0 && (
        <div
          className="swipeable-actions swipeable-actions-right"
          style={{ width: leftActionsWidth }}
        >
          {enhancedLeftActions.map((action) => (
            <button
              key={action.id}
              className="swipeable-action"
              onClick={() => handleActionClick(action)}
              aria-label={action.label}
              style={{
                backgroundColor: action.backgroundColor,
                color: action.color,
              }}
            >
              {action.icon && <span className="swipeable-action-icon">{action.icon}</span>}
              <span className="swipeable-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SwipeableCard;
