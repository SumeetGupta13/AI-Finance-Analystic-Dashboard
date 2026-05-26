class ExternalApiError extends Error {
  constructor(message, { provider, statusCode, retryAfter, payload } = {}) {
    super(message);
    this.name = 'ExternalApiError';
    this.provider = provider;
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
    this.payload = payload;
    this.isRateLimited = statusCode === 429;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { executeWithFallback } = require('../utils/apiErrorHandler');

const readPositiveNumber = (key, fallback) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const defaultTimeoutMs = readPositiveNumber('EXTERNAL_API_TIMEOUT_MS', 4000);
const defaultRetries = Math.max(0, Math.floor(readPositiveNumber('EXTERNAL_API_RETRIES', 0)));

const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const parsePayload = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const getRetryDelay = (response, attempt) => {
  const retryAfter = response.headers.get('retry-after');

  if (retryAfter) {
    const seconds = Number(retryAfter);
    return Number.isFinite(seconds) ? seconds * 1000 : 1500;
  }

  return Math.min(500 * 2 ** attempt, 4000);
};

const fetchJson = async (url, options = {}) => {
  const {
    provider = 'external API',
    timeoutMs = defaultTimeoutMs,
    retries = defaultRetries,
    headers = {},
    ...fetchOptions
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      const payload = await parsePayload(response);

      if (response.ok) {
        return payload;
      }

      const retryable = response.status === 429 || response.status >= 500;
      const message =
        payload.error?.message ||
        payload.message ||
        `${provider} request failed with status ${response.status}`;
      lastError = new ExternalApiError(message, {
        provider,
        statusCode: response.status,
        retryAfter: response.headers.get('retry-after'),
        payload,
      });

      if (!retryable || attempt === retries) {
        throw lastError;
      }

      await sleep(getRetryDelay(response, attempt));
    } catch (error) {
      if (
        error instanceof ExternalApiError &&
        error.statusCode &&
        error.statusCode !== 429 &&
        error.statusCode < 500
      ) {
        throw error;
      }

      lastError =
        error instanceof ExternalApiError
          ? error
          : new ExternalApiError(error.name === 'AbortError' ? `${provider} request timed out` : error.message, {
              provider,
            });

      if (attempt === retries) {
        throw lastError;
      }

      await sleep(Math.min(500 * 2 ** attempt, 4000));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
};

const withFallback = async ({ useMockData, live, mock, provider }) => {
  if (useMockData) {
    return mock();
  }

  return executeWithFallback(live, await mock(), provider);
};

module.exports = {
  ExternalApiError,
  buildUrl,
  fetchJson,
  withFallback,
};
