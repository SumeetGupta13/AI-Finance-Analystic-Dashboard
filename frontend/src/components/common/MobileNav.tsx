import { BarChart3, Briefcase, Star, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: BarChart3 },
  { label: 'Markets', href: '/markets', icon: TrendingUp },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'Watchlist', href: '/watchlist', icon: Star },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-[#0A0A0A]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold transition',
              isActive ? 'bg-white/[0.08] text-emerald-300' : 'text-white/52'
            )
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
