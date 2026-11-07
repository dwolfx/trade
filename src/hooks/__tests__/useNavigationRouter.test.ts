import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNavigationRouter, getNavFromPath } from '../useNavigationRouter';

describe('Hook de Roteamento de Navegação (useNavigationRouter)', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    document.title = 'TradeCraft';
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('mapeia corretamente os caminhos de URL para os itens ativos da navegação', () => {
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

  it('normaliza a rota "/" para "/home" e define o título Bolsa de valores', () => {
    window.history.replaceState({}, '', '/');
    const { result } = renderHook(() => useNavigationRouter());

    expect(result.current.activeNav).toBe('bolsa');
    expect(window.location.pathname).toBe('/home');
    expect(document.title).toBe('Bolsa de valores · TradeCraft');
  });

  it('inicializa na rota "/carteira" quando carregado com o pathname /carteira', () => {
    window.history.replaceState({}, '', '/carteira');
    const { result } = renderHook(() => useNavigationRouter());

    expect(result.current.activeNav).toBe('carteira');
    expect(window.location.pathname).toBe('/carteira');
    expect(document.title).toBe('Carteira · TradeCraft');
  });

  it('atualiza o caminho e o document.title ao navegar entre abas', () => {
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

  it('responde aos eventos de avançar e voltar do navegador (popstate)', () => {
    const { result } = renderHook(() => useNavigationRouter());

    act(() => {
      result.current.setActiveNav('carteira');
    });
    expect(result.current.activeNav).toBe('carteira');

    act(() => {
      window.history.replaceState({}, '', '/noticias');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.activeNav).toBe('noticias');
    expect(document.title).toBe('Notícias · TradeCraft');
  });
});
