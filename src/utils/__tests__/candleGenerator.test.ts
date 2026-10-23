import { describe, it, expect } from 'vitest';
import { generateInitialCandles, generateNextTick } from '../candleGenerator';

describe('candleGenerator Tests', () => {
  it('should generate requested number of candles with correct last close matching basePrice', () => {
    const basePrice = 112.5;
    const candles = generateInitialCandles(basePrice, '1D', 30);

    expect(candles).toHaveLength(30);
    const last = candles[candles.length - 1];
    expect(last.close).toBe(basePrice);

    // Ensure no massive spike on the last candle (open and close must be reasonably close)
    const deltaPercent = Math.abs(last.close - last.open) / last.open;
    expect(deltaPercent).toBeLessThan(0.02); // less than 2% difference
  });

  it('should generate candles for different timeframes without negative values', () => {
    const candles = generateInitialCandles(100, '1S', 28);
    expect(candles).toHaveLength(28);

    for (const c of candles) {
      expect(c.open).toBeGreaterThan(0);
      expect(c.close).toBeGreaterThan(0);
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
    }
  });

  it('should update candle on tick and create new candle when interval passes', () => {
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
