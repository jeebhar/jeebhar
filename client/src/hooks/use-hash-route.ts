import { useEffect, useState } from 'react';

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
