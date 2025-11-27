import React from 'react';

type InputMode = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  inputType?: 'text' | 'number' | 'date' | 'email' | 'password' | 'tel' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  /**
   * Placeholder text for select inputs (defaults to "Select...")
   */
  selectPlaceholder?: string;
  /**
   * Mobile keyboard hint - tells the browser which keyboard to show
   * - 'numeric': Number pad (0-9)
   * - 'decimal': Number pad with decimal point
   * - 'tel': Phone keypad
   * - 'email': Email keyboard (@, .com shortcuts)
   * - 'url': URL keyboard (/, .com shortcuts)
   * - 'search': Search keyboard (may have search button)
   */
  inputMode?: InputMode;
  /**
   * Input size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Input Component - Mobile-optimized form input
 *
 * Features:
 * - 44px minimum touch target
 * - 16px font size prevents iOS zoom
 * - inputMode support for appropriate mobile keyboards
 * - Accessible labels and error messages
 * - Support for text, email, password, number, date, tel, select, textarea
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  inputType = 'text',
  options = [],
  selectPlaceholder,
  inputMode,
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${props.name || Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = `input ${error ? 'input-error' : ''} ${size === 'lg' ? 'input-lg' : ''} ${className}`;

  // Auto-detect inputMode based on type if not explicitly set
  const getInputMode = (): InputMode | undefined => {
    if (inputMode) return inputMode;

    switch (inputType) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'number':
        return 'decimal';
      default:
        return undefined;
    }
  };

  // Render different input types
  const renderInput = () => {
    const commonProps = {
      id: inputId,
      className: inputClasses,
      'aria-invalid': error ? 'true' as const : undefined,
      'aria-describedby': error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined,
    };

    if (inputType === 'select') {
      // Generate default placeholder based on label if not provided
      const placeholder = selectPlaceholder || (label ? `Select ${label}...` : 'Select...');
      return (
        <select {...commonProps} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (inputType === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={3}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        type={inputType}
        inputMode={getInputMode()}
        {...commonProps}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  };

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {props.required && <span className="text-danger" aria-hidden="true"> *</span>}
        </label>
      )}

      {renderInput()}

      {error && (
        <div id={`${inputId}-error`} className="input-error-text" role="alert">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id={`${inputId}-helper`} className="input-helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
