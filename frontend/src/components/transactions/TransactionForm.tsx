import { FormEvent, useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import type { PaymentMethod, TransactionInput, TransactionType } from '../../types/domain';
import Button from '../ui/Button';

type TransactionFormProps = {
  onSubmit: (input: TransactionInput) => Promise<void>;
};

const financeTypes: Array<{ value: TransactionType; label: string }> = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'investment', label: 'Investment' },
  { value: 'savings', label: 'Savings' },
];

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank', label: 'Bank' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'net_banking', label: 'Net banking' },
  { value: 'other', label: 'Other' },
];

export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Food');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categorySuggestions = useMemo(() => {
    if (type === 'income') return ['Salary', 'Freelance', 'Dividends', 'Bonus'];
    if (type === 'investment') return ['Mutual Fund', 'Equity', 'Gold', 'Fixed Deposit'];
    if (type === 'savings') return ['Emergency Fund', 'Goal Saving', 'Recurring Deposit'];
    return ['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Healthcare'];
  }, [type]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        category,
        title,
        amount: Number(amount),
        paymentMethod,
        transactionDate,
        notes,
      });
      setTitle('');
      setAmount('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-white/64">
          Type
          <select
            value={type}
            onChange={(event) => {
              const nextType = event.target.value as TransactionType;
              setType(nextType);
              setCategory(nextType === 'income' ? 'Salary' : nextType === 'investment' ? 'Mutual Fund' : nextType === 'savings' ? 'Emergency Fund' : 'Food');
            }}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none"
          >
            {financeTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-white/64">
          Category
          <input
            list="transaction-categories"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
            required
          />
          <datalist id="transaction-categories">
            {categorySuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
      </div>

      <label className="block text-sm text-white/64">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
          placeholder="Monthly rent, salary credit, SIP transfer"
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-white/64">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
            required
          />
        </label>
        <label className="block text-sm text-white/64">
          Payment method
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none"
          >
            {paymentMethods.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm text-white/64">
        Date
        <input
          value={transactionDate}
          onChange={(event) => setTransactionDate(event.target.value)}
          type="date"
          className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
          required
        />
      </label>

      <label className="block text-sm text-white/64">
        Notes
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="mt-2 w-full resize-none rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-emerald-300"
          placeholder="Optional context"
        />
      </label>

      <Button type="submit" loading={submitting} className="w-full">
        <PlusCircle size={17} />
        Add transaction
      </Button>
    </form>
  );
}
