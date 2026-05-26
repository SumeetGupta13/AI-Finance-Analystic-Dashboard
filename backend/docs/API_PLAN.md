# StockIQ API Plan

All API responses use a consistent JSON contract:

```json
{
  "success": true,
  "message": "Readable result message",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Readable error message",
  "errors": []
}
```

## Public Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Render health check and runtime metadata |
| POST | `/api/auth/register` | Create user, portfolio, JWT session |
| POST | `/api/auth/login` | Authenticate user and issue JWT |
| POST | `/api/auth/logout` | Clear JWT cookie |
| GET | `/api/market/stocks` | List equities |
| GET | `/api/market/stocks/:symbol` | Get equity detail |
| GET | `/api/market/crypto` | List crypto markets |
| GET | `/api/market/mutual-funds` | List mutual funds |
| GET | `/api/market/trending` | Trending market instruments |
| GET | `/api/market/gainers` | Top gainers |
| GET | `/api/market/losers` | Top losers |
| GET | `/api/market/history/:symbol` | Historical prices by symbol and range |
| GET | `/api/market/news` | Financial news |
| GET | `/api/market/trends` | Trend score engine output, bullish/bearish assets, hot stocks, market momentum |
| GET | `/api/market/sentiment` | News sentiment analysis with confidence and positive/negative/neutral summaries |
| GET | `/api/market/ai-insights` | AI summaries, recommendations, risk alerts, market opportunities, portfolio suggestions |

## Protected Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/auth/profile` | Current user profile |
| GET | `/api/portfolio` | Portfolio summary |
| GET | `/api/portfolio/analytics` | Allocation, P&L, performance analytics |
| POST | `/api/portfolio/holdings` | Add or merge holding |
| PATCH | `/api/portfolio/holdings/:holdingId` | Update holding metadata |
| DELETE | `/api/portfolio/holdings/:holdingId` | Remove holding |
| POST | `/api/transactions/buy` | Simulate buy trade |
| POST | `/api/transactions/sell` | Simulate sell trade |
| GET | `/api/transactions` | Transaction history |
| GET | `/api/transactions/:transactionId` | Transaction detail |
| GET | `/api/watchlists` | List user watchlists |
| POST | `/api/watchlists` | Create watchlist |
| POST | `/api/watchlists/:watchlistId/items` | Add asset to watchlist |
| DELETE | `/api/watchlists/:watchlistId/items/:symbol` | Remove asset from watchlist |
| DELETE | `/api/watchlists/:watchlistId` | Delete watchlist |
| GET | `/api/settings` | Get profile settings |
| PATCH | `/api/settings/profile` | Update profile |
| PATCH | `/api/settings/preferences` | Update preferences |
