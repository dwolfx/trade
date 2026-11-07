import { describe, it, expect } from 'vitest';
import {
  calculateB3Fees,
  calculateOrderTotal,
  calculateTakeProfitPrice,
  calculateStopLossPrice,
  validateOrder
} from '../orderCalculator';

describe('Calculadora de Ordens de Negociação (orderCalculator)', () => {
  it('deve calcular taxas da B3 corretamente (0.030% de emolumentos e liquidação)', () => {
    const gross = 10000;
    const fees = calculateB3Fees(gross);
    expect(fees).toBe(3.00); // 10000 * 0.0003 = 3.00
  });

  it('deve retornar taxa zero para total bruto zero ou negativo', () => {
    expect(calculateB3Fees(0)).toBe(0);
    expect(calculateB3Fees(-100)).toBe(0);
  });

  it('deve calcular total da ordem de COMPRA adicionando taxas da B3', () => {
    const { grossTotal, fees, netTotal } = calculateOrderTotal(50.00, 100, 'buy');
    expect(grossTotal).toBe(5000.00);
    expect(fees).toBe(1.50);
    expect(netTotal).toBe(5001.50);
  });

  it('deve calcular total da ordem de VENDA deduzindo taxas da B3', () => {
    const { grossTotal, fees, netTotal } = calculateOrderTotal(50.00, 100, 'sell');
    expect(grossTotal).toBe(5000.00);
    expect(fees).toBe(1.50);
    expect(netTotal).toBe(4998.50);
  });

  it('deve calcular preço de Take Profit corretamente com base no percentual', () => {
    const base = 50.00;
    const tp = calculateTakeProfitPrice(base, 10); // +10%
    expect(tp).toBe(55.00);
  });

  it('deve calcular preço de Stop Loss corretamente com base no percentual', () => {
    const base = 50.00;
    const sl = calculateStopLossPrice(base, 5); // -5%
    expect(sl).toBe(47.50);
  });

  it('deve invalidar ordem com quantidade igual a zero ou negativa', () => {
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

  it('deve invalidar ordem de COMPRA se o saldo disponível for insuficiente', () => {
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

  it('deve invalidar ordem de VENDA se a custódia for insuficiente', () => {
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

  it('deve validar com sucesso ordem de COMPRA com saldo e parâmetros válidos', () => {
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
