import React, { useContext, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown, LogOut, Settings, User as UserIcon, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const routeTitles = {
  '/':                'Dashboard',
  '/transactions':    'Transactions',
  '/budgets':         'Portfolio',
  '/ai-analysis':     'AI Insights',
  '/news-sentiment':  'News Sentiment',
  '/ai-forecast':     'AI Forecast',
  '/fraud-detection': 'Fraud Detection',
  '/settings':        'Settings',
};

const Header = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = routeTitles[location.pathname] || 'FinSight AI';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 glass border-b border-border/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-bold text-foreground leading-none">{title}</h1>
          <p className="text-xs text-muted mt-0.5 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* AI Status */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
          AI Active
        </div>

        {/* Market Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Zap className="w-3 h-3" />
          NSE Live
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-card" />
        </button>

        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-background transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-foreground leading-none">{user?.name?.split(' ')[0] || 'User'}</p>
              <p className="text-xs text-muted mt-0.5">Pro Plan</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 hidden md:block ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-card-hover py-1.5 z-50">
              <div className="px-4 py-3 border-b border-border/60">
                <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-background transition-colors"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
