import React from 'react';

const FormGroup = ({
  children,
  label,
  required = false,
  error,
  helperText,
  className = '',
  size = 'md',
  orientation = 'vertical',
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getOrientationClasses = () => {
    switch (orientation) {
      case 'horizontal':
        return 'flex items-start space-x-4';
      case 'vertical':
        return 'space-y-1';
      default:
        return 'space-y-1';
    }
  };

  const getLabelClasses = () => {
    const baseClasses = 'block font-medium text-gray-700';
    const sizeClasses = getSizeClasses();
    
    if (orientation === 'horizontal') {
      return `${baseClasses} ${sizeClasses} w-32 flex-shrink-0 pt-2`;
    }
    
    return `${baseClasses} ${sizeClasses} mb-2`;
  };

  const getContentClasses = () => {
    if (orientation === 'horizontal') {
      return 'flex-1';
    }
    return '';
  };

  return (
    <div className={`${getOrientationClasses()} ${className}`} {...props}>
      {label && (
        <label className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={getContentClasses()}>
        {children}
        
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
    </div>
  );
};

// Özel FormGroup Bileşenleri
export const FormRow = ({ children, className = '', ...props }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`} {...props}>
    {children}
  </div>
);

export const FormSection = ({ 
  title, 
  description, 
  action,
  children, 
  className = '',
  ...props 
}) => (
  <div className={`space-y-5 ${className}`} {...props}>
    {(title || description || action) && (
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    )}
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

export const FormActions = ({ 
  children, 
  className = '',
  align = 'right',
  ...props 
}) => {
  const getAlignClasses = () => {
    switch (align) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      case 'between':
        return 'justify-between';
      default:
        return 'justify-end';
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${getAlignClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const FormField = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
  ...props
}) => (
  <FormGroup
    label={label}
    required={required}
    error={error}
    helperText={helperText}
    className={className}
    {...props}
  >
    {children}
  </FormGroup>
);

export const FormGrid = ({ 
  children, 
  columns = 2,
  className = '',
  ...props 
}) => {
  const getGridClasses = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  return (
    <div className={`grid ${getGridClasses()} gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default FormGroup;
