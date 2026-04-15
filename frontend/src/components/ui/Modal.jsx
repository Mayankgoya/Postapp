import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  maxWidth = 'max-w-md',
  showClose = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`
        relative bg-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden
        animate-in zoom-in scale-in duration-300
      `}>
        {/* Header */}
        <div className="p-6 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
          <h2 className="text-xl font-black text-surface-900 leading-tight">
            {title}
          </h2>
          {showClose && (
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white text-surface-400 hover:text-surface-900 rounded-full transition-all shadow-sm active:scale-90"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Body */}
        <div className="p-8">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-6 pt-0 flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
