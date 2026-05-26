import { useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock, type LucideIcon } from 'lucide-react';

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function AuthInput({ label, icon: Icon, type = 'text', className = '', ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <label className={`block text-sm font-semibold text-white/88 ${className}`}>
      {label}
      <span className="mt-3 flex h-14 items-center rounded-lg border border-white/18 bg-[#06111d]/70 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-within:border-emerald-300/80 focus-within:ring-2 focus-within:ring-emerald-300/15">
        <input
          {...props}
          type={inputType}
          className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/45"
        />
        <span className="ml-3 flex items-center gap-3 text-white/90">
          {isPassword ? <Lock size={20} strokeWidth={2} /> : <Icon size={21} strokeWidth={2} />}
          {isPassword ? (
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((value) => !value)}
              className="inline-flex size-8 items-center justify-center rounded-md text-white/88 transition hover:bg-white/[0.08] hover:text-emerald-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          ) : null}
        </span>
      </span>
    </label>
  );
}
