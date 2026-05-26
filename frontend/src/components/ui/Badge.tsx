import { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type BadgeTone = 'success' | 'danger' | 'neutral' | 'indigo' | 'warning';

const tones: Record<BadgeTone, string> = {
  success: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-300',
  danger: 'border-rose-300/20 bg-rose-300/10 text-rose-300',
  neutral: 'border-white/10 bg-white/[0.06] text-white/70',
  indigo: 'border-indigo-300/20 bg-indigo-400/10 text-indigo-200',
  warning: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
};

export default function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', tones[tone], className)}
      {...props}
    />
  );
}
