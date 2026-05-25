import { Line, LineChart, ResponsiveContainer } from 'recharts';

type SparklineProps = {
  data: number[];
  positive?: boolean;
};

export default function Sparkline({ data, positive = true }: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={positive ? '#34D399' : '#FDA4AF'}
            strokeWidth={2}
            dot={false}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
