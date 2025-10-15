import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-5 w-5';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const getVariantClasses = () => {
    const baseClasses = 'rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    if (error) {
      return `${baseClasses} border-red-300 focus:ring-red-500 ${checked ? 'bg-red-600 border-red-600' : 'bg-red-50'}`;
    }
    
    if (disabled) {
      return `${baseClasses} border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed`;
    }
    
    switch (variant) {
      case 'default':
        return `${baseClasses} border-gray-300 ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-900'} focus:ring-blue-500 hover:border-gray-400`;
      case 'filled':
        return `${baseClasses} border-transparent bg-gray-100 ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'text-gray-900'} focus:ring-blue-500`;
      default:
        return `${baseClasses} border-gray-300 ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-900'} focus:ring-blue-500 hover:border-gray-400`;
    }
  };

  const checkboxClasses = `${getSizeClasses()} ${getVariantClasses()} ${className}`;

  return (
    <div className="w-full">
      <label className={`flex items-start space-x-3 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            required={required}
            className="sr-only"
            {...props}
          />
          <div className={`${checkboxClasses} flex items-center justify-center`}>
            {checked && (
              <svg
                className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        
        {label && (
          <div className="flex-1">
            <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        )}
      </label>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Switch component (toggle switch)
const Switch = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}, ref) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-9';
      case 'md':
        return 'h-6 w-11';
      case 'lg':
        return 'h-7 w-12';
      default:
        return 'h-6 w-11';
    }
  };

  const getThumbSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-5 w-5';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const getVariantClasses = () => {
    const baseClasses = 'relative inline-flex rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (error) {
      return `${baseClasses} ${checked ? 'bg-red-600' : 'bg-red-200'} focus:ring-red-500`;
    }
    
    if (disabled) {
      return `${baseClasses} ${checked ? 'bg-gray-400' : 'bg-gray-200'} cursor-not-allowed`;
    }
    
    switch (variant) {
      case 'default':
        return `${baseClasses} ${checked ? 'bg-blue-600' : 'bg-gray-200'} focus:ring-blue-500`;
      case 'success':
        return `${baseClasses} ${checked ? 'bg-green-600' : 'bg-gray-200'} focus:ring-green-500`;
      case 'warning':
        return `${baseClasses} ${checked ? 'bg-yellow-600' : 'bg-gray-200'} focus:ring-yellow-500`;
      default:
        return `${baseClasses} ${checked ? 'bg-blue-600' : 'bg-gray-200'} focus:ring-blue-500`;
    }
  };

  const switchClasses = `${getSizeClasses()} ${getVariantClasses()} ${className}`;
  const thumbClasses = `${getThumbSizeClasses()} transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'} bg-white rounded-full shadow`;

  return (
    <div className="w-full">
      <label className={`flex items-center space-x-3 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="sr-only"
            {...props}
          />
          <div className={switchClasses}>
            <div className={thumbClasses} />
          </div>
        </div>
        
        {label && (
          <div className="flex-1">
            <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        )}
      </label>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

// CheckboxGroup component
const CheckboxGroup = ({
  label,
  options = [],
  value = [],
  onChange,
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  orientation = 'vertical', // 'vertical' or 'horizontal'
  ...props
}) => {
  const handleChange = (optionValue, isChecked) => {
    if (disabled) return;
    
    let newValue;
    if (isChecked) {
      newValue = [...value, optionValue];
    } else {
      newValue = value.filter(v => v !== optionValue);
    }
    
    onChange?.(newValue);
  };

  const groupClasses = `space-y-2 ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : ''} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={groupClasses}>
        {options.map((option, index) => (
          <Checkbox
            key={option.value || index}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            disabled={disabled || option.disabled}
            size="md"
            {...props}
          />
        ))}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';

export default Checkbox;
export { Switch, CheckboxGroup };