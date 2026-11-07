import { Candle } from '../../types/market';
import { BotMarket, BotStrategy } from '../../types/daytrade';

export interface RealBacktestTrade {
  id: string;
  tradeNumber: number;
  entryTime: number;
  exitTime: number;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'BREAKEVEN' | 'END_OF_DATA';
  barsHeld: number;
  equityAfter: number;
}

export type BacktestPeriod = '1d' | '7d' | '15d' | '30d' | '90d' | '6mo' | '1y';

export const BACKTEST_PERIOD_CONFIG: Record<
  BacktestPeriod,
  { label: string; description: string; days: number; yahooRange: string; cryptoLimit: number }
> = {
  '1d': { label: 'Hoje (24h)', description: 'Últimas 24 horas', days: 1, yahooRange: '1d', cryptoLimit: 288 },
  '7d': { label: '7 Dias (1 Sem)', description: 'Últimos 7 dias', days: 7, yahooRange: '5d', cryptoLimit: 672 },
  '15d': { label: '15 Dias (2 Sem)', description: 'Últimos 15 dias', days: 15, yahooRange: '1mo', cryptoLimit: 800 },
  '30d': { label: '30 Dias (1 Mês)', description: 'Últimos 30 dias', days: 30, yahooRange: '1mo', cryptoLimit: 1000 },
  '90d': { label: '90 Dias (3 Meses)', description: 'Últimos 3 meses', days: 90, yahooRange: '3mo', cryptoLimit: 1000 },
  '6mo': { label: '6 Meses', description: 'Últimos 6 meses', days: 180, yahooRange: '6mo', cryptoLimit: 1000 },
  '1y': { label: '1 Ano', description: 'Último ano completo', days: 365, yahooRange: '1y', cryptoLimit: 1000 },
};

export interface RealBacktestConfig {
  symbol: string;
  market: BotMarket;
  strategy: BotStrategy;
  timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D';
  period?: BacktestPeriod;
  initialCapital: number;
  positionSizingType?: 'FIXED_VALUE' | 'PERCENT';
  positionSizeValue?: number;
  confluenceThreshold: number;
  riskRewardRatio: number;
  stopLossAtrMultiplier: number;
  useBreakeven: boolean;
  filterToxicHours: boolean;
  slippagePercent: number;
  enableDailyGoals?: boolean;
  enableComebackBreakeven?: boolean;
  dailyStopLossPercent?: number;
}

export interface BacktestEventLog {
  id: string;
  barIndex: number;
  timestamp: number;
  type: 'ENTRY' | 'TAKE_PROFIT' | 'STOP_LOSS' | 'BREAKEVEN' | 'WAITING' | 'INFO';
  title: string;
  description: string;
  pnl?: number;
  pnlPercent?: number;
  price?: number;
  confidenceScore?: number;
}

export interface BacktestFrame {
  barIndex: number;
  time: number;
  candle: Candle;
  status: 'IDLE' | 'IN_POSITION';
  idleBarsCount: number;
  currentCapital: number;
  confluenceScore: number;
  position: {
    side: 'BUY' | 'SELL';
    entryPrice: number;
    currentPrice: number;
    stopLoss: number;
    takeProfit: number;
    quantity: number;
    floatingPnl: number;
    floatingPnlPercent: number;
    barsHeld: number;
    breakevenMoved: boolean;
  } | null;
  closedTradesCount: number;
  winningTradesCount: number;
  losingTradesCount: number;
  currentPnl: number;
  currentPnlPercent: number;
  equity: number;
  lastLogId?: string;
}

export interface RealBacktestReport {
  id: string;
  config: RealBacktestConfig;
  totalCandles: number;
  dateRange: { start: number; end: number };
  initialCapital: number;
  finalCapital: number;
  netProfit: number;
  netProfitPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  maxDrawdownValue: number;
  sharpeRatio: number;
  avgTradePnl: number;
  avgWin: number;
  avgLoss: number;
  trades: RealBacktestTrade[];
  equityCurve: { time: number; equity: number; tradeNumber: number }[];
  isRealData: boolean;
  dataSource: string;
  candles: Candle[];
  frames: BacktestFrame[];
  eventLogs: BacktestEventLog[];
}

export interface OptimalConfigResult {
  bestConfig: {
    confluenceThreshold: number;
    riskRewardRatio: number;
    stopLossAtrMultiplier: number;
    useBreakeven: boolean;
  };
  baselineReport: RealBacktestReport;
  optimizedReport: RealBacktestReport;
  netProfitGain: number;
  winRateGain: number;
  totalCombosTested: number;
}
