import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Skeleton from '../components/ui/Skeleton';
import ProtectedRoute from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AssetDetailPage = lazy(() => import('../pages/AssetDetailPage'));
const MarketsPage = lazy(() => import('../pages/MarketsPage'));
const CryptoPage = lazy(() => import('../pages/CryptoPage'));
const NewsPage = lazy(() => import('../pages/NewsPage'));
const AIInsightsPage = lazy(() => import('../pages/AIInsightsPage'));
const PortfolioPage = lazy(() => import('../pages/PortfolioPage'));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
const MonthlyAnalyticsPage = lazy(() => import('../pages/MonthlyAnalyticsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/markets/:symbol" element={<AssetDetailPage />} />
            <Route path="/crypto" element={<CryptoPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/monthly-analytics" element={<MonthlyAnalyticsPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
