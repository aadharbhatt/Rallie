import { Link } from 'react-router-dom';

export function RouteSkeleton() {
  return <section className="route-skeleton" role="status" aria-label="Loading page">
    <span className="sr-only">Loading page…</span>
    <div className="skeleton skeleton-title" /><div className="skeleton skeleton-subtitle" />
    <div className="card-grid">{[1, 2, 3].map((key) => <div key={key} className="skeleton skeleton-card" />)}</div>
  </section>;
}

export function RouteError() {
  return <main className="standalone-error"><p className="eyebrow">Rallie · Foundation preview</p>
    <h1>This page couldn’t load.</h1><p>A development update or interrupted connection may have caused this.</p>
    <a className="button primary" href="/">Reload dashboard</a>
  </main>;
}

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>;
}

export function BackToDashboard() { return <Link className="button primary" to="/">Back to dashboard</Link>; }