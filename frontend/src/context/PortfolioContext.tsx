import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { portfolioService } from '../services/portfolioService';
import type { PortfolioAnalytics, PortfolioPayload } from '../types/domain';

type PortfolioContextValue = {
  portfolio: PortfolioPayload | null;
  analytics: PortfolioAnalytics | null;
  loading: boolean;
  loadPortfolio: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
};

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      setPortfolio(await portfolioService.getPortfolio());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      setAnalytics(await portfolioService.getAnalytics());
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ portfolio, analytics, loading, loadPortfolio, loadAnalytics }),
    [portfolio, analytics, loading, loadPortfolio, loadAnalytics]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const value = useContext(PortfolioContext);

  if (!value) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }

  return value;
}
