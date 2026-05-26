# StockIQ Architecture

StockIQ is a premium MERN fintech market intelligence platform designed for virtual investing, portfolio analytics, market discovery, watchlists, AI insights, sentiment analysis, and financial news. The initial release runs entirely on realistic mock market data through a provider-ready abstraction layer. Live providers can be enabled later by adding API keys and setting `USE_MOCK_DATA=false`.

## Step 1 Scope

This step establishes the production architecture before feature implementation:

- Root project split into `frontend/` and `backend/`
- React 18, Vite, TypeScript, Tailwind CSS frontend structure
- Node.js, Express, local MongoDB, Mongoose backend MVC structure
- Mock-first market data abstraction on frontend and backend
- Database schema plan for authentication, portfolio, holdings, transactions, and watchlists
- API route plan for auth, market data, virtual trading, portfolio analytics, and settings
- Deployment plan for Vercel, Render, and environment-specific MongoDB connections
- Environment variable plan for local, staging, and production

## Root Structure

```text
StockIQ/
  frontend/
    src/
      api/
      assets/
      components/
        common/
        dashboard/
        market/
        portfolio/
        ui/
      context/
      hooks/
      layouts/
      pages/
      routes/
      services/
      styles/
      utils/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    data/
    validators/
    utils/
    docs/
```

## Frontend Architecture

The frontend is a Vite + React 18 + TypeScript application using React Router DOM v6, Context API, Axios, Recharts, Framer Motion, Lucide React, React Hot Toast, and Tailwind CSS.

Primary responsibilities:

- `api/`: Axios instance, interceptors, auth token handling, normalized API errors
- `services/`: Domain service layer for auth, market, portfolio, transaction, watchlist, user settings
- `context/`: Auth session, portfolio state, market preferences, UI state
- `routes/`: Public routes, protected routes, lazy route definitions
- `layouts/`: App shell, sidebar, top navigation, mobile bottom navigation
- `components/ui/`: Reusable design primitives such as buttons, cards, inputs, tables, badges, tabs, skeletons, empty states
- `components/dashboard/`: Dashboard widgets and analytics visualizations
- `components/market/`: Market tables, cards, search, filters, sparklines, detail views
- `components/portfolio/`: Holdings, allocation, transaction panels, buy/sell UI
- `pages/`: Route-level pages only
- `utils/`: Formatting, currency, percentages, chart transforms, storage helpers

Frontend data flow:

```text
Page -> Context or Service -> Axios Client -> Backend API -> Normalized Response -> UI Components
```

Frontend market abstraction:

```text
pages/components -> src/services/marketService.ts -> backend /api/market/*
```

The frontend never imports mock JSON directly. It consumes market data through `marketService.ts`, so switching from mock data to live providers requires no UI changes.

## Backend Architecture

The backend is a Node.js + Express API using local MongoDB via Mongoose in development. It follows MVC with service and validation layers.

Primary responsibilities:

- `config/`: Database connection, environment validation, constants
- `controllers/`: HTTP request orchestration and response shaping
- `middleware/`: Auth, error handling, rate limiting support, request guards
- `models/`: Mongoose schemas and indexes
- `routes/`: Express route modules grouped by domain
- `services/`: Business logic, market provider abstraction, portfolio calculations
- `data/`: Mock market datasets used while `USE_MOCK_DATA=true`
- `validators/`: Request validation helpers
- `utils/`: Token creation, API responses, async wrappers, financial math

Backend request flow:

```text
Route -> Middleware -> Validator -> Controller -> Service -> Model/Data Provider -> Response
```

## Market Service Architecture

StockIQ uses mock data on day one and a provider-ready live mode later.

Backend:

```text
backend/services/marketService.js
  getStocks()
  getStockBySymbol(symbol)
  getTrendingStocks()
  getTopGainers()
  getTopLosers()
  getCryptoMarkets()
  getMutualFunds()
  getHistoricalData(symbol, range)
  getMarketNews(category)
```

Mode selection:

```js
if (process.env.USE_MOCK_DATA === "true") {
  return mockMarketData;
}

return liveMarketData;
```

Provider-ready live adapters:

- Alpha Vantage for equity quotes and time series
- Finnhub for company metrics and market news
- Twelve Data for multi-asset time series
- Yahoo Finance-compatible provider for delayed quote fallback
- CoinGecko for crypto markets
- NewsAPI for financial headlines

The first implementation will expose stable StockIQ response contracts independent of provider-specific payloads.

## Database Schema Plan

### User

- `name`: string, required
- `email`: string, required, unique, lowercase, indexed
- `password`: string, required, hashed with bcryptjs
- `avatar`: string
- `role`: enum `user`, `admin`
- `preferences`: currency, theme, risk profile, default market
- `createdAt`, `updatedAt`

### Portfolio

- `user`: ObjectId reference to User, unique index
- `cashBalance`: number, default virtual balance 100000
- `currency`: string, default INR
- `totalInvested`: number
- `realizedPnL`: number
- `riskScore`: number
- `createdAt`, `updatedAt`

### Holding

- `user`: ObjectId reference to User, indexed
- `portfolio`: ObjectId reference to Portfolio, indexed
- `assetType`: enum `stock`, `crypto`, `mutual_fund`
- `symbol`: string, indexed
- `name`: string
- `exchange`: string
- `quantity`: number
- `averagePrice`: number
- `lastPriceSnapshot`: number
- `createdAt`, `updatedAt`

### Transaction

- `user`: ObjectId reference to User, indexed
- `portfolio`: ObjectId reference to Portfolio, indexed
- `type`: enum `buy`, `sell`
- `assetType`: enum `stock`, `crypto`, `mutual_fund`
- `symbol`: string, indexed
- `name`: string
- `quantity`: number
- `price`: number
- `grossAmount`: number
- `charges`: number
- `netAmount`: number
- `status`: enum `completed`, `rejected`
- `createdAt`, `updatedAt`

### Watchlist

- `user`: ObjectId reference to User, indexed
- `name`: string
- `items`: array of symbols with asset type, exchange, added date
- Compound unique index on `user` and `name`
- `createdAt`, `updatedAt`

## API Route Plan

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Market

- `GET /api/market/stocks`
- `GET /api/market/stocks/:symbol`
- `GET /api/market/crypto`
- `GET /api/market/mutual-funds`
- `GET /api/market/trending`
- `GET /api/market/gainers`
- `GET /api/market/losers`
- `GET /api/market/history/:symbol`
- `GET /api/market/news`

### Portfolio

- `GET /api/portfolio`
- `GET /api/portfolio/analytics`
- `POST /api/portfolio/holdings`
- `PATCH /api/portfolio/holdings/:holdingId`
- `DELETE /api/portfolio/holdings/:holdingId`

### Transactions

- `POST /api/transactions/buy`
- `POST /api/transactions/sell`
- `GET /api/transactions`
- `GET /api/transactions/:transactionId`

### Watchlists

- `GET /api/watchlists`
- `POST /api/watchlists`
- `POST /api/watchlists/:watchlistId/items`
- `DELETE /api/watchlists/:watchlistId/items/:symbol`
- `DELETE /api/watchlists/:watchlistId`

### User Settings

- `GET /api/settings`
- `PATCH /api/settings/profile`
- `PATCH /api/settings/preferences`

## Deployment Plan

Frontend deployment:

- Target: Vercel
- Build command: `npm run build`
- Output directory: `dist`
- Required environment variable: `VITE_API_BASE_URL`

Backend deployment:

- Target: Render Web Service
- Runtime: Node.js
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Database:

- Target: local MongoDB in development
- Use an environment-specific MongoDB URI when deploying outside the local machine
- Store the connection string in backend environment variables

## Environment Variable Plan

Backend `.env`:

```text
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stockiq
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=http://localhost:5173
USE_MOCK_DATA=true
ALPHA_VANTAGE_API_KEY=
FINNHUB_API_KEY=
TWELVE_DATA_API_KEY=
YAHOO_FINANCE_API_KEY=
COINGECKO_API_KEY=
NEWS_API_KEY=
```

Frontend `.env`:

```text
VITE_APP_NAME=StockIQ
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_DATA=true
```

## Step Implementation Order

1. Project architecture and planning
2. Backend foundation
3. Authentication
4. Database models
5. Mock market data
6. Market service layer
7. Backend APIs
8. Frontend foundation
9. Premium UI system
10. Landing page
11. Dashboard
12. Market module
13. Stock detail page
14. Crypto and funds module
15. Virtual trading
16. Watchlist and news
17. Profile and settings
18. Frontend-backend integration
19. Final optimization
20. Documentation and deployment
