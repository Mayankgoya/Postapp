import React from 'react';

const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const variants = {
    primary: "bg-brand-50 text-brand-700 border-brand-100",
    secondary: "bg-surface-50 text-surface-600 border-surface-200",
    success: "bg-green-50 text-green-700 border-green-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
    md: "px-3 py-1 text-xs font-bold",
    lg: "px-4 py-1.5 text-sm font-bold",
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border 
      ${variants[variant]} ${sizes[size]} 
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;
