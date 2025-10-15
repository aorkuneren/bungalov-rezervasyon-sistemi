import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
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
  rows = 3,
  resize = 'vertical',
  maxLength,
  showCharCount = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-2 text-sm';
      case 'md':
        return 'px-3 py-2.5 text-sm';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2.5 text-sm';
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

  const getResizeClasses = () => {
    switch (resize) {
      case 'none':
        return 'resize-none';
      case 'both':
        return 'resize';
      case 'horizontal':
        return 'resize-x';
      case 'vertical':
        return 'resize-y';
      default:
        return 'resize-y';
    }
  };

  const textareaClasses = `${getSizeClasses()} ${getVariantClasses()} ${getResizeClasses()} ${className}`;
  const currentLength = value ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
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
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
        {...props}
      />
      
      {(error || helperText || (showCharCount && maxLength)) && (
        <div className="mt-1 flex justify-between items-start">
          <div>
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
          
          {showCharCount && maxLength && (
            <p className={`text-xs ${currentLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Özel Textarea Bileşenleri
export const LargeTextarea = (props) => (
  <Textarea rows={6} {...props} />
);

export const SmallTextarea = (props) => (
  <Textarea rows={2} size="sm" {...props} />
);

export const AutoResizeTextarea = ({ value, ...props }) => {
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      resize="none"
      {...props}
    />
  );
};

export default Textarea;
