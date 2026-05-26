const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }

  const rawApiUrl = trimTrailingSlashes(String(import.meta.env.VITE_API_URL || 'http://localhost:4000'));
  return rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
};

export const getAuthProviderUrl = (provider: 'google') => {
  return `${getApiBaseUrl()}/auth/${provider}`;
};
