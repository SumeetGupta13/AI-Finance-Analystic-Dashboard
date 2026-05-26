import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type MonthlyFlowPoint = {
  month: string;
  buy: number;
  sell: number;
  net: number;
};

type MonthlyFlowChartProps = {
  data: MonthlyFlowPoint[];
};

export default function MonthlyFlowChart({ data }: MonthlyFlowChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Bar dataKey="buy" stackId="flow" fill="#34D399" radius={[6, 6, 0, 0]} />
          <Bar dataKey="sell" stackId="flow" fill="#FCA5A5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
