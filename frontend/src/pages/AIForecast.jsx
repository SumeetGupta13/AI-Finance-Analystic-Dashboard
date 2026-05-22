import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Activity, BarChart3, Sparkles, Target } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DUMMY = {
  symbol: 'AAPL', predictedPrice: 188.34, accuracy: 88, trend: 'Bullish',
  explanation: 'The AI model expects a gentle uptrend driven by solid earnings momentum and strong sector rotation into technology. Institutional accumulation patterns suggest continued buying pressure.',
  history: [
    { day: 'Mon', actual: 178, predicted: 180 },
    { day: 'Tue', actual: 180, predicted: 181 },
    { day: 'Wed', actual: 182, predicted: 183 },
    { day: 'Thu', actual: 183, predicted: 185 },
    { day: 'Fri', actual: 185, predicted: 187 },
    { day: 'Sat', actual: 186, predicted: 188 },
    { day: 'Sun', actual: 187, predicted: 189 },
  ],
  forecast: [
    { day: 'D+1', price: 189 }, { day: 'D+2', price: 190.5 }, { day: 'D+3', price: 192 },
    { day: 'D+4', price: 193.2 }, { day: 'D+5', price: 194.7 }, { day: 'D+6', price: 196 }, { day: 'D+7', price: 197.4 },
  ],
};

const AIForecast = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [data, setData] = useState(DUMMY);
  const [loading, setLoading] = useState(false);

  const combined = useMemo(() => [
    ...data.history,
    ...data.forecast.map(f => ({ day: f.day, predicted: f.price })),
  ], [data]);

  const fetchForecast = async (s) => {
    if (!s.trim()) { toast.error('Enter a valid symbol'); return; }
    setLoading(true);
    try {
      const res = await api.get(`/ai/forecast/${s.trim().toUpperCase()}`);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      } else {
        toast('Using demo forecast data', { icon: '⚠️' });
        setData({ ...DUMMY, symbol: s.trim().toUpperCase() });
      }
    } catch {
      toast.error('Could not fetch forecast. Showing demo data.');
      setData({ ...DUMMY, symbol: s.trim().toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast('AAPL'); }, []);

  const isBullish = data.trend === 'Bullish';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Forecasting</h1>
          <p className="text-sm text-muted mt-1">Predict future stock movement with AI-powered analysis.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Enter symbol (e.g. AAPL)"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchForecast(symbol)}
            className="sm:w-52"
          />
          <Button onClick={() => fetchForecast(symbol)} isLoading={loading} size="md">
            <Search className="w-4 h-4" /> Forecast
          </Button>
        </div>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <CardTitle>7-Day Price Forecast — {data.symbol}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} formatter={v => [`$${Number(v).toFixed(2)}`, '']} />
                    <Legend verticalAlign="top" iconType="circle" iconSize={8} />
                    <Line type="monotone" dataKey="actual" stroke="#0F172A" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="5 3" name="Predicted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Metrics */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-5 text-center">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Next 7-Day Close</p>
              <h2 className="text-5xl font-bold text-foreground">${data.predictedPrice?.toFixed(2)}</h2>
              <p className="text-sm text-muted mt-2">{data.symbol}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                {isBullish
                  ? <TrendingUp className="w-4 h-4 text-success" />
                  : <TrendingDown className="w-4 h-4 text-danger" />
                }
                <p className="text-sm font-semibold text-foreground">Trend Direction</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${isBullish ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {isBullish ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {data.trend}
              </div>
              <p className="text-xs text-muted mt-3 leading-relaxed">Based on price momentum and sector positioning analysis.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Model Accuracy</p>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-foreground">{data.accuracy}%</span>
              </div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${data.accuracy}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
              </div>
              <p className="text-xs text-muted mt-2">Historical model fit confidence</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle>Historical vs Predicted</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combined} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0F172A" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} formatter={v => [`$${v}`, '']} />
                    <Legend verticalAlign="top" iconType="circle" iconSize={8} />
                    <Area type="monotone" dataKey="actual" stroke="#0F172A" strokeWidth={2} fill="url(#aGrad)" name="Actual" />
                    <Area type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#pGrad)" name="Predicted" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <CardTitle className="text-primary">AI Explanation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-7">{data.explanation}</p>
            <div className="mt-4 p-3 rounded-xl bg-white border border-primary/10">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Confidence Level</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${data.accuracy}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground">{data.accuracy}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIForecast;
