import { Activity, BarChart3, Bitcoin, BrainCircuit, Briefcase, Newspaper, Settings, Star, TrendingUp, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Markets', href: '/markets', icon: TrendingUp },
  { label: 'Crypto', href: '/crypto', icon: Bitcoin },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Transactions', href: '/transactions', icon: Activity },
  { label: 'Monthly', href: '/monthly-analytics', icon: BarChart3 },
  { label: 'Watchlist', href: '/watchlist', icon: Star },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'AI Insights', href: '/ai-insights', icon: BrainCircuit },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#0A0A0A] p-4 lg:block">
      <NavLink to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-4">
        <div className="flex size-10 items-center justify-center rounded-md bg-emerald-300 text-black">
          <TrendingUp size={21} />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">StockIQ</p>
          <p className="text-xs uppercase tracking-[0.24em] text-white/42">Capital OS</p>
        </div>
      </NavLink>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition',
                isActive ? 'bg-white/[0.08] text-emerald-300' : 'text-white/58 hover:bg-white/[0.05] hover:text-white'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
