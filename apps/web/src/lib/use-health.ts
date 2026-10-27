import { useCallback, useEffect, useRef, useState } from 'react';
import { healthSchema, type HealthResponse } from '../../../../packages/api-contracts/src/index';

type HealthState = { state: 'loading' } | { state: 'loaded'; data: HealthResponse } | { state: 'error'; message: string };

export function useHealth() {
  const [health, setHealth] = useState<HealthState>({ state: 'loading' });
  const current = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    setHealth({ state: 'loading' });
    const timeout = setTimeout(() => controller.abort('timeout'), 6_000);
    try {
      const response = await fetch('/health', { signal: controller.signal, cache: 'no-store', headers: { Accept: 'application/json' } });
      if (response.status !== 200 && response.status !== 503) throw new Error('Unexpected health response.');
      const data = healthSchema.parse(await response.json());
      if ((response.status === 200) !== (data.status === 'ok')) throw new Error('Inconsistent health response.');
      if (current.current === controller) setHealth({ state: 'loaded', data });
    } catch {
      if (current.current === controller && (!controller.signal.aborted || controller.signal.reason === 'timeout')) {
        setHealth({ state: 'error', message: 'The API could not be reached or returned an invalid health response. Check that the local Worker is running, then try again.' });
      }
    } finally { clearTimeout(timeout); }
  }, []);
  useEffect(() => { void refresh(); return () => { current.current?.abort(); current.current = null; }; }, [refresh]);
  return { health, refresh };
}