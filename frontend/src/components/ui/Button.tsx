import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-300 text-black hover:bg-emerald-200 shadow-[0_0_28px_rgba(16,185,129,0.22)]',
  secondary: 'border border-white/10 bg-white/[0.07] text-white hover:border-white/20 hover:bg-white/[0.1]',
  ghost: 'text-white/70 hover:bg-white/[0.08] hover:text-white',
  danger: 'bg-rose-400 text-white hover:bg-rose-300',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading = false, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300/60 disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  )
);

Button.displayName = 'Button';

export default Button;
