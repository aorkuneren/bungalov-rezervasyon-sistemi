import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({
  to,
  href,
  children,
  icon,
  badge,
  active = false,
  disabled = false,
  onClick,
  className = '',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  const location = useLocation();
  const isActive = active || (to && location.pathname === to);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    const baseClasses = 'flex items-center font-medium transition-colors rounded-lg';
    
    if (disabled) {
      return `${baseClasses} text-gray-400 cursor-not-allowed`;
    }
    
    if (isActive) {
      switch (variant) {
        case 'default':
          return `${baseClasses} bg-gray-900 text-white`;
        case 'outline':
          return `${baseClasses} border border-gray-900 text-gray-900 bg-white`;
        case 'ghost':
          return `${baseClasses} bg-gray-100 text-gray-900`;
        case 'minimal':
          return `${baseClasses} text-gray-900`;
        default:
          return `${baseClasses} bg-gray-900 text-white`;
      }
    }
    
    switch (variant) {
      case 'default':
        return `${baseClasses} text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
      case 'outline':
        return `${baseClasses} border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 bg-white`;
      case 'ghost':
        return `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
      case 'minimal':
        return `${baseClasses} text-gray-600 hover:text-gray-900`;
      default:
        return `${baseClasses} text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
    }
  };

  const getWidthClasses = () => {
    return fullWidth ? 'w-full justify-start' : '';
  };

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className={icon ? 'ml-2' : ''}>
        {children}
      </span>
      {badge && (
        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
          isActive 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {badge}
        </span>
      )}
    </>
  );

  const classes = `${getSizeClasses()} ${getVariantClasses()} ${getWidthClasses()} ${className}`;

  if (disabled) {
    return (
      <span className={classes} {...props}>
        {content}
      </span>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
};

// Özel NavItem Bileşenleri
export const NavLink = (props) => (
  <NavItem {...props} />
);

export const NavButton = ({ children, ...props }) => (
  <NavItem {...props}>
    {children}
  </NavItem>
);

export const IconNavItem = ({ icon, children, ...props }) => (
  <NavItem icon={icon} {...props}>
    {children}
  </NavItem>
);

export const BadgeNavItem = ({ badge, children, ...props }) => (
  <NavItem badge={badge} {...props}>
    {children}
  </NavItem>
);

export const FullWidthNavItem = (props) => (
  <NavItem fullWidth {...props} />
);

// NavItem Group - Birden fazla NavItem'ı gruplamak için
export const NavItemGroup = ({
  children,
  title,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {title && (
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

// NavItem List - NavItem'ları liste halinde göstermek için
export const NavItemList = ({
  items = [],
  activeItem,
  onItemClick,
  className = '',
  ...props
}) => {
  return (
    <nav className={`space-y-1 ${className}`} {...props}>
      {items.map((item) => (
        <NavItem
          key={item.id}
          to={item.to}
          href={item.href}
          icon={item.icon}
          badge={item.badge}
          active={activeItem === item.id}
          disabled={item.disabled}
          onClick={() => onItemClick?.(item.id)}
          variant={item.variant}
          size={item.size}
          fullWidth={item.fullWidth}
        >
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
};

export default NavItem;
