import { describe, it, expect, vi, afterEach } from 'vitest';
import { getB3MarketStatus } from '../marketStatus';

describe('Status de Negociação do Mercado B3 (marketStatus)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve indicar FECHADO aos finais de semana (Domingo)', () => {
    vi.setSystemTime(new Date('2026-10-25T14:00:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(false);
    expect(status.badgeText).toContain('FIM DE SEMANA');
  });

  it('deve indicar FECHADO antes das 10:00 em dias úteis', () => {
    vi.setSystemTime(new Date('2026-10-22T08:30:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(false);
    expect(status.badgeText).toContain('ABRE ÀS 10:00');
  });

  it('deve indicar ABERTO durante o pregão regular da B3 (14:30)', () => {
    vi.setSystemTime(new Date('2026-10-22T14:30:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(true);
    expect(status.badgeText).toContain('B3 ABERTA');
  });

  it('deve indicar FECHADO após o fechamento do pregão às 17:00', () => {
    vi.setSystemTime(new Date('2026-10-22T20:30:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(false);
    expect(status.badgeText).toContain('ENCERRADO ÀS 17:00');
  });
});
