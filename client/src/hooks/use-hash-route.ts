import { useEffect, useState } from 'react';

/**
 * Minimal hash router.
 *
 * The site is a single public page plus an admin screen, so a full router
 * dependency would cost more than it returns. Hash routing also means the admin
 * screen needs no server rewrite rules to deploy behind static hosting.
 *
 * @returns the current route, e.g. `home` for `#/` and `admin` for `#/admin`.
 */

export type Route = 'home' | 'admin';

const readRoute = (): Route => (window.location.hash.startsWith('#/admin') ? 'admin' : 'home');

export const useHashRoute = (): [Route, (route: Route) => void] => {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const navigate = (next: Route) => {
    window.location.hash = next === 'admin' ? '#/admin' : '#/';
    setRoute(next);
  };

  return [route, navigate];
};
