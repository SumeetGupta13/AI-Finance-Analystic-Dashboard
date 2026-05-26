import { Bitcoin, Coins, RadioTower, ShieldAlert } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import AssetSignalList from '../components/analytics/AssetSignalList';
import ScoreMeter from '../components/analytics/ScoreMeter';
import MarketCard from '../components/market/MarketCard';
import Badge from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { marketService } from '../services/marketService';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export default function CryptoPage() {
  const { data, loading } = useAsyncData(
    async () => {
      const [assets, trends, sentiment] = await Promise.all([
        marketService.getCryptoMarkets(),
        marketService.getMarketTrends(),
        marketService.getSentimentAnalysis(),
      ]);

      return {
        assets,
        trends,
        sentiment: sentiment.filter((item) => item.assetType === 'crypto'),
      };
    },
    []
  );

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-56" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalMarketCap = data.assets.reduce((sum, asset) => sum + (asset.marketCap || 0), 0);
  const totalVolume = data.assets.reduce((sum, asset) => sum + (asset.volume || 0), 0);
  const averageTrendScore =
    data.assets.length > 0 ? data.assets.reduce((sum, asset) => sum + (asset.trendScore || 0), 0) / data.assets.length : 0;
  const chartData = data.assets.map((asset) => ({
    symbol: asset.symbol,
    marketCap: asset.marketCap || 0,
    volume: asset.volume || 0,
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Crypto</p>
          <h1 className="mt-3 text-4xl font-semibold">Digital asset terminal</h1>
          <p className="mt-2 max-w-3xl text-white/56">
            Crypto prices, sentiment, market capitalization, volatility signals, and traction scores from the StockIQ market API.
          </p>
        </div>
        <Badge tone="indigo">{data.assets.length} assets tracked</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <Bitcoin className="text-emerald-300" size={22} />
            <p className="mt-4 text-sm text-white/52">Crypto market cap</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalMarketCap, 'USD')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Coins className="text-indigo-200" size={22} />
            <p className="mt-4 text-sm text-white/52">24h volume</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalVolume, 'USD')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <RadioTower className="text-emerald-300" size={22} />
            <p className="mt-4 text-sm text-white/52">Average traction</p>
            <p className="mt-2 text-2xl font-semibold">{averageTrendScore.toFixed(0)}</p>
            <ScoreMeter value={averageTrendScore} className="mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ShieldAlert className="text-rose-300" size={22} />
            <p className="mt-4 text-sm text-white/52">Volatility watch</p>
            <p className="mt-2 text-2xl font-semibold">
              {data.assets.filter((asset) => Math.abs(asset.changePercent) >= 2).length}
            </p>
            <p className="mt-2 text-sm text-white/48">Assets moving at least 2% in the current feed.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.assets.map((asset) => (
          <MarketCard key={asset.symbol} asset={asset} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Market cap and volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cryptoCap" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="marketCap" stroke="#818CF8" strokeWidth={2} fill="url(#cryptoCap)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crypto sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sentiment.map((item) => (
                <div key={item.symbol} className="rounded-md border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.symbol}</p>
                    <Badge tone={item.sentiment === 'Positive' ? 'success' : item.sentiment === 'Negative' ? 'danger' : 'neutral'}>
                      {item.confidence}% {item.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/56">{item.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crypto ranking</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-white/42">
              <tr>
                <th className="py-3">Rank</th>
                <th className="py-3">Asset</th>
                <th className="py-3">Price</th>
                <th className="py-3">24h</th>
                <th className="py-3">Market cap</th>
                <th className="py-3">Supply</th>
                <th className="py-3">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.assets.map((asset) => (
                <tr key={asset.symbol}>
                  <td className="py-3">{asset.rank || '-'}</td>
                  <td className="py-3">
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="text-xs text-white/42">{asset.name}</p>
                  </td>
                  <td className="py-3">{formatCurrency(asset.price, 'USD')}</td>
                  <td className={asset.changePercent >= 0 ? 'py-3 text-emerald-300' : 'py-3 text-rose-300'}>
                    {formatPercent(asset.changePercent)}
                  </td>
                  <td className="py-3">{asset.marketCap ? formatCurrency(asset.marketCap, 'USD') : '-'}</td>
                  <td className="py-3">{asset.circulatingSupply ? formatNumber(asset.circulatingSupply) : '-'}</td>
                  <td className="py-3">{asset.recommendation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crypto leaders inside market traction</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetSignalList assets={data.trends.trendingStocks.filter((asset) => asset.assetType === 'crypto')} limit={4} />
        </CardContent>
      </Card>
    </section>
  );
}
