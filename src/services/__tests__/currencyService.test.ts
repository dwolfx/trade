import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLiveUsdRate, isRateSane, resetUsdRateCache } from '../currencyService';

describe('currencyService - Live USD/BRL Rate with Guardrails (Travas)', () => {
  beforeEach(() => {
    resetUsdRateCache();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates rate sanity with upper and lower guardrails (isRateSane)', () => {
    expect(isRateSane(5.50)).toBe(true);
    expect(isRateSane(2.50)).toBe(true);
    expect(isRateSane(15.00)).toBe(true);

    // Unsafe values that must be rejected
    expect(isRateSane(0)).toBe(false);
    expect(isRateSane(-5)).toBe(false);
    expect(isRateSane(1.99)).toBe(false); // Too low for USD/BRL
    expect(isRateSane(15.01)).toBe(false); // Too high / anomaly
    expect(isRateSane(NaN)).toBe(false);
    expect(isRateSane(Infinity)).toBe(false);
  });

  it('fetches live USD rate from Primary Guardrail (Binance USDTBRL)', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ symbol: 'USDTBRL', price: '5.5432' }),
    } as any);

    const result = await getLiveUsdRate();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.rate).toBe(5.5432);
    expect(result.source).toBe('BINANCE_LIVE');
    expect(result.formattedRate).toBe('R$ 5.54');
  });

  it('falls back to Secondary Guardrail (Yahoo Finance) when Binance fails', async () => {
    // Binance fails, Yahoo succeeds
    const mockFetch = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('Binance timeout'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          chart: {
            result: [
              {
                meta: { regularMarketPrice: 5.5180 },
              },
            ],
          },
        }),
      } as any);

    const result = await getLiveUsdRate();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.rate).toBe(5.5180);
    expect(result.source).toBe('YAHOO_LIVE');
    expect(result.formattedRate).toBe('R$ 5.52');
  });

  it('falls back to Tertiary Guardrail (AwesomeAPI) when Binance and Yahoo fail', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('Binance offline'))
      .mockRejectedValueOnce(new Error('Yahoo 404'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          USDBRL: { bid: '5.5250' },
        }),
      } as any);

    const result = await getLiveUsdRate();

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.rate).toBe(5.5250);
    expect(result.source).toBe('AWESOME_API');
    expect(result.formattedRate).toBe('R$ 5.53');
  });

  it('falls back to localStorage or Safe Default when all networks are offline', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('All networks down'));

    // With no localStorage saved, should return safe default
    const result = await getLiveUsdRate();

    expect(result.source).toBe('FALLBACK');
    expect(result.rate).toBe(5.52);
    expect(result.formattedRate).toBe('R$ 5.52');
  });

  it('uses memory cache for consecutive calls within TTL window', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ symbol: 'USDTBRL', price: '5.5500' }),
    } as any);

    const call1 = await getLiveUsdRate();
    const call2 = await getLiveUsdRate();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(call1.rate).toBe(call2.rate);
  });
});
