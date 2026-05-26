# StockIQ Database Plan

Local MongoDB stores user-owned data in development. Market data starts as static mock JSON and is later replaceable by live provider adapters.

## Collections

### users

- Unique email index for login identity
- Password stored as bcrypt hash only
- Role defaults to `user`
- Preferences capture currency, risk profile, and market defaults

### portfolios

- One default virtual portfolio per user
- Starts with INR 100000 cash balance
- Stores summary values that can be recalculated from transactions and holdings

### holdings

- One document per user, portfolio, asset type, and symbol
- Compound indexes support fast portfolio lookup and duplicate prevention
- Stores last price snapshot for quick UI rendering while analytics can refresh from market service

### transactions

- Immutable trading ledger
- Buy and sell simulations write completed or rejected records
- Used for portfolio history, realized P&L, and activity feeds

### watchlists

- User-owned named watchlists
- Items are embedded because watchlist entries are small and read together
- Compound index prevents duplicate watchlist names per user

## Data Ownership

Every protected resource includes a `user` reference and controllers must scope queries by `req.user.id`.

## Index Plan

- `users.email` unique
- `portfolios.user` unique
- `holdings.user + holdings.portfolio`
- `holdings.user + holdings.symbol + holdings.assetType`
- `transactions.user + createdAt`
- `transactions.user + symbol`
- `watchlists.user + name` unique
