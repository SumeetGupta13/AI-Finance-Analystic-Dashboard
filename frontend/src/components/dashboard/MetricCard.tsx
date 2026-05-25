import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

type MetricCardProps = {
  title: string;
  value: string;
  change?: string;
  tone?: 'success' | 'danger' | 'neutral' | 'indigo';
  icon: LucideIcon;
};

export default function MetricCard({ title, value, change, tone = 'neutral', icon: Icon }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/52">{title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-md bg-white/[0.07] text-emerald-300">
              <Icon size={20} />
            </div>
          </div>
          {change ? (
            <Badge tone={tone} className="mt-4">
              {change}
            </Badge>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
