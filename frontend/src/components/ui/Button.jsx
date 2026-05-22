import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, variant = 'primary', size = 'md', isLoading, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'gradient-primary text-white shadow-sm hover:shadow-md hover:opacity-90 focus:ring-primary active:scale-[0.98]',
    secondary: 'bg-white text-foreground border border-border hover:bg-background hover:border-primary/30 focus:ring-primary shadow-sm active:scale-[0.98]',
    danger:    'bg-danger text-white hover:opacity-90 focus:ring-danger shadow-sm active:scale-[0.98]',
    ghost:     'bg-transparent text-muted hover:text-foreground hover:bg-border/40 focus:ring-border',
    outline:   'bg-transparent border border-primary text-primary hover:bg-primary/5 focus:ring-primary',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1.5 gap-1',
    sm: 'text-sm px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
