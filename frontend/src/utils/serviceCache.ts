export const getCachedValue = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const setCachedValue = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
};

export const withCachedFallback = async <T>(key: string, request: () => Promise<T>, fallback: T): Promise<T & { isFallback?: boolean }> => {
  try {
    const data = await request();
    setCachedValue(key, data);
    return data as T & { isFallback?: boolean };
  } catch {
    const cached = getCachedValue<T>(key);
    return {
      ...(cached || fallback),
      isFallback: true,
    } as T & { isFallback?: boolean };
  }
};
