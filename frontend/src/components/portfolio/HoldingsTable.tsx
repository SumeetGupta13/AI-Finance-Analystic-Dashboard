import type { Holding } from '../../types/domain';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

type HoldingsTableProps = {
  holdings: Holding[];
};

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.05] text-white/48">
          <tr>
            <th className="px-4 py-3 font-medium">Asset</th>
            <th className="px-4 py-3 font-medium">Qty</th>
            <th className="px-4 py-3 font-medium">Avg</th>
            <th className="px-4 py-3 font-medium">LTP</th>
            <th className="px-4 py-3 font-medium">P&L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {holdings.map((holding) => (
            <tr key={holding._id} className="text-white">
              <td className="px-4 py-3">
                <p className="font-semibold">{holding.symbol}</p>
                <p className="text-xs text-white/48">{holding.name}</p>
              </td>
              <td className="px-4 py-3">{formatNumber(holding.quantity)}</td>
              <td className="px-4 py-3">{formatCurrency(holding.averagePrice)}</td>
              <td className="px-4 py-3">{formatCurrency(holding.lastPriceSnapshot)}</td>
              <td className={holding.metrics && holding.metrics.pnl >= 0 ? 'px-4 py-3 text-emerald-300' : 'px-4 py-3 text-rose-300'}>
                {holding.metrics ? `${formatCurrency(holding.metrics.pnl)} (${formatPercent(holding.metrics.pnlPercent)})` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
