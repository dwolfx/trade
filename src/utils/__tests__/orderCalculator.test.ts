import { describe, it, expect } from 'vitest';
import {
  calculateB3Fees,
  calculateOrderTotal,
  calculateTakeProfitPrice,
  calculateStopLossPrice,
  validateOrder
} from '../orderCalculator';

describe('orderCalculator', () => {
  it('should calculate B3 fees correctly (0.030%)', () => {
    const gross = 10000;
    const fees = calculateB3Fees(gross);
    expect(fees).toBe(3.00); // 10000 * 0.0003 = 3.00
  });

  it('should return 0 fees for 0 or negative gross total', () => {
    expect(calculateB3Fees(0)).toBe(0);
    expect(calculateB3Fees(-100)).toBe(0);
  });

  it('should calculate BUY order total adding B3 fees', () => {
    const { grossTotal, fees, netTotal } = calculateOrderTotal(50.00, 100, 'buy');
    expect(grossTotal).toBe(5000.00);
    expect(fees).toBe(1.50);
    expect(netTotal).toBe(5001.50);
  });

  it('should calculate SELL order total deducting B3 fees', () => {
    const { grossTotal, fees, netTotal } = calculateOrderTotal(50.00, 100, 'sell');
    expect(grossTotal).toBe(5000.00);
    expect(fees).toBe(1.50);
    expect(netTotal).toBe(4998.50);
  });

  it('should calculate Take Profit price correctly', () => {
    const base = 50.00;
    const tp = calculateTakeProfitPrice(base, 10); // +10%
    expect(tp).toBe(55.00);
  });

  it('should calculate Stop Loss price correctly', () => {
    const base = 50.00;
    const sl = calculateStopLossPrice(base, 5); // -5%
    expect(sl).toBe(47.50);
  });

  it('should invalidate order with 0 or negative quantity', () => {
    const res = validateOrder({
      side: 'buy',
      quantity: 0,
      price: 50,
      availableCash: 10000,
      currentHoldings: 0
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('maior que zero');
  });

  it('should invalidate BUY order if cash is insufficient', () => {
    const res = validateOrder({
      side: 'buy',
      quantity: 1000,
      price: 50, // total > 50000
      availableCash: 10000,
      currentHoldings: 0
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Saldo insuficiente');
  });

  it('should invalidate SELL order if holdings are insufficient', () => {
    const res = validateOrder({
      side: 'sell',
      quantity: 200,
      price: 50,
      availableCash: 10000,
      currentHoldings: 100
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Quantidade indisponível');
  });

  it('should validate valid BUY order', () => {
    const res = validateOrder({
      side: 'buy',
      quantity: 100,
      price: 50,
      availableCash: 10000,
      currentHoldings: 0
    });
    expect(res.isValid).toBe(true);
  });
});
