import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '../components/route-feedback';
import { money, products } from '../lib/fixtures';

export function Component() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const filtered = useMemo(() => products.filter((product) => (category === 'All categories' || product.category === category) && `${product.name} ${product.sku} ${product.finish} ${product.collection}`.toLowerCase().includes(query.trim().toLowerCase())), [query, category]);
  return <><PageHeader eyebrow="A LITTLE ORDER GOES A LONG WAY" title="Catalogue" description="Find the right detail, without the noise." />
    <div className="notice"><strong>Demo catalogue</strong><span>Six local fixtures for interface exploration. No server search, stock, price-list ingestion, or persistence.</span></div>
    <section className="table-panel" aria-label="Demo product catalogue"><div className="catalogue-toolbar"><div className="search-field"><Search size={18} aria-hidden="true" /><input aria-label="Search demo catalogue" placeholder="Search name, sample SKU, or finish…" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button className="text-button" onClick={() => setQuery('')}>Clear</button>}</div><label className="filter-field"><SlidersHorizontal size={16} aria-hidden="true" /><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option><option>Basin mixers</option><option>Shower fittings</option><option>Accessories</option></select></label></div>
      <div className="table-caption"><span role="status">{filtered.length} demo {filtered.length === 1 ? 'product' : 'products'}</span><span>Illustrative prices · INR</span></div>
      <div className="table-scroll"><table><caption className="sr-only">Local demo products and illustrative prices</caption><thead><tr><th scope="col">Product</th><th scope="col">Sample SKU</th><th scope="col">Finish</th><th scope="col">Category</th><th scope="col" className="align-right">Demo unit price</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.sku}><td><div className="product-cell"><span className={`product-swatch swatch-${product.letter.toLowerCase()}`} aria-hidden="true">{product.letter}</span><span><strong>{product.name}</strong><small>{product.collection}</small></span></div></td><td className="mono">{product.sku}</td><td>{product.finish}</td><td>{product.category}</td><td className="align-right price">{money(product.priceMinor)}</td></tr>)}</tbody></table></div>
      {filtered.length === 0 && <div className="empty-state"><Search size={30} aria-hidden="true" /><h2>No demo products found</h2><p>Try another name, SKU, finish, or category.</p><button className="button" onClick={() => { setQuery(''); setCategory('All categories'); }}>Reset filters</button></div>}
      <div className="table-bottom">Fixtures stay in this preview. Refreshing does not load business data.</div>
    </section></>;
}