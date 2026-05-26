import { Bell, LogOut, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0A0A0A]/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="hidden h-10 min-w-0 flex-1 max-w-xl items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 text-white/40 md:flex">
          <Search size={17} />
          <span className="text-sm">Search stocks, crypto, funds</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white">
            <Bell size={18} />
          </button>
          <Link to="/profile" className="hidden rounded-md px-2 py-1 text-right transition hover:bg-white/[0.05] sm:block">
            <p className="text-sm font-semibold text-white">{user?.name || 'Investor'}</p>
            <p className="text-xs text-white/48">{user?.preferences.currency || 'INR'} workspace</p>
          </Link>
          <Button variant="ghost" className="size-10 px-0" onClick={() => void logout()} aria-label="Sign out">
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
