import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type { AISummaryPayload } from './aiService';
import type { ApiResponse, MarketAsset, MarketIndex, MarketTrendOverview, NewsArticle, PortfolioAnalytics, Transaction, Watchlist } from '../types/domain';
import { withCachedFallback } from '../utils/serviceCache';

export type DashboardWarning = {
  section: string;
  message: string;
};

export type DashboardSummaryPayload = {
  portfolio: PortfolioAnalytics | null;
  marketIndices: MarketIndex[];
  marketTrends: MarketTrendOverview | null;
  trendingStocks: MarketAsset[];
  topGainers: MarketAsset[];
  topLosers: MarketAsset[];
  watchlist: Watchlist[];
  transactions: Transaction[];
  news: NewsArticle[];
  aiSummary: AISummaryPayload | null;
  crypto: MarketAsset[];
  marketUniverse: MarketAsset[];
  warnings: DashboardWarning[];
  isFallback: boolean;
};

const fallbackSummary: DashboardSummaryPayload = {
  portfolio: null,
  marketIndices: [],
  marketTrends: null,
  trendingStocks: [],
  topGainers: [],
  topLosers: [],
  watchlist: [],
  transactions: [],
  news: [],
  aiSummary: null,
  crypto: [],
  marketUniverse: [],
  warnings: [{ section: 'dashboard', message: 'Live data temporarily unavailable' }],
  isFallback: true,
};

export const dashboardService = {
  async getSummary() {
    return withCachedFallback<DashboardSummaryPayload>(
      'stockiq_dashboard_summary',
      async () => {
        const response = await api.get<ApiResponse<DashboardSummaryPayload>>(endpoints.dashboard.summary);
        return response.data.data;
      },
      fallbackSummary
    );
  },
};
