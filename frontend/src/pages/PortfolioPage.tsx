import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, WalletCards } from 'lucide-react';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import { marketService } from '../services/marketService';
import { portfolioService } from '../services/portfolioService';
import { transactionService } from '../services/transactionService';
import type { AssetType, MarketAsset, PortfolioAnalytics, Transaction } from '../types/domain';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function PortfolioPage() {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [symbol, setSymbol] = useState('RELIANCE');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadPortfolio() {
    setLoading(true);
    try {
      const [analyticsData, transactionsData, stocksData, cryptoData] = await Promise.all([
        portfolioService.getAnalytics(),
        transactionService.list(),
        marketService.getStocks(),
        marketService.getCryptoMarkets(),
      ]);
      setAnalytics(analyticsData);
      setTransactions(transactionsData);
      setAssets([...stocksData, ...cryptoData]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPortfolio();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { assetType, symbol: symbol.toUpperCase(), quantity: Number(quantity) };
      if (side === 'buy') {
        await transactionService.buy(payload);
        toast.success('Buy order processed');
      } else {
        await transactionService.sell(payload);
        toast.success('Sell order processed');
      }
      await loadPortfolio();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Virtual trading</p>
          <h1 className="mt-3 text-4xl font-semibold">Portfolio</h1>
          <p className="mt-2 text-white/56">Practice execution with a protected virtual wallet and live portfolio math.</p>
        </div>
        <Button variant="secondary" onClick={() => void loadPortfolio()} loading={loading}>
          <RefreshCw size={17} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Portfolio value', formatCurrency(analytics?.summary.portfolioValue || 0), 'success'],
          ['Cash balance', formatCurrency(analytics?.summary.cashBalance || 0), 'neutral'],
          ['Invested', formatCurrency(analytics?.summary.investedValue || 0), 'indigo'],
          ['P&L', `${formatCurrency(analytics?.summary.totalPnL || 0)} (${formatPercent(analytics?.summary.totalPnLPercent || 0)})`, (analytics?.summary.totalPnL || 0) >= 0 ? 'success' : 'danger'],
        ].map(([label, value, tone]) => (
          <Card key={label}>
            <CardContent>
              <WalletCards className="text-emerald-300" size={20} />
              <p className="mt-4 text-sm text-white/52">{label}</p>
              <p className="mt-2 text-xl font-semibold">{value}</p>
              <Badge tone={tone as 'success' | 'danger' | 'neutral' | 'indigo'} className="mt-4">Virtual</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <HoldingsTable holdings={analytics?.holdings || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trade ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs
                tabs={[
                  { value: 'buy', label: 'Buy' },
                  { value: 'sell', label: 'Sell' },
                ]}
                value={side}
                onChange={(value) => setSide(value as 'buy' | 'sell')}
              />
              <label className="block text-sm text-white/64">
                Asset type
                <select
                  value={assetType}
                  onChange={(event) => setAssetType(event.target.value as AssetType)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Crypto</option>
                  <option value="mutual_fund">Mutual fund</option>
                </select>
              </label>
              <label className="block text-sm text-white/64">
                Symbol
                <input
                  list="asset-symbols"
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
                  required
                />
                <datalist id="asset-symbols">
                  {assets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol} />
                  ))}
                </datalist>
              </label>
              <label className="block text-sm text-white/64">
                Quantity
                <input
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  type="number"
                  min="0.000001"
                  step="0.000001"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
                  required
                />
              </label>
              <Button type="submit" loading={submitting} variant={side === 'buy' ? 'primary' : 'danger'} className="w-full">
                Execute {side}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-white/42">
              <tr>
                <th className="py-3">Type</th>
                <th className="py-3">Asset</th>
                <th className="py-3">Qty</th>
                <th className="py-3">Price</th>
                <th className="py-3">Net</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="py-3 capitalize">{transaction.type}</td>
                  <td className="py-3 font-semibold">{transaction.symbol}</td>
                  <td className="py-3">{transaction.quantity}</td>
                  <td className="py-3">{formatCurrency(transaction.price, transaction.assetType === 'stock' ? 'INR' : 'USD')}</td>
                  <td className="py-3">{formatCurrency(transaction.netAmount, transaction.assetType === 'stock' ? 'INR' : 'USD')}</td>
                  <td className="py-3">
                    <Badge tone={transaction.status === 'completed' ? 'success' : 'danger'}>{transaction.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
