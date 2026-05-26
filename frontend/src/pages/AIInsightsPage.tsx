import { BrainCircuit, Gem, HeartPulse, LineChart, ShieldAlert, Sparkles } from 'lucide-react';
import AssetSignalList from '../components/analytics/AssetSignalList';
import ScoreMeter from '../components/analytics/ScoreMeter';
import InsightCard from '../components/ai/InsightCard';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { useAsyncData } from '../hooks/useAsyncData';
import { aiService } from '../services/aiService';
import { portfolioService } from '../services/portfolioService';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function AIInsightsPage() {
  const { data, loading } = useAsyncData(
    async () => {
      const [summary, portfolio] = await Promise.all([aiService.getSummary(), portfolioService.getAnalytics()]);

      return { insights: summary.insights, trends: summary.marketTrends, portfolio, isFallback: summary.isFallback };
    },
    []
  );

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  const { insights, trends, portfolio, isFallback } = data;
  const safeTrends = trends || {
    indices: [],
    bullishAssets: [],
    bearishAssets: [],
    marketMood: { score: 0, label: 'Unavailable', summary: 'Live data temporarily unavailable.' },
  };
  const portfolioTone = portfolio.summary.totalPnL >= 0 ? 'success' : 'danger';
  const diversificationScore = Math.min((portfolio.allocation.length || 0) * 25, 100);
  const investmentScore = Math.min(Math.max(50 + portfolio.summary.totalPnLPercent * 4 + (100 - portfolio.summary.riskScore) * 0.25, 0), 100);
  const portfolioHealthScore = Math.round((diversificationScore + investmentScore + (100 - portfolio.summary.riskScore)) / 3);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">AI insights</p>
          <h1 className="mt-3 text-4xl font-semibold">Decision intelligence</h1>
          <p className="mt-2 max-w-3xl text-white/56">
            AI summaries, risk alerts, recommendations, opportunities, and portfolio health signals from the StockIQ insight endpoint.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/58">
          Generated {new Date(insights.dailyMarketOverview.generatedAt).toLocaleString()}
        </div>
      </div>
      {isFallback ? (
        <div className="inline-flex rounded-md border border-amber-300/25 bg-amber-300/[0.08] px-3 py-2 text-sm font-semibold text-amber-200">
          Live data temporarily unavailable
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightCard title="AI Summary Card" icon={BrainCircuit} accent="indigo">
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">{insights.dailyMarketOverview.marketMood}</Badge>
            <Badge tone="indigo">Risk: {insights.dailyMarketOverview.riskScore}</Badge>
          </div>
          <h2 className="mt-5 text-2xl font-semibold">{insights.dailyMarketOverview.title}</h2>
          <p className="mt-3 leading-7 text-white/62">{insights.dailyMarketOverview.summary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {insights.marketSummaries.map((summary) => (
              <div key={summary.id} className="rounded-md border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{summary.title}</p>
                  <Badge tone={summary.recommendation.includes('Buy') ? 'success' : 'neutral'}>{summary.recommendation}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/56">{summary.summary}</p>
                <p className="mt-3 text-xs text-white/42">{Math.round(summary.confidence * 100)}% confidence</p>
              </div>
            ))}
          </div>
        </InsightCard>

        <InsightCard title="Market Trend Card" icon={LineChart}>
          <ScoreMeter value={insights.marketMomentum.score} label={insights.marketMomentum.label} />
          <p className="mt-4 text-sm leading-6 text-white/56">{insights.marketMomentum.summary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-emerald-300/20 bg-emerald-300/[0.07] p-4">
              <p className="text-sm text-white/52">Bullish trend</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{safeTrends.bullishAssets.length}</p>
              <p className="mt-1 text-xs text-white/42">Momentum {insights.marketMomentum.score}%</p>
            </div>
            <div className="rounded-md border border-rose-300/20 bg-rose-300/[0.07] p-4">
              <p className="text-sm text-white/52">Bearish trend</p>
              <p className="mt-2 text-2xl font-semibold text-rose-300">{safeTrends.bearishAssets.length}</p>
              <p className="mt-1 text-xs text-white/42">Trend strength {safeTrends.marketMood.score}%</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {safeTrends.indices.slice(0, 4).map((index) => (
              <div key={index.symbol} className="rounded-md border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{index.symbol}</p>
                    <p className="text-sm text-white/48">{index.name}</p>
                  </div>
                  <span className={index.changePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    {formatPercent(index.changePercent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </InsightCard>

        <InsightCard title="Risk Alert Card" icon={ShieldAlert} accent="rose">
          <div className="space-y-3">
            {safeTrends.bearishAssets.slice(0, 3).map((asset) => (
              <div key={asset.symbol} className="rounded-md border border-rose-300/20 bg-rose-300/[0.07] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{asset.symbol} high-risk asset</p>
                  <Badge tone="danger">{asset.trendScore?.toFixed(0) || 0} score</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">{asset.sentiment?.reason || 'Bearish market traction requires smaller position sizing.'}</p>
              </div>
            ))}
            {insights.riskAlerts.map((alert) => (
              <div key={alert.id} className="rounded-md border border-rose-300/20 bg-rose-300/[0.07] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{alert.message}</p>
                  <Badge tone={alert.severity === 'high' ? 'danger' : 'neutral'}>{alert.severity}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">{alert.reason}</p>
              </div>
            ))}
          </div>
        </InsightCard>

        <InsightCard title="Smart Recommendations Card" icon={Sparkles}>
          <div className="divide-y divide-white/10">
            {insights.recommendations.map((item) => (
              <div key={item.symbol} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.symbol}</p>
                    <p className="mt-1 text-sm leading-6 text-white/56">{item.reason}</p>
                  </div>
                  <Badge tone={item.rating.includes('Buy') ? 'success' : item.rating.includes('Sell') ? 'danger' : 'neutral'}>
                    {item.rating}
                  </Badge>
                </div>
                <ScoreMeter value={item.confidence * 100} label="Confidence" className="mt-3" />
              </div>
            ))}
          </div>
        </InsightCard>

        <InsightCard title="Investment Opportunity Card" icon={Gem} accent="indigo">
          <div className="space-y-4">
            <AssetSignalList assets={safeTrends.bullishAssets} limit={3} />
            <div className="grid gap-3">
              {insights.marketOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="rounded-md border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {opportunity.symbols.map((symbol) => (
                      <Badge key={symbol} tone="indigo">{symbol}</Badge>
                    ))}
                    <Badge tone={opportunity.rating.includes('Buy') ? 'success' : 'neutral'}>{opportunity.rating}</Badge>
                  </div>
                  <p className="mt-3 font-semibold">{opportunity.message}</p>
                  <p className="mt-2 text-sm leading-6 text-white/56">{opportunity.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </InsightCard>

        <InsightCard title="Portfolio Health Card" icon={HeartPulse}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/48">Current balance</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(portfolio.summary.portfolioValue)}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/48">Profit/Loss</p>
              <p className={portfolio.summary.totalPnL >= 0 ? 'mt-2 text-2xl font-semibold text-emerald-300' : 'mt-2 text-2xl font-semibold text-rose-300'}>
                {formatCurrency(portfolio.summary.totalPnL)}
              </p>
              <Badge tone={portfolioTone} className="mt-3">{formatPercent(portfolio.summary.totalPnLPercent)}</Badge>
            </div>
          </div>
          <ScoreMeter value={portfolio.summary.riskScore} label="Risk score" tone="indigo" className="mt-5" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ScoreMeter value={portfolioHealthScore} label="Health score" />
            <ScoreMeter value={diversificationScore} label="Diversification" tone="indigo" />
            <ScoreMeter value={investmentScore} label="Investment score" />
          </div>
          <div className="mt-5 space-y-3">
            {insights.portfolioSuggestions.map((suggestion) => (
              <div key={suggestion.message} className="rounded-md border border-white/10 bg-black/20 p-4">
                <p className="font-semibold">{suggestion.message}</p>
                <p className="mt-2 text-sm leading-6 text-white/56">{suggestion.action}</p>
              </div>
            ))}
          </div>
        </InsightCard>
      </div>
    </section>
  );
}
