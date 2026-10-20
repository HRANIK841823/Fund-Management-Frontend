import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../api/client.js";

/** Fetch data when `deps` change. Returns { data, loading, error, reload }. */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((res) => !cancelled && setState({ data: res.data, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ data: null, loading: false, error: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
