import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CreditCard, ShieldCheck, ClipboardList, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DUMMY_ALERTS = [
  { id: 'a1', title: 'High-risk online purchase detected', description: 'Transaction amount is elevated compared to your normal spending patterns.', confidence: 81, riskLevel: 'High' },
  { id: 'a2', title: 'Unusual merchant location', description: 'Merchant location does not match your typical geographic footprint.', confidence: 72, riskLevel: 'Medium' },
  { id: 'a3', title: 'New payee with no history', description: 'This recipient has not been used in prior transactions.', confidence: 65, riskLevel: 'Medium' },
];

const DUMMY_TX = [
  { id: 't1', date: '2026-05-20', merchant: 'GlobePay Services', amount: 2410, type: 'Wire Transfer', location: 'Mexico City' },
  { id: 't2', date: '2026-05-19', merchant: 'ElectroCart', amount: 980, type: 'Online Purchase', location: 'San Francisco, CA' },
  { id: 't3', date: '2026-05-18', merchant: 'Ace Travel', amount: 3200, type: 'Travel', location: 'Dubai, UAE' },
];

const riskVariant = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'danger' };

const FraudDetection = () => {
  const [form, setForm] = useState({ amount: '', merchant: '', location: '', type: 'Online Purchase', category: 'Shopping', date: '' });
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState(DUMMY_ALERTS);
  const [transactions, setTransactions] = useState(DUMMY_TX);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const demoEval = (payload) => {
    const amount = Math.max(0, Number(payload.amount) || 0);
    const score = Math.min(0.98, 0.18 + Math.min(0.35, amount / 8000) + (/usa|us|united states/i.test(payload.location || '') ? 0 : 0.18) + (payload.type === 'Wire Transfer' ? 0.14 : 0.1) + (/(crypto|casino|pawn|travel|overseas)/i.test(payload.merchant || '') ? 0.14 : 0));
    const prob = Math.round(score * 100) / 100;
    const riskLevel = prob >= 0.7 ? 'High' : prob >= 0.4 ? 'Medium' : 'Low';
    return {
      probability: prob, riskLevel, fraudScore: Math.round(prob * 100),
      explanation: `This transaction has a ${Math.round(prob * 100)}% fraud probability based on amount, merchant profile, and location.`,
      alerts: [{ id: 'demo', title: 'Unusual transaction pattern', description: 'Customer rarely spends this amount with the selected merchant.', confidence: Math.round(70 + prob * 10), riskLevel }],
      suspiciousTransactions: [{ id: 'demo-tx', date: payload.date || '2026-05-21', merchant: payload.merchant || 'Unknown', amount: amount, type: payload.type, location: payload.location || 'Unknown' }],
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { amount: form.amount, merchant: form.merchant, location: form.location, transactionType: form.type, category: form.category, date: form.date };
    try {
      const res = await api.post('/ai/fraud-check', payload);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setResult({ probability: d.probability ?? 0, riskLevel: d.riskLevel ?? 'Low', explanation: d.explanation || 'AI assessed transaction risk.', fraudScore: Math.round((d.probability ?? 0) * 100) });
        setAlerts(d.alerts?.length ? d.alerts : DUMMY_ALERTS);
        setTransactions(d.suspiciousTransactions?.length ? d.suspiciousTransactions : DUMMY_TX);
      } else {
        const demo = demoEval(payload);
        setResult(demo); setAlerts(demo.alerts); setTransactions(demo.suspiciousTransactions);
        toast('Using demo fraud analysis', { icon: '⚠️' });
      }
    } catch {
      const demo = demoEval(payload);
      setResult(demo); setAlerts(demo.alerts); setTransactions(demo.suspiciousTransactions);
      toast.error('Fraud service unavailable. Showing demo output.');
    } finally {
      setLoading(false);
    }
  };

  const score = result?.fraudScore ?? 35;
  const meterData = [{ name: 'Score', value: score, fill: score >= 70 ? '#F43F5E' : score >= 40 ? '#F59E0B' : '#10B981' }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" /> Fraud Detection
        </h1>
        <p className="text-sm text-muted mt-1">Simulate transaction review and visualize AI-driven fraud risk.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Input Form */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <CardTitle>Transaction Input</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Amount ($)" type="number" placeholder="Enter amount" value={form.amount} onChange={e => set('amount', e.target.value)} required />
                  <Input label="Merchant" placeholder="e.g. GlobePay Services" value={form.merchant} onChange={e => set('merchant', e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Location" placeholder="e.g. Mexico City" value={form.location} onChange={e => set('location', e.target.value)} required />
                  <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Transaction Type" placeholder="e.g. Wire Transfer" value={form.type} onChange={e => set('type', e.target.value)} required />
                  <Input label="Category" placeholder="e.g. Travel" value={form.category} onChange={e => set('category', e.target.value)} required />
                </div>
                <div className="flex justify-end pt-1">
                  <Button type="submit" isLoading={loading}>Analyze Transaction</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Gauge + Risk */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <BarChart3 className="w-4 h-4" />
                <CardTitle className="text-primary">Fraud Probability</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={16} data={meterData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted uppercase tracking-wider">Probability Score</p>
                <h3 className="text-4xl font-bold text-foreground mt-1">{score}%</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <CardTitle>Risk Level</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 rounded-xl bg-background border border-border">
                <Badge variant={riskVariant[result?.riskLevel || 'Medium']} className="text-sm px-4 py-1.5">
                  {result?.riskLevel || 'Medium'} Risk
                </Badge>
                <p className="mt-3 text-xs text-muted leading-relaxed">
                  {result?.explanation || 'Run a transaction analysis to see a full fraud assessment.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Alert Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <CardTitle>AI Alert Cards</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl border border-border bg-background hover:border-danger/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{alert.description}</p>
                  </div>
                  <Badge variant={riskVariant[alert.riskLevel]}>{alert.riskLevel}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-border h-1.5 rounded-full overflow-hidden">
                    <div className="bg-warning h-full rounded-full" style={{ width: `${alert.confidence}%` }} />
                  </div>
                  <span className="text-xs text-muted font-medium">{alert.confidence}%</span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Suspicious Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              <CardTitle>Suspicious Transactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-background/60">
                    {['Date', 'Merchant', 'Amount', 'Type'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {transactions.map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="hover:bg-background/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-muted text-xs">{tx.date}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{tx.merchant}</td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">${tx.amount.toLocaleString()}</td>
                      <td className="px-5 py-3.5"><Badge variant="default">{tx.type}</Badge></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FraudDetection;
