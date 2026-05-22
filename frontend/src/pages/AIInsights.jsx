import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Activity, ShieldAlert, Target, TrendingUp, Compass, CheckCircle2, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (d) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(d));

const mapAction = (insight) => {
  const t = insight.title.toLowerCase();
  if (t.includes('buy') || t.includes('accumulate')) return 'Buy';
  if (t.includes('sell') || t.includes('reduce')) return 'Sell';
  return 'Hold';
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [iRes, fRes] = await Promise.all([
          api.get('/ai/insights').catch(() => ({ data: { success: false } })),
          api.get('/ai/forecasts').catch(() => ({ data: { success: false } })),
        ]);
        if (iRes.data.success) setInsights(iRes.data.data);
        if (fRes.data.success) setForecasts(fRes.data.data);
      } catch {
        toast.error('Failed to load AI data');
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };
    fetch();
  }, []);

  const forecastData = useMemo(() => {
    if (!forecasts.length) return [
      { name: 'Wk 1', actual: 120000, predicted: 121000 },
      { name: 'Wk 2', actual: 121500, predicted: 122500 },
      { name: 'Wk 3', actual: 123000, predicted: 124500 },
      { name: 'Wk 4', actual: 124800, predicted: 126000 },
      { name: 'Wk 5', actual: 126200, predicted: 127800 },
    ];
    return forecasts.slice(0, 10).map(f => ({ name: fmt(f.targetDate), predicted: f.predictedValue, low: f.lowerBound, high: f.upperBound }));
  }, [forecasts]);

  const recommendations = useMemo(() => {
    const defaults = [
      { symbol: 'AAPL', action: 'Buy',  conviction: 'High',   reason: 'Strong quarterly earnings momentum and AI product pipeline.' },
      { symbol: 'TSLA', action: 'Hold', conviction: 'Medium', reason: 'Awaiting regulatory approvals for FSD expansion.' },
      { symbol: 'BND',  action: 'Sell', conviction: 'Low',    reason: 'Yields dropping below target allocation threshold.' },
    ];
    if (!insights.length) return defaults;
    const derived = insights.filter(i => i.type === 'opportunity' || i.type === 'optimization').slice(0, 3).map(i => ({
      symbol: i.portfolioId ? i.portfolioId.toString().slice(0, 6).toUpperCase() : 'PORTFOLIO',
      action: mapAction(i),
      conviction: i.confidenceScore >= 80 ? 'High' : i.confidenceScore >= 60 ? 'Medium' : 'Low',
      reason: i.content.length > 90 ? i.content.slice(0, 90) + '...' : i.content,
    }));
    return derived.length ? derived : defaults;
  }, [insights]);

  const tips = useMemo(() => {
    const t = insights.filter(i => i.type === 'tip').map(i => i.content);
    return t.length ? t : [
      'Increase exposure to emerging markets by 5% to hedge domestic volatility.',
      'Your tech weighting is high (45%). Consider rebalancing into healthcare ETFs.',
    ];
  }, [insights]);

  const riskScore = useMemo(() => {
    const r = insights.filter(i => i.type === 'risk');
    if (!r.length) return 32;
    return Math.max(20, Math.min(80, Math.round(100 - r.reduce((s, i) => s + i.confidenceScore, 0) / r.length * 0.7)));
  }, [insights]);

  const confidence = useMemo(() => {
    if (!insights.length) return 91;
    return Math.round(insights.reduce((s, i) => s + i.confidenceScore, 0) / insights.length);
  }, [insights]);

  const health = useMemo(() => {
    if (!insights.length) return 84;
    return Math.min(100, Math.max(55, Math.round(60 + insights.reduce((s, i) => s + i.confidenceScore, 0) / insights.length * 0.35)));
  }, [insights]);

  const healthData = [{ name: 'Score', value: health }, { name: 'Rest', value: 100 - health }];

  const actionColor = (a) => a === 'Buy' ? 'success' : a === 'Sell' ? 'danger' : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" /> AI Intelligence
          </h1>
          <p className="text-sm text-muted mt-1">Deep learning analysis of your portfolio and market conditions.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-2xl" />) : (
          <>
            <motion.div variants={item}>
              <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-success flex items-center gap-1 uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5" /> Portfolio Health
                    </p>
                    <h3 className="text-4xl font-bold text-foreground mt-2">{health}<span className="text-lg text-muted">/100</span></h3>
                    <p className="text-xs text-muted mt-1">AI-backed readiness score</p>
                  </div>
                  <div className="w-20 h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={healthData} cx="50%" cy="50%" innerRadius={25} outerRadius={35} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                          <Cell fill="#10B981" />
                          <Cell fill="#10B981" fillOpacity={0.15} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold text-muted flex items-center gap-1 uppercase tracking-wider mb-3">
                    <ShieldAlert className="w-3.5 h-3.5" /> Risk Score
                  </p>
                  <div className="flex items-end gap-2 mb-3">
                    <h3 className="text-3xl font-bold text-foreground">{riskScore}</h3>
                    <span className="text-sm font-semibold text-warning mb-0.5">Low/Moderate</span>
                  </div>
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                    <motion.div className="bg-warning h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${riskScore}%` }} transition={{ delay: 0.5, duration: 0.8 }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1 uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5" /> AI Confidence
                  </p>
                  <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-bold text-foreground">{confidence}%</h3>
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-xs text-muted mt-2">Based on {insights.length || 'sample'} generated insights</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle>30-Day Forecast</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="w-full h-[240px]" /> : (
                <>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecastData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dx={-8} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} formatter={v => [`$${Number(v).toLocaleString()}`, 'Value']} />
                        <Area type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#fGrad)" name="Predicted" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-background border border-border/60">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Forecast Summary</p>
                    <p className="text-sm text-foreground leading-relaxed">
                      Our AI model projects steady portfolio growth over the next 30 days, with balanced momentum and low volatility signals.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Macro Insights */}
          <Card>
            <CardHeader><CardTitle>Macro Investment Insights</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : insights.length === 0 ? (
                <EmptyState title="No insights yet" description="Check back after the AI processes your portfolio." className="min-h-[120px] border-none" />
              ) : (
                <div className="space-y-3">
                  {insights.map(insight => (
                    <div key={insight._id} className="p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors">
                      <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{insight.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Recommendations */}
          <Card>
            <CardHeader className="bg-background/60">
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12 w-full" /></div>) : (
                  recommendations.map((rec, i) => (
                    <div key={i} className="p-4 hover:bg-background/60 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-foreground text-sm">{rec.symbol}</span>
                        <Badge variant={actionColor(rec.action)}>{rec.action}</Badge>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{rec.reason}</p>
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-2">Conviction: {rec.conviction}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Diversification Tips */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                <CardTitle className="text-primary">Smart Diversification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />) : (
                tips.map((tip, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-primary/10 flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-xs text-foreground leading-relaxed">{tip}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
