import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  title = 'No data found',
  description = 'Get started by creating a new entry.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center min-h-[280px] border-2 border-dashed border-border/60 rounded-2xl bg-background/50 ${className}`}>
    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-4 animate-float">
      <Icon className="w-7 h-7 text-primary/60" />
    </div>
    <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted max-w-xs mb-6 leading-relaxed">{description}</p>
    {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
  </div>
);

export default EmptyState;
