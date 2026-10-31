import { createBrowserRouter } from 'react-router-dom';
import { Shell } from './shell';
import { RouteError, RouteSkeleton } from '../components/route-feedback';
import { navigation } from './navigation';
import { LazyPage } from '../components/lazy-page';

const loadNotFound = () => import('../features/not-found');

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Shell,
    ErrorBoundary: RouteError,
    HydrateFallback: RouteSkeleton,
    children: [
      ...navigation.map((item) => ({
        ...(item.to === '/' ? { index: true as const } : { path: item.to.slice(1) }),
        element: <LazyPage key={item.to} load={item.load} />,
      })),
      { path: '*', element: <LazyPage load={loadNotFound} /> },
    ],
  },
]);