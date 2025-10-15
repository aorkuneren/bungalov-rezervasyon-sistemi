import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDownIcon, 
  Bars3Icon, 
  XMarkIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

const Navbar = ({
  logo,
  brandName = "BungApp",
  navItems = [],
  user,
  onLogout,
  isAuthenticated = true,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dropdown dışına tıklama ile kapanma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mobil menü kapanması için
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-12';
      case 'md':
        return 'h-16';
      case 'lg':
        return 'h-20';
      default:
        return 'h-16';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-gray-50 shadow-sm border-b border-gray-200';
      case 'dark':
        return 'bg-gray-900 shadow-lg border-b border-gray-700';
      case 'transparent':
        return 'bg-transparent';
      case 'white':
        return 'bg-white shadow-sm border-b border-gray-200';
      default:
        return 'bg-gray-50 shadow-sm border-b border-gray-200';
    }
  };

  const getTextVariantClasses = () => {
    switch (variant) {
      case 'dark':
        return 'text-white';
      default:
        return 'text-gray-800';
    }
  };

  const getNavItemClasses = (isActive) => {
    const baseClasses = 'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors';
    
    if (variant === 'dark') {
      return isActive 
        ? `${baseClasses} bg-white text-gray-900`
        : `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
    }
    
    return isActive 
      ? `${baseClasses} bg-gray-900 text-white`
      : `${baseClasses} text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
  };

  const getMobileNavItemClasses = (isActive) => {
    const baseClasses = 'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors';
    
    if (variant === 'dark') {
      return isActive 
        ? `${baseClasses} bg-white text-gray-900`
        : `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
    }
    
    return isActive 
      ? `${baseClasses} bg-gray-900 text-white`
      : `${baseClasses} text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
  };

  const getProfileButtonClasses = () => {
    const baseClasses = 'flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors';
    
    if (variant === 'dark') {
      return `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
    }
    
    return `${baseClasses} text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
  };

  const getMobileProfileClasses = () => {
    const baseClasses = 'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors';
    
    if (variant === 'dark') {
      return `${baseClasses} text-gray-300 hover:bg-gray-800 hover:text-white`;
    }
    
    return `${baseClasses} text-gray-600 hover:bg-gray-200 hover:text-gray-800`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${getVariantClasses()} ${className}`} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${getSizeClasses()}`}>
          {/* Sol taraf - Logo ve Brand Adı */}
          <div className="flex items-center space-x-3">
            {logo ? (
              <div className="flex items-center">
                {logo}
              </div>
            ) : (
              <div className={`w-8 h-8 ${variant === 'dark' ? 'bg-white' : 'bg-gray-900'} rounded-lg flex items-center justify-center`}>
                <div className={`w-5 h-5 ${variant === 'dark' ? 'text-gray-900' : 'text-white'}`}>
                  {/* Default logo icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </div>
            )}
            <h1 className={`text-xl font-bold ${getTextVariantClasses()}`}>
              {brandName}
            </h1>
          </div>

          {/* Desktop Navigasyon Menüsü */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getNavItemClasses(isActive)}
                >
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Kullanıcı Bilgileri ve Dropdown */}
          {user && (
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={getProfileButtonClasses()}
              >
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getTextVariantClasses()}`}>
                    {user.name || 'Admin'}
                  </div>
                  <div className={`text-xs ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user.role || 'Yönetici'}
                  </div>
                </div>
                <div className={`w-8 h-8 ${variant === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                  <UserIcon className={`w-5 h-5 ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Dropdown Menü */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {user.menuItems?.map((menuItem, index) => (
                    <Link
                      key={index}
                      to={menuItem.path}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      {menuItem.icon && <menuItem.icon className="w-4 h-4 mr-3" />}
                      {menuItem.name}
                    </Link>
                  ))}
                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Çıkış
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobil Hamburger Menü Butonu */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobil Kullanıcı Bilgileri */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 ${variant === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                  <UserIcon className={`w-5 h-5 ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getTextVariantClasses()}`}>
                    {user.name || 'Admin'}
                  </div>
                  <div className={`text-xs ${variant === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user.role || 'Yönetici'}
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md transition-colors ${variant === 'dark' ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobil Menü */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${variant === 'dark' ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}>
              {/* Mobil Navigasyon Menüsü */}
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={getMobileNavItemClasses(isActive)}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobil Profil ve Çıkış */}
              {user && (
                <div className={`border-t ${variant === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-2 mt-2`}>
                  {user.menuItems?.map((menuItem, index) => (
                    <Link
                      key={index}
                      to={menuItem.path}
                      onClick={closeMobileMenu}
                      className={getMobileProfileClasses()}
                    >
                      {menuItem.icon && <menuItem.icon className="w-5 h-5" />}
                      <span>{menuItem.name}</span>
                    </Link>
                  ))}
                  {onLogout && (
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        onLogout();
                      }}
                      className={`flex items-center space-x-3 w-full ${getMobileProfileClasses()}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Çıkış</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
