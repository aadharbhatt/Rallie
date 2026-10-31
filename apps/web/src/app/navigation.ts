import { LayoutDashboard, LibraryBig, Files, Cable, Settings2 } from 'lucide-react';

export const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, detail: 'Workspace overview & API health', load: () => import('../features/dashboard') },
  { to: '/catalogue', label: 'Catalogue', icon: LibraryBig, detail: 'Find and inspect demo products', load: () => import('../features/catalogue') },
  { to: '/quotations', label: 'Quotations', icon: Files, detail: 'Tabbed editor & live pricing preview', load: () => import('../features/quotations') },
  { to: '/tally', label: 'Tally', icon: Cable, detail: 'Integration scope & availability', load: () => import('../features/tally') },
  { to: '/settings', label: 'Settings', icon: Settings2, detail: 'Preview boundaries & preferences', load: () => import('../features/settings') },
];

/** Navigation is not authorization. Every domain screen is a fixture/information preview. */
export const moduleAvailability = {
  '/': 'foundation', '/catalogue': 'fixture_preview', '/quotations': 'fixture_preview',
  '/tally': 'unavailable', '/settings': 'information_only',
} as const;

export function prefetchPage(load: () => Promise<unknown>) {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (!connection?.saveData) void load().catch(() => {});
}