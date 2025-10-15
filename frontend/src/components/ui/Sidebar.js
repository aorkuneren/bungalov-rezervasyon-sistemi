import React from 'react';

const Sidebar = ({
  items = [],
  activeItem,
  onItemClick,
  className = '',
  variant = 'default',
  size = 'md',
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-48';
      case 'md':
        return 'w-64';
      case 'lg':
        return 'w-80';
      default:
        return 'w-64';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-white border border-gray-200';
      case 'dark':
        return 'bg-gray-900 border border-gray-700';
      case 'minimal':
        return 'bg-transparent';
      default:
        return 'bg-white border border-gray-200';
    }
  };

  const getTextVariantClasses = () => {
    switch (variant) {
      case 'dark':
        return 'text-gray-300';
      default:
        return 'text-gray-600';
    }
  };

  const getActiveTextVariantClasses = () => {
    switch (variant) {
      case 'dark':
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  const getItemClasses = (isActive) => {
    const baseClasses = 'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors';
    
    if (variant === 'dark') {
      return isActive 
        ? `${baseClasses} bg-gray-800 text-white`
        : `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
    }
    
    return isActive 
      ? `${baseClasses} bg-gray-100 text-gray-900`
      : `${baseClasses} text-gray-600 hover:bg-gray-50 hover:text-gray-900`;
  };

  const getCollapsedClasses = () => {
    return collapsed ? 'w-16' : getSizeClasses();
  };

  return (
    <div 
      className={`${getCollapsedClasses()} ${getVariantClasses()} rounded-lg transition-all duration-300 ${className}`} 
      {...props}
    >
      {/* Header */}
      {header && (
        <div className="p-4 border-b border-gray-200">
          {header}
        </div>
      )}

      {/* Collapse Toggle */}
      {collapsible && (
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
              variant === 'dark' 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={getItemClasses(isActive)}
              disabled={item.disabled}
            >
              {IconComponent && (
                <IconComponent className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
              )}
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
              {item.badge && !collapsed && (
                <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                  variant === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

// Özel Sidebar Bileşenleri
export const SidebarWithHeader = ({ 
  title, 
  subtitle, 
  items, 
  activeItem, 
  onItemClick, 
  ...props 
}) => {
  const header = (
    <div>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <Sidebar
      header={header}
      items={items}
      activeItem={activeItem}
      onItemClick={onItemClick}
      {...props}
    />
  );
};

export const SidebarWithFooter = ({ 
  footerContent, 
  items, 
  activeItem, 
  onItemClick, 
  ...props 
}) => {
  const footer = (
    <div className="text-sm text-gray-500">
      {footerContent}
    </div>
  );

  return (
    <Sidebar
      footer={footer}
      items={items}
      activeItem={activeItem}
      onItemClick={onItemClick}
      {...props}
    />
  );
};

export const CollapsibleSidebar = ({ 
  items, 
  activeItem, 
  onItemClick, 
  collapsed, 
  onToggleCollapse, 
  ...props 
}) => {
  return (
    <Sidebar
      collapsible
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      items={items}
      activeItem={activeItem}
      onItemClick={onItemClick}
      {...props}
    />
  );
};

export default Sidebar;
