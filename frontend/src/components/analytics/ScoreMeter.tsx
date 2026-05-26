import { cn } from '../../utils/cn';

type ScoreMeterProps = {
  value: number;
  label?: string;
  tone?: 'success' | 'danger' | 'indigo';
  className?: string;
};

const toneStyles = {
  success: 'from-emerald-300 to-emerald-500',
  danger: 'from-rose-300 to-rose-500',
  indigo: 'from-indigo-300 to-indigo-500',
};

export default function ScoreMeter({ value, label, tone = 'success', className }: ScoreMeterProps) {
  const score = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-white/56">{label || 'Score'}</span>
        <span className="font-semibold text-white">{score.toFixed(0)}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className={cn('h-full rounded-full bg-gradient-to-r', toneStyles[tone])} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
