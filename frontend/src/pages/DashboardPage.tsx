import { useEffect, useMemo, useState } from 'react';
import { Activity, BadgeIndianRupee, Briefcase, Star, Target, TrendingUp, WalletCards } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import TractionAnalytics from '../components/analytics/TractionAnalytics';
import MetricCard from '../components/dashboard/MetricCard';
import MarketCard from '../components/market/MarketCard';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { dashboardService } from '../services/dashboardService';
import type { MarketAsset, MarketTrendOverview, PortfolioAnalytics, Transaction, Watchlist } from '../types/domain';
import { getTransactionId, getTransactionSymbol } from '../utils/analytics';
import { formatCurrency, formatPercent, getAssetCurrency } from '../utils/formatters';

const allocationColors = ['#34D399', '#818CF8', '#FBBF24', '#F472B6'];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [trending, setTrending] = useState<MarketAsset[]>([]);
  const [gainers, setGainers] = useState<MarketAsset[]>([]);
  const [losers, setLosers] = useState<MarketAsset[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrendOverview | null>(null);
  const [marketUniverse, setMarketUniverse] = useState<MarketAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [liveWarning, setLiveWarning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      try {
        const summaryData = await dashboardService.getSummary();

        if (active) {
          setAnalytics(summaryData.portfolio);
          setTrending(summaryData.trendingStocks);
          setGainers(summaryData.topGainers.slice(0, 4));
          setLosers(summaryData.topLosers.slice(0, 4));
          setMarketTrends(summaryData.marketTrends);
          setMarketUniverse(summaryData.marketUniverse);
          setTransactions(summaryData.transactions);
          setWatchlists(summaryData.watchlist);
          setLiveWarning(Boolean(summaryData.isFallback || summaryData.warnings?.length));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const summary = analytics?.summary;
  const primaryWatchlist = watchlists[0];
  const recentTransactions = transactions.slice(0, 4);
  const riskLabel = (summary?.riskScore || 0) >= 65 ? 'Elevated' : (summary?.riskScore || 0) >= 35 ? 'Balanced' : 'Low';
  const topChartAsset = trending[0];

  const barData = useMemo(
    () =>
      gainers.map((asset) => ({
        symbol: asset.symbol,
        change: asset.changePercent,
      })),
    [gainers]
  );

  const dailyPnL = useMemo(() => {
    const assetMap = new Map(marketUniverse.map((asset) => [asset.symbol, asset]));

    return (analytics?.holdings || []).reduce((sum, holding) => {
      const asset = assetMap.get(holding.symbol);
      if (!asset?.previousClose) return sum;
      return sum + holding.quantity * (asset.price - asset.previousClose);
    }, 0);
  }, [analytics?.holdings, marketUniverse]);

  const dailyPnLPercent = summary?.currentValue && summary.currentValue - dailyPnL !== 0
    ? (dailyPnL / (summary.currentValue - dailyPnL)) * 100
    : 0;

  const topChartData = useMemo(
    () => (topChartAsset?.sparkline || []).map((value, index) => ({ label: `${index + 1}`, value })),
    [topChartAsset?.sparkline]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-36" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">StockIQ Terminal</p>
          <h1 className="mt-3 text-4xl font-semibold">Investment dashboard</h1>
          <p className="mt-2 text-white/56">Portfolio intelligence, market pulse, and virtual trading readiness in one cockpit.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/58">
          Market data source: <span className="font-semibold text-emerald-300">StockIQ API</span>
        </div>
      </div>

      {liveWarning ? (
        <div className="inline-flex rounded-md border border-amber-300/25 bg-amber-300/[0.08] px-3 py-2 text-sm font-semibold text-amber-200">
          Live data temporarily unavailable
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Portfolio value"
          value={formatCurrency(summary?.portfolioValue || 0)}
          change={formatPercent(summary?.totalPnLPercent || 0)}
          tone={(summary?.totalPnL || 0) >= 0 ? 'success' : 'danger'}
          icon={Briefcase}
        />
        <MetricCard title="Cash balance" value={formatCurrency(summary?.cashBalance || 0)} icon={WalletCards} />
        <MetricCard
          title="Daily P&L"
          value={formatCurrency(dailyPnL)}
          change={formatPercent(dailyPnLPercent)}
          tone={dailyPnL >= 0 ? 'success' : 'danger'}
          icon={Activity}
        />
        <MetricCard
          title="Total P&L"
          value={formatCurrency(summary?.totalPnL || 0)}
          change={formatCurrency(summary?.realizedPnL || 0)}
          tone={(summary?.totalPnL || 0) >= 0 ? 'success' : 'danger'}
          icon={TrendingUp}
        />
        <MetricCard title="Risk score" value={`${summary?.riskScore || 0}/100`} change={riskLabel} tone="indigo" icon={Target} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Market summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge tone="success">{marketTrends?.marketMood.label || 'Loading'}</Badge>
            <p className="mt-4 text-3xl font-semibold">{marketTrends?.marketMood.score || 0}/100</p>
            <p className="mt-3 text-sm leading-6 text-white/56">{marketTrends?.marketMood.summary || 'Market summary is loading from the API.'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market indices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {(marketTrends?.indices || []).slice(0, 4).map((index) => (
                <div key={index.symbol} className="rounded-md border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{index.symbol}</p>
                      <p className="text-xs text-white/42">{index.name}</p>
                    </div>
                    <span className={index.changePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                      {formatPercent(index.changePercent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ['Analyze AI signals', '/ai-insights'],
              ['Execute trade', '/portfolio'],
              ['Review transactions', '/transactions'],
              ['Monthly analytics', '/monthly-analytics'],
              ['Add watchlist asset', '/watchlist'],
              ['Scan market news', '/news'],
            ].map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="flex h-11 items-center justify-between rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white/72 transition hover:border-emerald-300/30 hover:text-white"
              >
                {label}
                <TrendingUp size={16} className="text-emerald-300" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Asset allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.allocation || []}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={68}
                    outerRadius={104}
                    paddingAngle={4}
                  >
                    {(analytics?.allocation || []).map((entry, index) => (
                      <Cell key={entry.label} fill={allocationColors[index % allocationColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Allocation']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(analytics?.allocation || []).map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-white/68">
                    <span className="size-2 rounded-full" style={{ backgroundColor: allocationColors[index % allocationColors.length] }} />
                    {item.label}
                  </span>
                  <span className="font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market heat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="symbol" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  />
                  <Bar dataKey="change" radius={[6, 6, 0, 0]} fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{topChartAsset ? `${topChartAsset.symbol} mini chart widget` : 'Mini chart widget'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={topChartData}>
                  <defs>
                    <linearGradient id="dashboardMomentum" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} domain={['dataMin', 'dataMax']} />
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} fill="url(#dashboardMomentum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Index breadth line</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketTrends?.indices || []}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="symbol" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="changePercent" stroke="#818CF8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
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
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <EmptyState icon={Activity} title="No trading activity yet" description="Executed orders will appear here once the portfolio records transactions." />
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={getTransactionId(transaction)} className="flex gap-3 rounded-md bg-white/[0.04] p-3">
                    <Activity className="mt-0.5 text-emerald-300" size={17} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white">
                          {transaction.type.replace('_', ' ').toUpperCase()} {getTransactionSymbol(transaction)}
                        </p>
                        <Badge tone={transaction.status === 'completed' ? 'success' : 'danger'}>{transaction.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-white/54">
                        {transaction.quantity} units at {formatCurrency(transaction.price, getAssetCurrency(transaction.assetType))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Watchlist</CardTitle>
            <Star size={18} className="text-emerald-300" />
          </CardHeader>
          <CardContent>
            {!primaryWatchlist || primaryWatchlist.items.length === 0 ? (
              <EmptyState icon={Star} title="No watchlist assets" description="Add symbols to a watchlist to monitor them from the dashboard." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {primaryWatchlist.items.slice(0, 6).map((item) => (
                  <div key={`${item.assetType}-${item.symbol}`} className="rounded-md border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{item.symbol}</p>
                        <p className="mt-1 truncate text-sm text-white/48">{item.name}</p>
                      </div>
                      <Badge tone={item.assetType === 'crypto' ? 'success' : item.assetType === 'mutual_fund' ? 'indigo' : 'neutral'}>
                        {item.exchange}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market heat map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {trending.slice(0, 8).map((asset) => (
                <div
                  key={asset.symbol}
                  className={
                    asset.changePercent >= 0
                      ? 'rounded-md border border-emerald-300/20 bg-emerald-300/[0.08] p-3'
                      : 'rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3'
                  }
                >
                  <p className="font-semibold">{asset.symbol}</p>
                  <p className="mt-1 truncate text-xs text-white/48">{asset.name}</p>
                  <p className={asset.changePercent >= 0 ? 'mt-3 text-sm font-semibold text-emerald-300' : 'mt-3 text-sm font-semibold text-rose-300'}>
                    {formatPercent(asset.changePercent)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="text-emerald-300" size={20} />
          <h2 className="text-xl font-semibold">Traction analytics</h2>
        </div>
        <TractionAnalytics trends={marketTrends} gainers={gainers} losers={losers} />
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <BadgeIndianRupee className="text-emerald-300" size={20} />
          <h2 className="text-xl font-semibold">Trending assets</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trending.slice(0, 4).map((asset) => (
            <MarketCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      </div>
    </section>
  );
}
