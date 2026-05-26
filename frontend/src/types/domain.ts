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
  trendScore?: number;
  trendComponents?: TrendComponents;
  sentiment?: AssetSentimentSummary;
  recommendation?: RecommendationRating;
  rank?: number;
  circulatingSupply?: number;
};

export type TrendComponents = {
  volumeChange: number;
  priceMomentum: number;
  newsImpact: number;
  socialBuzz: number;
  watchlistGrowth: number;
};

export type RecommendationRating = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';

export type AssetSentimentSummary = {
  label: string;
  score: number;
  confidence: number;
  reason: string;
};

export type MutualFund = Omit<MarketAsset, 'price' | 'sector' | 'industry' | 'previousClose'> & {
  nav: number;
  category: string;
  aum: number;
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
  sentimentScore?: number;
  confidence?: number;
};

export type SentimentAnalysis = {
  symbol: string;
  assetType: AssetType;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  label: 'bullish' | 'neutral' | 'bearish';
  score: number;
  confidence: number;
  confidencePercent?: string;
  reason: string;
  newsImpact: number;
  positiveNews: string[];
  negativeNews: string[];
  neutralNews: string[];
  recommendation?: RecommendationRating;
  updatedAt: string;
};

export type MarketIndex = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export type SectorPerformance = {
  sector: string;
  changePercent: number;
};

export type MarketMomentum = {
  score: number;
  label: string;
  bullishCount: number;
  bearishCount: number;
  summary: string;
};

export type MarketTrendOverview = {
  indices: MarketIndex[];
  trending: string[];
  topGainers: string[];
  topLosers: string[];
  sectorPerformance: SectorPerformance[];
  trendSignals: Array<{ symbol: string } & TrendComponents>;
  marketMood: {
    score: number;
    label: string;
    summary: string;
  };
  trendingStocks: MarketAsset[];
  bullishAssets: MarketAsset[];
  bearishAssets: MarketAsset[];
  hotStocks: MarketAsset[];
  marketMomentum: MarketMomentum;
  recommendations: Record<'strongBuy' | 'buy' | 'hold' | 'sell' | 'strongSell', MarketAsset[]>;
};

export type AIInsightPayload = {
  portfolioSummary?: PortfolioSummary;
  dailyMarketOverview: {
    title: string;
    summary: string;
    riskScore: string;
    marketMood: string;
    generatedAt: string;
  };
  marketSummaries: Array<{
    id: string;
    title: string;
    summary: string;
    symbols: string[];
    category: string;
    recommendation: RecommendationRating;
    confidence: number;
  }>;
  recommendations: Array<{
    symbol: string;
    rating: RecommendationRating;
    confidence: number;
    reason: string;
  }>;
  riskAlerts: Array<{
    id: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  marketOpportunities: Array<{
    id: string;
    message: string;
    symbols: string[];
    rating: RecommendationRating;
    reason: string;
  }>;
  investmentSuggestions: string[];
  portfolioSuggestions: Array<{
    message: string;
    action: string;
  }>;
  marketMomentum: MarketMomentum;
  topOpportunities: Array<{
    symbol: string;
    name: string;
    trendScore: number;
    recommendation: RecommendationRating;
    reason: string;
  }>;
};

export type PortfolioSummary = {
  initialWalletBalance?: number;
  cashBalance: number;
  walletBalance?: number;
  investedValue: number;
  portfolioValue: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  realizedPnL: number;
  unrealizedPnL?: number;
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
  sectorExposure?: Array<{ label: string; value: number; amount: number }>;
  holdings: Holding[];
};

export type TransactionType = 'income' | 'expense' | 'investment' | 'savings' | 'stock_buy' | 'stock_sell' | 'buy' | 'sell';
export type PaymentMethod = 'cash' | 'bank' | 'upi' | 'card' | 'net_banking' | 'virtual_wallet' | 'other';
export type TransactionStatus = 'completed' | 'rejected';

export type Transaction = {
  id?: string;
  _id?: string;
  type: TransactionType;
  category: string;
  title: string;
  amount: number;
  assetType?: AssetType | 'cash';
  symbol?: string;
  stockSymbol?: string;
  name?: string;
  stockName?: string;
  quantity: number;
  price: number;
  grossAmount?: number;
  charges?: number;
  netAmount: number;
  totalValue?: number;
  fees?: number;
  profitLoss?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  transactionDate?: string;
  month?: number;
  year?: number;
  status: TransactionStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
};

export type TransactionInput = {
  type: TransactionType;
  category: string;
  title: string;
  amount?: number;
  stockSymbol?: string;
  stockName?: string;
  quantity?: number;
  price?: number;
  totalValue?: number;
  fees?: number;
  profitLoss?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  transactionDate?: string;
};

export type TransactionSummary = {
  income: number;
  expense: number;
  investment: number;
  savings: number;
  stockSell: number;
  netCashFlow: number;
  savingRate: number;
  investmentRate: number;
  totalTransactions: number;
};

export type MonthlyTransactionSummary = {
  month: number;
  year: number;
  income: number;
  expense: number;
  investment: number;
  savings: number;
  stockBuy: number;
  stockSell: number;
  netCashFlow: number;
  transactionCount: number;
};

export type AITransactionInsightPayload = {
  moneyHealthScore: number;
  spendingPatternSummary: string;
  overspendingDetection: string;
  savingSuggestions: string[];
  investmentSuggestions: string[];
  riskAlert: string;
  stockPortfolioInsight: string;
  highlights: string[];
};

export type TransactionAnalytics = {
  summary: TransactionSummary;
  previousSummary: TransactionSummary;
  monthly: MonthlyTransactionSummary[];
  categoryBreakdown: Array<{ category: string; amount: number }>;
  paymentMethods: Array<{ category: string; amount: number }>;
  cashFlow: Array<{
    month: string;
    income: number;
    expense: number;
    investment: number;
    savings: number;
    netCashFlow: number;
  }>;
  stockProfitLoss: {
    realized: number;
    unrealized: number;
    total: number;
  };
  aiInsights: AITransactionInsightPayload;
};

export type TradeInput = {
  assetType: AssetType;
  symbol: string;
  quantity: number;
};

export type TradeResult = {
  status: TransactionStatus;
  transaction: Transaction;
  holding?: Holding;
  portfolio: PortfolioPayload['portfolio'];
  profitLoss?: number;
  reason?: string;
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
