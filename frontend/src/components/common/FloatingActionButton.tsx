import React, { useState, useRef, useEffect } from 'react';

interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface FloatingActionButtonProps {
  /**
   * Primary action when FAB is clicked (single action mode)
   */
  onClick?: () => void;
  /**
   * Icon to display on the main FAB
   */
  icon?: React.ReactNode;
  /**
   * Accessible label for the FAB
   */
  label?: string;
  /**
   * FAB color variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /**
   * Position on screen
   */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /**
   * Array of actions for expandable FAB
   */
  actions?: FABAction[];
  /**
   * Whether FAB is disabled
   */
  disabled?: boolean;
  /**
   * Whether to hide FAB (useful for scroll behavior)
   */
  hidden?: boolean;
  /**
   * Extended FAB with text label
   */
  extended?: boolean;
  /**
   * Text for extended FAB
   */
  text?: string;
  /**
   * Size of the FAB
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * FloatingActionButton - Mobile-optimized floating action button
 *
 * Features:
 * - Touch-friendly 56px size (meets WCAG AAA 44px minimum)
 * - Expandable actions menu
 * - Safe area inset support
 * - Smooth animations
 * - Keyboard accessible
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = '+',
  label = 'Action',
  variant = 'primary',
  position = 'bottom-right',
  actions,
  disabled = false,
  hidden = false,
  extended = false,
  text,
  size = 'md',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [isExpanded]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  const handleMainClick = () => {
    if (disabled) return;

    if (actions && actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  const handleActionClick = (action: FABAction) => {
    setIsExpanded(false);
    action.onClick();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMainClick();
    }
  };

  const positionClass = `fab-${position}`;
  const sizeClass = `fab-${size}`;
  const variantClass = `fab-${variant}`;

  return (
    <div
      ref={fabRef}
      className={`fab-container ${positionClass} ${hidden ? 'fab-hidden' : ''}`}
    >
      {/* Actions menu */}
      {actions && actions.length > 0 && (
        <div className={`fab-actions ${isExpanded ? 'fab-actions-expanded' : ''}`}>
          {actions.map((action, index) => (
            <button
              key={action.id}
              className={`fab-action fab-${action.variant || 'secondary'}`}
              onClick={() => handleActionClick(action)}
              aria-label={action.label}
              title={action.label}
              style={{
                transitionDelay: isExpanded ? `${index * 50}ms` : '0ms',
              }}
            >
              <span className="fab-action-icon">{action.icon}</span>
              <span className="fab-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <button
        className={`fab-button ${variantClass} ${sizeClass} ${extended ? 'fab-extended' : ''} ${isExpanded ? 'fab-expanded' : ''}`}
        onClick={handleMainClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={label}
        aria-expanded={actions ? isExpanded : undefined}
        aria-haspopup={actions ? 'menu' : undefined}
      >
        <span className={`fab-icon ${isExpanded ? 'fab-icon-rotated' : ''}`}>
          {icon}
        </span>
        {extended && text && <span className="fab-text">{text}</span>}
      </button>

      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div
          className="fab-backdrop"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
