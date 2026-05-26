import type { AssetType } from '../types/domain';

export const getAssetCurrency = (assetType?: AssetType | 'cash') => (assetType === 'crypto' ? 'USD' : 'INR');

export const formatCurrency = (value: number, currency = 'INR') =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(value);

export const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
