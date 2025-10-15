import React from 'react';

const FormGrid = ({ 
  cols = 1, 
  gap = 'gap-4', 
  children, 
  className = '',
  ...props 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'
  };

  return (
    <div 
      className={`grid ${gridCols[cols] || gridCols[1]} ${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default FormGrid;
