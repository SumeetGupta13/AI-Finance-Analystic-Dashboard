import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type IncomeExpenseChartProps = {
  data: Array<{
    month: string;
    income: number;
    expense: number;
    investment: number;
    savings: number;
  }>;
};

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Bar dataKey="income" fill="#34D399" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#F87171" radius={[6, 6, 0, 0]} />
          <Bar dataKey="investment" fill="#818CF8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="savings" fill="#FBBF24" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
