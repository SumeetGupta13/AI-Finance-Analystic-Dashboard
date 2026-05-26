import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, ArrowDownUp, RefreshCw, WalletCards } from 'lucide-react';
import AITransactionInsights from '../components/transactions/AITransactionInsights';
import CategoryPieChart from '../components/transactions/CategoryPieChart';
import CashFlowChart from '../components/transactions/CashFlowChart';
import IncomeExpenseChart from '../components/transactions/IncomeExpenseChart';
import LoadingSkeleton from '../components/transactions/LoadingSkeleton';
import MonthlySummaryCards from '../components/transactions/MonthlySummaryCards';
import StockProfitLossCard from '../components/transactions/StockProfitLossCard';
import TransactionCard from '../components/transactions/TransactionCard';
import TransactionFilters, { type TransactionFilterState } from '../components/transactions/TransactionFilters';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionTable from '../components/transactions/TransactionTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { transactionService } from '../services/transactionService';
import type { Transaction, TransactionAnalytics, TransactionInput } from '../types/domain';
import { getTransactionAmount, getTransactionName, getTransactionSymbol } from '../utils/analytics';
import { formatCurrency } from '../utils/formatters';

const defaultFilters: TransactionFilterState = {
  search: '',
  type: 'all',
  status: 'all',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
  const [filters, setFilters] = useState<TransactionFilterState>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadTransactions() {
    setRefreshing(true);
    try {
      const [transactionData, analyticsData] = await Promise.all([
        transactionService.list({ limit: 300 }),
        transactionService.analytics(),
      ]);
      setTransactions(transactionData);
      setAnalytics(analyticsData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const symbol = getTransactionSymbol(transaction).toLowerCase();
      const name = getTransactionName(transaction).toLowerCase();
      const method = transaction.paymentMethod?.toLowerCase() || '';
      const matchesSearch =
        !query ||
        symbol.includes(query) ||
        name.includes(query) ||
        (transaction.title || '').toLowerCase().includes(query) ||
        (transaction.category || '').toLowerCase().includes(query) ||
        method.includes(query);
      const matchesType = filters.type === 'all' || transaction.type === filters.type;
      const matchesStatus = filters.status === 'all' || transaction.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [filters, transactions]);

  const completed = transactions.filter((transaction) => transaction.status === 'completed');
  const rejected = transactions.filter((transaction) => transaction.status === 'rejected');
  const netFlow = analytics?.summary.netCashFlow || 0;

  const handleCreateTransaction = async (input: TransactionInput) => {
    await transactionService.create(input);
    toast.success('Transaction saved');
    await loadTransactions();
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Transactions</p>
          <h1 className="mt-3 text-4xl font-semibold">Money command center</h1>
          <p className="mt-2 max-w-3xl text-white/56">
            Track income, expenses, investments, savings, stock trades, monthly cash flow, and AI money-health signals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={netFlow >= 0 ? 'success' : 'danger'}>{formatCurrency(netFlow)} net flow</Badge>
          <Button variant="secondary" onClick={() => void loadTransactions()} loading={refreshing}>
            <RefreshCw size={17} />
            Refresh
          </Button>
        </div>
      </div>

      {analytics ? <MonthlySummaryCards summary={analytics.summary} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <Activity className="text-emerald-300" size={20} />
            <p className="mt-4 text-sm text-white/52">Completed</p>
            <p className="mt-2 text-2xl font-semibold">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ArrowDownUp className="text-rose-300" size={20} />
            <p className="mt-4 text-sm text-white/52">Rejected</p>
            <p className="mt-2 text-2xl font-semibold">{rejected.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <WalletCards className="text-indigo-300" size={20} />
            <p className="mt-4 text-sm text-white/52">Ledger value</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(completed.reduce((sum, item) => sum + getTransactionAmount(item), 0))}</p>
          </CardContent>
        </Card>
        {analytics ? (
          <StockProfitLossCard
            realized={analytics.stockProfitLoss.realized}
            unrealized={analytics.stockProfitLoss.unrealized}
            total={analytics.stockProfitLoss.total}
          />
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm onSubmit={handleCreateTransaction} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <TransactionFilters filters={filters} onChange={setFilters} />
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredTransactions.slice(0, 4).map((transaction) => (
              <TransactionCard key={transaction._id || transaction.id || transaction.createdAt} transaction={transaction} />
            ))}
          </div>
        </div>
      </div>

      {analytics ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs expense</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart data={analytics.cashFlow} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash flow</CardTitle>
              </CardHeader>
              <CardContent>
                <CashFlowChart data={analytics.cashFlow} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <Card>
              <CardHeader>
                <CardTitle>Category spending</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={analytics.categoryBreakdown} />
              </CardContent>
            </Card>
            <AITransactionInsights insights={analytics.aiInsights} />
          </div>
        </>
      ) : null}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Transaction history</CardTitle>
          <Badge tone="neutral">{filteredTransactions.length} rows</Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <EmptyState icon={Activity} title="No matching transactions" description="Adjust filters or add a new finance transaction." />
          ) : (
            <TransactionTable transactions={filteredTransactions} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
