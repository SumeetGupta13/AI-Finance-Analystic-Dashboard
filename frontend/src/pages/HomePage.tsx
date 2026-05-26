import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Briefcase, Newspaper, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { marketService } from '../services/marketService';
import type { MarketAsset, MarketTrendOverview, NewsArticle } from '../types/domain';
import { formatCurrency, formatPercent } from '../utils/formatters';

const features = [
  {
    icon: BarChart3,
    title: 'Portfolio command center',
    copy: 'Track allocation, unrealized P&L, cash balance, and performance in a fast institutional workspace.',
  },
  {
    icon: TrendingUp,
    title: 'Market discovery',
    copy: 'Explore equities, crypto assets, mutual funds, gainers, losers, sentiment, and market news.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure SaaS foundation',
    copy: 'Protected routes, JWT sessions, typed service contracts, and market APIs shared by every screen.',
  },
];

const testimonials = [
  {
    quote: 'StockIQ puts portfolio context, news sentiment, and market traction in one workflow instead of scattering decisions across tabs.',
    name: 'Aarav Mehta',
    role: 'Active investor',
  },
  {
    quote: 'The dashboard feels closer to a trading terminal than a retail tracker, but the flows are still clean enough for daily use.',
    name: 'Nisha Rao',
    role: 'Fintech product lead',
  },
  {
    quote: 'AI Insights is useful because it shows the reason behind recommendations, not just a generic buy or sell label.',
    name: 'Kabir Sethi',
    role: 'Portfolio analyst',
  },
];

export default function HomePage() {
  const [trending, setTrending] = useState<MarketAsset[]>([]);
  const [trends, setTrends] = useState<MarketTrendOverview | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let active = true;

    async function loadLandingData() {
      const [trendingData, trendData, newsData] = await Promise.all([
        marketService.getTrending(),
        marketService.getMarketTrends(),
        marketService.getMarketNews(),
      ]);

      if (active) {
        setTrending(trendingData);
        setTrends(trendData);
        setNews(newsData);
      }
    }

    void loadLandingData();

    return () => {
      active = false;
    };
  }, []);

  const heroAsset = trending[0];
  const stats = useMemo(
    () => [
      { label: 'Assets tracked', value: String(trending.length || trends?.trendingStocks.length || 0) },
      { label: 'Market mood', value: trends?.marketMood.label || 'Loading' },
      { label: 'News signals', value: String(news.length) },
    ],
    [news.length, trending.length, trends?.marketMood.label, trends?.trendingStocks.length]
  );

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl content-center gap-8 overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:px-8">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-8 hidden border-y border-white/10 bg-white/[0.03] py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/34 lg:flex"
          animate={{ x: ['0%', '-18%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          {[...trending, ...trending].slice(0, 12).map((asset, index) => (
            <span key={`${asset.symbol}-${index}`} className="mx-6 whitespace-nowrap">
              {asset.symbol} {formatPercent(asset.changePercent)}
            </span>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Badge tone="success">Premium fintech SaaS</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">StockIQ</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            A dark investment platform for portfolio analytics, market traction, AI insights, watchlists, sentiment, and virtual trading workflows.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup">
              <Button className="w-full sm:w-auto">
                Create account <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="w-full sm:w-auto">
                Open terminal
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * index }}
                className="rounded-lg border border-white/10 bg-white/[0.05] p-4 backdrop-blur"
              >
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="mt-1 text-sm text-white/50">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="grid content-center gap-4"
        >
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/56">Leading traction signal</p>
                <p className="mt-1 text-2xl font-semibold sm:text-3xl">{heroAsset?.symbol || 'Loading'}</p>
              </div>
              {heroAsset ? <Badge tone={heroAsset.changePercent >= 0 ? 'success' : 'danger'}>{formatPercent(heroAsset.changePercent)}</Badge> : null}
            </div>
            <div className="mt-8 grid h-44 grid-cols-7 items-end gap-2">
              {heroAsset ? (
                heroAsset.sparkline.map((value, index, values) => {
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const height = max === min ? 50 : 24 + ((value - min) / (max - min)) * 70;

                  return (
                    <div
                      key={`${value}-${index}`}
                      className="rounded-t bg-gradient-to-t from-indigo-500 to-emerald-300"
                      style={{ height: `${height}%` }}
                    />
                  );
                })
              ) : (
                <div className="col-span-7 flex h-full items-center justify-center rounded-md border border-dashed border-white/10 text-sm text-white/42">
                  Loading market signal
                </div>
              )}
            </div>
            {heroAsset ? (
              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <span className="text-white/52">{heroAsset.name}</span>
                <span className="font-semibold">{formatCurrency(heroAsset.price, heroAsset.currency)}</span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trending.slice(0, 4).map((asset) => (
              <Link key={asset.symbol} to="/login" className="rounded-lg border border-white/10 bg-[#111111] p-4 transition hover:border-emerald-300/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="truncate text-sm text-white/50">{asset.name}</p>
                  </div>
                  <span className={asset.changePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{formatPercent(asset.changePercent)}</span>
                </div>
                <p className="mt-4 text-xl font-semibold">{formatCurrency(asset.price, asset.currency)}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-white/10 bg-[#111111]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 sm:py-14 md:grid-cols-3 lg:px-8">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <feature.icon className="text-emerald-300" size={22} />
              <h2 className="mt-5 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/56">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Badge tone="indigo">Market pulse</Badge>
          <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{trends?.marketMood.summary || 'Market pulse loads from the StockIQ market-trends endpoint.'}</h2>
          <p className="mt-4 text-white/58">
            The first screen reflects the same assets, trend scores, and news categories used across the authenticated dashboard.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: WalletCards, label: 'Momentum score', value: trends?.marketMood.score ? `${trends.marketMood.score}/100` : '-' },
            { icon: Briefcase, label: 'Bullish assets', value: String(trends?.bullishAssets.length || 0) },
            { icon: Newspaper, label: 'Headlines', value: String(news.length) },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
              <item.icon className="text-emerald-300" size={22} />
              <p className="mt-5 text-2xl font-semibold">{item.value}</p>
              <p className="mt-1 text-sm text-white/52">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:px-8">
        {news.slice(0, 2).map((article) => (
          <article key={article.id} className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">{article.category}</Badge>
              <Badge tone={article.sentiment === 'positive' ? 'success' : article.sentiment === 'negative' ? 'danger' : 'neutral'}>
                {article.sentiment}
              </Badge>
            </div>
            <h2 className="mt-4 text-xl font-semibold leading-7">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/56">{article.summary}</p>
            <p className="mt-5 text-xs text-white/42">{article.source}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Badge tone="success">Testimonials</Badge>
          <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">Built for investors who need speed and context.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="rounded-lg border border-white/10 bg-[#111111]/80 p-6 shadow-2xl shadow-black/20 backdrop-blur">
              <blockquote className="text-sm leading-7 text-white/72">"{item.quote}"</blockquote>
              <figcaption className="mt-5">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-white/44">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.08] p-5 text-center sm:p-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">Build conviction from connected market signals.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/60">
            Sign in to combine portfolio data, watchlists, trading history, sentiment, and AI insights in one workspace.
          </p>
          <Link to="/signup" className="mt-6 inline-flex">
            <Button>
              Create account <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
