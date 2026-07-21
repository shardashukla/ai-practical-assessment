import { useCallback, useEffect, useState } from 'react';
import { ApiRequestError } from '../services/api';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string[]> | null;
}

/**
 * Fetches data on mount and when dependencies change.
 * deps is passed directly to useCallback — callers control re-fetch triggers.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
    validationErrors: null,
  });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null, validationErrors: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null, validationErrors: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      const validationErrors = err instanceof ApiRequestError ? err.details ?? null : null;
      setState({ data: null, loading: false, error: message, validationErrors });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}

/** Wraps write operations; surfaces server validation errors via ApiRequestError.details. */
export function useMutation<TArgs extends unknown[], TResult>(
  mutator: (...args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    setValidationErrors(null);
    setSuccess(false);
    try {
      const result = await mutator(...args);
      setSuccess(true);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      if (err instanceof ApiRequestError) {
        setValidationErrors(err.details ?? null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutator]);

  const reset = useCallback(() => {
    setError(null);
    setValidationErrors(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, validationErrors, success, reset };
}
