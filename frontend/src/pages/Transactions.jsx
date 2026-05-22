import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Search, Filter, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  deposit:    'success',
  income:     'success',
  sell:       'success',
  withdrawal: 'danger',
  expense:    'danger',
  buy:        'warning',
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '', type: 'deposit', amount: '', symbol: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/transactions');
      if (data.success) setTransactions(data.data);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ description: '', type: 'deposit', amount: '', symbol: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isDebit = ['expense', 'withdrawal', 'buy'].includes(formData.type);
      await api.post('/transactions', {
        description: formData.description,
        type: formData.type,
        amount: isDebit ? -Math.abs(Number(formData.amount)) : Math.abs(Number(formData.amount)),
        symbol: formData.symbol.toUpperCase(),
        date: formData.date,
      });
      toast.success('Transaction added');
      handleCloseModal();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = transactions.filter(tx =>
    (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.symbol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCredit = (type) => ['income', 'deposit', 'sell'].includes(type);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Transactions</h1>
          <p className="text-sm text-muted mt-1">Track and manage your financial history.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> New Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              placeholder="Search transactions..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" className="gap-1.5 shrink-0">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-background/60">
                  {['Date', 'Description', 'Type', 'Status', 'Amount'].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState
                        title="No transactions found"
                        description={searchTerm ? 'Try adjusting your search.' : "You haven't made any transactions yet."}
                        actionLabel={!searchTerm ? 'Add Transaction' : ''}
                        onAction={() => setIsModalOpen(true)}
                        className="border-none rounded-none min-h-[320px]"
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, idx) => (
                    <motion.tr
                      key={tx._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-background/70 transition-colors group"
                    >
                      <td className="px-5 py-4 text-muted text-xs whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCredit(tx.type) ? 'bg-success/10' : 'bg-danger/10'}`}>
                            {isCredit(tx.type)
                              ? <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                              : <ArrowDownLeft className="w-3.5 h-3.5 text-danger" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{tx.description || 'N/A'}</p>
                            {tx.symbol && <p className="text-xs text-muted">{tx.symbol}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={TYPE_COLORS[tx.type] || 'default'}>{tx.type}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                          {tx.status || 'completed'}
                        </Badge>
                      </td>
                      <td className={`px-5 py-4 font-semibold text-right ${isCredit(tx.type) ? 'text-success' : 'text-foreground'}`}>
                        {isCredit(tx.type) ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
              <h2 className="text-lg font-bold text-foreground">New Transaction</h2>
              <button onClick={handleCloseModal} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Description" name="description" placeholder="e.g. Salary Deposit"
                value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Transaction Type</label>
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={formData.type}
                  onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                >
                  {['deposit', 'withdrawal', 'income', 'expense', 'buy', 'sell'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Amount ($)" type="number" step="0.01" min="0" placeholder="500.00"
                  value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} required />
                <Input label="Symbol (Optional)" placeholder="AAPL"
                  value={formData.symbol} onChange={e => setFormData(p => ({ ...p, symbol: e.target.value }))} />
              </div>
              <Input label="Date" type="date" value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Add Transaction</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
