import React from 'react';

const Skeleton = ({ className = '', variant = 'rect', ...props }) => {
  const baseClasses = "bg-surface-100 animate-pulse-slow";
  const variantClasses = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4 w-full"
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
      {...props}
    />
  );
};

export const PostSkeleton = () => (
  <div className="bg-white rounded-3xl p-6 shadow-premium border border-surface-50 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circle" className="w-12 h-12" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-1/4 h-2 opacity-50" />
      </div>
    </div>
    <Skeleton className="h-32 mt-4" />
    <div className="flex gap-4 pt-2">
      <Skeleton variant="rect" className="w-16 h-8" />
      <Skeleton variant="rect" className="w-16 h-8" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="h-48 bg-surface-100 rounded-3xl animate-pulse" />
    <div className="max-w-5xl mx-auto px-6 -mt-16">
      <div className="bg-white rounded-3xl p-8 shadow-premium border border-surface-50 space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <Skeleton variant="circle" className="w-32 h-32 border-4 border-white shadow-xl" />
          <div className="flex-1 space-y-3 pb-2">
            <Skeleton variant="text" className="w-1/2 h-8" />
            <Skeleton variant="text" className="w-1/3" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
