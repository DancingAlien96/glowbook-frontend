"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";

type State<T> = {
  data: T | undefined;
  error: ApiError | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

// Tiny SWR-lite: keyed fetch with abort + manual refetch.
export function useApi<T>(path: string | null, deps: unknown[] = []): State<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const reqId = useRef(0);

  const run = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await api<T>(path);
      if (reqId.current === id) setData(result);
    } catch (err) {
      if (reqId.current === id) setError(err instanceof ApiError ? err : new ApiError(0, "Network error"));
    } finally {
      if (reqId.current === id) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  return { data, error, loading, refetch: run };
}
