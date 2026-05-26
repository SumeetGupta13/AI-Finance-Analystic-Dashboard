import { AlertTriangle, BrainCircuit, Lightbulb, ShieldCheck } from 'lucide-react';
import type { AITransactionInsightPayload } from '../../types/domain';
import ScoreMeter from '../analytics/ScoreMeter';
import Badge from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

type AITransactionInsightsProps = {
  insights: AITransactionInsightPayload;
};

export default function AITransactionInsights({ insights }: AITransactionInsightsProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>AI money analysis</CardTitle>
        <Badge tone={insights.moneyHealthScore >= 70 ? 'success' : insights.moneyHealthScore >= 45 ? 'warning' : 'danger'}>
          {insights.moneyHealthScore}/100
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <ScoreMeter value={insights.moneyHealthScore} label="Money health score" tone={insights.moneyHealthScore >= 60 ? 'success' : 'danger'} />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-emerald-300">
              <BrainCircuit size={17} />
              <p className="text-sm font-semibold">Pattern</p>
            </div>
            <p className="mt-2 text-sm text-white/58">{insights.spendingPatternSummary}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle size={17} />
              <p className="text-sm font-semibold">Overspending</p>
            </div>
            <p className="mt-2 text-sm text-white/58">{insights.overspendingDetection}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-indigo-200">
              <Lightbulb size={17} />
              <p className="text-sm font-semibold">Suggestions</p>
            </div>
            <div className="mt-2 space-y-1 text-sm text-white/58">
              {[...insights.savingSuggestions, ...insights.investmentSuggestions].slice(0, 3).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-rose-200">
              <ShieldCheck size={17} />
              <p className="text-sm font-semibold">Risk</p>
            </div>
            <p className="mt-2 text-sm text-white/58">{insights.riskAlert}</p>
            <p className="mt-2 text-sm text-white/58">{insights.stockPortfolioInsight}</p>
          </div>
        </div>

        {insights.highlights.length > 0 ? (
          <div className="space-y-2">
            {insights.highlights.map((item) => (
              <div key={item} className="rounded-md border border-emerald-300/10 bg-emerald-300/[0.04] px-3 py-2 text-sm text-white/68">
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
