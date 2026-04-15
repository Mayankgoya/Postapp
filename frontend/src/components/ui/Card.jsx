import React from 'react';

const Card = ({ children, className = '', noPadding = false, hoverable = false, ...props }) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl border border-surface-200 shadow-premium overflow-hidden
        ${hoverable ? 'hover:shadow-premium-hover transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
