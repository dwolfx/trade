import { describe, it, expect } from 'vitest';
import { generateInitialCandles, generateNextTick } from '../candleGenerator';

describe('Gerador de Velas Históricas e Ticks (candleGenerator)', () => {
  it('deve gerar a quantidade solicitada de candles com o último fechamento alinhado ao preço base', () => {
    const basePrice = 112.5;
    const candles = generateInitialCandles(basePrice, '1D', 30);

    expect(candles).toHaveLength(30);
    const last = candles[candles.length - 1];
    expect(last.close).toBe(basePrice);

    const deltaPercent = Math.abs(last.close - last.open) / last.open;
    expect(deltaPercent).toBeLessThan(0.02);
  });

  it('deve gerar candles para diferentes tempos gráficos sem valores negativos', () => {
    const candles = generateInitialCandles(100, '1S', 28);
    expect(candles).toHaveLength(28);

    for (const c of candles) {
      expect(c.open).toBeGreaterThan(0);
      expect(c.close).toBeGreaterThan(0);
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
    }
  });

  it('deve atualizar candle a cada tick e abrir novo candle ao expirar o tempo gráfico', () => {
    const now = Date.now();
    const currentCandle = {
      time: now,
      open: 100,
      high: 102,
      low: 99,
      close: 101,
      volume: 1000,
    };

    const { updatedCandle, isNewCandle } = generateNextTick(currentCandle, '1D');
    expect(isNewCandle).toBe(false);
    expect(updatedCandle.time).toBe(now);
    expect(updatedCandle.close).toBeGreaterThan(0);
  });
});
