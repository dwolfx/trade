import { describe, it, expect } from 'vitest';
import {
  calculateNewAveragePrice,
  calculatePositionPL,
  applyTradeToHoldings
} from '../portfolioCalculator';

describe('portfolioCalculator', () => {
  it('should calculate new weighted average price when buying additional lots', () => {
    // 100 shares @ 30 + 100 shares @ 40 = 200 shares @ 35
    const avg = calculateNewAveragePrice(100, 30, 100, 40);
    expect(avg).toBe(35.00);
  });

  it('should calculate new weighted average price with different lot sizes', () => {
    // 100 shares @ 20 (R$ 2000) + 300 shares @ 40 (R$ 12000) = 400 shares, total R$ 14000 => avg 35
    const avg = calculateNewAveragePrice(100, 20, 300, 40);
    expect(avg).toBe(35.00);
  });

  it('should calculate position profit correctly', () => {
    const pl = calculatePositionPL(100, 50, 60);
    expect(pl.totalInvested).toBe(5000);
    expect(pl.currentValue).toBe(6000);
    expect(pl.plValue).toBe(1000);
    expect(pl.plPercent).toBe(20.00); // +20%
  });

  it('should calculate position loss correctly', () => {
    const pl = calculatePositionPL(100, 50, 40);
    expect(pl.totalInvested).toBe(5000);
    expect(pl.currentValue).toBe(4000);
    expect(pl.plValue).toBe(-1000);
    expect(pl.plPercent).toBe(-20.00); // -20%
  });

  it('should apply BUY trade to empty holdings', () => {
    const result = applyTradeToHoldings(undefined, {
      side: 'buy',
      quantity: 100,
      price: 38.50
    });
    expect(result).toEqual({ quantity: 100, avgPrice: 38.50 });
  });

  it('should apply partial SELL trade maintaining average price', () => {
    const current = { quantity: 200, avgPrice: 35.00 };
    const result = applyTradeToHoldings(current, {
      side: 'sell',
      quantity: 50,
      price: 45.00
    });
    expect(result).toEqual({ quantity: 150, avgPrice: 35.00 });
  });

  it('should return null when position is completely closed', () => {
    const current = { quantity: 100, avgPrice: 35.00 };
    const result = applyTradeToHoldings(current, {
      side: 'sell',
      quantity: 100,
      price: 40.00
    });
    expect(result).toBeNull();
  });
});
