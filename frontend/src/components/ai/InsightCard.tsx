import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

type InsightCardProps = {
  title: string;
  icon: LucideIcon;
  accent?: 'emerald' | 'indigo' | 'rose';
  children: ReactNode;
};

const accentClasses = {
  emerald: 'bg-emerald-300/10 text-emerald-300',
  indigo: 'bg-indigo-400/10 text-indigo-200',
  rose: 'bg-rose-300/10 text-rose-300',
};

export default function InsightCard({ title, icon: Icon, accent = 'emerald', children }: InsightCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <div className={`flex size-10 items-center justify-center rounded-md ${accentClasses[accent]}`}>
          <Icon size={18} />
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
