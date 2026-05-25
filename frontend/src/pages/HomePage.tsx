import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Briefcase, ShieldCheck, Sparkles, TrendingUp, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const stats = [
  { label: 'Virtual capital', value: 'INR 1,00,000' },
  { label: 'Asset coverage', value: 'Stocks, Crypto, Funds' },
  { label: 'Market mode', value: 'Mock now, live-ready' },
];

const features = [
  {
    icon: BarChart3,
    title: 'Portfolio command center',
    copy: 'Track allocation, unrealized P&L, cash balance, and performance in a fast institutional workspace.',
  },
  {
    icon: TrendingUp,
    title: 'Market discovery',
    copy: 'Explore Indian equities, US megacaps, crypto assets, mutual funds, gainers, losers, and news.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure SaaS foundation',
    copy: 'JWT sessions, protected APIs, rate limiting, security headers, and MongoDB Atlas readiness.',
  },
];

const marketPreview = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$136.42', change: '+2.73%' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 'INR 1,748', change: '+1.68%' },
  { symbol: 'BTC', name: 'Bitcoin', price: '$109,450', change: '+1.46%' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 'INR 3,913', change: '-0.81%' },
];

const testimonials = [
  {
    quote: 'FINORA feels closer to an institutional terminal than a retail dashboard.',
    name: 'Aarav Mehta',
    role: 'Active equity investor',
  },
  {
    quote: 'The mock-first architecture makes product demos credible while keeping the live API path clean.',
    name: 'Nisha Rao',
    role: 'Fintech product lead',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Badge tone="success">Premium fintech SaaS</Badge>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
            FINORA
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">
            A dark, addictive investment platform for virtual trading, portfolio analytics, watchlists, market research, and future live market integrations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button className="w-full sm:w-auto">
                Start investing <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="w-full sm:w-auto">
                Open terminal
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="mt-1 text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="grid content-center gap-4"
        >
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/56">Portfolio value</p>
                <p className="mt-1 text-3xl font-semibold">INR 1,26,842</p>
              </div>
              <Badge tone="success">+5.08%</Badge>
            </div>
            <div className="mt-8 grid h-44 grid-cols-12 items-end gap-2">
              {[32, 44, 39, 52, 61, 58, 74, 69, 82, 78, 88, 94].map((height, index) => (
                <div
                  key={index}
                  className="rounded-t bg-gradient-to-t from-indigo-500 to-emerald-300"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {marketPreview.map((asset) => (
              <div key={asset.symbol} className="rounded-lg border border-white/10 bg-[#111111] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="truncate text-sm text-white/50">{asset.name}</p>
                  </div>
                  <span className={asset.change.startsWith('+') ? 'text-emerald-300' : 'text-rose-300'}>{asset.change}</span>
                </div>
                <p className="mt-4 text-xl font-semibold">{asset.price}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-white/10 bg-[#111111]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
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
          <Badge tone="indigo">Built for scale</Badge>
          <h2 className="mt-4 text-3xl font-semibold">Enterprise architecture without losing speed.</h2>
          <p className="mt-4 text-white/58">
            FINORA separates UI, service contracts, controllers, data providers, and persistence so mock data can become live market data without rewriting the frontend.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: WalletCards, label: 'Virtual wallet', value: 'INR 1L' },
            { icon: Briefcase, label: 'Portfolio APIs', value: 'Protected' },
            { icon: Sparkles, label: 'Provider mode', value: 'Ready' },
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
        {testimonials.map((item) => (
          <figure key={item.name} className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
            <blockquote className="text-lg leading-8 text-white/82">"{item.quote}"</blockquote>
            <figcaption className="mt-5">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-white/48">{item.role}</p>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.08] p-8 text-center">
          <h2 className="text-3xl font-semibold">Build conviction before risking capital.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/60">
            Start with realistic market simulations, then switch to live providers when API keys are ready.
          </p>
          <Link to="/register" className="mt-6 inline-flex">
            <Button>
              Create account <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
