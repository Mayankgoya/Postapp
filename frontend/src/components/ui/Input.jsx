import React from 'react';

const Input = ({ 
  label, 
  error, 
  leftIcon: LeftIcon, 
  className = '', 
  containerClassName = '',
  id,
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs font-black text-surface-400 uppercase tracking-widest pl-1"
        >
          {label}
        </label>
      ) }
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-600 transition-colors">
            <LeftIcon size={20} />
          </div>
        )}
        <input
          id={id}
          className={`
            w-full bg-white border border-surface-200 rounded-xl p-4 
            ${LeftIcon ? 'pl-12' : 'pl-4'} 
            text-surface-900 placeholder:text-surface-400
            focus:ring-4 focus:ring-brand-50 focus:border-brand-600 
            outline-none transition-all font-medium
            ${error ? 'border-red-500 focus:ring-red-50 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 font-bold pl-1 animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
