import { createBrowserRouter } from 'react-router-dom';
import { Shell } from './shell';
import { RouteError, RouteSkeleton } from '../components/route-feedback';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Shell,
    ErrorBoundary: RouteError,
    HydrateFallback: RouteSkeleton,
    children: [
      { index: true, lazy: () => import('../features/dashboard') },
      { path: 'catalogue', lazy: () => import('../features/catalogue') },
      { path: 'quotations', lazy: () => import('../features/quotations') },
      { path: 'tally', lazy: () => import('../features/tally') },
      { path: 'settings', lazy: () => import('../features/settings') },
      { path: '*', lazy: () => import('../features/not-found') },
    ],
  },
]);