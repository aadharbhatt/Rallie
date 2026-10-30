import { useState } from 'react';
import { ArrowRight, Cable, Database, Files, Layers3, LibraryBig, RefreshCw, Search, Server, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/route-feedback';
import { useHealth } from '../lib/use-health';
import { RuntimeNotice } from '../components/runtime-notice';
import { products, money } from '../lib/fixtures';

const bindingLabels: Record<string, string> = {
  documents: 'R2 documents',
  assets: 'Static assets',
  ingestionWorkflow: 'Ingestion workflow',
  tallyConnections: 'Tally Durable Object',
};

export function Component() {
  const { health, refresh } = useHealth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  return <>
    <section className="home-start" aria-label="Workspace start"><PageHeader title="Ready when you are." description="Find the right product. Build your next quotation." />
      <form className="workspace-search" role="search" aria-label="Search sample products" onSubmit={(event) => { event.preventDefault(); const search = query.trim(); navigate(search ? `/catalogue?q=${encodeURIComponent(search)}` : '/catalogue'); }}><label className="sr-only" htmlFor="workspace-product-search">Find a sample product</label><Search size={20} aria-hidden="true" /><input id="workspace-product-search" type="search" placeholder="Search products by name, SKU, or finish" value={query} onChange={(event) => setQuery(event.target.value)} /><button className="icon-button" type="submit" aria-label="Search catalogue"><ArrowRight size={20} aria-hidden="true" /></button></form>
      <nav className="action-chips" aria-label="Quick actions"><Link to="catalogue"><LibraryBig size={17} aria-hidden="true" />Browse catalogue</Link><Link to="quotations"><Files size={17} aria-hidden="true" />Open quotation demo</Link><Link to="tally"><Cable size={17} aria-hidden="true" />Tally connection</Link></nav>
    </section>
    <section className="workspace-panel" aria-labelledby="sample-products-title"><div className="panel-heading"><h2 id="sample-products-title">Sample products</h2><Link to="catalogue" className="text-button">View all<ArrowRight size={16} aria-hidden="true" /></Link></div><div className="sample-products">{products.slice(0, 3).map((product) => <Link key={product.sku} to={`/catalogue?q=${encodeURIComponent(product.sku)}`}><span className={`product-swatch swatch-${product.letter.toLowerCase()}`} aria-hidden="true">{product.letter}</span><span><strong>{product.name}</strong><small>{product.finish}</small></span><span className="sample-price">{money(product.priceMinor)}</span></Link>)}</div></section>
    <section className="health-panel" aria-labelledby="health-title"><div className="section-heading"><div className="inline-heading"><Server size={17} aria-hidden="true" /><h2 id="health-title">Connection</h2></div><button className="button subtle compact" disabled={health.state === 'loading'} onClick={() => void refresh()}><RefreshCw size={15} aria-hidden="true" />Refresh</button></div>
      {health.state === 'loading' ? <div role="status" aria-label="Checking API health" className="health-loading"><span className="sr-only">Checking API health…</span><div className="skeleton" /><div className="skeleton" /></div> : health.state === 'error' ? <div className="health-error" role="alert"><strong>API unavailable</strong><p>Local demos still work. Start the API to check the connection.</p><details className="connection-details"><summary>Connection details</summary><p>{health.message}</p><p>No dependency status is assumed while the API is unreachable.</p></details></div> : <div aria-live="polite"><div className="health-summary"><div><span className={`status-dot ${health.data.status}`} /><strong>{health.data.status === 'ok' ? 'API responding · database reachable' : 'API responding · database needs attention'}</strong></div><span className="muted">Checked {new Date(health.data.checkedAt).toLocaleTimeString()}</span></div><details className="connection-details"><summary>Connection details</summary><div className="dependency-grid"><div><Database size={17} aria-hidden="true" /><span>D1 database<small>Read-only SELECT 1 probe</small></span><strong className={health.data.database.status === 'ok' ? 'text-teal' : 'text-warning'}>{health.data.database.status === 'ok' ? 'Reachable' : health.data.database.status === 'error' ? 'Probe failed' : 'Not configured'}</strong></div>{Object.entries(health.data.bindings).map(([name, value]) => <div key={name}><Layers3 size={17} aria-hidden="true" /><span>{bindingLabels[name]}<small>Binding presence only</small></span><strong>{value === 'configured' ? 'Configured' : 'Not configured'}</strong></div>)}</div></details></div>}
      {health.state === 'loaded' && <RuntimeNotice runtime={health.data.runtime} />}
      <p className="health-footnote"><ShieldCheck size={15} aria-hidden="true" />Infrastructure check only. Sample prices are illustrative; stock is not connected.</p>
    </section>
  </>;
}