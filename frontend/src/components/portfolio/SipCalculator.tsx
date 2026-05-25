import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export default function SipCalculator() {
  const [monthlySip, setMonthlySip] = useState(10000);
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(13);

  const result = useMemo(() => {
    const months = years * 12;
    const monthlyRate = returnRate / 12 / 100;
    const futureValue = monthlySip * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const invested = monthlySip * months;
    const gains = futureValue - invested;
    const points = Array.from({ length: years }, (_, index) => {
      const periodMonths = (index + 1) * 12;
      const value = monthlySip * (((Math.pow(1 + monthlyRate, periodMonths) - 1) / monthlyRate) * (1 + monthlyRate));
      return { year: `Y${index + 1}`, value: Number(value.toFixed(0)) };
    });

    return {
      futureValue,
      invested,
      gains,
      points,
    };
  }, [monthlySip, years, returnRate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIP calculator</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          {[
            { label: 'Monthly SIP', value: monthlySip, setter: setMonthlySip, min: 500, max: 200000, step: 500 },
            { label: 'Years', value: years, setter: setYears, min: 1, max: 30, step: 1 },
            { label: 'Expected return', value: returnRate, setter: setReturnRate, min: 1, max: 24, step: 0.5 },
          ].map((item) => (
            <label key={item.label} className="block text-sm text-white/64">
              <div className="flex justify-between">
                <span>{item.label}</span>
                <span className="font-semibold text-white">{item.value}{item.label === 'Expected return' ? '%' : ''}</span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={item.value}
                onChange={(event) => item.setter(Number(event.target.value))}
                className="mt-3 w-full accent-emerald-300"
              />
            </label>
          ))}
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Invested', result.invested],
              ['Gains', result.gains],
              ['Value', result.futureValue],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-white/[0.05] p-3">
                <p className="text-xs text-white/42">{label}</p>
                <p className="mt-1 text-sm font-semibold">{formatCurrency(Number(value))}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.points}>
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
