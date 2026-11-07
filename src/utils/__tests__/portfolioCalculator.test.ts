import { describe, it, expect } from 'vitest';
import {
  calculateNewAveragePrice,
  calculatePositionPL,
  applyTradeToHoldings
} from '../portfolioCalculator';

describe('Calculadora de Carteira e Posições (portfolioCalculator)', () => {
  it('deve calcular o novo preço médio ponderado ao comprar lotes adicionais', () => {
    // 100 ações @ R$ 30 + 100 ações @ R$ 40 = 200 ações @ R$ 35
    const avg = calculateNewAveragePrice(100, 30, 100, 40);
    expect(avg).toBe(35.00);
  });

  it('deve calcular o preço médio ponderado com lotes de tamanhos diferentes', () => {
    // 100 ações @ R$ 20 (R$ 2.000) + 300 ações @ R$ 40 (R$ 12.000) = 400 ações, total R$ 14.000 => média 35
    const avg = calculateNewAveragePrice(100, 20, 300, 40);
    expect(avg).toBe(35.00);
  });

  it('deve calcular lucro da posição em valor e percentual corretamente', () => {
    const pl = calculatePositionPL(100, 50, 60);
    expect(pl.totalInvested).toBe(5000);
    expect(pl.currentValue).toBe(6000);
    expect(pl.plValue).toBe(1000);
    expect(pl.plPercent).toBe(20.00); // +20%
  });

  it('deve calcular prejuízo da posição em valor e percentual corretamente', () => {
    const pl = calculatePositionPL(100, 50, 40);
    expect(pl.totalInvested).toBe(5000);
    expect(pl.currentValue).toBe(4000);
    expect(pl.plValue).toBe(-1000);
    expect(pl.plPercent).toBe(-20.00); // -20%
  });

  it('deve aplicar ordem de COMPRA em custódia inicialmente vazia', () => {
    const result = applyTradeToHoldings(undefined, {
      side: 'buy',
      quantity: 100,
      price: 38.50
    });
    expect(result).toEqual({ quantity: 100, avgPrice: 38.50 });
  });

  it('deve aplicar ordem de VENDA parcial mantendo inalterado o preço médio', () => {
    const current = { quantity: 200, avgPrice: 35.00 };
    const result = applyTradeToHoldings(current, {
      side: 'sell',
      quantity: 50,
      price: 45.00
    });
    expect(result).toEqual({ quantity: 150, avgPrice: 35.00 });
  });

  it('deve retornar null quando a posição for completamente liquidada', () => {
    const current = { quantity: 100, avgPrice: 35.00 };
    const result = applyTradeToHoldings(current, {
      side: 'sell',
      quantity: 100,
      price: 40.00
    });
    expect(result).toBeNull();
  });
});
