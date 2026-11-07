import { describe, it, expect } from 'vitest';
import {
  calculateEMA,
  calculateRSI,
  calculateATR,
  calculateVWAP,
  generateRealisticWalkCandles,
  runRealHistoricalBacktest,
  RealBacktestConfig,
} from '../realBacktestEngine';
import { Candle } from '../../types/market';

describe('Motor de Backtest Real - Cálculos Quantitativos', () => {
  it('calcula EMA corretamente sem viés de antecipação (lookahead bias)', () => {
    const data = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const ema = calculateEMA(data, 5);

    expect(ema).toHaveLength(data.length);
    // Antes do período (5), valores iniciais são 0
    expect(ema[0]).toBe(0);
    expect(ema[3]).toBe(0);
    // 5º elemento é a média móvel simples: (10+11+12+13+14)/5 = 12
    expect(ema[4]).toBe(12);
    // Valores subsequentes usam fator de suavização: 15 * (2/6) + 12 * (4/6) = 5 + 8 = 13
    expect(ema[5]).toBe(13);
  });

  it('calcula RSI dentro dos limites permitidos [0, 100]', () => {
    const closes = [10, 11, 12, 13, 12, 11, 10, 9, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    const rsi = calculateRSI(closes, 14);

    expect(rsi).toHaveLength(closes.length);
    rsi.forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('calcula ATR (Average True Range) com precisão', () => {
    const candles: Candle[] = Array.from({ length: 20 }, (_, i) => ({
      time: i * 60000,
      open: 10 + i,
      high: 12 + i,
      low: 9 + i,
      close: 11 + i,
      volume: 1000,
    }));

    const atr = calculateATR(candles, 14);
    expect(atr).toHaveLength(20);
    expect(atr[14]).toBeGreaterThan(0);
  });

  it('calcula VWAP corretamente ponderado pelo volume financeiro', () => {
    const candles: Candle[] = [
      { time: 1, open: 10, high: 12, low: 8, close: 10, volume: 100 },
      { time: 2, open: 10, high: 22, low: 18, close: 20, volume: 100 },
    ];

    const vwap = calculateVWAP(candles);
    expect(vwap[0]).toBe(10);
    expect(vwap[1]).toBe(15);
  });

  it('executa simulação walk-forward de backtest e rastreia métricas de desempenho', () => {
    const candles = generateRealisticWalkCandles('PETR4', 'B3', 150);

    const config: RealBacktestConfig = {
      symbol: 'PETR4',
      market: 'B3',
      strategy: 'confluence_ai',
      timeframe: '15m',
      initialCapital: 10000,
      confluenceThreshold: 65,
      riskRewardRatio: 2.0,
      stopLossAtrMultiplier: 1.5,
      useBreakeven: true,
      filterToxicHours: false,
      slippagePercent: 0.02,
    };

    const report = runRealHistoricalBacktest(candles, config, true, 'Feed de Teste');

    expect(report).toBeDefined();
    expect(report.totalCandles).toBe(150);
    expect(report.initialCapital).toBe(10000);
    expect(report.trades).toBeInstanceOf(Array);
    expect(report.equityCurve.length).toBeGreaterThan(0);
    expect(report.winRate).toBeGreaterThanOrEqual(0);
    expect(report.winRate).toBeLessThanOrEqual(100);
    expect(report.maxDrawdownPercent).toBeGreaterThanOrEqual(0);

    // Cada operação executada deve possuir preços válidos de entrada e saída
    report.trades.forEach(trade => {
      expect(trade.entryPrice).toBeGreaterThan(0);
      expect(trade.exitPrice).toBeGreaterThan(0);
      expect(trade.exitTime).toBeGreaterThanOrEqual(trade.entryTime);
      expect(['TAKE_PROFIT', 'STOP_LOSS', 'BREAKEVEN', 'END_OF_DATA']).toContain(trade.exitReason);
    });
  });

  it('lança erro descritivo em português se menos de 30 candles forem fornecidos', () => {
    const candles = generateRealisticWalkCandles('PETR4', 'B3', 15);
    const config: RealBacktestConfig = {
      symbol: 'PETR4',
      market: 'B3',
      strategy: 'confluence_ai',
      timeframe: '15m',
      initialCapital: 10000,
      confluenceThreshold: 70,
      riskRewardRatio: 2.0,
      stopLossAtrMultiplier: 1.5,
      useBreakeven: true,
      filterToxicHours: false,
      slippagePercent: 0.02,
    };

    expect(() => runRealHistoricalBacktest(candles, config, false, 'Feed curto')).toThrow(
      'Mínimo de 30 candles necessários'
    );
  });
});
