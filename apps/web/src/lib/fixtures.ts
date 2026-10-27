/** Illustrative local fixtures. Never presented as persisted catalogue records. */
export const products = [
  { sku: 'DEMO-BM-101', name: 'Arc basin mixer', category: 'Basin mixers', collection: 'Arc collection', finish: 'Brushed nickel', priceMinor: 425_000, costMinor: 305_000, letter: 'A' },
  { sku: 'DEMO-SH-204', name: 'Rain overhead shower', category: 'Shower fittings', collection: 'Rain collection', finish: 'Chrome', priceMinor: 285_000, costMinor: 195_000, letter: 'R' },
  { sku: 'DEMO-DV-310', name: 'Line diverter trim', category: 'Shower fittings', collection: 'Line collection', finish: 'Matte black', priceMinor: 365_000, costMinor: 260_000, letter: 'L' },
  { sku: 'DEMO-AC-408', name: 'Form towel rail', category: 'Accessories', collection: 'Form collection', finish: 'Brushed nickel', priceMinor: 145_000, costMinor: 95_000, letter: 'F' },
  { sku: 'DEMO-BM-112', name: 'Arc tall basin mixer', category: 'Basin mixers', collection: 'Arc collection', finish: 'Chrome', priceMinor: 565_000, costMinor: 410_000, letter: 'A' },
  { sku: 'DEMO-AC-420', name: 'Form robe hook', category: 'Accessories', collection: 'Form collection', finish: 'Matte black', priceMinor: 65_000, costMinor: 40_000, letter: 'F' },
] as const;

export function money(minor: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(minor / 100);
}