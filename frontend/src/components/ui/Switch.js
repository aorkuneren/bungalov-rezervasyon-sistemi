import React from 'react';

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  color = 'blue',
  className = '',
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-7';
      case 'md':
        return 'h-5 w-9';
      case 'lg':
        return 'h-6 w-11';
      default:
        return 'h-5 w-9';
    }
  };

  const getColorClasses = () => {
    if (disabled) {
      return checked
        ? 'bg-gray-300'
        : 'bg-gray-200';
    }
    
    switch (color) {
      case 'blue':
        return checked
          ? 'bg-blue-600 focus:ring-blue-500'
          : 'bg-gray-200';
      case 'green':
        return checked
          ? 'bg-green-600 focus:ring-green-500'
          : 'bg-gray-200';
      case 'red':
        return checked
          ? 'bg-red-600 focus:ring-red-500'
          : 'bg-gray-200';
      case 'yellow':
        return checked
          ? 'bg-yellow-600 focus:ring-yellow-500'
          : 'bg-gray-200';
      default:
        return checked
          ? 'bg-blue-600 focus:ring-blue-500'
          : 'bg-gray-200';
    }
  };

  const getThumbSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const getThumbPositionClasses = () => {
    switch (size) {
      case 'sm':
        return checked ? 'translate-x-3' : 'translate-x-0';
      case 'md':
        return checked ? 'translate-x-4' : 'translate-x-0';
      case 'lg':
        return checked ? 'translate-x-5' : 'translate-x-0';
      default:
        return checked ? 'translate-x-4' : 'translate-x-0';
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`
        relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${getSizeClasses()}
        ${getColorClasses()}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
          ${getThumbSizeClasses()}
          ${getThumbPositionClasses()}
        `}
      />
    </button>
  );
};

export default Switch;
