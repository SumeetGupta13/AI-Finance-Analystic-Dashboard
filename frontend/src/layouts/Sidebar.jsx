import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Receipt, PieChart, BrainCircuit,
  Newspaper, ShieldAlert, TrendingUp, Settings, X,
  LogOut, User as UserIcon, Zap,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard',       path: '/',                icon: LayoutDashboard },
  { name: 'Transactions',    path: '/transactions',    icon: Receipt },
  { name: 'Portfolio',       path: '/budgets',         icon: PieChart },
  { name: 'AI Insights',     path: '/ai-analysis',     icon: BrainCircuit },
  { name: 'News Sentiment',  path: '/news-sentiment',  icon: Newspaper },
  { name: 'AI Forecast',     path: '/ai-forecast',     icon: TrendingUp },
  { name: 'Fraud Detection', path: '/fraud-detection', icon: ShieldAlert },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-foreground/30 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">FinSight <span className="text-gradient">AI</span></span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
          <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest px-3 mb-3">Navigation</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary/8 text-primary'
                  : 'text-muted hover:text-foreground hover:bg-background'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-primary/8"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <item.icon className={`w-4.5 h-4.5 shrink-0 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'}`} />
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest px-3 mb-3">Account</p>
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive ? 'bg-primary/8 text-primary' : 'text-muted hover:text-foreground hover:bg-background'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="nav-pill-settings" className="absolute inset-0 rounded-xl bg-primary/8" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                  )}
                  <Settings className={`w-4.5 h-4.5 shrink-0 relative z-10 ${isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'}`} />
                  <span className="relative z-10">Settings</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User Profile + Logout */}
        <div className="shrink-0 p-3 border-t border-border/60">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-background transition-colors group">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
