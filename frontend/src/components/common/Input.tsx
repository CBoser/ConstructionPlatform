import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputType?: 'text' | 'number' | 'date' | 'email' | 'password' | 'tel' | 'select';
  options?: { value: string; label: string }[];
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  inputType = 'text',
  options = [],
  className = '',
  ...props
}) => {
  const inputClasses = `input ${error ? 'input-error' : ''} ${className}`;

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {props.required && <span className="text-danger"> *</span>}
        </label>
      )}

      {inputType === 'select' ? (
        <select className={inputClasses} {...(props as any)}>
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={inputType}
          className={inputClasses}
          {...(props as any)}
        />
      )}

      {error && <div className="input-error-text">{error}</div>}
      {helperText && !error && <div className="input-helper-text">{helperText}</div>}
    </div>
  );
};

export default Input;
