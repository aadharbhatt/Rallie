import { createBrowserRouter } from 'react-router-dom';
import { Shell } from './shell';
import { RouteError, RouteSkeleton } from '../components/route-feedback';
import { navigation } from './navigation';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Shell,
    ErrorBoundary: RouteError,
    HydrateFallback: RouteSkeleton,
    children: [
      ...navigation.map((item) => item.to === '/' ? { index: true as const, lazy: item.load } : { path: item.to.slice(1), lazy: item.load }),
      { path: '*', lazy: () => import('../features/not-found') },
    ],
  },
]);