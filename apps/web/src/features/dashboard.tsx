import { ArrowRight, ArrowUpRight, Cable, Check, Database, Files, Layers3, LibraryBig, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/route-feedback';
import { useHealth } from '../lib/use-health';

const bindingLabels: Record<string, string> = {
  documents: 'R2 documents',
  assets: 'Static assets',
  ingestionWorkflow: 'Ingestion workflow',
  tallyConnections: 'Tally Durable Object',
};

export function Component() {
  const { health, refresh } = useHealth();
  return <>
    <PageHeader eyebrow="YOUR WORKSPACE, AT A GLANCE" title="A clear place to start." description="The first building block of a calmer, more connected working day." />
    <section className="welcome-panel" aria-labelledby="welcome-title"><div><span className="pill"><span className="tiny-dot" /> FOUNDATION / 01</span><h2 id="welcome-title">Less friction.<br />More room for your work.</h2><p>A focused home for your catalogue, quotations, and the work between them. Start by exploring the preview.</p><Link className="button primary" to="catalogue">Explore demo catalogue <ArrowRight size={17} aria-hidden="true" /></Link></div><div className="welcome-art" aria-hidden="true"><div className="art-orbit" /><div className="art-card art-card-back"><span /><span /><span /></div><div className="art-card art-card-front"><div className="art-icon"><Layers3 size={28} /></div><b>A little more clarity.</b><span /><span /><div className="art-check"><Check size={14} /> All in one place</div></div><div className="art-spark">✳</div></div></section>
    <div className="section-heading"><h2>Explore the foundation</h2><span className="muted">Preview data, not business activity</span></div>
    <div className="card-grid">
      <Link to="catalogue" className="feature-card"><span className="feature-icon"><LibraryBig size={21} aria-hidden="true" /></span><span className="card-status">LOCAL FIXTURES</span><h3>Catalogue</h3><p>Six sample products. One simple way to find your bearings.</p><span className="card-link">Browse demo products <ArrowUpRight size={17} aria-hidden="true" /></span></Link>
      <Link to="quotations" className="feature-card"><span className="feature-icon"><Files size={21} aria-hidden="true" /></span><span className="card-status">LAYOUT DEMO</span><h3>Quotations</h3><p>Try the tabbed workspace and an integer-based pricing preview.</p><span className="card-link">Explore quote layout <ArrowUpRight size={17} aria-hidden="true" /></span></Link>
      <Link to="tally" className="feature-card"><span className="feature-icon muted-icon"><Cable size={21} aria-hidden="true" /></span><span className="card-status">NOT CONNECTED</span><h3>Tally</h3><p>A place for a future bridge. No agent, stock sync, or live connection yet.</p><span className="card-link">See integration scope <ArrowUpRight size={17} aria-hidden="true" /></span></Link>
    </div>
    <section className="health-panel" aria-labelledby="health-title"><div className="section-heading"><div className="inline-heading"><Server size={19} aria-hidden="true" /><h2 id="health-title">Foundation health</h2><span className="pill neutral">Live API check</span></div><button className="button subtle compact" disabled={health.state === 'loading'} onClick={() => void refresh()}><RefreshCw size={15} aria-hidden="true" />Refresh</button></div>
      {health.state === 'loading' ? <div role="status" aria-label="Checking API health" className="health-loading"><span className="sr-only">Checking API health…</span><div className="skeleton" /><div className="skeleton" /></div> : health.state === 'error' ? <div className="health-error" role="alert"><strong>API unavailable</strong><p>{health.message}</p><p>No dependency status is assumed while the API is unreachable.</p></div> : <div aria-live="polite"><div className="health-summary"><div><span className={`status-dot ${health.data.status}`} /><strong>{health.data.status === 'ok' ? 'API responding · database reachable' : 'API responding · database needs attention'}</strong></div><span className="muted">Checked {new Date(health.data.checkedAt).toLocaleTimeString()}</span></div><div className="dependency-grid"><div><Database size={17} aria-hidden="true" /><span>D1 database<small>Read-only SELECT 1 probe</small></span><strong className={health.data.database.status === 'ok' ? 'text-teal' : 'text-warning'}>{health.data.database.status === 'ok' ? 'Reachable' : health.data.database.status === 'error' ? 'Probe failed' : 'Not configured'}</strong></div>{Object.entries(health.data.bindings).map(([name, value]) => <div key={name}><Layers3 size={17} aria-hidden="true" /><span>{bindingLabels[name]}<small>Binding presence only</small></span><strong>{value === 'configured' ? 'Configured' : 'Not configured'}</strong></div>)}</div></div>}
      <p className="health-footnote"><ShieldCheck size={15} aria-hidden="true" /> Health checks infrastructure only, not migrations, authentication, or business readiness. Optional bindings are not connectivity-tested.</p>
    </section>
  </>;
}