import { describe, it, expect, vi, afterEach } from 'vitest';
import { getB3MarketStatus } from '../marketStatus';

describe('marketStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should report CLOSED on weekends (Sunday)', () => {
    // 2026-10-25 is Sunday
    vi.setSystemTime(new Date('2026-10-25T14:00:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(false);
    expect(status.badgeText).toContain('FIM DE SEMANA');
  });

  it('should report CLOSED before 10:00 AM on weekdays', () => {
    // 2026-10-22 is Thursday, 08:30 AM Brasília
    vi.setSystemTime(new Date('2026-10-22T08:30:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(false);
    expect(status.badgeText).toContain('ABRE ÀS 10:00');
  });

  it('should report OPEN during trading hours (14:30 PM)', () => {
    // 2026-10-22 Thursday, 14:30 PM Brasília
    vi.setSystemTime(new Date('2026-10-22T14:30:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(true);
    expect(status.badgeText).toContain('B3 ABERTA');
  });

  it('should report CLOSED after 17:00 PM', () => {
    // 2026-10-22 Thursday, 20:30 PM Brasília
    vi.setSystemTime(new Date('2026-10-22T20:30:00-03:00'));
    const status = getB3MarketStatus();
    expect(status.isOpen).toBe(false);
    expect(status.badgeText).toContain('ENCERRADO ÀS 17:00');
  });
});
