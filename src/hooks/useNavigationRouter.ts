import { useState, useEffect, useCallback } from 'react';
import { ActiveNav } from '../types/market';

export interface RouteConfig {
  path: string;
  title: string;
}

export const ROUTE_MAP: Record<ActiveNav, RouteConfig> = {
  bolsa: { path: '/home', title: 'Bolsa de valores' },
  noticias: { path: '/noticias', title: 'Notícias' },
  carteira: { path: '/carteira', title: 'Carteira' },
  cripto: { path: '/crypto', title: 'Crypto' },
  dividendos: { path: '/mapaDividendos', title: 'Mapa de Dividendos' },
  daytrade: { path: '/daytrade', title: 'Day Trade' },
  heatmap: { path: '/heatmap', title: 'Mapa de Mercado' },
};

export const getNavFromPath = (path: string): ActiveNav => {
  const normalized = (path || '').toLowerCase().replace(/\/$/, '') || '/';

  switch (normalized) {
    case '/home':
    case '/bolsa':
    case '/':
      return 'bolsa';
    case '/noticias':
      return 'noticias';
    case '/carteira':
    case '/portfolio':
      return 'carteira';
    case '/crypto':
    case '/cripto':
      return 'cripto';
    case '/mapadividendos':
    case '/dividendos':
      return 'dividendos';
    case '/daytrade':
      return 'daytrade';
    case '/heatmap':
    case '/mapa':
    case '/mapa-mercado':
      return 'heatmap';
    default:
      return 'bolsa';
  }
};

export const getDocumentTitle = (nav: ActiveNav): string => {
  return `${ROUTE_MAP[nav].title} · TradeCraft`;
};

export function useNavigationRouter(defaultNav?: ActiveNav) {
  const [activeNav, setActiveNavState] = useState<ActiveNav>(() => {
    if (defaultNav) return defaultNav;
    if (typeof window !== 'undefined') {
      return getNavFromPath(window.location.pathname);
    }
    return 'bolsa';
  });

  const navigate = useCallback((nav: ActiveNav) => {
    setActiveNavState(nav);
    if (typeof window !== 'undefined') {
      const targetRoute = ROUTE_MAP[nav];
      if (window.location.pathname !== targetRoute.path) {
        window.history.pushState({ nav }, '', targetRoute.path);
      }
      document.title = getDocumentTitle(nav);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect path on mount
    const detectedNav = getNavFromPath(window.location.pathname);
    setActiveNavState(detectedNav);

    const targetRoute = ROUTE_MAP[detectedNav];
    // If user opened "/" or an alias like "/cripto", normalize URL to target official path
    if (window.location.pathname !== targetRoute.path) {
      window.history.replaceState({ nav: detectedNav }, '', targetRoute.path);
    }
    document.title = getDocumentTitle(detectedNav);

    const handlePopState = () => {
      const currentNav = getNavFromPath(window.location.pathname);
      setActiveNavState(currentNav);
      document.title = getDocumentTitle(currentNav);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return { activeNav, setActiveNav: navigate };
}
