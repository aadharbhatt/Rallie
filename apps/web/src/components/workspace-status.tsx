import { useEffect, useRef, useState } from 'react';
import { useHealth } from '../lib/use-health';
import { RuntimeNotice } from './runtime-notice';

export function WorkspaceStatus() {
  const { health, refresh } = useHealth();
  const [waiting, setWaiting] = useState(false);
  const [resolved, setResolved] = useState(false);
  const recovering = useRef(false);
  useEffect(() => {
    if (recovering.current && health.state !== 'loading') {
      recovering.current = false;
      document.querySelector<HTMLElement>('#main-content')?.focus();
    }
  }, [health.state]);
  useEffect(() => {
    if (health.state !== 'loading') { setResolved(true); return; }
    const timer = setTimeout(() => setWaiting(true), 1_000);
    return () => clearTimeout(timer);
  }, [health.state]);
  if (health.state === 'loaded') return <RuntimeNotice runtime={health.data.runtime} database={health.data.database.status} />;
  if (health.state === 'error') return <div className="workspace-status" role="status" aria-label="Workspace connection">
    <strong>API unavailable</strong><span>Environment and dependency readiness are unknown. Preview only; authentication is not implemented.</span>
    <button className="text-button" onClick={() => { recovering.current = true; void refresh(); }}>Retry connection</button>
  </div>;
  if (!waiting || resolved) return null;
  return <div className="workspace-status" role="status" aria-label="Opening workspace">
    <span className="brand-mark" aria-hidden="true">r.</span><span>Opening your workspace… Checking API readiness. Preview navigation is available; authentication is not implemented.</span>
  </div>;
}