# Backend Architecture - StockIQ

Structure: MVC with services and data layer.

- `server.js` - entry point
- `app.js` - Express app configuration
- `config/` - database connection and environment helpers
- `controllers/` - request handlers per resource
- `routes/` - Express routers
- `services/` - domain services
- `models/` - Mongoose schemas and indexes
- `middleware/` - auth, error, and request middleware
- `validators/` - express-validator request validation
- `utils/` - shared API, token, async, and finance helpers
- `data/` - mock market datasets used when `USE_MOCK_DATA=true`

Market service abstraction implemented at `services/marketService.js` supports mock/live modes.
