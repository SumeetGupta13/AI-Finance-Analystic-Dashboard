# StockIQ Market Service Plan

The market service is the only backend layer allowed to know whether data comes from mock JSON or a live provider.

## Backend Contract

```text
backend/services/marketService.js
  getStocks(filters)
  getStockBySymbol(symbol)
  getTrendingStocks()
  getTopGainers()
  getTopLosers()
  getCryptoMarkets(filters)
  getMutualFunds(filters)
  getHistoricalData(symbol, range)
  getMarketNews(filters)
```

## Data Modes

Mock mode:

- Enabled with `USE_MOCK_DATA=true`
- Reads from `backend/data/*.json`
- Returns realistic normalized StockIQ payloads

Live mode:

- Enabled with `USE_MOCK_DATA=false`
- Reads provider keys from environment variables
- Normalizes provider payloads into the same StockIQ response shape

## Provider Targets

- Alpha Vantage: equity quotes, technical time series
- Finnhub: metrics, company data, news
- Twelve Data: cross-market candles
- Yahoo Finance-compatible provider: delayed quote fallback
- CoinGecko: crypto markets
- NewsAPI: market headlines

## Frontend Boundary

The frontend calls only `src/services/marketService.ts`. It does not import provider code or static JSON.
