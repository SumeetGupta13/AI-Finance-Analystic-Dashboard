import type { Transaction } from '../types/domain';

export type MonthlyFlow = {
  month: string;
  buy: number;
  sell: number;
  net: number;
  trades: number;
};

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: '2-digit',
});

export const getTransactionId = (transaction: Transaction) =>
  transaction._id || transaction.id || `${transaction.stockSymbol || transaction.symbol || transaction.title}-${transaction.createdAt}`;

export const getTransactionSymbol = (transaction: Transaction) => transaction.stockSymbol || transaction.symbol || '';
export const getTransactionName = (transaction: Transaction) => transaction.stockName || transaction.name || transaction.title;
export const getTransactionAmount = (transaction: Transaction) =>
  transaction.netAmount ?? transaction.amount ?? transaction.totalValue ?? transaction.grossAmount ?? 0;
export const isBuyTransaction = (transaction: Transaction) => transaction.type === 'stock_buy' || transaction.type === 'buy';
export const isSellTransaction = (transaction: Transaction) => transaction.type === 'stock_sell' || transaction.type === 'sell';
export const isTradeTransaction = (transaction: Transaction) => isBuyTransaction(transaction) || isSellTransaction(transaction);

export function buildMonthlyFlow(transactions: Transaction[]): MonthlyFlow[] {
  const buckets = new Map<string, MonthlyFlow & { sortKey: string }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = monthFormatter.format(date);
    const current = buckets.get(sortKey) || {
      month: label,
      buy: 0,
      sell: 0,
      net: 0,
      trades: 0,
      sortKey,
    };

    const amount = getTransactionAmount(transaction);

    if (isBuyTransaction(transaction) || transaction.type === 'investment') {
      current.buy += amount;
      current.net -= amount;
    } else if (isSellTransaction(transaction) || transaction.type === 'income') {
      current.sell += amount;
      current.net += amount;
    } else if (transaction.type === 'expense' || transaction.type === 'savings') {
      current.buy += amount;
      current.net -= amount;
    }

    current.trades += 1;
    buckets.set(sortKey, current);
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...item }) => item);
}
