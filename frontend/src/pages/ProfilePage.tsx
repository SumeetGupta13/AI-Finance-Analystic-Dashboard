import { CalendarClock, Mail, ShieldCheck, Star, User, WalletCards } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { portfolioService } from '../services/portfolioService';
import { transactionService } from '../services/transactionService';
import { watchlistService } from '../services/watchlistService';
import { getTransactionAmount, getTransactionId, getTransactionSymbol } from '../utils/analytics';
import { formatCurrency, formatPercent, getAssetCurrency } from '../utils/formatters';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data, loading } = useAsyncData(
    async () => {
      const [portfolio, transactions, watchlists] = await Promise.all([
        portfolioService.getAnalytics(),
        transactionService.list(),
        watchlistService.list(),
      ]);

      return { portfolio, transactions, watchlists };
    },
    []
  );

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const latestTransactions = data.transactions.slice(0, 5);
  const trackedAssets = data.watchlists.reduce((sum, watchlist) => sum + watchlist.items.length, 0);
  const pnlTone = data.portfolio.summary.totalPnL >= 0 ? 'success' : 'danger';

  return (
    <section className="space-y-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-300">
              <User size={30} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Profile</p>
              <h1 className="mt-2 text-4xl font-semibold">{user?.name || 'Investor'}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/52">
                <span className="inline-flex items-center gap-2"><Mail size={15} /> {user?.email}</span>
                <span className="inline-flex items-center gap-2"><CalendarClock size={15} /> Joined {user ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
          <Badge tone="indigo">{user?.preferences.riskProfile || 'balanced'} risk profile</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <WalletCards className="text-emerald-300" size={22} />
            <p className="mt-4 text-sm text-white/52">Portfolio value</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(data.portfolio.summary.portfolioValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ShieldCheck className="text-indigo-200" size={22} />
            <p className="mt-4 text-sm text-white/52">Profit/Loss</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(data.portfolio.summary.totalPnL)}</p>
            <Badge tone={pnlTone} className="mt-3">{formatPercent(data.portfolio.summary.totalPnLPercent)}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Star className="text-emerald-300" size={22} />
            <p className="mt-4 text-sm text-white/52">Tracked assets</p>
            <p className="mt-2 text-2xl font-semibold">{trackedAssets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <User className="text-indigo-200" size={22} />
            <p className="mt-4 text-sm text-white/52">Workspace</p>
            <p className="mt-2 text-2xl font-semibold">{user?.preferences.currency || 'INR'}</p>
            <p className="mt-2 text-sm text-white/48">{user?.preferences.defaultMarket || 'IN'} default market</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferences and theme settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['Theme', user?.preferences.theme || 'dark'],
              ['Currency', user?.preferences.currency || '-'],
              ['Default market', user?.preferences.defaultMarket || '-'],
              ['Risk posture', user?.preferences.riskProfile || '-'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/48">{label}</p>
                <p className="mt-2 text-lg font-semibold capitalize">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Name', user?.name || '-'],
              ['Email', user?.email || '-'],
              ['Role', user?.role || '-'],
              ['Currency', user?.preferences.currency || '-'],
              ['Default market', user?.preferences.defaultMarket || '-'],
              ['Risk profile', user?.preferences.riskProfile || '-'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/20 p-3 text-sm">
                <span className="text-white/48">{label}</span>
                <span className="font-semibold capitalize">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent trading activity</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-white/42">
                <tr>
                  <th className="py-3">Date</th>
                  <th className="py-3">Side</th>
                  <th className="py-3">Asset</th>
                  <th className="py-3">Quantity</th>
                  <th className="py-3">Net</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {latestTransactions.map((transaction) => (
                  <tr key={getTransactionId(transaction)}>
                    <td className="py-3">{new Date(transaction.transactionDate || transaction.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 capitalize">{transaction.type.replace('_', ' ')}</td>
                    <td className="py-3 font-semibold">{getTransactionSymbol(transaction)}</td>
                    <td className="py-3">{transaction.quantity}</td>
                    <td className="py-3">{formatCurrency(getTransactionAmount(transaction), getAssetCurrency(transaction.assetType))}</td>
                    <td className="py-3">
                      <Badge tone={transaction.status === 'completed' ? 'success' : 'danger'}>{transaction.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Watchlist footprint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.watchlists.map((watchlist) => (
              <div key={watchlist._id} className="rounded-md border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{watchlist.name}</p>
                  <Badge tone="indigo">{watchlist.items.length} assets</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {watchlist.items.map((item) => (
                    <Badge key={`${watchlist._id}-${item.symbol}`} tone={item.assetType === 'crypto' ? 'success' : 'neutral'}>
                      {item.symbol}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
