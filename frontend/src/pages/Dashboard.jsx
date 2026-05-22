import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Lightbulb,
  ShieldCheck, BrainCircuit, Activity, BarChart3, Newspaper, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import api from '../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#F43F5E', '#EC4899'];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const StatCard = ({ title, value, subtitle, icon: Icon, bg, iconColor, delay }) => (
  <motion.div variants={item}>
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted/40" />
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1 tracking-tight">{value}</h3>
          <div className="mt-2 text-xs font-medium">{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-card-hover text-sm">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className="font-bold text-foreground">${Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, tRes, iRes, aRes] = await Promise.all([
          api.get('/portfolio').catch(() => ({ data: { success: false } })),
          api.get('/transactions').catch(() => ({ data: { success: false } })),
          api.get('/ai/insights').catch(() => ({ data: { success: false } })),
          api.get('/ai/alerts').catch(() => ({ data: { success: false } })),
        ]);
        if (pRes.data.success) setPortfolioData(pRes.data.data);
        if (tRes.data.success) setTransactions(tRes.data.data.slice(0, 5));
        if (iRes.data.success) setInsights(iRes.data.data.slice(0, 3));
        if (aRes.data.success) setAlerts(aRes.data.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const base = portfolioData?.summary?.currentValue || 100000;
  const performanceData = [
    { name: 'Mon', value: base * 0.95 },
    { name: 'Tue', value: base * 0.963 },
    { name: 'Wed', value: base * 0.978 },
    { name: 'Thu', value: base * 0.971 },
    { name: 'Fri', value: base * 0.989 },
    { name: 'Sat', value: base * 0.995 },
    { name: 'Sun', value: base },
  ];

  const allocationData = portfolioData?.stocks?.length > 0
    ? portfolioData.stocks.map(s => ({ name: s.symbol, value: s.value }))
    : [{ name: 'Cash', value: 100 }];

  const pl = portfolioData?.summary?.totalProfitLoss || 0;
  const plPct = portfolioData?.summary?.totalProfitLossPercentage || 0;

  const txTypeColor = (type) => ['income', 'deposit', 'sell'].includes(type) ? 'text-success' : 'text-foreground';
  const txSign = (type) => ['income', 'deposit', 'sell'].includes(type) ? '+' : '-';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Financial Overview</h1>
          <p className="text-sm text-muted mt-1">Your AI-powered portfolio at a glance.</p>
        </div>
        <Button size="sm" className="gap-2 self-start sm:self-auto">
          <Activity className="w-4 h-4" /> Run AI Analysis
        </Button>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Portfolio Value"
              value={`$${(portfolioData?.summary?.currentValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              subtitle={<span className="text-success flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12.5% all time</span>}
              icon={DollarSign}
              bg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              title="Total P&L"
              value={`${pl >= 0 ? '+' : '-'}$${Math.abs(pl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              subtitle={
                <span className={`flex items-center gap-1 ${plPct >= 0 ? 'text-success' : 'text-danger'}`}>
                  {plPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(plPct).toFixed(2)}% ROI
                </span>
              }
              icon={BarChart3}
              bg={pl >= 0 ? 'bg-success/10' : 'bg-danger/10'}
              iconColor={pl >= 0 ? 'text-success' : 'text-danger'}
            />
            <StatCard
              title="Risk Score"
              value="Low (24/100)"
              subtitle={<span className="text-success flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Well diversified</span>}
              icon={ShieldCheck}
              bg="bg-success/10"
              iconColor="text-success"
            />
            <StatCard
              title="AI Signal"
              value="Hold Assets"
              subtitle={<span className="text-primary flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Volatility expected</span>}
              icon={BrainCircuit}
              bg="bg-primary/10"
              iconColor="text-primary"
            />
          </>
        )}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Chart */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Portfolio Performance</CardTitle>
              <select className="text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 text-muted focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                <option>7 Days</option>
                <option>1 Month</option>
                <option>1 Year</option>
              </select>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="w-full h-[280px]" /> : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dx={-8} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#grad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Allocation Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader><CardTitle>Asset Allocation</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center h-[280px]">
              {loading ? <Skeleton className="w-44 h-44 rounded-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {allocationData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                      formatter={v => [`$${Number(v).toLocaleString()}`, 'Value']}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transactions + Widgets */}
        <div className="lg:col-span-2 space-y-4">
          {/* Transactions Table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-background/60">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Asset</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Type</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 4 }).map((_, j) => (
                              <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-full" /></td>
                            ))}
                          </tr>
                        ))
                      ) : transactions.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-8 text-sm text-muted">No transactions yet</td></tr>
                      ) : (
                        transactions.map(tx => (
                          <tr key={tx._id} className="hover:bg-background/70 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-foreground">{tx.description || tx.type}</td>
                            <td className="px-5 py-3.5 text-muted text-xs">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="px-5 py-3.5">
                              <Badge variant="default">{tx.type}</Badge>
                            </td>
                            <td className={`px-5 py-3.5 font-semibold text-right ${txTypeColor(tx.type)}`}>
                              {txSign(tx.type)}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sentiment + Fraud */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-primary" />
                    <CardTitle>Market Sentiment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-16 w-full" /> : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success mb-1">Bullish</div>
                      <p className="text-xs text-muted mb-3">Based on 500+ news sources</p>
                      <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-success h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                        />
                      </div>
                      <p className="text-xs text-muted mt-1.5">75% positive coverage</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border-success/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <CardTitle className="text-success">Fraud Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-16 w-full" /> : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
                        <ShieldCheck className="w-6 h-6 text-success" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {alerts.length === 0 ? 'No Active Threats' : `${alerts.length} Alerts`}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {alerts.length === 0 ? 'Account fully secured' : 'Review AI engine'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <Card className="h-full border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-primary">Smart Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : insights.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted">No insights yet</div>
              ) : (
                insights.map((insight, idx) => (
                  <motion.div
                    key={insight._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-primary/2 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-3">
                      {idx === 0
                        ? <TrendingUp className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        : <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      }
                      <div>
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{insight.title}</h4>
                        <p className="text-xs text-muted mt-1 leading-relaxed">{insight.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
