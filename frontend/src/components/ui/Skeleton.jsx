import React from 'react';

const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-shimmer rounded-xl bg-border/50 ${className}`}
    {...props}
  />
);

export default Skeleton;
