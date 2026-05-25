import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import MarketCard from '../components/market/MarketCard';
import Tabs from '../components/ui/Tabs';
import { Card, CardContent } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { marketService } from '../services/marketService';
import type { MarketAsset, MutualFund } from '../types/domain';

type MarketTab = 'stocks' | 'crypto' | 'funds';

const tabs = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'funds', label: 'Funds' },
];

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

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<MarketTab>('stocks');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      setLoading(true);
      try {
        if (activeTab === 'stocks') {
          const data = await marketService.getStocks();
          if (active) setAssets(data);
        }

        if (activeTab === 'crypto') {
          const data = await marketService.getCryptoMarkets();
          if (active) setAssets(data);
        }

        if (activeTab === 'funds') {
          const data = await marketService.getMutualFunds();
          if (active) setAssets(data.map(normalizeFund));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAssets();

    return () => {
      active = false;
    };
  }, [activeTab]);

  const filteredAssets = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return assets;
    }

    return assets.filter((asset) => asset.symbol.toLowerCase().includes(value) || asset.name.toLowerCase().includes(value));
  }, [assets, search]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Markets</p>
          <h1 className="mt-3 text-4xl font-semibold">Market discovery</h1>
          <p className="mt-2 text-white/56">Search and compare equities, digital assets, and mutual funds from FINORA's normalized market layer.</p>
        </div>
        <Tabs tabs={tabs} value={activeTab} onChange={(value) => setActiveTab(value as MarketTab)} />
      </div>

      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-black/30 px-3">
            <Search size={18} className="text-white/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/36"
              placeholder="Search by symbol or company"
            />
          </label>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white/70">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <Skeleton key={item} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <MarketCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      )}
    </section>
  );
}
