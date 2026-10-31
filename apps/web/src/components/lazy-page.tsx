import { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { RouteSkeleton } from './route-feedback';

export type PageModule = { Component: ComponentType };

class PageBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <PageFailure onRetry={this.props.onRetry} /> : this.props.children; }
}

function PageFailure({ onRetry }: { onRetry: () => void }) {
  useEffect(() => { document.querySelector<HTMLElement>('#route-failure-title')?.focus(); }, []);
  return <section className="route-failure" aria-labelledby="route-failure-title">
    <h1 id="route-failure-title" tabIndex={-1}>This page couldn’t load.</h1>
    <p>The page module is unavailable. Check your connection, then retry. The workspace navigation still works.</p>
    <p>Retry stays on this route and does not reload the workspace or discard other open state.</p>
    <button className="button primary" onClick={onRetry}>Retry page</button>
  </section>;
}

/** A rejected module never escapes into the shell; each explicit retry is one attempt. */
export function LazyPage({ load }: { load: () => Promise<PageModule> }) {
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState<PageModule | 'error' | null>(null);
  useEffect(() => {
    let active = true;
    setPage(null);
    void load().then((module) => { if (active) setPage(module); }, () => { if (active) setPage('error'); });
    return () => { active = false; };
  }, [load, attempt]);
  useEffect(() => {
    if (attempt > 0 && page && page !== 'error') document.querySelector<HTMLElement>('#main-content')?.focus();
  }, [page, attempt]);
  const retry = () => { setPage(null); setAttempt((value) => value + 1); };
  if (!page) return <RouteSkeleton />;
  if (page === 'error') return <PageFailure onRetry={retry} />;
  return <PageBoundary key={attempt} onRetry={retry}><page.Component /></PageBoundary>;
}