import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Navigation = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Bungalovlar', path: '/bungalows', icon: BuildingOfficeIcon },
    { name: 'Rezervasyonlar', path: '/reservations', icon: CalendarDaysIcon },
    { name: 'Müşteriler', path: '/customers', icon: UsersIcon },
    { name: 'Raporlar', path: '/reports', icon: ChartBarIcon },
    { name: 'Ayarlar', path: '/settings', icon: Cog6ToothIcon },
  ];

  // Click outside to close dropdown
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    closeMobileMenu();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Sol Bölüm - Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">BungApp</h1>
          </div>

          {/* Orta Bölüm - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Sağ Bölüm - User Profile & Actions */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            {/* User Info Button */}
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-600">
                  {user?.role_display_name || 'Yönetici'}
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <Link 
                  to="/profile" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <UserIcon className="w-4 h-4 mr-3" />
                  Profil
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  Çıkış
                </button>
              </div>
            )}
          </div>

          {/* Mobile User Info & Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile User Info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-600">
                  {user?.role_display_name || 'Yönetici'}
                </div>
              </div>
            </div>
            
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-md transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Accordion) */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {/* Navigation Items */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Profile Actions */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link 
                to="/profile" 
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profil</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
