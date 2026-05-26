import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type CashFlowChartProps = {
  data: Array<{ month: string; netCashFlow: number }>;
};

export default function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cashFlowGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
          <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Area type="monotone" dataKey="netCashFlow" stroke="#34D399" strokeWidth={2} fill="url(#cashFlowGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
