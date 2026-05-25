import { useEffect, useMemo, useState } from 'react';
import { Activity, BadgeIndianRupee, Briefcase, Target, TrendingUp, WalletCards } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../components/dashboard/MetricCard';
import MarketCard from '../components/market/MarketCard';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import Skeleton from '../components/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { marketService } from '../services/marketService';
import { portfolioService } from '../services/portfolioService';
import type { MarketAsset, PortfolioAnalytics } from '../types/domain';
import { formatCurrency, formatPercent } from '../utils/formatters';

const allocationColors = ['#34D399', '#818CF8', '#FBBF24', '#F472B6'];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [trending, setTrending] = useState<MarketAsset[]>([]);
  const [gainers, setGainers] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [analyticsData, trendingData, gainersData] = await Promise.all([
          portfolioService.getAnalytics(),
          marketService.getTrending(),
          marketService.getTopGainers(4),
        ]);

        if (active) {
          setAnalytics(analyticsData);
          setTrending(trendingData);
          setGainers(gainersData);
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

  const barData = useMemo(
    () =>
      gainers.map((asset) => ({
        symbol: asset.symbol,
        change: asset.changePercent,
      })),
    [gainers]
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
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">FINORA Terminal</p>
          <h1 className="mt-3 text-4xl font-semibold">Investment dashboard</h1>
          <p className="mt-2 text-white/56">Portfolio intelligence, market pulse, and virtual trading readiness in one cockpit.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/58">
          Market data mode: <span className="font-semibold text-emerald-300">Mock, provider-ready</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Portfolio value"
          value={formatCurrency(summary?.portfolioValue || 0)}
          change={formatPercent(summary?.totalPnLPercent || 0)}
          tone={(summary?.totalPnL || 0) >= 0 ? 'success' : 'danger'}
          icon={Briefcase}
        />
        <MetricCard title="Cash balance" value={formatCurrency(summary?.cashBalance || 0)} icon={WalletCards} />
        <MetricCard
          title="Total P&L"
          value={formatCurrency(summary?.totalPnL || 0)}
          change={formatCurrency(summary?.realizedPnL || 0)}
          tone={(summary?.totalPnL || 0) >= 0 ? 'success' : 'danger'}
          icon={TrendingUp}
        />
        <MetricCard title="Risk score" value={`${summary?.riskScore || 0}/100`} change="Balanced" tone="indigo" icon={Target} />
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
            <div className="space-y-3">
              {[
                'Virtual portfolio synced with latest mock prices',
                'Risk score remains balanced after technology allocation',
                'Banking sector momentum improved versus prior session',
                'Crypto exposure remains below aggressive threshold',
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-md bg-white/[0.04] p-3">
                  <Activity className="mt-0.5 text-emerald-300" size={17} />
                  <p className="text-sm leading-6 text-white/64">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <BadgeIndianRupee className="text-emerald-300" size={20} />
          <h2 className="text-xl font-semibold">Trending watchlist</h2>
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
