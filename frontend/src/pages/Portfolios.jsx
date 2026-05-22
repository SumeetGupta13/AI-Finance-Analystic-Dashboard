import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, Search, Edit2, Trash2, X, PieChart as PieIcon, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import api from '../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#F43F5E', '#EC4899', '#6366F1'];

const Portfolios = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentStockId, setCurrentStockId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ symbol: '', companyName: '', shares: '', averagePurchasePrice: '', currentPrice: '' });

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portfolio');
      if (res.data.success) setData(res.data.data);
    } catch {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const openModal = (mode, stock = null) => {
    setModalMode(mode);
    if (mode === 'edit' && stock) {
      setCurrentStockId(stock._id);
      setFormData({ symbol: stock.symbol, companyName: stock.companyName, shares: stock.shares, averagePurchasePrice: stock.averagePurchasePrice, currentPrice: stock.currentPrice });
    } else {
      setCurrentStockId(null);
      setFormData({ symbol: '', companyName: '', shares: '', averagePurchasePrice: '', currentPrice: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ symbol: '', companyName: '', shares: '', averagePurchasePrice: '', currentPrice: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        symbol: formData.symbol.toUpperCase(),
        companyName: formData.companyName,
        shares: Number(formData.shares),
        averagePurchasePrice: Number(formData.averagePurchasePrice),
        currentPrice: formData.currentPrice ? Number(formData.currentPrice) : Number(formData.averagePurchasePrice),
      };
      if (modalMode === 'add') {
        await api.post('/portfolio', payload);
        toast.success('Asset added successfully');
      } else {
        await api.put(`/portfolio/${currentStockId}`, payload);
        toast.success('Asset updated');
      }
      closeModal();
      fetchPortfolio();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${modalMode} asset`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Asset removed');
      fetchPortfolio();
    } catch {
      toast.error('Failed to delete asset');
    }
  };

  const filtered = data?.stocks?.filter(s =>
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const pieData = data?.stocks?.map(s => ({ name: s.symbol, value: s.value })) || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted mt-1">Track and manage your investments.</p>
        </div>
        <Button size="sm" className="gap-1.5 self-start sm:self-auto" onClick={() => openModal('add')}>
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </div>

      {/* Summary Cards + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[140px] rounded-2xl" />)
          ) : (
            <>
              {[
                { label: 'Total Investment', value: `$${(summary.totalInvestment || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, bg: 'bg-primary/10', color: 'text-primary' },
                { label: 'Current Value', value: `$${(summary.currentValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: TrendingUp, bg: 'bg-success/10', color: 'text-success' },
              ].map(({ label, value, icon: Icon, bg, color }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
                      <h3 className="text-xl font-bold text-foreground mt-1">{value}</h3>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl ${(summary.totalProfitLoss || 0) >= 0 ? 'bg-success/10' : 'bg-danger/10'} flex items-center justify-center mb-3`}>
                      {(summary.totalProfitLoss || 0) >= 0
                        ? <TrendingUp className="w-5 h-5 text-success" />
                        : <TrendingDown className="w-5 h-5 text-danger" />
                      }
                    </div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total P&L</p>
                    <div className="flex items-end gap-2 mt-1">
                      <h3 className="text-xl font-bold text-foreground">
                        {(summary.totalProfitLoss || 0) >= 0 ? '+' : '-'}${Math.abs(summary.totalProfitLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </h3>
                      <span className={`text-xs font-bold mb-0.5 ${(summary.totalProfitLossPercentage || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                        ({(summary.totalProfitLossPercentage || 0) >= 0 ? '+' : ''}{(summary.totalProfitLossPercentage || 0).toFixed(2)}%)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              <CardTitle>Allocation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[200px]">
            {loading ? <Skeleton className="w-full h-full rounded-full" /> : pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">No assets</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #E2E8F0' }} formatter={v => [`$${Number(v).toLocaleString()}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Holdings</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              placeholder="Search assets..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-background/60">
                  {['Asset', 'Shares', 'Avg Cost', 'Current', 'Value', 'P&L', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider ${i === 0 ? 'text-left' : i === 6 ? 'text-center' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  ))
                ) : !data || data.stocks.length === 0 ? (
                  <tr><td colSpan={7} className="p-0">
                    <EmptyState title="No assets yet" description="Add your first stock to start tracking." actionLabel="Add Asset" onAction={() => openModal('add')} className="border-none rounded-none min-h-[280px]" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-sm text-muted">No matching assets</td></tr>
                ) : (
                  filtered.map((stock, idx) => (
                    <motion.tr
                      key={stock._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-background/70 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{stock.symbol}</p>
                            <p className="text-xs text-muted">{stock.companyName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-foreground">{stock.shares}</td>
                      <td className="px-5 py-4 text-right text-muted">${stock.averagePurchasePrice.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right text-muted">${stock.currentPrice.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right font-semibold text-foreground">${stock.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className={`px-5 py-4 text-right font-bold ${stock.profitOrLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                        {stock.profitOrLoss >= 0 ? '+' : '-'}${Math.abs(stock.profitOrLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] font-semibold opacity-80 mt-0.5">
                          {stock.profitOrLossPercentage >= 0 ? '+' : ''}{stock.profitOrLossPercentage.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('edit', stock)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(stock._id)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card w-full max-w-md rounded-2xl shadow-card-hover border border-border p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">{modalMode === 'add' ? 'Add New Asset' : 'Edit Asset'}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Ticker Symbol" placeholder="AAPL" value={formData.symbol}
                  onChange={e => setFormData(p => ({ ...p, symbol: e.target.value }))} required disabled={modalMode === 'edit'} />
                <Input label="Company Name" placeholder="Apple Inc." value={formData.companyName}
                  onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))} required disabled={modalMode === 'edit'} />
              </div>
              <Input label="Number of Shares" type="number" step="0.0001" min="0.0001" placeholder="10"
                value={formData.shares} onChange={e => setFormData(p => ({ ...p, shares: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Avg. Purchase Price ($)" type="number" step="0.01" min="0" placeholder="150.50"
                  value={formData.averagePurchasePrice} onChange={e => setFormData(p => ({ ...p, averagePurchasePrice: e.target.value }))} required />
                <Input label="Current Price ($)" type="number" step="0.01" min="0" placeholder="155.00"
                  value={formData.currentPrice} onChange={e => setFormData(p => ({ ...p, currentPrice: e.target.value }))} required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>{modalMode === 'add' ? 'Add Asset' : 'Save Changes'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Portfolios;
