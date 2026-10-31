import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigation } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { moduleAvailability, navigation, prefetchPage } from './navigation';
import { CommandDialogs, type DialogKind } from '../components/command-dialogs';
import { RouteSkeleton } from '../components/route-feedback';
import { Tooltip, TooltipProvider } from '../components/ui/tooltip';
import { Dialog } from '../components/ui/dialog';
import { WorkspaceStatus } from '../components/workspace-status';
import { HealthContext, useHealthRequest } from '../lib/use-health';

function isEditable(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'));
}

export function Shell() {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const health = useHealthRequest();
  const location = useLocation();
  const transition = useNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const mobileNavigating = useRef(false);
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
    const media = window.matchMedia('(max-width: 760px)');
    function resize() {
      setMobileOpen(false);
      const active = document.activeElement;
      if (active?.closest('.mobile-navigation') || active?.closest('.sidebar-toggle') || active === mobileTrigger.current) {
        if (media.matches) mobileTrigger.current?.focus();
        else mainRef.current?.focus();
      }
    }
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!shortcutsEnabled || event.defaultPrevented || event.isComposing || event.repeat) return;
      if (isEditable(event.target) || mobileOpen || dialog) return;
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
  }, [shortcutsEnabled, mobileOpen, dialog]);

  return <HealthContext.Provider value={health}><TooltipProvider delayDuration={350}><div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar" id="workspace-sidebar">
      <div className="sidebar-brand-row">
        <NavLink to="/" className="brand" aria-label="Rallie dashboard"><span className="brand-mark" aria-hidden="true">r.</span><span className="brand-word">rallie</span></NavLink>
        <Tooltip label="Toggle sidebar (⌘/Ctrl B)" side="right"><button type="button" className="icon-button sidebar-toggle" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed} aria-controls="workspace-sidebar" onClick={() => setSidebarCollapsed((value) => !value)}>{sidebarCollapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}</button></Tooltip>
      </div>
      <Tooltip label="Find a page (⌘/Ctrl K)" side="right"><button type="button" className="command-trigger" onClick={() => setDialog('command')} aria-label="Open command palette" aria-haspopup="dialog" aria-expanded={dialog === 'command'}><Search size={18} aria-hidden="true" /><span>Find a page…</span><kbd aria-hidden="true">⌘/Ctrl K</kbd></button></Tooltip>
      <button ref={mobileTrigger} type="button" className="icon-button mobile-navigation-trigger" aria-label="Open navigation" aria-haspopup="dialog" aria-expanded={mobileOpen} onClick={() => { mobileNavigating.current = false; setMobileOpen(true); }}><Menu size={20} aria-hidden="true" /></button>
      <p className="workspace-context">Local workspace</p>
      <nav aria-label="Main navigation">{navigation.map(({ to, label, icon: Icon, load }) =>
        <Tooltip key={to} label={label} side="right"><NavLink to={to} end={to === '/'} aria-label={label} onMouseEnter={() => prefetchPage(load)} onFocus={() => prefetchPage(load)} className={`nav-item${location.pathname === to ? ' active' : ''}`}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink></Tooltip>
      )}</nav>
      <div className="sidebar-bottom">
        <div className="local-identity"><span className="identity-avatar">L</span><div><strong>Local session</strong><span>Not signed in</span></div></div>
      </div>
    </aside>
    <div className="main-shell">
      <main id="main-content" ref={mainRef} tabIndex={-1} className={`main-content${location.pathname === '/' ? ' main-content-home' : ''}${['/settings', '/tally'].includes(location.pathname) ? ' main-content-reading' : ''}`}>
        <WorkspaceStatus />
        {location.pathname !== '/' && location.pathname in moduleAvailability && <p className="preview-notice">Foundation preview — {moduleAvailability[location.pathname as keyof typeof moduleAvailability] === 'fixture_preview' ? 'sample data only; changes are not saved.' : 'this module has no operational service yet.'} No authenticated business, live catalogue, quotation saving, or accounting actions.</p>}
        {transition.state === 'loading' ? <RouteSkeleton /> : <Outlet />}
      </main>
      <footer className="app-footer">
        <nav aria-label="Current page"><Link className="status-item status-location" to={`${location.pathname}${location.search}${location.hash}`} aria-current="page"><span className="footer-root">Workspace<span className="footer-separator" aria-hidden="true">/</span></span><span>{pageName}</span></Link></nav>
        <button type="button" className="status-item" aria-label="Keyboard shortcuts" aria-haspopup="dialog" aria-expanded={dialog === 'help'} onClick={() => setDialog('help')}>Keyboard shortcuts <kbd aria-hidden="true">?</kbd></button>
      </footer>
    </div>
    <Dialog open={mobileOpen} onOpenChange={setMobileOpen} className="mobile-navigation" title="Workspace navigation" description="Open a workspace preview page." onCloseAutoFocus={(event) => {
      event.preventDefault();
      if (mobileNavigating.current || !window.matchMedia('(max-width: 760px)').matches) mainRef.current?.focus();
      else mobileTrigger.current?.focus();
    }}>
      <nav aria-label="Mobile navigation">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className="nav-item" onClick={() => { mobileNavigating.current = true; setMobileOpen(false); }}><Icon size={20} aria-hidden="true" />{label}</NavLink>)}</nav>
    </Dialog>
    <CommandDialogs kind={dialog} onClose={() => setDialog(null)} shortcutsEnabled={shortcutsEnabled} onShortcutsChange={setShortcutsEnabled} />
  </div></TooltipProvider></HealthContext.Provider>;
}