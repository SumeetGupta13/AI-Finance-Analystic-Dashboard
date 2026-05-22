import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => (
  <div
    className={`bg-card rounded-2xl border border-border shadow-card ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : ''} transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-border/60 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-semibold text-base text-foreground tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-border/60 ${className}`}>
    {children}
  </div>
);

export default Card;
