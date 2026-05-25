# FINORA Frontend

React 18 + Vite + TypeScript frontend for FINORA.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env`:

```text
VITE_APP_NAME=FINORA
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_DATA=true
```

## App Areas

- Landing page
- Authentication
- Dashboard
- Markets
- Asset details
- Portfolio and virtual trading
- Watchlists
- News
- Settings

The frontend never imports market JSON directly. It uses `src/services/marketService.ts`, which keeps the UI ready for live backend providers.
