import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { navigation } from './navigation';
import { CommandDialogs, type DialogKind } from '../components/command-dialogs';
import { RouteSkeleton } from '../components/route-feedback';
import { Tooltip, TooltipProvider } from '../components/ui/tooltip';

function isEditable(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'));
}

export function Shell() {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const transition = useNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);
  const pageName = navigation.find((item) => item.to === location.pathname)?.label ?? 'Not found';

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      mainRef.current?.focus();
    }
    const name = navigation.find((item) => item.to === location.pathname)?.label ?? 'Not found';
    document.title = `${name} · Rallie foundation`;
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      if ((event.metaKey || event.ctrlKey) && !(event.metaKey && event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setDialog('command');
      } else if ((event.metaKey || event.ctrlKey) && !(event.metaKey && event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'b' && !isEditable(event.target)) {
        event.preventDefault();
        setSidebarCollapsed((value) => !value);
      } else if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target)) {
        event.preventDefault();
        setDialog('help');
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return <TooltipProvider delayDuration={350}><div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar" id="workspace-sidebar">
      <div className="sidebar-brand-row">
        <NavLink to="/" className="brand" aria-label="Rallie dashboard"><span className="brand-mark" aria-hidden="true">r.</span><span className="brand-word">rallie</span></NavLink>
        <Tooltip label="Toggle sidebar (⌘/Ctrl B)" side="right"><button type="button" className="icon-button sidebar-toggle" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed} aria-controls="workspace-sidebar" onClick={() => setSidebarCollapsed((value) => !value)}>{sidebarCollapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}</button></Tooltip>
      </div>
      <Tooltip label="Find a page (⌘/Ctrl K)" side="right"><button type="button" className="command-trigger" onClick={() => setDialog('command')} aria-label="Open command palette" aria-haspopup="dialog" aria-expanded={dialog === 'command'}><Search size={18} aria-hidden="true" /><span>Find a page…</span><kbd aria-hidden="true">⌘/Ctrl K</kbd></button></Tooltip>
      <p className="workspace-context">Local workspace</p>
      <nav aria-label="Main navigation">{navigation.map(({ to, label, icon: Icon, load }) =>
        <Tooltip key={to} label={label} side="right"><NavLink to={to} end={to === '/'} aria-label={label} onMouseEnter={() => void load().catch(() => {})} onFocus={() => void load().catch(() => {})} className={`nav-item${location.pathname === to ? ' active' : ''}`}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink></Tooltip>
      )}</nav>
      <div className="sidebar-bottom">
        <div className="local-identity"><span className="identity-avatar">L</span><div><strong>Local session</strong><span>Not signed in</span></div></div>
      </div>
    </aside>
    <div className="main-shell">
      <main id="main-content" ref={mainRef} tabIndex={-1} className={`main-content${location.pathname === '/' ? ' main-content-home' : ''}${['/settings', '/tally'].includes(location.pathname) ? ' main-content-reading' : ''}`}>{transition.state === 'loading' ? <RouteSkeleton /> : <Outlet />}</main>
      <footer className="app-footer">
        <nav aria-label="Current page"><Link className="status-item status-location" to={`${location.pathname}${location.search}${location.hash}`} aria-current="page"><span className="footer-root">Workspace<span className="footer-separator" aria-hidden="true">/</span></span><span>{pageName}</span></Link></nav>
        <button type="button" className="status-item" aria-label="Keyboard shortcuts" aria-haspopup="dialog" aria-expanded={dialog === 'help'} onClick={() => setDialog('help')}>Keyboard shortcuts <kbd aria-hidden="true">?</kbd></button>
      </footer>
    </div>
    <CommandDialogs kind={dialog} onClose={() => setDialog(null)} />
  </div></TooltipProvider>;
}