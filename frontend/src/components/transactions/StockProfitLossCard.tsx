import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import Badge from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

type StockProfitLossCardProps = {
  realized: number;
  unrealized: number;
  total: number;
};

export default function StockProfitLossCard({ realized, unrealized, total }: StockProfitLossCardProps) {
  const Icon = total >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/52">Stock profit/loss</p>
            <p className={total >= 0 ? 'mt-2 text-2xl font-semibold text-emerald-300' : 'mt-2 text-2xl font-semibold text-rose-300'}>
              {formatCurrency(total)}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-md bg-white/[0.07] text-emerald-300">
            <Icon size={20} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-white/42">Realized</p>
            <p className="mt-1 font-semibold">{formatCurrency(realized)}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-white/42">Unrealized</p>
            <p className="mt-1 font-semibold">{formatCurrency(unrealized)}</p>
          </div>
        </div>
        <Badge tone={total >= 0 ? 'success' : 'danger'} className="mt-4">
          <Activity size={13} />
          Virtual portfolio
        </Badge>
      </CardContent>
    </Card>
  );
}
