import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Star, Trash2 } from 'lucide-react';
import WatchlistAssetCard from '../components/watchlist/WatchlistAssetCard';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { marketService } from '../services/marketService';
import { watchlistService } from '../services/watchlistService';
import type { AssetType, MarketAsset, MutualFund, Watchlist } from '../types/domain';

const normalizeFund = (fund: MutualFund): MarketAsset => ({
  ...fund,
  price: fund.nav,
  exchange: 'AMFI',
  sector: fund.category,
  industry: fund.risk,
  previousClose: fund.nav / (1 + fund.changePercent / 100),
  marketCap: fund.aum,
  volume: undefined,
});

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [selectedWatchlistId, setSelectedWatchlistId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadWatchlists() {
    setLoading(true);
    try {
      const [watchlistData, stocksData, cryptoData, fundData] = await Promise.all([
        watchlistService.list(),
        marketService.getStocks(),
        marketService.getCryptoMarkets(),
        marketService.getMutualFunds(),
      ]);

      setWatchlists(watchlistData);
      setAssets([...stocksData, ...cryptoData, ...fundData.map(normalizeFund)]);
      setSelectedWatchlistId((current) => current || watchlistData[0]?._id || '');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWatchlists();
  }, []);

  const createWatchlist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = await watchlistService.create(name);
    toast.success('Watchlist created');
    setName('');
    setSelectedWatchlistId(created._id);
    await loadWatchlists();
  };

  const addItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedWatchlistId) return;
    await watchlistService.addItem(selectedWatchlistId, { assetType, symbol: symbol.toUpperCase() });
    toast.success('Asset added to watchlist');
    setSymbol('');
    await loadWatchlists();
  };

  const removeItem = async (watchlistId: string, itemSymbol: string) => {
    await watchlistService.removeItem(watchlistId, itemSymbol);
    toast.success('Asset removed');
    await loadWatchlists();
  };

  const removeWatchlist = async () => {
    if (!selectedWatchlistId) return;
    await watchlistService.remove(selectedWatchlistId);
    toast.success('Watchlist removed');
    setSelectedWatchlistId('');
    await loadWatchlists();
  };

  const selectedWatchlist = watchlists.find((watchlist) => watchlist._id === selectedWatchlistId);
  const assetMap = useMemo(() => new Map(assets.map((asset) => [asset.symbol, asset])), [assets]);
  const symbolSuggestions = assets.filter((asset) => asset.assetType === assetType);
  const filteredItems = (selectedWatchlist?.items || []).filter((item) => {
    const value = search.trim().toLowerCase();
    if (!value) return true;
    return item.symbol.toLowerCase().includes(value) || item.name.toLowerCase().includes(value);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Watchlists</p>
          <h1 className="mt-3 text-4xl font-semibold">Track conviction</h1>
          <p className="mt-2 text-white/56">Create focused watchlists and monitor price, trend, and mini-chart movement.</p>
        </div>
        <Button variant="danger" onClick={() => void removeWatchlist()} disabled={!selectedWatchlistId}>
          <Trash2 size={17} />
          Remove watchlist
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createWatchlist} className="space-y-3">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
                  placeholder="Watchlist name"
                  required
                />
                <Button type="submit" className="w-full">
                  <Plus size={17} />
                  Create
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addItem} className="space-y-3">
                <select
                  value={selectedWatchlistId}
                  onChange={(event) => setSelectedWatchlistId(event.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none"
                >
                  {watchlists.map((watchlist) => (
                    <option key={watchlist._id} value={watchlist._id}>
                      {watchlist.name}
                    </option>
                  ))}
                </select>
                <select
                  value={assetType}
                  onChange={(event) => setAssetType(event.target.value as AssetType)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="mutual_fund">Mutual fund</option>
                </select>
                <input
                  list="watchlist-symbols"
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
                  placeholder="Search symbol"
                  required
                />
                <datalist id="watchlist-symbols">
                  {symbolSuggestions.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.name}
                    </option>
                  ))}
                </datalist>
                <Button type="submit" className="w-full" disabled={!selectedWatchlistId}>
                  Add asset
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <CardTitle>{selectedWatchlist?.name || 'Watchlist'}</CardTitle>
            <label className="flex h-10 w-full items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 md:max-w-xs">
              <Search size={16} className="text-white/38" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/36"
                placeholder="Filter watchlist"
              />
            </label>
          </CardHeader>
          <CardContent>
            {!selectedWatchlist || selectedWatchlist.items.length === 0 ? (
              <EmptyState icon={Star} title="No assets tracked yet" description="Add a symbol to start monitoring market opportunities." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => {
                  const asset = assetMap.get(item.symbol);

                  return (
                    <WatchlistAssetCard
                      key={`${item.assetType}-${item.symbol}`}
                      item={item}
                      asset={asset}
                      onRemove={() => void removeItem(selectedWatchlist._id, item.symbol)}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
