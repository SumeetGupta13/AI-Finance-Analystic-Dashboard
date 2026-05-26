const missingKeyPattern = /api[_ -]?key|token|credential|unauthorized|missing|not configured|required/i;

const getStatus = (error) => error?.statusCode || error?.status || error?.response?.status;

const classifyApiError = (error = {}) => {
  const status = getStatus(error);
  const message = String(error.message || '');

  if (status === 429) return 'Too Many Requests';
  if (status === 403) return 'Forbidden';
  if (status === 426) return 'Upgrade Required';
  if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || /timeout|timed out/i.test(message)) return 'Timeout';
  if (['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN', 'ETIMEDOUT'].includes(error.code)) return 'Network';
  if (!status && missingKeyPattern.test(message)) return 'Missing API key';
  if (!status) return 'Network';
  return `HTTP ${status}`;
};

const shouldFallback = (error = {}) => {
  const status = getStatus(error);
  const message = String(error.message || '');

  return (
    status === 429 ||
    status === 403 ||
    status === 426 ||
    error.name === 'AbortError' ||
    error.code === 'ECONNABORTED' ||
    ['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN', 'ETIMEDOUT'].includes(error.code) ||
    /timeout|timed out/i.test(message) ||
    missingKeyPattern.test(message) ||
    !status
  );
};

const executeWithFallback = async (fetchFunction, fallbackValue, providerName = 'External API') => {
  try {
    const result = await fetchFunction();
    return result || fallbackValue;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      const reason = classifyApiError(error);
      const action = shouldFallback(error) ? 'serving fallback data' : 'unexpected error, serving fallback data';
      console.warn(`[${providerName}] ${reason}; ${action}.`);
    }

    return fallbackValue;
  }
};

module.exports = {
  classifyApiError,
  executeWithFallback,
  shouldFallback,
};
