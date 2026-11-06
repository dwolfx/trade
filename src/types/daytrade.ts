export type BotMarket = 'B3' | 'CRYPTO';

export type BotStrategy =
  | 'confluence_ai'
  | 'vwap_pullback'
  | 'mean_reversion'
  | 'ema_breakout';

export type BotStatus =
  | 'running'
  | 'in_position'
  | 'waiting_filter'
  | 'paused'
  | 'stopped_loss'
  | 'stopped_gain';

export interface BotPosition {
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pnlPercent: number;
  openTime: number;
}

export interface DaytradeBot {
  id: string;
  name: string;
  market: BotMarket;
  symbol: string;
  assetName: string;
  strategy: BotStrategy;
  strategyLabel: string;
  strategyDescription: string;
  allocatedCapital: number;
  status: BotStatus;
  currentPosition: BotPosition | null;
  dailyPnl: number;
  dailyPnlPercent: number;
  tradesCount: number;
  winningTrades: number;
  winRate: number;
  maxDailyLoss: number;
  targetDailyProfit: number;
  confluenceThreshold: number; // e.g. 75 (%)
  createdAt: number;
  lastUpdated: number;
  lastLog?: string;
}

export type DecisionType =
  | 'ENTRY'
  | 'EXIT'
  | 'REJECTED'
  | 'MONITORING'
  | 'SAFETY_STOP';

export interface BotDecisionLog {
  id: string;
  botId: string;
  botName: string;
  symbol: string;
  market: BotMarket;
  timestamp: number;
  type: DecisionType;
  action: string;
  reason: string;
  confidenceScore: number; // 0 to 100%
  metrics?: {
    rsi?: number;
    vwapDiffPercent?: number;
    volumeRatio?: number;
    atr?: number;
  };
  resultPnl?: number;
}

export interface DaytradeMetrics {
  totalAllocated: number;
  totalDailyPnl: number;
  totalDailyPnlPercent: number;
  activeBotsCount: number;
  totalBotsCount: number;
  inPositionCount: number;
  averageWinRate: number;
  totalTradesToday: number;
}

export interface BacktestParams {
  symbol: string;
  market: BotMarket;
  strategy: BotStrategy;
  periodDays: number;
  capital: number;
  confluenceThreshold: number;
  useBreakeven: boolean;
  filterToxicHours: boolean;
  filterLowAtr: boolean;
}

export interface BacktestResult {
  id: string;
  params: BacktestParams;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  netProfitPercent: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  equityCurve: { trade: number; equity: number }[];
  summaryMessage: string;
}

