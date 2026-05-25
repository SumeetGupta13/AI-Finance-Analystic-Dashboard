export type AssetType = 'stock' | 'crypto' | 'mutual_fund';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    count?: number;
    [key: string]: unknown;
  };
  errors?: string[];
};

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  preferences: {
    currency: 'INR' | 'USD';
    defaultMarket: 'IN' | 'US' | 'GLOBAL';
    riskProfile: 'conservative' | 'balanced' | 'aggressive';
    theme: 'dark';
  };
  createdAt: string;
  updatedAt: string;
};

export type MarketAsset = {
  symbol: string;
  name: string;
  exchange: string;
  country?: string;
  currency: string;
  assetType: AssetType;
  sector?: string;
  industry?: string;
  price: number;
  previousClose?: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
  peRatio?: number;
  dividendYield?: number;
  high52?: number;
  low52?: number;
  sparkline: number[];
};

export type MutualFund = Omit<MarketAsset, 'price' | 'sector' | 'industry' | 'previousClose'> & {
  nav: number;
  category: string;
  expenseRatio: number;
  risk: string;
  rating: number;
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  sipMinimum: number;
  lumpsumMinimum: number;
};

export type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  summary: string;
  publishedAt: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  symbols: string[];
};

export type PortfolioSummary = {
  cashBalance: number;
  investedValue: number;
  portfolioValue: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  realizedPnL: number;
  riskScore: number;
};

export type Holding = {
  _id: string;
  assetType: AssetType;
  symbol: string;
  name: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  lastPriceSnapshot: number;
  metrics?: {
    invested: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
  };
};

export type PortfolioPayload = {
  portfolio: {
    _id: string;
    cashBalance: number;
    currency: 'INR' | 'USD';
    totalInvested: number;
    realizedPnL: number;
    riskScore: number;
  };
  holdings: Holding[];
};

export type PortfolioAnalytics = {
  summary: PortfolioSummary;
  allocation: Array<{ label: string; value: number; amount: number }>;
  holdings: Holding[];
};

export type Transaction = {
  _id: string;
  type: 'buy' | 'sell';
  assetType: AssetType;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  grossAmount: number;
  charges: number;
  netAmount: number;
  status: 'completed' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
};

export type Watchlist = {
  _id: string;
  name: string;
  items: Array<{
    assetType: AssetType;
    symbol: string;
    name: string;
    exchange: string;
    addedAt?: string;
  }>;
};
