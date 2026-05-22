import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../layouts/Layout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Transactions from '../pages/Transactions';
import Portfolios from '../pages/Portfolios';
import AIInsights from '../pages/AIInsights';
import NewsSentiment from '../pages/NewsSentiment';
import AIForecast from '../pages/AIForecast';
import FraudDetection from '../pages/FraudDetection';
import Settings from '../pages/Settings';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Main Application Routes Wrapped in Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Portfolios />} />
        <Route path="ai-analysis" element={<AIInsights />} />
        <Route path="news-sentiment" element={<NewsSentiment />} />
        <Route path="ai-forecast" element={<AIForecast />} />
        <Route path="fraud-detection" element={<FraudDetection />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
