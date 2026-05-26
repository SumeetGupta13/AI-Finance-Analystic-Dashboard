import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Markets', href: '/markets' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Watchlist', href: '/watchlist' },
  { label: 'News', href: '/news' },
  { label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 bg-gradient-to-b from-[#0A0A0A] to-[#111111] glass-card h-full">
      <div className="text-xl font-semibold">StockIQ</div>
      <nav className="mt-6 flex flex-col gap-3">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href} className="text-slate-300 hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
