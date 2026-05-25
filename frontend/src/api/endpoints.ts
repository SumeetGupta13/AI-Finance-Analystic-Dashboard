export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },
  market: {
    stocks: '/market/stocks',
    stock: (symbol: string) => `/market/stocks/${symbol}`,
    crypto: '/market/crypto',
    mutualFunds: '/market/mutual-funds',
    trending: '/market/trending',
    gainers: '/market/gainers',
    losers: '/market/losers',
    history: (symbol: string) => `/market/history/${symbol}`,
    news: '/market/news',
    trends: '/market/trends',
  },
  portfolio: {
    root: '/portfolio',
    analytics: '/portfolio/analytics',
    holdings: '/portfolio/holdings',
    holding: (holdingId: string) => `/portfolio/holdings/${holdingId}`,
  },
  transactions: {
    root: '/transactions',
    buy: '/transactions/buy',
    sell: '/transactions/sell',
    detail: (transactionId: string) => `/transactions/${transactionId}`,
  },
  watchlists: {
    root: '/watchlists',
    detail: (watchlistId: string) => `/watchlists/${watchlistId}`,
    items: (watchlistId: string) => `/watchlists/${watchlistId}/items`,
    item: (watchlistId: string, symbol: string) => `/watchlists/${watchlistId}/items/${symbol}`,
  },
};
