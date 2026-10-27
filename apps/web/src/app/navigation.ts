import { LayoutDashboard, LibraryBig, Files, Cable, Settings2 } from 'lucide-react';

export const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, detail: 'Foundation overview & API health' },
  { to: '/catalogue', label: 'Catalogue', icon: LibraryBig, detail: 'Search local product fixtures' },
  { to: '/quotations', label: 'Quotations', icon: Files, detail: 'Explore a pricing layout demo' },
  { to: '/tally', label: 'Tally', icon: Cable, detail: 'Integration scope & availability' },
  { to: '/settings', label: 'Settings', icon: Settings2, detail: 'Preview boundaries & preferences' },
];