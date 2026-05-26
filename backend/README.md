# StockIQ Backend

Enterprise Express API for StockIQ with JWT auth, local MongoDB persistence, portfolio analytics, watchlists, settings, AI insights, news, sentiment, market trends, and mock-first market data.

## Commands

```bash
npm install
npm run dev
npm start
```

## Environment

Copy `.env.example` to `.env` and set:

```text
APP_NAME=StockIQ
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stockiq
JWT_SECRET=replace-with-a-strong-secret
CLIENT_URL=http://localhost:5173
USE_MOCK_DATA=true
FINNHUB_API_KEY=
FMP_API_KEY=
NEWS_API_KEY=
GROQ_API_KEY=
COINGECKO_API_KEY=
```

## Auth Routes

The API base path is `/api`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

## Models

- `User`
- `Portfolio`
- `Holding`
- `Transaction`
- `Watchlist`
- `AIInsight`
- `NewsSentiment`
- `News`
- `Sentiment`
- `MarketTrend`

## Market Intelligence

`services/marketService.js` selects mock or live market providers. `services/tractionService.js`, `services/sentimentService.js`, and `services/aiService.js` power higher-level intelligence.

Live provider strategy:

- Finnhub: stock quotes and company profiles
- FMP: historical prices, gainers, and losers
- NewsAPI: financial news
- Groq: AI insights, risk, recommendations, and sentiment reasoning
- CoinGecko: crypto market data

When `USE_MOCK_DATA=true`, the API reads from `backend/data`. When `USE_MOCK_DATA=false`, the live provider keys above are used.

It powers:

- Trending score engine
- Bullish, bearish, and hot stock discovery
- News sentiment confidence scoring
- AI market summaries and risk alerts
- Smart recommendations and diversification suggestions

## AI Routes

- `GET /api/ai/insights`
- `GET /api/ai/risk`
- `GET /api/ai/suggestions`
- `GET /api/ai/news-sentiment`
- `GET /api/ai/market-trends`

## Architecture

The backend follows MVC with service, validator, middleware, utility, and data layers.
