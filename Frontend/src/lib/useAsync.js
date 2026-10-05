import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// One loading/error/retry pattern for every dashboard request.
// `fetcher` returns a promise of the data. An expired session (401) sends the
// user to /login, as the individual pages did before.
const useAsync = (fetcher, deps = []) => {
  const navigate = useNavigate();
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  const requestId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++requestId.current;
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await run();
        if (id === requestId.current) setState({ data, loading: false, error: null });
      } catch (error) {
        if (id !== requestId.current) return;
        if (error?.response?.status === 401) navigate("/login");
        setState((s) => ({ ...s, loading: false, error }));
      }
    },
    [run, navigate],
  );

  useEffect(() => {
    reload();
    return () => {
      requestId.current += 1; // ignore responses after unmount / dep change
    };
  }, [reload]);

  // Lets callers update data optimistically without refetching.
  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload, setData };
};

export default useAsync;
