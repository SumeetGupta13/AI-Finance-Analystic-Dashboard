import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import { getCachedValue, setCachedValue } from '../utils/serviceCache';
import type { AIInsightPayload, AITransactionInsightPayload, ApiResponse, MarketTrendOverview, SentimentAnalysis } from '../types/domain';

export type AIRiskPayload = {
  riskAlerts: AIInsightPayload['riskAlerts'];
  highRiskAssets: MarketTrendOverview['bearishAssets'];
  volatilityWarnings: Array<{ symbol: string; changePercent: number; reason: string }>;
  exposureWarning: AIInsightPayload['portfolioSuggestions'][number] | null;
};

export type AISuggestionsPayload = {
  smartRecommendations: AIInsightPayload['recommendations'];
  investmentOpportunities: AIInsightPayload['marketOpportunities'];
  portfolioSuggestions: AIInsightPayload['portfolioSuggestions'];
  diversificationSuggestions: string[];
};

export type AINewsSentimentPayload = {
  items: SentimentAnalysis[];
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
};

export type AISummaryPayload = {
  insights: AIInsightPayload;
  risk: AIRiskPayload;
  suggestions: AISuggestionsPayload;
  newsSentiment: AINewsSentimentPayload;
  portfolioSummary: AIInsightPayload['portfolioSummary'] | null;
  marketTrends?: MarketTrendOverview;
  isFallback?: boolean;
};

export const aiService = {
  async getSummary(params?: Record<string, string>) {
    const cacheKey = `stockiq_ai_summary_${JSON.stringify(params || {})}`;

    try {
      const response = await api.get<ApiResponse<AISummaryPayload>>(endpoints.ai.summary, { params });
      setCachedValue(cacheKey, response.data.data);
      return response.data.data;
    } catch {
      const cached = getCachedValue<AISummaryPayload>(cacheKey);
      if (cached) {
        return { ...cached, isFallback: true };
      }
      throw new Error('Live data temporarily unavailable');
    }
  },

  async getInsights(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<AIInsightPayload>>(endpoints.ai.insights, { params });
    return response.data.data;
  },

  async getRisk(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<AIRiskPayload>>(endpoints.ai.risk, { params });
    return response.data.data;
  },

  async getSuggestions(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<AISuggestionsPayload>>(endpoints.ai.suggestions, { params });
    return response.data.data;
  },

  async getNewsSentiment(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<AINewsSentimentPayload>>(endpoints.ai.newsSentiment, { params });
    return response.data.data;
  },

  async getMarketTrends(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<MarketTrendOverview>>(endpoints.ai.marketTrends, { params });
    return response.data.data;
  },

  async getTransactionInsights(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<AITransactionInsightPayload>>(endpoints.ai.transactions, { params });
    return response.data.data;
  },
};
