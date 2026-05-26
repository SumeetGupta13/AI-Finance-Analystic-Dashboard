import { Trash2 } from 'lucide-react';
import type { MarketAsset, Watchlist } from '../../types/domain';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Sparkline from '../market/Sparkline';
import Badge from '../ui/Badge';

type WatchlistItem = Watchlist['items'][number];

type WatchlistAssetCardProps = {
  item: WatchlistItem;
  asset?: MarketAsset;
  onRemove: () => void;
};

export default function WatchlistAssetCard({ item, asset, onRemove }: WatchlistAssetCardProps) {
  const positive = (asset?.changePercent || 0) >= 0;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{item.symbol}</p>
          <p className="mt-1 truncate text-sm text-white/52">{item.name}</p>
        </div>
        <button
          onClick={onRemove}
          className="flex size-9 items-center justify-center rounded-md text-white/48 transition hover:bg-rose-400/10 hover:text-rose-300"
          aria-label={`Remove ${item.symbol}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
      {asset ? (
        <>
          <div className="mt-4">
            <Sparkline data={asset.sparkline} positive={positive} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xl font-semibold">{formatCurrency(asset.price, asset.currency)}</p>
            <Badge tone={positive ? 'success' : 'danger'}>{formatPercent(asset.changePercent)}</Badge>
          </div>
          <p className="mt-2 text-xs text-white/42">{asset.recommendation || item.exchange}</p>
        </>
      ) : (
        <Badge tone="indigo" className="mt-4">{item.exchange}</Badge>
      )}
    </div>
  );
}
