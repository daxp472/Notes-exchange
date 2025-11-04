import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  animate = true,
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const classes = `
    loading-skeleton
    ${rounded ? 'rounded-full' : 'rounded'}
    ${animate ? 'animate-pulse' : ''}
    ${className}
  `.trim();

  return (
    <div className={classes} style={style} />
  );
};

export default Skeleton;