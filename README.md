# FINORA

FINORA is a premium MERN fintech investment platform with virtual trading, portfolio analytics, market discovery, watchlists, financial news, and a mock-first market service that is ready for future live API providers.

## Tech Stack

Frontend: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios, React Router DOM v6, Recharts, Lucide React, React Hot Toast, Context API.

Backend: Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs, dotenv, cors, helmet, morgan, express-rate-limit, cookie-parser.

Deployment: Vercel frontend, Render backend, MongoDB Atlas database.

## Project Structure

```text
frontend/
  src/api
  src/components
  src/context
  src/layouts
  src/pages
  src/routes
  src/services
  src/styles
  src/utils
backend/
  config
  controllers
  middleware
  models
  routes
  services
  data
  validators
  utils
```

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create backend environment:

```bash
cp backend/.env.example backend/.env
```

3. Create frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

4. Start backend:

```bash
npm run dev:backend
```

5. Start frontend:

```bash
npm run dev:frontend
```

Frontend runs at `http://localhost:5173`. Backend runs at `http://localhost:5000`.

## MongoDB Atlas Setup

1. Create an Atlas cluster.
2. Create a database user.
3. Add your IP address to Network Access.
4. Copy the connection string.
5. Set `MONGODB_URI` in `backend/.env`.

The backend also accepts the older `MONGO_URI` key for local compatibility.

## Market Data Mode

FINORA starts in mock mode:

```text
USE_MOCK_DATA=true
VITE_USE_MOCK_DATA=true
```

To prepare live mode later:

```text
USE_MOCK_DATA=false
ALPHA_VANTAGE_API_KEY=
FINNHUB_API_KEY=
TWELVE_DATA_API_KEY=
YAHOO_FINANCE_API_KEY=
COINGECKO_API_KEY=
NEWS_API_KEY=
```

Frontend logic does not change. The UI calls `frontend/src/services/marketService.ts`, which calls backend market routes. The backend switches providers in `backend/services/marketService.js`.

## API Summary

Health:

- `GET /api/health`

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

Market:

- `GET /api/market/stocks`
- `GET /api/market/stocks/:symbol`
- `GET /api/market/crypto`
- `GET /api/market/mutual-funds`
- `GET /api/market/trending`
- `GET /api/market/gainers`
- `GET /api/market/losers`
- `GET /api/market/history/:symbol`
- `GET /api/market/news`
- `GET /api/market/trends`

Portfolio:

- `GET /api/portfolio`
- `GET /api/portfolio/analytics`
- `POST /api/portfolio/holdings`
- `PATCH /api/portfolio/holdings/:holdingId`
- `DELETE /api/portfolio/holdings/:holdingId`

Transactions:

- `POST /api/transactions/buy`
- `POST /api/transactions/sell`
- `GET /api/transactions`
- `GET /api/transactions/:transactionId`

Watchlists:

- `GET /api/watchlists`
- `POST /api/watchlists`
- `POST /api/watchlists/:watchlistId/items`
- `DELETE /api/watchlists/:watchlistId/items/:symbol`
- `DELETE /api/watchlists/:watchlistId`

Settings:

- `GET /api/settings`
- `PATCH /api/settings/profile`
- `PATCH /api/settings/preferences`

## Vercel Deployment

1. Import the repository in Vercel.
2. Set root directory to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variable:

```text
VITE_API_BASE_URL=https://your-render-api.onrender.com/api
VITE_USE_MOCK_DATA=true
```

## Render Deployment

1. Create a Render Web Service.
2. Set root directory to `backend`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Health check path: `/api/health`.
6. Add environment variables from `backend/.env.example`.

## Verification

Backend import and public API smoke checks pass. Frontend production build passes with route-level code splitting.
