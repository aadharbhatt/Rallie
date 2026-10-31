import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { navigation } from '../app/navigation';
import { Dialog } from './ui/dialog';

export type DialogKind = 'command' | 'help' | null;

export function CommandDialogs({ kind, onClose, shortcutsEnabled, onShortcutsChange }: { kind: DialogKind; onClose: () => void; shortcutsEnabled: boolean; onShortcutsChange: (enabled: boolean) => void }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const navigating = useRef(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const matches = navigation.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase().trim()));

  useEffect(() => {
    setQuery(''); setActive(0);
    if (kind === 'command') searchRef.current?.focus();
  }, [kind]);

  function choose(to: string) { navigating.current = to !== window.location.pathname; onClose(); navigate(to); }

  return <Dialog open={kind !== null} onOpenChange={(open) => { if (!open) onClose(); }} title={kind === 'help' ? 'A few useful shortcuts' : 'Where would you like to go?'} description={kind === 'help' ? 'Keyboard shortcuts for navigation and workspace controls.' : 'Search pages, use the arrow keys to explore, and press Enter to open.'} onOpenAutoFocus={(event) => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    navigating.current = false;
    if (kind === 'command') { event.preventDefault(); searchRef.current?.focus(); }
  }} onCloseAutoFocus={(event) => {
    event.preventDefault();
    if (!navigating.current && returnFocus.current?.isConnected) returnFocus.current.focus();
  }}>
    {kind === 'command' ? <>
      <div className="palette-search"><Search size={20} aria-hidden="true" /><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} aria-label="Find a page" placeholder="Search pages…" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="command-results" aria-activedescendant={matches[active] ? `command-${active}` : undefined} onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive((current) => matches.length ? (current + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length : 0); }
        if (event.key === 'Enter' && matches[active]) { event.preventDefault(); choose(matches[active].to); }
      }} /></div>
      <ul className="command-results" id="command-results" role="listbox" aria-label="Pages">{matches.map(({ to, label, detail, icon: Icon }, index) => <li key={to} id={`command-${index}`} role="option" aria-selected={index === active} className={index === active ? 'selected' : ''} onMouseMove={() => setActive(index)} onClick={() => choose(to)}><Icon size={20} aria-hidden="true" /><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight size={16} aria-hidden="true" /></li>)}</ul>
      {matches.length === 0 && <p className="empty-message" role="status">No pages match “{query}”. Try Catalogue or Settings.</p>}
      <div className="dialog-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> to explore · <kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div>
    </> : <div className="shortcut-help"><p>Move around without leaving the keyboard.</p><dl><div><dt>Open page finder</dt><dd><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd></dd></div><div><dt>Toggle desktop sidebar</dt><dd><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>B</kbd></dd></div><div><dt>Show this help</dt><dd><kbd>?</kbd></dd></div><div><dt>Close a dialog</dt><dd><kbd>Esc</kbd></dd></div><div><dt>Move through controls</dt><dd><kbd>Tab</kbd></dd></div></dl><label><input type="checkbox" checked={shortcutsEnabled} onChange={(event) => onShortcutsChange(event.target.checked)} /> Enable navigation shortcuts for this workspace visit</label><p className="muted">Navigation shortcuts do not interrupt editable fields or composition. Page-finder and help buttons always work. Browser search, refresh, and new-tab shortcuts are left alone. This preference is not saved to an account.</p></div>}
  </Dialog>;
}