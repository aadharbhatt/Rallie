import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { navigation } from '../app/navigation';

export type DialogKind = 'command' | 'help' | null;

export function CommandDialogs({ kind, onClose }: { kind: DialogKind; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const matches = navigation.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase().trim()));

  useEffect(() => {
    const element = dialogRef.current;
    if (!element || !kind) return;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery(''); setActive(0);
    element.showModal();
    if (kind === 'command') searchRef.current?.focus();
    else element.querySelector<HTMLButtonElement>('button')?.focus();
    return () => { element.close(); returnFocus.current?.focus(); };
  }, [kind]);

  function choose(to: string) { onClose(); navigate(to); }

  return <dialog ref={dialogRef} className="command-dialog" aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <div className="dialog-heading"><h2 id="dialog-title">{kind === 'help' ? 'A few useful shortcuts' : 'Where would you like to go?'}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} aria-hidden="true" /></button></div>
    {kind === 'command' ? <>
      <div className="palette-search"><Search size={20} aria-hidden="true" /><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} aria-label="Find a page" placeholder="Search pages…" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="command-results" aria-activedescendant={matches[active] ? `command-${active}` : undefined} onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive((current) => matches.length ? (current + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length : 0); }
        if (event.key === 'Enter' && matches[active]) { event.preventDefault(); choose(matches[active].to); }
      }} /></div>
      <ul className="command-results" id="command-results" role="listbox" aria-label="Pages">{matches.map(({ to, label, detail, icon: Icon }, index) => <li key={to} id={`command-${index}`} role="option" aria-selected={index === active} className={index === active ? 'selected' : ''} onMouseMove={() => setActive(index)} onClick={() => choose(to)}><Icon size={20} aria-hidden="true" /><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight size={16} aria-hidden="true" /></li>)}</ul>
      {matches.length === 0 && <p className="empty-message" role="status">No pages match “{query}”. Try Catalogue or Settings.</p>}
      <div className="dialog-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> to explore · <kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div>
    </> : <div className="shortcut-help"><p>Move around without leaving the keyboard.</p><dl><div><dt>Open page finder</dt><dd><kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd></dd></div><div><dt>Show this help</dt><dd><kbd>?</kbd></dd></div><div><dt>Close a dialog</dt><dd><kbd>Esc</kbd></dd></div><div><dt>Move through controls</dt><dd><kbd>Tab</kbd></dd></div></dl><p className="muted">Page shortcuts are inactive while editing a field. Browser shortcuts such as search, refresh, and new tab are left alone.</p></div>}
  </dialog>;
}