import { Link } from 'react-router-dom';
import type { MarketAsset } from '../../types/domain';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Badge from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import Sparkline from './Sparkline';

type MarketCardProps = {
  asset: MarketAsset;
};

export default function MarketCard({ asset }: MarketCardProps) {
  const positive = asset.changePercent >= 0;

  return (
    <Link to={`/markets/${asset.symbol}`}>
      <Card className="transition hover:border-emerald-300/30 hover:bg-white/[0.08]">
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-white">{asset.symbol}</p>
              <p className="mt-1 truncate text-sm text-white/52">{asset.name}</p>
            </div>
            <Badge tone={positive ? 'success' : 'danger'}>{formatPercent(asset.changePercent)}</Badge>
          </div>
          <div className="mt-5">
            <Sparkline data={asset.sparkline} positive={positive} />
          </div>
          <p className="mt-4 text-xl font-semibold text-white">{formatCurrency(asset.price, asset.currency)}</p>
          <p className="mt-1 text-xs text-white/42">
            {asset.exchange} {asset.sector ? `- ${asset.sector}` : ''}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
