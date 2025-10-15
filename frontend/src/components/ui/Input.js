import React, { forwardRef } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  size = 'md',
  variant = 'default',
  showPasswordToggle = false,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-2.5 text-sm';
      case 'md':
        return 'h-10 px-3 text-sm';
      case 'lg':
        return 'h-12 px-4 text-base';
      default:
        return 'h-10 px-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    const baseClasses = 'w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    if (error) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    }
    
    if (disabled) {
      return `${baseClasses} border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed`;
    }
    
    switch (variant) {
      case 'default':
        return `${baseClasses} border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-gray-500 hover:border-gray-400`;
      case 'filled':
        return `${baseClasses} border-transparent bg-gray-100 text-gray-900 focus:bg-white focus:border-gray-500 focus:ring-gray-500`;
      default:
        return `${baseClasses} border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-gray-500 hover:border-gray-400`;
    }
  };

  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const inputClasses = `${getSizeClasses()} ${getVariantClasses()} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {React.createElement(leftIcon, { className: "h-5 w-5" })}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          type={getInputType()}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon || (type === 'password' && showPasswordToggle) ? 'pr-10' : ''}`}
          {...props}
        />
        
        {(rightIcon || (type === 'password' && showPasswordToggle)) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {type === 'password' && showPasswordToggle ? (
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            ) : (
              <div className="h-5 w-5 text-gray-400">
                {React.createElement(rightIcon, { className: "h-5 w-5" })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Özel Input Bileşenleri
export const EmailInput = (props) => (
  <Input type="email" {...props} />
);

export const PasswordInput = (props) => (
  <Input type="password" showPasswordToggle {...props} />
);

export const NumberInput = ({ value, onChange, ...props }) => {
  const formatCurrency = (inputValue) => {
    const numbers = inputValue.replace(/\D/g, '');
    if (!numbers) return '';

    // TL biçimlendirmesi yap
    const formatted = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0, // kuruş göstermemek için
      maximumFractionDigits: 0,
    }).format(Number(numbers));

    return formatted;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Sadece rakamları al
    const numbers = inputValue.replace(/\D/g, '');

    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: numbers, // parent’a sade değer gönder
        },
      });
    }
  };

  const displayValue = value ? formatCurrency(value.toString()) : '';

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder="₺0"
      {...props}
    />
  );
};

export const TelInput = ({ value, onChange, ...props }) => {
  const formatPhoneNumber = (inputValue) => {
    // Sadece rakamları al
    const numbers = inputValue.replace(/\D/g, '');
    
    // +90 ile başlamıyorsa +90 ekle
    let formatted = numbers;
    if (!formatted.startsWith('90')) {
      formatted = '90' + formatted;
    }
    
    // Maksimum 12 karakter (90 + 10 haneli numara)
    if (formatted.length > 12) {
      formatted = formatted.substring(0, 12);
    }
    
    // Format: +90 (5XX) XXX XX XX
    if (formatted.length >= 3) {
      const countryCode = formatted.substring(0, 2);
      const remaining = formatted.substring(2);
      
      if (remaining.length === 0) {
        return `+${countryCode}`;
      } else if (remaining.length <= 3) {
        return `+${countryCode} (${remaining}`;
      } else if (remaining.length <= 6) {
        return `+${countryCode} (${remaining.substring(0, 3)}) ${remaining.substring(3)}`;
      } else if (remaining.length <= 8) {
        return `+${countryCode} (${remaining.substring(0, 3)}) ${remaining.substring(3, 6)} ${remaining.substring(6)}`;
      } else {
        return `+${countryCode} (${remaining.substring(0, 3)}) ${remaining.substring(3, 6)} ${remaining.substring(6, 8)} ${remaining.substring(8, 10)}`;
      }
    }
    
    return formatted;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue);
    
    // Sadece rakamları parent component'e gönder
    const numbers = formatted.replace(/\D/g, '');
    
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: numbers
        }
      });
    }
  };

  const displayValue = value ? formatPhoneNumber(value) : '';

  return (
    <Input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      placeholder="+90 (5XX) XXX XX XX"
      {...props}
    />
  );
};

export const DateInput = (props) => (
  <Input type="date" {...props} />
);

export const SearchInput = (props) => (
  <Input type="search" {...props} />
);

export default Input;
