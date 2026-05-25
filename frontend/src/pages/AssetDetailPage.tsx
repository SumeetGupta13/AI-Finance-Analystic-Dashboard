import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Skeleton from '../components/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import SipCalculator from '../components/portfolio/SipCalculator';
import { marketService } from '../services/marketService';
import { transactionService } from '../services/transactionService';
import type { AssetType, Candle, MarketAsset, MutualFund } from '../types/domain';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

const timeframes = ['1D', '5D', '1M', '6M', '1Y', 'MAX'].map((value) => ({ value, label: value }));

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

async function findAsset(symbol: string) {
  try {
    return await marketService.getStockBySymbol(symbol);
  } catch {
    const [crypto, funds] = await Promise.all([marketService.getCryptoMarkets(), marketService.getMutualFunds()]);
    return crypto.find((asset) => asset.symbol === symbol) || funds.map(normalizeFund).find((asset) => asset.symbol === symbol) || null;
  }
}

export default function AssetDetailPage() {
  const { symbol = '' } = useParams();
  const [asset, setAsset] = useState<MarketAsset | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState('1M');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setLoading(true);
      try {
        const normalizedSymbol = symbol.toUpperCase();
        const [assetData, historyData] = await Promise.all([
          findAsset(normalizedSymbol),
          marketService.getHistoricalData(normalizedSymbol, timeframe),
        ]);

        if (active) {
          setAsset(assetData);
          setCandles(historyData.candles);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [symbol, timeframe]);

  const estimatedValue = useMemo(() => {
    const parsedQuantity = Number(quantity) || 0;
    return parsedQuantity * (asset?.price || 0);
  }, [asset?.price, quantity]);

  const handleTrade = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!asset) return;

    setSubmitting(true);
    try {
      const payload = {
        assetType: asset.assetType as AssetType,
        symbol: asset.symbol,
        quantity: Number(quantity),
      };

      if (side === 'buy') {
        await transactionService.buy(payload);
        toast.success('Buy order processed');
      } else {
        await transactionService.sell(payload);
        toast.success('Sell order processed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!asset) {
    return (
      <Card>
        <CardContent>
          <h1 className="text-2xl font-semibold">Asset not found</h1>
          <p className="mt-2 text-white/56">FINORA could not find this symbol in the current market universe.</p>
        </CardContent>
      </Card>
    );
  }

  const positive = asset.changePercent >= 0;

  return (
    <section className="space-y-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold">{asset.symbol}</h1>
              <Badge tone={positive ? 'success' : 'danger'}>{formatPercent(asset.changePercent)}</Badge>
              <Badge tone="neutral">{asset.exchange}</Badge>
            </div>
            <p className="mt-2 text-white/56">{asset.name}</p>
            <p className="mt-5 text-4xl font-semibold">{formatCurrency(asset.price, asset.currency)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 md:min-w-[440px]">
            {[
              ['52W High', asset.high52 ? formatCurrency(asset.high52, asset.currency) : '-'],
              ['52W Low', asset.low52 ? formatCurrency(asset.low52, asset.currency) : '-'],
              ['Volume', asset.volume ? formatNumber(asset.volume) : '-'],
              ['Mkt Cap', asset.marketCap ? formatNumber(asset.marketCap) : '-'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-white/[0.05] p-3">
                <p className="text-white/42">{label}</p>
                <p className="mt-1 font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Price performance</CardTitle>
            <Tabs tabs={timeframes} value={timeframe} onChange={setTimeframe} />
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={candles}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} domain={['dataMin', 'dataMax']} />
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="close" stroke="#34D399" strokeWidth={2} fill="url(#priceGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trade simulator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrade} className="space-y-4">
              <Tabs
                tabs={[
                  { value: 'buy', label: 'Buy' },
                  { value: 'sell', label: 'Sell' },
                ]}
                value={side}
                onChange={(value) => setSide(value as 'buy' | 'sell')}
              />
              <label className="block text-sm text-white/64">
                Quantity
                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  type="number"
                  min="0.000001"
                  step="0.000001"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-emerald-300"
                  required
                />
              </label>
              <div className="rounded-md bg-white/[0.05] p-4">
                <div className="flex justify-between text-sm text-white/56">
                  <span>Estimated value</span>
                  <span className="font-semibold text-white">{formatCurrency(estimatedValue, asset.currency)}</span>
                </div>
              </div>
              <Button type="submit" loading={submitting} className="w-full" variant={side === 'buy' ? 'primary' : 'danger'}>
                {side === 'buy' ? 'Buy' : 'Sell'} {asset.symbol}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candlestick simulation</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-white/42">
              <tr>
                <th className="py-3">Date</th>
                <th className="py-3">Open</th>
                <th className="py-3">High</th>
                <th className="py-3">Low</th>
                <th className="py-3">Close</th>
                <th className="py-3">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {candles.map((candle) => (
                <tr key={candle.date}>
                  <td className="py-3">{candle.date}</td>
                  <td className="py-3">{formatNumber(candle.open)}</td>
                  <td className="py-3 text-emerald-300">{formatNumber(candle.high)}</td>
                  <td className="py-3 text-rose-300">{formatNumber(candle.low)}</td>
                  <td className="py-3 font-semibold">{formatNumber(candle.close)}</td>
                  <td className="py-3">{formatNumber(candle.volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {asset.assetType === 'crypto' ? (
        <Card>
          <CardHeader>
            <CardTitle>Crypto analytics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {[
              ['Rank', 'rank' in asset ? String(asset.rank) : 'Top market'],
              ['Circulating supply', 'circulatingSupply' in asset ? formatNumber(Number(asset.circulatingSupply)) : '-'],
              ['24h volume', asset.volume ? formatCurrency(asset.volume, asset.currency) : '-'],
              ['Volatility profile', Math.abs(asset.changePercent) > 2 ? 'Elevated' : 'Moderate'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-white/[0.05] p-4">
                <p className="text-sm text-white/42">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {asset.assetType === 'mutual_fund' ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Fund analytics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              {[
                ['Category', asset.sector || '-'],
                ['Risk', asset.industry || '-'],
                ['AUM', asset.marketCap ? formatCurrency(asset.marketCap) : '-'],
                ['Expense ratio', 'expenseRatio' in asset ? `${asset.expenseRatio}%` : '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-white/[0.05] p-4">
                  <p className="text-sm text-white/42">{label}</p>
                  <p className="mt-2 font-semibold">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <SipCalculator />
        </>
      ) : null}
    </section>
  );
}
