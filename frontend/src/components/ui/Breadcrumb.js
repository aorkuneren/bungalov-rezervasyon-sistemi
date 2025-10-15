import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({
  items = [],
  separator = 'chevron',
  className = '',
  size = 'md',
  variant = 'default',
  showHome = true,
  homePath = '/',
  homeLabel = 'Ana Sayfa',
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'text-gray-500';
      case 'dark':
        return 'text-gray-400';
      case 'minimal':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  const getLinkClasses = () => {
    switch (variant) {
      case 'default':
        return 'text-gray-500 hover:text-gray-700';
      case 'dark':
        return 'text-gray-400 hover:text-gray-200';
      case 'minimal':
        return 'text-gray-600 hover:text-gray-900';
      default:
        return 'text-gray-500 hover:text-gray-700';
    }
  };

  const getActiveClasses = () => {
    switch (variant) {
      case 'default':
        return 'text-gray-900';
      case 'dark':
        return 'text-white';
      case 'minimal':
        return 'text-gray-900';
      default:
        return 'text-gray-900';
    }
  };

  const getSeparatorIcon = () => {
    switch (separator) {
      case 'chevron':
        return <ChevronRightIcon className="w-4 h-4" />;
      case 'slash':
        return <span>/</span>;
      case 'arrow':
        return <span>→</span>;
      case 'dot':
        return <span>•</span>;
      default:
        return <ChevronRightIcon className="w-4 h-4" />;
    }
  };

  const allItems = showHome 
    ? [{ path: homePath, label: homeLabel, icon: HomeIcon }, ...items]
    : items;

  return (
    <nav className={`flex items-center space-x-1 ${getSizeClasses()} ${getVariantClasses()} ${className}`} {...props}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const IconComponent = item.icon;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="flex-shrink-0">
                {getSeparatorIcon()}
              </span>
            )}
            
            {isLast ? (
              <span className={`flex items-center ${getActiveClasses()}`}>
                {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                <span className="truncate">{item.label}</span>
              </span>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center ${getLinkClasses()} hover:underline`}
              >
                {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
                <span className="truncate">{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Özel Breadcrumb Bileşenleri
export const BreadcrumbWithHome = (props) => (
  <Breadcrumb showHome {...props} />
);

export const BreadcrumbWithoutHome = (props) => (
  <Breadcrumb showHome={false} {...props} />
);

export const SlashBreadcrumb = (props) => (
  <Breadcrumb separator="slash" {...props} />
);

export const ArrowBreadcrumb = (props) => (
  <Breadcrumb separator="arrow" {...props} />
);

export const DotBreadcrumb = (props) => (
  <Breadcrumb separator="dot" {...props} />
);

export const DarkBreadcrumb = (props) => (
  <Breadcrumb variant="dark" {...props} />
);

export const MinimalBreadcrumb = (props) => (
  <Breadcrumb variant="minimal" {...props} />
);

// Breadcrumb Container - Başlık ile birlikte kullanmak için
export const BreadcrumbContainer = ({
  title,
  subtitle,
  breadcrumbItems,
  actions,
  className = '',
  breadcrumbClassName = '',
  ...props
}) => {
  return (
    <div className={`${className}`} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb 
            items={breadcrumbItems} 
            className={breadcrumbClassName}
          />
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Breadcrumb Helper - Sayfa yollarını otomatik oluşturmak için
export const createBreadcrumbItems = (pathname) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const items = [];
  
  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Segment'i daha okunabilir hale getir
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    items.push({
      path: currentPath,
      label: label,
      isLast: index === pathSegments.length - 1
    });
  });
  
  return items;
};

export default Breadcrumb;
