import React from 'react';

const Tabs = ({
  items = [],
  activeTab,
  onTabChange,
  className = '',
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-3 py-2';
      case 'md':
        return 'text-sm px-4 py-2';
      case 'lg':
        return 'text-base px-6 py-3';
      default:
        return 'text-sm px-4 py-2';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'border-b border-gray-200';
      case 'pills':
        return 'space-x-1';
      case 'underline':
        return 'border-b border-gray-200';
      case 'minimal':
        return '';
      default:
        return 'border-b border-gray-200';
    }
  };

  const getTabClasses = (isActive) => {
    const baseClasses = `flex items-center justify-center font-medium transition-colors ${getSizeClasses()}`;
    
    if (variant === 'pills') {
      return isActive 
        ? `${baseClasses} bg-gray-900 text-white rounded-lg`
        : `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg`;
    }
    
    if (variant === 'underline') {
      return isActive 
        ? `${baseClasses} text-gray-900 border-b-2 border-gray-900`
        : `${baseClasses} text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300`;
    }
    
    if (variant === 'minimal') {
      return isActive 
        ? `${baseClasses} text-gray-900`
        : `${baseClasses} text-gray-600 hover:text-gray-900`;
    }
    
    // Default variant
    return isActive 
      ? `${baseClasses} text-gray-900 border-b-2 border-gray-900`
      : `${baseClasses} text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300`;
  };

  const getOrientationClasses = () => {
    switch (orientation) {
      case 'vertical':
        return 'flex flex-col space-y-1';
      case 'horizontal':
        return 'flex space-x-1';
      default:
        return 'flex space-x-1';
    }
  };

  const getContainerClasses = () => {
    const orientationClasses = getOrientationClasses();
    const variantClasses = getVariantClasses();
    
    if (orientation === 'vertical') {
      return `${orientationClasses} ${variantClasses}`;
    }
    
    return `${orientationClasses} ${variantClasses}`;
  };

  return (
    <div className={`${getContainerClasses()} ${className}`} {...props}>
      {items.map((item) => {
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange?.(item.id)}
            className={`${getTabClasses(isActive)} ${fullWidth ? 'flex-1' : ''}`}
            disabled={item.disabled}
          >
            {item.icon && (
              <item.icon className="w-5 h-5 mr-2" />
            )}
            <span>{item.name}</span>
            {item.badge && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                isActive 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// Tab Content Bileşeni
export const TabContent = ({
  children,
  activeTab,
  className = '',
  ...props
}) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

// Tab Panel Bileşeni
export const TabPanel = ({
  children,
  tabId,
  activeTab,
  className = '',
  ...props
}) => {
  if (tabId !== activeTab) {
    return null;
  }

  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

// Özel Tab Bileşenleri
export const PillsTabs = (props) => (
  <Tabs variant="pills" {...props} />
);

export const UnderlineTabs = (props) => (
  <Tabs variant="underline" {...props} />
);

export const MinimalTabs = (props) => (
  <Tabs variant="minimal" {...props} />
);

export const VerticalTabs = (props) => (
  <Tabs orientation="vertical" {...props} />
);

export const FullWidthTabs = (props) => (
  <Tabs fullWidth {...props} />
);

// Tab Container - Tabs ve TabContent'i birlikte kullanmak için
export const TabContainer = ({
  items = [],
  activeTab,
  onTabChange,
  children,
  className = '',
  tabClassName = '',
  contentClassName = '',
  ...props
}) => {
  return (
    <div className={className} {...props}>
      <Tabs
        items={items}
        activeTab={activeTab}
        onTabChange={onTabChange}
        className={tabClassName}
      />
      <TabContent className={contentClassName}>
        {children}
      </TabContent>
    </div>
  );
};

export default Tabs;
