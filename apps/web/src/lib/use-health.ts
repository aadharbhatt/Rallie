import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { healthSchema, type HealthResponse } from '@rallie/api-contracts';

type HealthState = { state: 'loading' } | { state: 'loaded'; data: HealthResponse } | { state: 'error'; message: string };

export function useHealthRequest() {
  const [health, setHealth] = useState<HealthState>({ state: 'loading' });
  const current = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    setHealth({ state: 'loading' });
    const timeout = setTimeout(() => controller.abort('timeout'), 10_000);
    let responseReceived = false;
    try {
      const response = await fetch('/health', { signal: controller.signal, cache: 'no-store', headers: { Accept: 'application/json' } });
      responseReceived = true;
      if (response.status !== 200 && response.status !== 503) throw new Error('Unexpected health response.');
      const data = healthSchema.parse(await response.json());
      if ((response.status === 200) !== (data.status === 'ok')) throw new Error('Inconsistent health response.');
      if (current.current === controller) setHealth({ state: 'loaded', data });
    } catch {
      if (current.current === controller && (!controller.signal.aborted || controller.signal.reason === 'timeout')) {
        setHealth({ state: 'error', message: responseReceived
          ? 'The API returned an invalid health response. Check the Worker version, then try again.'
          : 'The API could not be reached. Check that the local Worker is running, then try again.' });
      }
    } finally { clearTimeout(timeout); }
  }, []);
  useEffect(() => { void refresh(); return () => { current.current?.abort(); current.current = null; }; }, [refresh]);
  return { health, refresh };
}

export const HealthContext = createContext<ReturnType<typeof useHealthRequest> | null>(null);

/** One shell-owned request; navigating must not restart bootstrap or lose status. */
export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) throw new Error('HealthContext is required.');
  return context;
}