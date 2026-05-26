import { useEffect, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await loader();
        if (active) {
          setData(result);
        }
      } catch (caughtError) {
        if (active) {
          setError(caughtError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, dependencies);

  return { data, loading, error };
}
