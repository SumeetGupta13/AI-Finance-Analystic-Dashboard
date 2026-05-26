import { Flame, Gauge, RadioTower, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import type { MarketAsset, MarketTrendOverview } from '../../types/domain';
import { formatNumber, formatPercent } from '../../utils/formatters';
import AssetSignalList from './AssetSignalList';
import ScoreMeter from './ScoreMeter';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

type TractionAnalyticsProps = {
  trends: MarketTrendOverview | null;
  gainers: MarketAsset[];
  losers: MarketAsset[];
};

export default function TractionAnalytics({ trends, gainers, losers }: TractionAnalyticsProps) {
  const score = trends?.marketMomentum?.score ?? trends?.marketMood?.score ?? 0;
  const hotStocks = trends?.hotStocks || [];
  const sectors = trends?.sectorPerformance || [];
  const topTrending = trends?.trendingStocks || [];
  const buySignals = (trends?.recommendations.strongBuy.length || 0) + (trends?.recommendations.buy.length || 0);
  const sellSignals = (trends?.recommendations.sell.length || 0) + (trends?.recommendations.strongSell.length || 0);
  const signalTotal = Math.max((trends?.bullishAssets.length || 0) + (trends?.bearishAssets.length || 0), 1);
  const bullishStrength = ((trends?.bullishAssets.length || 0) / signalTotal) * 100;
  const bearishStrength = ((trends?.bearishAssets.length || 0) / signalTotal) * 100;
  const totalVolume = topTrending.reduce((sum, asset) => sum + (asset.volume || 0), 0);
  const strongestSignal = topTrending[0];
  const componentRows = strongestSignal?.trendComponents
    ? [
        ['Price Momentum', strongestSignal.trendComponents.priceMomentum],
        ['Trading Volume', strongestSignal.trendComponents.volumeChange],
        ['News Impact', strongestSignal.trendComponents.newsImpact],
        ['Watchlist Growth', strongestSignal.trendComponents.watchlistGrowth],
        ['Social Buzz', strongestSignal.trendComponents.socialBuzz],
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/52">Trending score</p>
                <p className="mt-2 text-3xl font-semibold">{score.toFixed(0)}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-300">
                <Zap size={20} />
              </div>
            </div>
            <ScoreMeter value={score} className="mt-5" />
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-emerald-300/[0.08] p-2 text-emerald-300">{buySignals} buy signals</div>
              <div className="rounded-md bg-rose-300/[0.08] p-2 text-rose-300">{sellSignals} sell signals</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/52">Momentum meter</p>
                <p className="mt-2 text-xl font-semibold">{trends?.marketMomentum?.label || trends?.marketMood?.label || 'Loading'}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-indigo-400/10 text-indigo-200">
                <Gauge size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/56">{trends?.marketMomentum?.summary || trends?.marketMood?.summary || 'Market momentum is loading.'}</p>
            <div className="mt-4 space-y-3">
              <ScoreMeter value={bullishStrength} label="Bullish strength" />
              <ScoreMeter value={bearishStrength} label="Bearish strength" tone="danger" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/52">Bullish assets</p>
                <p className="mt-2 text-3xl font-semibold">{trends?.marketMomentum?.bullishCount ?? trends?.bullishAssets?.length ?? 0}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-300">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-white/52">Assets with traction scores above the bullish threshold.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/52">Bearish assets</p>
                <p className="mt-2 text-3xl font-semibold">{trends?.marketMomentum?.bearishCount ?? trends?.bearishAssets?.length ?? 0}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-md bg-rose-300/10 text-rose-300">
                <TrendingDown size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-white/52">Assets where price, news, or watchlist signals need caution.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetSignalList assets={gainers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top losers</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetSignalList assets={losers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Hot stocks</CardTitle>
            <Flame size={18} className="text-emerald-300" />
          </CardHeader>
          <CardContent>
            <AssetSignalList assets={hotStocks.length > 0 ? hotStocks : topTrending} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Market volume indicator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{formatNumber(totalVolume)}</p>
            <p className="mt-3 text-sm leading-6 text-white/56">Combined reported volume across the current trending asset basket.</p>
            <div className="mt-5 grid gap-2">
              {topTrending.slice(0, 4).map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm">
                  <span className="font-semibold">{asset.symbol}</span>
                  <span className="text-white/52">{asset.volume ? formatNumber(asset.volume) : 'No volume'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend score formula</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/52">
              Price momentum, trading volume, news impact, watchlist growth, and social buzz are scored from the market-trends endpoint.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {componentRows.map(([label, value]) => (
                <ScoreMeter key={label} label={String(label)} value={Number(value) * 5} tone={Number(value) >= 10 ? 'success' : 'danger'} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Sector strength</CardTitle>
          <RadioTower size={18} className="text-indigo-200" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sectors.map((sector) => {
              const positive = sector.changePercent >= 0;
              const width = Math.min(Math.abs(sector.changePercent) * 45, 100);

              return (
                <div key={sector.sector} className="rounded-md border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{sector.sector}</p>
                    <span className={positive ? 'text-emerald-300' : 'text-rose-300'}>{formatPercent(sector.changePercent)}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={positive ? 'h-full rounded-full bg-emerald-300' : 'h-full rounded-full bg-rose-300'}
                      style={{ width: `${Math.max(width, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trending sectors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...sectors]
              .sort((a, b) => b.changePercent - a.changePercent)
              .slice(0, 6)
              .map((sector, index) => (
                <div key={sector.sector} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{index + 1}. {sector.sector}</p>
                    <span className={sector.changePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{formatPercent(sector.changePercent)}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
