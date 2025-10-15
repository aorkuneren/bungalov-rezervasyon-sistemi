import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'default',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  
  const variantClasses = {
    default: '',
    elevated: 'shadow-lg',
    outlined: 'border-2',
    flat: 'shadow-none border-gray-100'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
