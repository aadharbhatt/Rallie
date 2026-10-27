import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigation } from 'react-router-dom';
import { ArrowUpRight, Command, HelpCircle, Search } from 'lucide-react';
import { navigation } from './navigation';
import { CommandDialogs, type DialogKind } from '../components/command-dialogs';
import { RouteSkeleton } from '../components/route-feedback';

function isEditable(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'));
}

export function Shell() {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const location = useLocation();
  const transition = useNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);

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
      if (event.defaultPrevented || event.isComposing || event.repeat || isEditable(event.target)) return;
      if ((event.metaKey || event.ctrlKey) && !(event.metaKey && event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setDialog('command');
      } else if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setDialog('help');
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar">
      <NavLink to="/" className="brand" aria-label="Rallie dashboard"><span className="brand-mark" aria-hidden="true">r.</span>rallie<span className="brand-dot">®</span></NavLink>
      <div className="workspace-label"><span className="workspace-avatar">R</span><div><strong>Local workspace</strong><span>Foundation environment</span></div></div>
      <p className="nav-caption">WORKSPACE</p>
      <nav aria-label="Main navigation">{navigation.map(({ to, label, icon: Icon }) =>
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><Icon size={18} aria-hidden="true" /><span>{label}</span></NavLink>
      )}</nav>
      <div className="sidebar-bottom"><div className="build-note"><span className="tiny-dot" /> A foundation, thoughtfully built.<p>No business data. No connected accounts.</p></div>
        <button className="help-button" onClick={() => setDialog('help')}><HelpCircle size={17} aria-hidden="true" /> Keyboard help <kbd>?</kbd></button>
        <div className="local-identity"><span className="identity-avatar">L</span><div><strong>Local preview</strong><span>Not signed in</span></div><ArrowUpRight size={16} aria-hidden="true" /></div>
      </div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{navigation.find((item) => item.to === location.pathname)?.label ?? 'Not found'}</strong></div>
        <button className="command-trigger" onClick={() => setDialog('command')} aria-label="Open command palette"><Search size={16} aria-hidden="true" /><span>Jump to a page…</span><kbd><Command size={11} aria-hidden="true" /> K</kbd></button>
      </header>
      <div className="preview-banner"><span className="preview-tag">Foundation preview</span><span>Explore the shell. Business screens use demo fixtures; nothing is saved or sent.</span></div>
      <main id="main-content" ref={mainRef} tabIndex={-1} className="main-content">{transition.state === 'loading' ? <RouteSkeleton /> : <Outlet />}</main>
      <footer className="app-footer"><span>RALLIE / FOUNDATION 01</span><span>Built for a clearer working day.</span></footer>
    </div>
    <CommandDialogs kind={dialog} onClose={() => setDialog(null)} />
  </div>;
}