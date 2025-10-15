import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
      case 'warning':
        return 'bg-yellow-500 text-white hover:bg-yellow-400 focus:ring-yellow-500';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
      default:
        return 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs';
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'xl':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  const renderIcon = () => {
    if (loading) {
      return (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      );
    }
    
    if (icon) {
      return icon;
    }
    
    return null;
  };

  const renderContent = () => {
    const iconElement = renderIcon();
    
    if (!iconElement) {
      return children;
    }
    
    if (iconPosition === 'right') {
      return (
        <>
          {children}
          <span className="ml-2">{iconElement}</span>
        </>
      );
    }
    
    return (
      <>
        <span>{iconElement}</span>
        {children}
      </>
    );
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// Özel Buton Bileşenleri
export const IconButton = ({ icon, ...props }) => (
  <Button {...props} icon={icon}>
    {props.children}
  </Button>
);

export const LoadingButton = ({ loading, children, ...props }) => (
  <Button {...props} loading={loading}>
    {children}
  </Button>
);

export default Button;
