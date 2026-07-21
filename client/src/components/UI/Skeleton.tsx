import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect', count = 1 }) => {
  const getShapeClass = () => {
    switch (variant) {
      case 'text':
        return 'h-3.5 w-full rounded';
      case 'circle':
        return 'h-10 w-10 rounded-full';
      case 'rect':
      default:
        return 'h-24 w-full rounded-2xl';
    }
  };

  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`bg-slate-800/50 animate-pulse border border-slate-800/30 ${getShapeClass()} ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;
