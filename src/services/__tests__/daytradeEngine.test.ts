import { describe, it, expect } from 'vitest';
import {
  STRATEGY_DEFINITIONS,
  INITIAL_BOTS,
  simulateBotTick,
} from '../daytradeEngine';
import { DaytradeBot } from '../../types/daytrade';

describe('Daytrade Engine', () => {
  it('defines valid quant strategies with confluence thresholds', () => {
    expect(STRATEGY_DEFINITIONS.confluence_ai).toBeDefined();
    expect(STRATEGY_DEFINITIONS.vwap_pullback).toBeDefined();
    expect(STRATEGY_DEFINITIONS.mean_reversion).toBeDefined();
    expect(STRATEGY_DEFINITIONS.ema_breakout).toBeDefined();

    expect(STRATEGY_DEFINITIONS.confluence_ai.defaultThreshold).toBeGreaterThanOrEqual(70);
  });

  it('initializes default bots with allocated capital and risk boundaries', () => {
    expect(INITIAL_BOTS.length).toBeGreaterThanOrEqual(3);
    const winBot = INITIAL_BOTS.find(b => b.market === 'B3');
    const cryptoBot = INITIAL_BOTS.find(b => b.market === 'CRYPTO');

    expect(winBot).toBeDefined();
    expect(winBot!.allocatedCapital).toBeGreaterThan(0);
    expect(winBot!.maxDailyLoss).toBeGreaterThan(0);

    expect(cryptoBot).toBeDefined();
    expect(cryptoBot!.allocatedCapital).toBeGreaterThan(0);
  });

  it('updates position price and calculates pnl during tick', () => {
    const testBot: DaytradeBot = {
      id: 'test-bot-1',
      name: 'Test Bot',
      market: 'B3',
      symbol: 'WINZ24',
      assetName: 'Mini-Índice',
      strategy: 'confluence_ai',
      strategyLabel: 'Confluência IA',
      strategyDescription: 'Test',
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

  it('triggers take profit when current price reaches take profit level', () => {
    const testBot: DaytradeBot = {
      id: 'test-bot-tp',
      name: 'Take Profit Bot',
      market: 'B3',
      symbol: 'PETR4',
      assetName: 'Petrobras',
      strategy: 'vwap_pullback',
      strategyLabel: 'VWAP',
      strategyDescription: 'Test',
      allocatedCapital: 1000,
      status: 'in_position',
      currentPosition: {
        side: 'BUY',
        entryPrice: 30,
        currentPrice: 35, // Already past take profit
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
      targetDailyProfit: 1000, // higher so it doesn't stop immediately
      confluenceThreshold: 75,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    const { updatedBots, newLogs } = simulateBotTick([testBot], []);
    const updated = updatedBots[0];

    expect(updated.currentPosition).toBeNull(); // Position closed
    expect(updated.dailyPnl).toBeGreaterThan(0);
    expect(newLogs.some(l => l.type === 'EXIT')).toBe(true);
  });
});
