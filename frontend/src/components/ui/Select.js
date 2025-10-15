import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Seçiniz",
  label,
  disabled = false,
  required = false,
  error,
  helperText,
  className = "",
  size = 'md',
  variant = 'default',
  searchable = false,
  clearable = false,
  multiple = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
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
    if (error) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50';
    }
    
    if (disabled) {
      return 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed';
    }
    
    switch (variant) {
      case 'default':
        return 'border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-gray-500 hover:border-gray-400';
      case 'filled':
        return 'border-transparent bg-gray-100 text-gray-900 focus:bg-white focus:border-gray-500 focus:ring-gray-500';
      default:
        return 'border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-gray-500 hover:border-gray-400';
    }
  };

  const handleSelect = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange?.(newValues);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const getSelectedOptions = () => {
    if (multiple) {
      const values = Array.isArray(value) ? value : [];
      return options.filter(option => values.includes(option.value));
    } else {
      return options.filter(option => option.value === value);
    }
  };

  const selectedOptions = getSelectedOptions();
  const displayText = multiple 
    ? selectedOptions.length > 0 
      ? `${selectedOptions.length} seçenek seçildi`
      : placeholder
    : selectedOptions.length > 0 
      ? selectedOptions[0].label 
      : placeholder;

  const baseClasses = 'w-full border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  const buttonClasses = `${baseClasses} ${getSizeClasses()} ${getVariantClasses()} flex items-center justify-between ${className}`;

  return (
    <div className="w-full relative" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={buttonClasses}
        {...props}
      >
        <span className={`text-left truncate ${selectedOptions.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
          {displayText}
        </span>
        <div className="flex items-center space-x-1">
          {clearable && ((multiple && Array.isArray(value) && value.length > 0) || (!multiple && value)) && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ara..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="py-1 max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = multiple 
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center justify-between hover:bg-gray-100 transition-colors ${
                      isSelected ? 'bg-gray-100 text-gray-900' : 'text-gray-900'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <CheckIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                {searchable && searchTerm ? 'Sonuç bulunamadı' : 'Seçenek yok'}
              </div>
            )}
          </div>
        </div>
      )}
      
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
};

// Özel Select Bileşenleri
export const MultiSelect = (props) => (
  <Select multiple {...props} />
);

export const SearchableSelect = (props) => (
  <Select searchable {...props} />
);

export const ClearableSelect = (props) => (
  <Select clearable {...props} />
);

export default Select;
