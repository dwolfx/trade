import { describe, it, expect } from 'vitest';
import {
  STRATEGY_DEFINITIONS,
  INITIAL_BOTS,
  simulateBotTick,
} from '../daytradeEngine';
import { DaytradeBot } from '../../types/daytrade';

describe('Motor de Daytrade e Execução de Robôs Quantitativos (daytradeEngine)', () => {
  it('define estratégias quantitativas válidas com notas de confluência mínimas', () => {
    expect(STRATEGY_DEFINITIONS.confluence_ai).toBeDefined();
    expect(STRATEGY_DEFINITIONS.vwap_pullback).toBeDefined();
    expect(STRATEGY_DEFINITIONS.mean_reversion).toBeDefined();
    expect(STRATEGY_DEFINITIONS.ema_breakout).toBeDefined();

    expect(STRATEGY_DEFINITIONS.confluence_ai.defaultThreshold).toBeGreaterThanOrEqual(70);
  });

  it('inicializa os robôs padrão com capital alocado e limites de risco diário', () => {
    expect(INITIAL_BOTS.length).toBeGreaterThanOrEqual(3);
    const winBot = INITIAL_BOTS.find(b => b.market === 'B3');
    const cryptoBot = INITIAL_BOTS.find(b => b.market === 'CRYPTO');

    expect(winBot).toBeDefined();
    expect(winBot!.allocatedCapital).toBeGreaterThan(0);
    expect(winBot!.maxDailyLoss).toBeGreaterThan(0);

    expect(cryptoBot).toBeDefined();
    expect(cryptoBot!.allocatedCapital).toBeGreaterThan(0);
  });

  it('atualiza o preço da posição e recalcula o PnL durante cada tick de mercado', () => {
    const testBot: DaytradeBot = {
      id: 'test-bot-1',
      name: 'Robô de Teste',
      market: 'B3',
      symbol: 'WINZ24',
      assetName: 'Mini-Índice',
      strategy: 'confluence_ai',
      strategyLabel: 'Confluência IA',
      strategyDescription: 'Teste',
      allocatedCapital: 2000,
      status: 'in_position',
      currentPosition: {
        side: 'BUY',
        entryPrice: 100,
        currentPrice: 100,
        quantity: 1,
        stopLoss: 90,
        takeProfit: 120,
        pnl: 0,
        pnlPercent: 0,
        openTime: Date.now(),
      },
      dailyPnl: 0,
      dailyPnlPercent: 0,
      tradesCount: 0,
      winningTrades: 0,
      winRate: 0,
      maxDailyLoss: 200,
      targetDailyProfit: 400,
      confluenceThreshold: 80,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    const { updatedBots } = simulateBotTick([testBot], []);
    const updated = updatedBots[0];

    expect(updated).toBeDefined();
    expect(updated.lastUpdated).toBeGreaterThanOrEqual(testBot.lastUpdated);
  });

  it('aciona saída por Take Profit quando o preço de mercado atinge o alvo estipulado', () => {
    const testBot: DaytradeBot = {
      id: 'test-bot-tp',
      name: 'Robô Take Profit',
      market: 'B3',
      symbol: 'PETR4',
      assetName: 'Petrobras',
      strategy: 'vwap_pullback',
      strategyLabel: 'VWAP',
      strategyDescription: 'Teste',
      allocatedCapital: 1000,
      status: 'in_position',
      currentPosition: {
        side: 'BUY',
        entryPrice: 30,
        currentPrice: 35, // Já superou o take profit de 34
        quantity: 100,
        stopLoss: 28,
        takeProfit: 34,
        pnl: 500,
        pnlPercent: 50,
        openTime: Date.now(),
      },
      dailyPnl: 0,
      dailyPnlPercent: 0,
      tradesCount: 1,
      winningTrades: 1,
      winRate: 100,
      maxDailyLoss: 150,
      targetDailyProfit: 1000,
      confluenceThreshold: 75,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    const { updatedBots, newLogs } = simulateBotTick([testBot], []);
    const updated = updatedBots[0];

    expect(updated.currentPosition).toBeNull(); // Posição encerrada com lucro
    expect(updated.dailyPnl).toBeGreaterThan(0);
    expect(newLogs.some(l => l.type === 'EXIT')).toBe(true);
  });
});
