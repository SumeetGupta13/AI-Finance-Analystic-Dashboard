import React from 'react';

const variants = {
  success:  'bg-success/10 text-success border-success/20',
  danger:   'bg-danger/10 text-danger border-danger/20',
  warning:  'bg-warning/10 text-warning border-warning/20',
  primary:  'bg-primary/10 text-primary border-primary/20',
  muted:    'bg-muted/10 text-muted border-muted/20',
  default:  'bg-background text-muted border-border',
};

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
    {children}
  </span>
);

export default Badge;
