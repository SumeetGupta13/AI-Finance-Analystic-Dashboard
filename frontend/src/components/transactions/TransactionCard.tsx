import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react';
import type { Transaction } from '../../types/domain';
import { getTransactionAmount, getTransactionName, getTransactionSymbol, isBuyTransaction, isSellTransaction } from '../../utils/analytics';
import { formatCurrency } from '../../utils/formatters';
import Badge from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

const iconByType = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  investment: TrendingUp,
  savings: PiggyBank,
  stock_buy: TrendingUp,
  stock_sell: ArrowDownLeft,
  buy: TrendingUp,
  sell: ArrowDownLeft,
};

export default function TransactionCard({ transaction }: { transaction: Transaction }) {
  const Icon = iconByType[transaction.type];
  const amount = getTransactionAmount(transaction);
  const symbol = getTransactionSymbol(transaction);
  const positive = transaction.type === 'income' || transaction.type === 'stock_sell' || isSellTransaction(transaction);
  const danger = transaction.type === 'expense' || isBuyTransaction(transaction);

  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/30">
          <Icon size={18} className={positive ? 'text-emerald-300' : danger ? 'text-rose-300' : 'text-indigo-300'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{transaction.title || getTransactionName(transaction)}</p>
              <p className="mt-1 text-xs text-white/42">
                {transaction.category || 'General'}
                {symbol ? ` · ${symbol}` : ''}
              </p>
            </div>
            <p className={positive ? 'font-semibold text-emerald-300' : danger ? 'font-semibold text-rose-300' : 'font-semibold text-white'}>
              {positive ? '+' : '-'}
              {formatCurrency(amount)}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={transaction.status === 'completed' ? 'success' : 'danger'}>{transaction.status}</Badge>
            <Badge tone="neutral">{transaction.paymentMethod?.replace('_', ' ') || 'wallet'}</Badge>
            <span className="text-xs text-white/38">{new Date(transaction.transactionDate || transaction.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
