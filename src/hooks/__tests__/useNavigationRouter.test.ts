import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNavigationRouter, getNavFromPath } from '../useNavigationRouter';

describe('useNavigationRouter Hook', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    document.title = 'TradeCraft';
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('correctly maps URL paths to active nav items', () => {
    expect(getNavFromPath('/')).toBe('bolsa');
    expect(getNavFromPath('/home')).toBe('bolsa');
    expect(getNavFromPath('/noticias')).toBe('noticias');
    expect(getNavFromPath('/carteira')).toBe('carteira');
    expect(getNavFromPath('/crypto')).toBe('cripto');
    expect(getNavFromPath('/cripto')).toBe('cripto');
    expect(getNavFromPath('/mapaDividendos')).toBe('dividendos');
    expect(getNavFromPath('/dividendos')).toBe('dividendos');
    expect(getNavFromPath('/daytrade')).toBe('daytrade');
    expect(getNavFromPath('/unknown')).toBe('bolsa');
  });

  it('normalizes "/" to "/home" and sets Bolsa de valores title', () => {
    window.history.replaceState({}, '', '/');
    const { result } = renderHook(() => useNavigationRouter());

    expect(result.current.activeNav).toBe('bolsa');
    expect(window.location.pathname).toBe('/home');
    expect(document.title).toBe('Bolsa de valores · TradeCraft');
  });

  it('initializes to "/carteira" when loaded with /carteira pathname', () => {
    window.history.replaceState({}, '', '/carteira');
    const { result } = renderHook(() => useNavigationRouter());

    expect(result.current.activeNav).toBe('carteira');
    expect(window.location.pathname).toBe('/carteira');
    expect(document.title).toBe('Carteira · TradeCraft');
  });

  it('updates path and document.title when navigating', () => {
    const { result } = renderHook(() => useNavigationRouter());

    act(() => {
      result.current.setActiveNav('noticias');
    });

    expect(result.current.activeNav).toBe('noticias');
    expect(window.location.pathname).toBe('/noticias');
    expect(document.title).toBe('Notícias · TradeCraft');

    act(() => {
      result.current.setActiveNav('cripto');
    });

    expect(result.current.activeNav).toBe('cripto');
    expect(window.location.pathname).toBe('/crypto');
    expect(document.title).toBe('Crypto · TradeCraft');

    act(() => {
      result.current.setActiveNav('dividendos');
    });

    expect(result.current.activeNav).toBe('dividendos');
    expect(window.location.pathname).toBe('/mapaDividendos');
    expect(document.title).toBe('Mapa de Dividendos · TradeCraft');
  });

  it('responds to popstate back/forward browser navigation', () => {
    const { result } = renderHook(() => useNavigationRouter());

    act(() => {
      result.current.setActiveNav('carteira');
    });
    expect(result.current.activeNav).toBe('carteira');

    // Simulate browser back button
    act(() => {
      window.history.replaceState({}, '', '/noticias');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.activeNav).toBe('noticias');
    expect(document.title).toBe('Notícias · TradeCraft');
  });
});
