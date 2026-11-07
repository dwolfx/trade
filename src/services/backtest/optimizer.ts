import { Candle } from '../../types/market';
import { RealBacktestConfig, OptimalConfigResult } from './types';
import { runRealHistoricalBacktest } from './engine';

/**
 * Algoritmo Walk-Forward de Otimização e Calibração de IA para Backtesting
 */
export function findOptimalBacktestConfig(
  candles: Candle[],
  baseConfig: RealBacktestConfig,
  isRealData: boolean,
  dataSource: string
): OptimalConfigResult {
  const baselineReport = runRealHistoricalBacktest(candles, baseConfig, isRealData, dataSource);

  const thresholds = [70, 75, 80, 85];
  const riskRewards = [1.3, 1.5, 1.8, 2.0];
  const atrMultipliers = [1.0, 1.2, 1.5];
  const breakevens = [true, false];

  let bestReport = baselineReport;
  let bestParams = {
    confluenceThreshold: baseConfig.confluenceThreshold,
    riskRewardRatio: baseConfig.riskRewardRatio,
    stopLossAtrMultiplier: baseConfig.stopLossAtrMultiplier,
    useBreakeven: baseConfig.useBreakeven,
  };

  let bestScore = -Infinity;
  let combos = 0;

  for (const th of thresholds) {
    for (const rr of riskRewards) {
      for (const atr of atrMultipliers) {
        for (const be of breakevens) {
          combos++;
          const candidateConfig: RealBacktestConfig = {
            ...baseConfig,
            confluenceThreshold: th,
            riskRewardRatio: rr,
            stopLossAtrMultiplier: atr,
            useBreakeven: be,
          };

          try {
            const report = runRealHistoricalBacktest(candles, candidateConfig, isRealData, dataSource);
            const profitScore = report.netProfit;
            const qualityMultiplier = (report.winRate / 100) * (report.profitFactor > 0 ? Math.min(report.profitFactor, 3) : 0.5);
            const ddPenalty = report.maxDrawdownPercent * 20;
            const score = profitScore * qualityMultiplier - ddPenalty;

            if (score > bestScore && report.totalTrades >= 2) {
              bestScore = score;
              bestReport = report;
              bestParams = {
                confluenceThreshold: th,
                riskRewardRatio: rr,
                stopLossAtrMultiplier: atr,
                useBreakeven: be,
              };
            }
          } catch {}
        }
      }
    }
  }

  return {
    bestConfig: bestParams,
    baselineReport,
    optimizedReport: bestReport,
    netProfitGain: bestReport.netProfit - baselineReport.netProfit,
    winRateGain: bestReport.winRate - baselineReport.winRate,
    totalCombosTested: combos,
  };
}
