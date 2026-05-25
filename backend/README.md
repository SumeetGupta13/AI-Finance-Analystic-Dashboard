# FINORA Backend

Express API for FINORA with JWT auth, MongoDB Atlas persistence, virtual trading, portfolio analytics, watchlists, settings, and mock-first market data.

## Commands

```bash
npm install
npm run dev
npm start
```

## Environment

Copy `.env.example` to `.env` and set:

```text
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finora
JWT_SECRET=replace-with-a-strong-secret
CLIENT_URL=http://localhost:5173
USE_MOCK_DATA=true
```

## Routes

The API base path is `/api`.

- `/health`
- `/auth`
- `/market`
- `/portfolio`
- `/transactions`
- `/watchlists`
- `/settings`

## Market Service

`services/marketService.js` is the only backend layer that selects mock or live data mode. Mock mode reads from `data/*.json`. Live mode is provider-ready for Alpha Vantage, Finnhub, Twelve Data, Yahoo Finance-compatible providers, CoinGecko, and NewsAPI.
