import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '',
  onClick 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'primary':
        return 'bg-gray-900 text-white border-gray-900';
      case 'secondary':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-xs';
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2.5 py-1 text-sm';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2 py-0.5 text-xs';
    }
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 transition-colors overflow-hidden';
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80' : '';

  return (
    <span 
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

// Özel Badge Bileşenleri
export const StatusBadge = ({ status, type = 'reservation' }) => {
  const getStatusConfig = () => {
    if (type === 'reservation') {
      const config = {
        'pending': { variant: 'secondary', label: 'Beklemede' },
        'confirmed': { variant: 'success', label: 'Onaylandı' },
        'checked_in': { variant: 'warning', label: 'Giriş Yaptı' },
        'completed': { variant: 'primary', label: 'Tamamlandı' },
        'cancelled': { variant: 'danger', label: 'İptal Edildi' }
      };
      return config[status] || { variant: 'secondary', label: status };
    }
    
    if (type === 'payment') {
      const config = {
        'unpaid': { variant: 'danger', label: 'Ödenmedi' },
        'partial': { variant: 'warning', label: 'Kısmi Ödendi' },
        'paid': { variant: 'success', label: 'Ödendi' },
        'refunded': { variant: 'secondary', label: 'İade Edildi' }
      };
      return config[status] || { variant: 'secondary', label: status };
    }
    
    if (type === 'customer') {
      const config = {
        'active': { variant: 'success', label: 'Aktif' },
        'inactive': { variant: 'secondary', label: 'Pasif' },
        'banned': { variant: 'danger', label: 'Banlı' }
      };
      return config[status] || { variant: 'secondary', label: status };
    }
    
    if (type === 'bungalow') {
      const config = {
        'active': { variant: 'success', label: 'Aktif' },
        'inactive': { variant: 'secondary', label: 'Pasif' },
        'maintenance': { variant: 'warning', label: 'Bakımda' }
      };
      return config[status] || { variant: 'secondary', label: status };
    }
    
    return { variant: 'secondary', label: status };
  };

  const config = getStatusConfig();
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default Badge;
