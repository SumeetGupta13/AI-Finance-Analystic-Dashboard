import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, PieChart as PieChartIcon, Target, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../components/dashboard/MetricCard';
import AITransactionInsights from '../components/transactions/AITransactionInsights';
import CategoryPieChart from '../components/transactions/CategoryPieChart';
import CashFlowChart from '../components/transactions/CashFlowChart';
import IncomeExpenseChart from '../components/transactions/IncomeExpenseChart';
import MonthlyFlowChart from '../components/transactions/MonthlyFlowChart';
import MonthlySummaryCards from '../components/transactions/MonthlySummaryCards';
import StockProfitLossCard from '../components/transactions/StockProfitLossCard';
import Badge from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { marketService } from '../services/marketService';
import { portfolioService } from '../services/portfolioService';
import { transactionService } from '../services/transactionService';
import type { MarketTrendOverview, PortfolioAnalytics, Transaction, TransactionAnalytics } from '../types/domain';
import { buildMonthlyFlow } from '../utils/analytics';
import { formatCurrency, formatPercent } from '../utils/formatters';

const allocationColors = ['#34D399', '#818CF8', '#FBBF24', '#F472B6', '#A78BFA'];

export default function MonthlyAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [transactionAnalytics, setTransactionAnalytics] = useState<TransactionAnalytics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trends, setTrends] = useState<MarketTrendOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      setLoading(true);
      try {
        const [portfolioData, transactionData, transactionAnalyticsData, trendData] = await Promise.all([
          portfolioService.getAnalytics(),
          transactionService.list(),
          transactionService.analytics(),
          marketService.getMarketTrends(),
        ]);

        if (active) {
          setAnalytics(portfolioData);
          setTransactions(transactionData);
          setTransactionAnalytics(transactionAnalyticsData);
          setTrends(trendData);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const monthlyFlow = useMemo(() => buildMonthlyFlow(transactions), [transactions]);
  const latestMonth = monthlyFlow[monthlyFlow.length - 1];
  const cumulativeFlow = monthlyFlow.reduce<Array<{ month: string; value: number }>>((items, point) => {
    const previous = items[items.length - 1]?.value || 0;
    items.push({ month: point.month, value: previous + point.net });
    return items;
  }, []);
  const bestMonth = monthlyFlow.reduce<typeof latestMonth | undefined>((best, point) => {
    if (!best || point.net > best.net) return point;
    return best;
  }, undefined);
  const activeMonths = monthlyFlow.length;
  const diversificationScore = Math.min((analytics?.allocation.length || 0) * 25, 100);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
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
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Monthly analytics</p>
          <h1 className="mt-3 text-4xl font-semibold">Portfolio rhythm</h1>
          <p className="mt-2 max-w-3xl text-white/56">
            Monthly execution flow, allocation posture, realized activity, and current market momentum in one analytics view.
          </p>
        </div>
        <Badge tone={latestMonth && latestMonth.net >= 0 ? 'success' : 'danger'}>
          {latestMonth ? `${latestMonth.month} ${formatCurrency(latestMonth.net)}` : 'No monthly flow'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Portfolio value" value={formatCurrency(analytics?.summary.portfolioValue || 0)} icon={PieChartIcon} />
        <MetricCard
          title="Total P&L"
          value={formatCurrency(analytics?.summary.totalPnL || 0)}
          change={formatPercent(analytics?.summary.totalPnLPercent || 0)}
          tone={(analytics?.summary.totalPnL || 0) >= 0 ? 'success' : 'danger'}
          icon={TrendingUp}
        />
        <MetricCard title="Active months" value={String(activeMonths)} icon={CalendarDays} />
        <MetricCard title="Diversification" value={`${diversificationScore}/100`} icon={Target} tone="indigo" />
      </div>

      {transactionAnalytics ? (
        <>
          <MonthlySummaryCards summary={transactionAnalytics.summary} />
          <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
            <Card>
              <CardHeader>
                <CardTitle>Income, expense, investment, savings</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart data={transactionAnalytics.cashFlow} />
              </CardContent>
            </Card>
            <StockProfitLossCard
              realized={transactionAnalytics.stockProfitLoss.realized}
              unrealized={transactionAnalytics.stockProfitLoss.unrealized}
              total={transactionAnalytics.stockProfitLoss.total}
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <Card>
              <CardHeader>
                <CardTitle>Category-wise spending</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={transactionAnalytics.categoryBreakdown} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Net cash flow</CardTitle>
              </CardHeader>
              <CardContent>
                <CashFlowChart data={transactionAnalytics.cashFlow} />
              </CardContent>
            </Card>
          </div>
          <AITransactionInsights insights={transactionAnalytics.aiInsights} />
        </>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Asset allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics?.allocation || []} dataKey="value" nameKey="label" innerRadius={70} outerRadius={112} paddingAngle={4}>
                    {(analytics?.allocation || []).map((entry, index) => (
                      <Cell key={entry.label} fill={allocationColors[index % allocationColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly buy/sell flow</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyFlow.length === 0 ? (
              <EmptyState icon={BarChart3} title="No monthly activity" description="Monthly order flow appears after buy or sell transactions are recorded." />
            ) : (
              <MonthlyFlowChart data={monthlyFlow} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative monthly flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeFlow}>
                  <defs>
                    <linearGradient id="monthlyNet" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} fill="url(#monthlyNet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/48">Best net-flow month</p>
              <p className="mt-2 text-xl font-semibold">{bestMonth ? bestMonth.month : '-'}</p>
              <p className={bestMonth && bestMonth.net >= 0 ? 'mt-1 text-emerald-300' : 'mt-1 text-rose-300'}>
                {bestMonth ? formatCurrency(bestMonth.net) : formatCurrency(0)}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/48">Market momentum</p>
              <p className="mt-2 text-xl font-semibold">{trends?.marketMomentum.label || '-'}</p>
              <p className="mt-1 text-sm text-white/52">{trends?.marketMomentum.summary || 'Market momentum is loading.'}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/48">Risk score</p>
              <p className="mt-2 text-xl font-semibold">{analytics?.summary.riskScore || 0}/100</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly rows</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-white/42">
              <tr>
                <th className="py-3">Month</th>
                <th className="py-3">Buy flow</th>
                <th className="py-3">Sell flow</th>
                <th className="py-3">Net flow</th>
                <th className="py-3">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {monthlyFlow.map((point) => (
                <tr key={point.month}>
                  <td className="py-3 font-semibold">{point.month}</td>
                  <td className="py-3">{formatCurrency(point.buy)}</td>
                  <td className="py-3">{formatCurrency(point.sell)}</td>
                  <td className={point.net >= 0 ? 'py-3 text-emerald-300' : 'py-3 text-rose-300'}>{formatCurrency(point.net)}</td>
                  <td className="py-3">{point.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
