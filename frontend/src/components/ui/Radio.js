import React, { forwardRef } from 'react';

const Radio = forwardRef(({
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  size = 'md',
  variant = 'default',
  name,
  ...props
}, ref) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getVariantClasses = () => {
    if (error) {
      return 'border-red-300 text-red-600 focus:ring-red-500';
    }
    
    if (disabled) {
      return 'border-gray-300 text-gray-400 cursor-not-allowed';
    }
    
    switch (variant) {
      case 'default':
        return 'border-gray-300 text-gray-600 focus:ring-gray-500';
      case 'primary':
        return 'border-gray-300 text-gray-900 focus:ring-gray-500';
      default:
        return 'border-gray-300 text-gray-600 focus:ring-gray-500';
    }
  };

  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e);
    }
  };

  const radioClasses = `${getSizeClasses()} ${getVariantClasses()} ${className}`;

  return (
    <div className="w-full">
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={`${radioClasses} rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors`}
            {...props}
          />
          
          {checked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5'} bg-current rounded-full`} />
            </div>
          )}
        </div>
        
        {label && (
          <div className="ml-3">
            <label className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}
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
});

Radio.displayName = 'Radio';

// Özel Radio Bileşenleri
export const RadioGroup = ({
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  className = '',
  name,
  orientation = 'vertical',
  ...props
}) => {
  const handleChange = (optionValue) => {
    if (disabled) return;
    onChange?.(optionValue);
  };

  const getOrientationClasses = () => {
    switch (orientation) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'vertical':
        return 'space-y-2';
      default:
        return 'space-y-2';
    }
  };

  return (
    <div className={`${getOrientationClasses()} ${className}`}>
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          label={option.label}
          value={option.value}
          checked={value === option.value}
          onChange={() => handleChange(option.value)}
          disabled={disabled}
          {...props}
        />
      ))}
      
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

export const RadioCard = ({
  label,
  description,
  value,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '',
  size = 'md',
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getVariantClasses = () => {
    if (error) {
      return 'border-red-300 bg-red-50';
    }
    
    if (disabled) {
      return 'border-gray-200 bg-gray-50 cursor-not-allowed';
    }
    
    if (checked) {
      return 'border-gray-900 bg-gray-50';
    }
    
    return 'border-gray-200 bg-white hover:border-gray-300';
  };

  const handleChange = () => {
    if (!disabled) {
      onChange?.(value);
    }
  };

  return (
    <div
      className={`${getSizeClasses()} ${getVariantClasses()} border rounded-lg cursor-pointer transition-colors ${className}`}
      onClick={handleChange}
    >
      <div className="flex items-start">
        <Radio
          value={value}
          checked={checked}
          onChange={() => handleChange()}
          disabled={disabled}
          className="mt-0.5"
          {...props}
        />
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {label}
            </h3>
            {checked && (
              <div className="w-2 h-2 bg-gray-900 rounded-full" />
            )}
          </div>
          
          {description && (
            <p className={`mt-1 text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const RadioCardGroup = ({
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  className = '',
  orientation = 'vertical',
  ...props
}) => {
  const getOrientationClasses = () => {
    switch (orientation) {
      case 'horizontal':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'vertical':
        return 'space-y-3';
      default:
        return 'space-y-3';
    }
  };

  return (
    <div className={`${getOrientationClasses()} ${className}`}>
      {options.map((option) => (
        <RadioCard
          key={option.value}
          label={option.label}
          description={option.description}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
      ))}
      
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

export default Radio;
