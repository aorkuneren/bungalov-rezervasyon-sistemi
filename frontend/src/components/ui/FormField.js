import React from 'react';

const FormField = ({ 
  label, 
  required = false, 
  error, 
  helpText, 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default FormField;
