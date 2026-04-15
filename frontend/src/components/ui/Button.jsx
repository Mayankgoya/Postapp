import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon: LeftIcon, 
  rightIcon: RightIcon, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-100/50 hover:bg-brand-700 hover:shadow-brand-200/50",
    secondary: "bg-surface-100 text-surface-700 hover:bg-surface-200",
    outline: "bg-transparent border-2 border-brand-600 text-brand-600 hover:bg-brand-50",
    ghost: "bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900",
    danger: "bg-red-500 text-white shadow-lg shadow-red-100/50 hover:bg-red-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-8 py-3.5 text-base rounded-2xl gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
      ) : (
        <>
          {LeftIcon && <LeftIcon size={size === 'sm' ? 14 : 18} />}
          {children}
          {RightIcon && <RightIcon size={size === 'sm' ? 14 : 18} />}
        </>
      )}
    </button>
  );
};

export default Button;
