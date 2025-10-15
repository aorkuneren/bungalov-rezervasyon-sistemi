import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Menu = ({
  items = [],
  trigger,
  placement = 'bottom-start',
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm py-1';
      case 'md':
        return 'text-sm py-1';
      case 'lg':
        return 'text-base py-2';
      default:
        return 'text-sm py-1';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-white border border-gray-200 shadow-lg';
      case 'dark':
        return 'bg-gray-900 border border-gray-700 shadow-lg';
      case 'minimal':
        return 'bg-white shadow-lg';
      default:
        return 'bg-white border border-gray-200 shadow-lg';
    }
  };

  const getItemClasses = () => {
    const baseClasses = `flex items-center w-full px-4 ${getSizeClasses()} font-medium transition-colors`;
    
    switch (variant) {
      case 'dark':
        return `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
      case 'minimal':
        return `${baseClasses} text-gray-700 hover:bg-gray-100 hover:text-gray-900`;
      default:
        return `${baseClasses} text-gray-700 hover:bg-gray-100 hover:text-gray-900`;
    }
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'top-start':
        return 'bottom-full left-0 mb-1';
      case 'top-end':
        return 'bottom-full right-0 mb-1';
      case 'bottom-start':
        return 'top-full left-0 mt-1';
      case 'bottom-end':
        return 'top-full right-0 mt-1';
      case 'left-start':
        return 'right-full top-0 mr-1';
      case 'left-end':
        return 'right-full bottom-0 mr-1';
      case 'right-start':
        return 'left-full top-0 ml-1';
      case 'right-end':
        return 'left-full bottom-0 ml-1';
      default:
        return 'top-full left-0 mt-1';
    }
  };

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef} {...props}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div className={`absolute z-50 w-48 rounded-md ${getVariantClasses()} ${getPlacementClasses()}`}>
          <div className="py-1">
            {items.map((item, index) => {
              if (item.separator) {
                return (
                  <div key={index} className="border-t border-gray-200 my-1" />
                );
              }

              if (item.disabled) {
                return (
                  <div
                    key={index}
                    className={`${getItemClasses()} opacity-50 cursor-not-allowed`}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                    <span>{item.label}</span>
                  </div>
                );
              }

              if (item.href) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    target={item.target}
                    rel={item.rel}
                    className={getItemClasses()}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                    <span>{item.label}</span>
                  </a>
                );
              }

              if (item.to) {
                return (
                  <Link
                    key={index}
                    to={item.to}
                    className={getItemClasses()}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={getItemClasses()}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Özel Menu Bileşenleri
export const DropdownMenu = ({ 
  trigger, 
  items, 
  placement = 'bottom-start',
  ...props 
}) => {
  const defaultTrigger = (
    <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors">
      <span>Menü</span>
      <ChevronDownIcon className="w-4 h-4" />
    </button>
  );

  return (
    <Menu
      trigger={trigger || defaultTrigger}
      items={items}
      placement={placement}
      {...props}
    />
  );
};

export const ContextMenu = ({ 
  children, 
  items, 
  placement = 'bottom-start',
  ...props 
}) => {
  return (
    <Menu
      trigger={children}
      items={items}
      placement={placement}
      {...props}
    />
  );
};

export const UserMenu = ({ 
  user, 
  items = [], 
  trigger,
  ...props 
}) => {
  const defaultItems = [
    { label: 'Profil', to: '/profile', icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { separator: true },
    { label: 'Çıkış', onClick: () => {}, icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    )}
  ];

  const defaultTrigger = (
    <button className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors">
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-800">
          {user?.name || 'Admin'}
        </div>
        <div className="text-xs text-gray-600">
          {user?.role || 'Yönetici'}
        </div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <ChevronDownIcon className="w-4 h-4" />
    </button>
  );

  return (
    <Menu
      trigger={trigger || defaultTrigger}
      items={[...defaultItems, ...items]}
      {...props}
    />
  );
};

export const ActionMenu = ({ 
  items, 
  trigger,
  ...props 
}) => {
  const defaultTrigger = (
    <button className="p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button>
  );

  return (
    <Menu
      trigger={trigger || defaultTrigger}
      items={items}
      {...props}
    />
  );
};

export default Menu;
