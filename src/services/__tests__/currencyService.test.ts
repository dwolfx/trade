import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLiveUsdRate, isRateSane, resetUsdRateCache } from '../currencyService';

describe('Serviço de Cotação de Moeda com Travas de Segurança (currencyService)', () => {
  beforeEach(() => {
    resetUsdRateCache();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('valida a sanidade da cotação com travas superior e inferior (isRateSane)', () => {
    expect(isRateSane(5.50)).toBe(true);
    expect(isRateSane(2.50)).toBe(true);
    expect(isRateSane(15.00)).toBe(true);

    // Valores anômalos que devem ser rejeitados imediatamente
    expect(isRateSane(0)).toBe(false);
    expect(isRateSane(-5)).toBe(false);
    expect(isRateSane(1.99)).toBe(false);
    expect(isRateSane(15.01)).toBe(false);
    expect(isRateSane(NaN)).toBe(false);
    expect(isRateSane(Infinity)).toBe(false);
  });

  it('busca a cotação ao vivo do Dólar através da trava primária (Binance USDTBRL)', async () => {
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

  it('aciona a trava secundária (Yahoo Finance) quando a Binance falhar', async () => {
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

  it('aciona a trava terciária (AwesomeAPI) se Binance e Yahoo falharem', async () => {
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

  it('utiliza fallback seguro ou cache de contingência se toda a rede estiver indisponível', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Rede indisponível'));

    const result = await getLiveUsdRate();

    expect(result.source).toBe('FALLBACK');
    expect(result.rate).toBe(5.52);
    expect(result.formattedRate).toBe('R$ 5.52');
  });

  it('utiliza cache em memória para chamadas consecutivas dentro do intervalo TTL', async () => {
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
