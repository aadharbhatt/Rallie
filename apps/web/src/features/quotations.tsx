import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FileText, Info } from 'lucide-react';
import { calculateLine } from '../../../../packages/domain/src/index';
import { PageHeader } from '../components/route-feedback';
import { money, products } from '../lib/fixtures';

const examples = [
  { title: 'Sample bathroom', reference: 'FIXTURE / 001', product: products[0], note: 'An illustrative bathroom selection, not a customer quotation.' },
  { title: 'Sample accessories', reference: 'FIXTURE / 002', product: products[3], note: 'A second layout fixture to demonstrate switching between tabs.' },
];

export function Component() {
  const [selected, setSelected] = useState(0);
  const [inputs, setInputs] = useState(examples.map(() => ({ quantity: '2', discount: '10' })));
  const example = examples[selected]!;
  const input = inputs[selected]!;
  const quantity = Number(input.quantity);
  const discount = Number(input.discount);
  const valid = /^\d+$/.test(input.quantity) && Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 10_000 && /^\d+(\.\d{1,2})?$/.test(input.discount) && discount >= 0 && discount <= 100;
  const line = valid ? calculateLine({ quantity, unitPriceMinor: example.product.priceMinor, discountBps: Math.round(discount * 100), unitCostMinor: example.product.costMinor }) : null;
  function update(field: 'quantity' | 'discount', value: string) { setInputs((previous) => previous.map((entry, index) => index === selected ? { ...entry, [field]: value } : entry)); }

  return <><PageHeader title="Quotations" description="Adjust quantities and discounts. See totals as you work." />
    <div className="notice"><strong>Layout demo · fixture data</strong><span>In-memory examples only. No save, sharing, approval, PDF, or persistence.</span></div>
    <Tabs.Root asChild value={String(selected)} onValueChange={(value) => setSelected(Number(value))} activationMode="automatic"><section className="quote-workspace" aria-label="Quotation layout demo"><Tabs.List className="quote-tabs" aria-label="Demo quotations">{examples.map((item, index) => <Tabs.Trigger key={item.reference} value={String(index)}><FileText size={16} aria-hidden="true" />{item.title}<span className="tab-dot" aria-hidden="true" /></Tabs.Trigger>)}</Tabs.List>
      {examples.map((item, index) => <Tabs.Content key={item.reference} value={String(index)} className="quote-layout"><div className="quote-editor"><div className="quote-title"><div><p className="eyebrow">{example.reference}</p><h2>{example.title}</h2></div><span className="pill neutral">Demo only</span></div><p className="muted">{example.note}</p><div className="quote-customer"><span className="eyebrow">CUSTOMER</span><strong>No customer attached</strong><span>Identity and business data are not implemented.</span></div>
        <div className="section-heading"><h3>Preview line item</h3><span className="muted">1 fixture</span></div><div className="quote-product"><span className="product-swatch">{example.product.letter}</span><div><strong>{example.product.name}</strong><span>{example.product.sku} · {example.product.finish}</span></div><strong>{money(example.product.priceMinor)}<small>per unit</small></strong></div>
        <div className="price-inputs"><label>Quantity<input type="number" min="1" max="10000" step="1" value={input.quantity} onChange={(event) => update('quantity', event.target.value)} aria-invalid={!valid} aria-describedby="pricing-rules" /></label><label>Discount (%)<input type="number" min="0" max="100" step="0.01" value={input.discount} onChange={(event) => update('discount', event.target.value)} aria-invalid={!valid} aria-describedby="pricing-rules" /></label></div><p id="pricing-rules" className={valid ? 'field-hint' : 'field-error'} role={valid ? undefined : 'alert'}>Use a whole quantity from 1–10,000 and a discount from 0–100% with up to two decimals.</p>
        <div className="quote-note"><Info size={18} aria-hidden="true" /><p>Try adjusting quantity or discount. This calculator uses integer paise and rounds the discount half up, once per line. Changes last only while this page is open.</p></div>
      </div><aside className="quote-summary" aria-label="Pricing preview"><h2>Pricing preview</h2><p>Illustrative amounts in INR</p><div aria-live="polite" aria-atomic="true">{line ? <><dl className="totals"><div><dt>Line subtotal</dt><dd>{money(line.grossMinor)}</dd></div><div><dt>Discount ({discount}%)</dt><dd>−{money(line.discountMinor)}</dd></div><div className="total-row"><dt>Preview total</dt><dd data-testid="quote-total">{money(line.totalMinor)}</dd></div></dl><div className="cost-preview"><div><span>Fixture cost</span><strong>{money(line.costMinor!)}</strong></div><div><span>Illustrative profit</span><strong>{money(line.profitMinor!)}</strong></div></div></> : <p className="field-error">Enter valid values to see the pricing preview.</p>}</div><div className="summary-disclaimer"><Info size={16} aria-hidden="true" /><p>No tax, freight, or invoice rounding is applied. This is not a payable quote or a business record.</p></div></aside></Tabs.Content>)}
    </section></Tabs.Root></>;
}