import { Landmark, PiggyBank, Receipt, TrendingUp } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import type { TransactionSummary } from '../../types/domain';
import { formatCurrency, formatPercent } from '../../utils/formatters';

type MonthlySummaryCardsProps = {
  summary: TransactionSummary;
};

export default function MonthlySummaryCards({ summary }: MonthlySummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Income" value={formatCurrency(summary.income)} icon={Landmark} tone="success" />
      <MetricCard title="Expenses" value={formatCurrency(summary.expense)} icon={Receipt} tone="danger" />
      <MetricCard title="Invested" value={formatCurrency(summary.investment)} change={formatPercent(summary.investmentRate)} icon={TrendingUp} tone="indigo" />
      <MetricCard title="Savings" value={formatCurrency(summary.savings)} change={formatPercent(summary.savingRate)} icon={PiggyBank} />
    </div>
  );
}
