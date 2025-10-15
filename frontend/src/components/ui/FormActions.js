import React from 'react';

const FormActions = ({ 
  children, 
  className = '',
  align = 'right',
  ...props 
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div 
      className={`flex items-center gap-3 ${alignmentClasses[align]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default FormActions;
