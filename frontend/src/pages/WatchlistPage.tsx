import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Star, Trash2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { watchlistService } from '../services/watchlistService';
import type { AssetType, Watchlist } from '../types/domain';

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [name, setName] = useState('Core Opportunities');
  const [symbol, setSymbol] = useState('RELIANCE');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [selectedWatchlistId, setSelectedWatchlistId] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadWatchlists() {
    setLoading(true);
    try {
      const data = await watchlistService.list();
      setWatchlists(data);
      setSelectedWatchlistId((current) => current || data[0]?._id || '');
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
    await loadWatchlists();
  };

  const removeItem = async (watchlistId: string, itemSymbol: string) => {
    await watchlistService.removeItem(watchlistId, itemSymbol);
    toast.success('Asset removed');
    await loadWatchlists();
  };

  const selectedWatchlist = watchlists.find((watchlist) => watchlist._id === selectedWatchlistId);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Watchlists</p>
        <h1 className="mt-3 text-4xl font-semibold">Track conviction</h1>
        <p className="mt-2 text-white/56">Create focused watchlists and keep your highest-signal assets within reach.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createWatchlist} className="space-y-3">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
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
              <CardTitle>Add asset</CardTitle>
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
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  className="h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
                  required
                />
                <Button type="submit" className="w-full" disabled={!selectedWatchlistId}>
                  Add asset
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedWatchlist?.name || 'Watchlist'}</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && (!selectedWatchlist || selectedWatchlist.items.length === 0) ? (
              <EmptyState icon={Star} title="No assets tracked yet" description="Add a symbol to start monitoring market opportunities." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {selectedWatchlist?.items.map((item) => (
                  <div key={`${item.assetType}-${item.symbol}`} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.symbol}</p>
                        <p className="mt-1 text-sm text-white/52">{item.name}</p>
                      </div>
                      <button
                        onClick={() => void removeItem(selectedWatchlist._id, item.symbol)}
                        className="flex size-9 items-center justify-center rounded-md text-white/48 transition hover:bg-rose-400/10 hover:text-rose-300"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <Badge tone="indigo" className="mt-4">{item.exchange}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
