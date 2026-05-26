import type { Transaction } from '../../types/domain';
import { getTransactionAmount, getTransactionId, getTransactionName, getTransactionSymbol, isBuyTransaction, isTradeTransaction } from '../../utils/analytics';
import { formatCurrency, getAssetCurrency } from '../../utils/formatters';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { Activity } from 'lucide-react';

type TransactionTableProps = {
  transactions: Transaction[];
};

export default function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No transactions yet"
        description="Completed and rejected orders will appear here once trading activity is recorded."
      />
    );
  }

  return (
    <table className="w-full min-w-[860px] text-left text-sm">
      <thead className="text-white/42">
        <tr>
          <th className="py-3">Date</th>
          <th className="py-3">Asset class</th>
          <th className="py-3">Title</th>
          <th className="py-3">Category</th>
          <th className="py-3">Method</th>
          <th className="py-3">Qty</th>
          <th className="py-3">Type</th>
          <th className="py-3">Amount</th>
          <th className="py-3">P/L</th>
          <th className="py-3">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10">
        {transactions.map((transaction) => {
          const symbol = getTransactionSymbol(transaction);
          const amount = getTransactionAmount(transaction);
          const isBuy = isBuyTransaction(transaction);
          const isTrade = isTradeTransaction(transaction);

          return (
            <tr key={getTransactionId(transaction)}>
              <td className="py-3 text-white/58">{new Date(transaction.transactionDate || transaction.createdAt).toLocaleString()}</td>
              <td className="py-3 capitalize">
                <Badge tone={transaction.status === 'rejected' ? 'danger' : isBuy || transaction.type === 'expense' ? 'warning' : 'success'}>
                  {transaction.type.replace('_', ' ')}
                </Badge>
              </td>
              <td className="py-3">
                <p className="font-semibold">{transaction.title || getTransactionName(transaction)}</p>
                <p className="text-xs text-white/42">{symbol || getTransactionName(transaction)}</p>
              </td>
              <td className="py-3 text-white/58">{transaction.category || 'General'}</td>
              <td className="py-3 text-white/58">{transaction.paymentMethod?.replace('_', ' ') || '-'}</td>
              <td className="py-3">{isTrade ? transaction.quantity : '-'}</td>
              <td className="py-3 text-white/58">{transaction.assetType?.replace('_', ' ') || 'cash'}</td>
              <td className="py-3 font-semibold">{formatCurrency(amount, getAssetCurrency(transaction.assetType))}</td>
              <td className={(transaction.profitLoss || 0) >= 0 ? 'py-3 text-emerald-300' : 'py-3 text-rose-300'}>
                {isTrade ? formatCurrency(transaction.profitLoss || 0, getAssetCurrency(transaction.assetType)) : '-'}
              </td>
              <td className="py-3">
                <Badge tone={transaction.status === 'completed' ? 'success' : 'danger'}>{transaction.status}</Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
