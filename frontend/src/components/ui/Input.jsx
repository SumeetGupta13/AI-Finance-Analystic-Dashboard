import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ label, error, type = 'text', className = '', ...props }, ref) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={`
            flex h-11 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-foreground
            transition-all duration-200 placeholder:text-muted/60
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-border hover:border-primary/40'}
            ${isPassword ? 'pr-11' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-danger font-medium flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-danger inline-block" />
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
