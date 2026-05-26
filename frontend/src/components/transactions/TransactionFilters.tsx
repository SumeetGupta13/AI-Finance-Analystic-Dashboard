import { Search } from 'lucide-react';
import type { TransactionStatus, TransactionType } from '../../types/domain';
import Tabs from '../ui/Tabs';

export type TransactionFilterState = {
  search: string;
  type: TransactionType | 'all';
  status: TransactionStatus | 'all';
};

type TransactionFiltersProps = {
  filters: TransactionFilterState;
  onChange: (filters: TransactionFilterState) => void;
};

const typeTabs = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'investment', label: 'Invest' },
  { value: 'savings', label: 'Save' },
  { value: 'stock_buy', label: 'Buy' },
  { value: 'stock_sell', label: 'Sell' },
];

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Done' },
  { value: 'rejected', label: 'Rejected' },
];

export default function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto]">
      <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-black/30 px-3">
        <Search size={18} className="text-white/40" />
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/36"
          placeholder="Search title, category, symbol, or method"
        />
      </label>
      <Tabs tabs={typeTabs} value={filters.type} onChange={(value) => onChange({ ...filters, type: value as TransactionFilterState['type'] })} />
      <Tabs tabs={statusTabs} value={filters.status} onChange={(value) => onChange({ ...filters, status: value as TransactionFilterState['status'] })} />
    </div>
  );
}
