import React from 'react';

const TextArea = ({ 
  label, 
  error, 
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
      )}
      <textarea
        id={id}
        className={`
          w-full bg-white border border-surface-200 rounded-xl p-4 
          text-surface-900 placeholder:text-surface-400
          focus:ring-4 focus:ring-brand-50 focus:border-brand-600 
          outline-none transition-all font-medium resize-none
          ${error ? 'border-red-500 focus:ring-red-50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-bold pl-1 animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;
