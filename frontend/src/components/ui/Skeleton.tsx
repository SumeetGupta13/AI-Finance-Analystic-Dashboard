import { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export default function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-white/[0.08]', className)} {...props} />;
}
