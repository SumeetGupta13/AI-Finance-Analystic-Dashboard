import { Link } from 'react-router-dom';
import type { MarketAsset } from '../../types/domain';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Badge from '../ui/Badge';

type AssetSignalListProps = {
  assets: MarketAsset[];
  limit?: number;
  showScore?: boolean;
};

export default function AssetSignalList({ assets, limit = 5, showScore = true }: AssetSignalListProps) {
  return (
    <div className="divide-y divide-white/10">
      {assets.slice(0, limit).map((asset) => {
        const positive = asset.changePercent >= 0;

        return (
          <Link
            key={asset.symbol}
            to={`/markets/${asset.symbol}`}
            className="flex items-center justify-between gap-3 py-3 transition hover:text-emerald-300"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">{asset.symbol}</p>
                <Badge tone={positive ? 'success' : 'danger'}>{formatPercent(asset.changePercent)}</Badge>
              </div>
              <p className="mt-1 truncate text-sm text-white/48">{asset.name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{formatCurrency(asset.price, asset.currency)}</p>
              {showScore ? <p className="mt-1 text-xs text-white/42">{asset.trendScore?.toFixed(0) || 0} score</p> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
