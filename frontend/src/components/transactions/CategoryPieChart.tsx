import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import EmptyState from '../ui/EmptyState';
import { PieChart as PieChartIcon } from 'lucide-react';

type CategoryPieChartProps = {
  data: Array<{ category: string; amount: number }>;
};

const colors = ['#34D399', '#818CF8', '#FBBF24', '#F472B6', '#A78BFA', '#F87171', '#22D3EE'];

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return <EmptyState icon={PieChartIcon} title="No category spend" description="Expense categories appear after monthly transactions are added." />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="category" innerRadius={70} outerRadius={112} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
