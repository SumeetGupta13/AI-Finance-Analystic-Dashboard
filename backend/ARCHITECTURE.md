# Backend Architecture — FINORA

Structure: MVC with services and data layer.

- `src/server.js` — entry point (created in Step 2)
- `src/app.js` — express app configuration (Step 2)
- `config/` — database connection and configuration helpers
- `controllers/` — request handlers per resource
- `routes/` — express routers
- `services/` — domain services (marketService, portfolioService)
- `models/` — Mongoose models
- `data/` — mock market datasets (used when USE_MOCK_DATA=true)

Market service abstraction implemented at `services/marketService.js` supports mock/live modes.
