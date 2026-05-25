import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Skeleton from '../components/ui/Skeleton';
import ProtectedRoute from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AssetDetailPage = lazy(() => import('../pages/AssetDetailPage'));
const MarketsPage = lazy(() => import('../pages/MarketsPage'));
const NewsPage = lazy(() => import('../pages/NewsPage'));
const PortfolioPage = lazy(() => import('../pages/PortfolioPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const WatchlistPage = lazy(() => import('../pages/WatchlistPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-6 h-96" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/markets/:symbol" element={<AssetDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
