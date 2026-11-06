import { Candle, Timeframe } from '../types/market';
import { BotMarket, BotStrategy } from '../types/daytrade';
import { fetchYahooCandles } from './yahooFinanceService';
import { fetchCryptoCandles } from './binanceService';
import { CryptoTimeframe } from '../types/crypto';
import { getLiveUsdRate } from './currencyService';

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
  period?: BacktestPeriod; // '1d' | '7d' | '15d' | '30d' | '90d' | '6mo' | '1y'
  initialCapital: number;
  positionSizingType?: 'FIXED_VALUE' | 'PERCENT'; // 'FIXED_VALUE' (default) ou 'PERCENT'
  positionSizeValue?: number; // valor fixo em R$ (ex: 200) ou porcentagem (ex: 20)
  confluenceThreshold: number; // 60 - 95%
  riskRewardRatio: number; // e.g. 1.5, 2.0, 3.0
  stopLossAtrMultiplier: number; // e.g. 1.5
  useBreakeven: boolean; // move SL to entry once 50% target is reached
  filterToxicHours: boolean; // skip erratic opening/closing bars
  slippagePercent: number; // default 0.02%
  enableDailyGoals?: boolean; // Ativa Escada de Metas (+2%, +5%)
  enableComebackBreakeven?: boolean; // Se ficar negativo e voltar pro 0x0, encerra o dia
  dailyStopLossPercent?: number; // Limite de perda diária (default: 2.0%)
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

// ==========================================
// PURE QUANT INDICATORS (No lookahead bias)
// ==========================================

export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = new Array(data.length).fill(0);
  if (data.length < period) return result;

  const k = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  let prevEma = sum / period;
  result[period - 1] = prevEma;

  for (let i = period; i < data.length; i++) {
    const currentEma = data[i] * k + prevEma * (1 - k);
    result[i] = currentEma;
    prevEma = currentEma;
  }
  return result;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = new Array(closes.length).fill(50);
  if (closes.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}

export function calculateATR(candles: Candle[], period: number = 14): number[] {
  const atr: number[] = new Array(candles.length).fill(0);
  if (candles.length <= period) return atr;

  const tr: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }

  let sum = 0;
  for (let i = 0; i < period; i++) sum += tr[i];
  let prevAtr = sum / period;
  atr[period - 1] = prevAtr;

  for (let i = period; i < candles.length; i++) {
    const currentAtr = (prevAtr * (period - 1) + tr[i]) / period;
    atr[i] = currentAtr;
    prevAtr = currentAtr;
  }

  return atr;
}

export function calculateVWAP(candles: Candle[]): number[] {
  const vwap: number[] = new Array(candles.length).fill(0);
  let cumVol = 0;
  let cumVolPrice = 0;

  for (let i = 0; i < candles.length; i++) {
    const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
    const vol = candles[i].volume || 1;
    cumVol += vol;
    cumVolPrice += typicalPrice * vol;
    vwap[i] = cumVolPrice / cumVol;
  }

  return vwap;
}

// ==========================================
// HISTORICAL DATA FETCHER
// ==========================================

export async function fetchHistoricalCandlesForBacktest(
  symbol: string,
  market: BotMarket,
  timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D',
  period: BacktestPeriod = '30d',
  specificDate?: string // Formato 'YYYY-MM-DD' para testar um dia específico do calendário
): Promise<{ candles: Candle[]; isReal: boolean; source: string }> {
  const periodMeta = BACKTEST_PERIOD_CONFIG[period] || BACKTEST_PERIOD_CONFIG['30d'];

  let startTimeMs: number | undefined;
  let endTimeMs: number | undefined;
  if (specificDate) {
    const startOfTarget = new Date(`${specificDate}T00:00:00Z`).getTime();
    const tfMinutes = timeframe === '1m' ? 1 : timeframe === '3m' ? 3 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '30m' ? 30 : 60;
    startTimeMs = startOfTarget - 35 * tfMinutes * 60 * 1000; // 35 warm-up candles
    endTimeMs = startOfTarget + 24 * 60 * 60 * 1000;
  }

  try {
    if (market === 'CRYPTO') {
      const cryptoTf: CryptoTimeframe = timeframe === '1D' ? '1D' : (timeframe as CryptoTimeframe);
      const rawSymbol = symbol.toUpperCase().replace(/\.SA$/, '');

      // Prefer native BRL pair on Binance (e.g. BTCBRL, ETHBRL, SOLBRL) for Brazilian trader reality
      let pairToFetch = rawSymbol;
      let isUsdtConversionNeeded = false;

      if (!pairToFetch.endsWith('BRL') && !pairToFetch.endsWith('USDT')) {
        pairToFetch = `${pairToFetch}BRL`;
      }

      let klines = await fetchCryptoCandles(
        pairToFetch,
        cryptoTf,
        specificDate ? 500 : periodMeta.cryptoLimit,
        startTimeMs,
        endTimeMs
      );

      // If BRL pair wasn't found or returned few candles, try USDT pair and convert to BRL
      if ((!klines || klines.length <= 10) && pairToFetch.endsWith('BRL')) {
        const fallbackUsdt = pairToFetch.replace(/BRL$/, 'USDT');
        const usdtKlines = await fetchCryptoCandles(
          fallbackUsdt,
          cryptoTf,
          specificDate ? 500 : periodMeta.cryptoLimit,
          startTimeMs,
          endTimeMs
        );
        if (usdtKlines && usdtKlines.length > 10) {
          klines = usdtKlines;
          pairToFetch = fallbackUsdt;
          isUsdtConversionNeeded = true;
        }
      } else if (pairToFetch.endsWith('USDT')) {
        // User typed USDT explicitly, convert to BRL reality
        isUsdtConversionNeeded = true;
      }

      if (klines && klines.length > 20) {
        let usdBrlRate = 5.52;
        let usdSourceDetails = '';

        if (isUsdtConversionNeeded) {
          const liveUsd = await getLiveUsdRate();
          usdBrlRate = liveUsd.rate;
          usdSourceDetails = ` [Cotação do Dólar: R$ ${usdBrlRate.toFixed(2)} via ${liveUsd.sourceLabel}]`;
        }

        const multiplier = isUsdtConversionNeeded ? usdBrlRate : 1.0;

        const mapped = klines.map(k => ({
          time: k.time,
          open: Number((k.open * multiplier).toFixed(2)),
          high: Number((k.high * multiplier).toFixed(2)),
          low: Number((k.low * multiplier).toFixed(2)),
          close: Number((k.close * multiplier).toFixed(2)),
          volume: k.volume,
        }));

        if (specificDate && startTimeMs && endTimeMs) {
          const dayCandles = mapped.filter(c => c.time >= startTimeMs! && c.time <= endTimeMs!);
          if (dayCandles.length >= 20) {
            return {
              candles: dayCandles,
              isReal: true,
              source: isUsdtConversionNeeded
                ? `Binance Spot (${pairToFetch} em R$ a ${usdBrlRate.toFixed(2)} · Dia: ${specificDate})`
                : `Binance Spot Live API (${pairToFetch} · Dia: ${specificDate})`,
            };
          }
        }

        // Filter by requested period cutoff while preserving minimum 30 bars for indicators
        const cutoff = Date.now() - periodMeta.days * 24 * 60 * 60 * 1000;
        const filtered = mapped.filter(c => c.time >= cutoff);
        const finalCandles = filtered.length >= 30 ? filtered : mapped.slice(-Math.max(30, filtered.length));

        return {
          candles: finalCandles,
          isReal: true,
          source: isUsdtConversionNeeded
            ? `Binance Spot (${pairToFetch} convertido p/ R$ a ${usdBrlRate.toFixed(2)}${usdSourceDetails} · ${periodMeta.label})`
            : `Binance Spot Live API (${pairToFetch} · ${periodMeta.label})`,
        };
      }
    } else {
      // B3 Market via Yahoo Finance
      const cleanB3 = symbol.toUpperCase().replace(/\.SA$/, '');
      const yahooCandles = await fetchYahooCandles(cleanB3, timeframe as Timeframe, periodMeta.yahooRange);
      if (yahooCandles && yahooCandles.length > 20) {
        if (specificDate && startTimeMs && endTimeMs) {
          const dayCandles = yahooCandles.filter(c => c.time >= startTimeMs! && c.time <= endTimeMs!);
          if (dayCandles.length >= 10) {
            return {
              candles: dayCandles,
              isReal: true,
              source: `Yahoo Finance B3 (${cleanB3}.SA · Dia: ${specificDate})`,
            };
          }
        }

        const cutoff = Date.now() - periodMeta.days * 24 * 60 * 60 * 1000;
        const filtered = yahooCandles.filter(c => c.time >= cutoff);
        const finalCandles = filtered.length >= 30 ? filtered : yahooCandles.slice(-Math.max(30, filtered.length));

        return {
          candles: finalCandles,
          isReal: true,
          source: `Yahoo Finance B3 (${cleanB3}.SA · ${periodMeta.label})`,
        };
      }
    }
  } catch (err) {
    console.warn('Real candles fetch error, generating historical walk-forward baseline:', err);
  }

  // Realistic fallback generated candles if network is offline
  const fallbackCount = Math.min(500, Math.max(45, periodMeta.days * 16));
  const fallbackCandles = generateRealisticWalkCandles(symbol, market, fallbackCount, timeframe);
  return {
    candles: fallbackCandles,
    isReal: false,
    source: specificDate
      ? `Simulação Sintética (${symbol} · Dia: ${specificDate})`
      : `Simulação Sintética Determinística (${symbol} · ${periodMeta.label})`,
  };
}

export function generateRealisticWalkCandles(
  symbol: string,
  market: BotMarket,
  count: number,
  timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D' = '15m'
): Candle[] {
  const candles: Candle[] = [];
  let price = 34.50;
  if (market === 'CRYPTO') {
    if (symbol.includes('BTC')) price = 385000;
    else if (symbol.includes('ETH')) price = 16500;
    else if (symbol.includes('SOL')) price = 1100;
    else if (symbol.includes('BNB')) price = 3700;
    else if (symbol.includes('DOGE')) price = 0.95;
    else if (symbol.includes('LINK')) price = 85;
    else price = 50.0;
  }
  const now = Date.now();
  const tfMinutes =
    timeframe === '1m' ? 1 :
    timeframe === '3m' ? 3 :
    timeframe === '5m' ? 5 :
    timeframe === '15m' ? 15 :
    timeframe === '30m' ? 30 :
    timeframe === '1h' ? 60 : 1440;
  const stepMs = tfMinutes * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * stepMs;
    const volatility = price * 0.008;
    const trend = Math.sin(i / 15) * (volatility * 0.4);
    const change = (Math.random() - 0.48) * volatility + trend;
    const open = price;
    const close = Math.max(0.01, open + change);
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
    const volume = Math.floor(1000 + Math.random() * 5000);

    candles.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  return candles;
}

// ==========================================
// WALK-FORWARD ENGINE (Bar-by-Bar Replay)
// ==========================================

export function runRealHistoricalBacktest(
  candles: Candle[],
  config: RealBacktestConfig,
  isRealData: boolean,
  dataSource: string
): RealBacktestReport {
  if (!candles || candles.length < 30) {
    throw new Error('Mínimo de 30 candles necessários para calcular médias móveis e ATR com precisão.');
  }

  // Pre-calculate indicators for walk-forward checking
  const closes = candles.map(c => c.close);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const ema50 = calculateEMA(closes, 50);
  const rsi14 = calculateRSI(closes, 14);
  const atr14 = calculateATR(candles, 14);
  const vwap = calculateVWAP(candles);

  let currentCapital = config.initialCapital;
  let peakCapital = config.initialCapital;
  let maxDrawdownValue = 0;
  let maxDrawdownPercent = 0;

  // Daily Risk Management tracking
  let dailyTradingHalted = false;
  let haltReason: string | null = null;
  let wasInDrawdown = false;
  let peakPnlPercent = 0;

  const trades: RealBacktestTrade[] = [];
  const equityCurve: { time: number; equity: number; tradeNumber: number }[] = [
    { time: candles[25].time, equity: currentCapital, tradeNumber: 0 }
  ];

  const frames: BacktestFrame[] = [];
  const eventLogs: BacktestEventLog[] = [];

  let idleBarsCount = 0;

  let inTrade: {
    entryBar: number;
    entryTime: number;
    side: 'BUY' | 'SELL';
    entryPrice: number;
    stopLoss: number;
    initialStopLoss: number;
    takeProfit: number;
    quantity: number;
    breakevenMoved: boolean;
  } | null = null;

  // Add initial start event log
  eventLogs.push({
    id: `log-start-${candles[25].time}`,
    barIndex: 25,
    timestamp: candles[25].time,
    type: 'INFO',
    title: 'Início do Replay Histórico Walk-Forward',
    description: `Setup inicializado com ${config.initialCapital.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Confluência mínima requerida: ${config.confluenceThreshold}%.`,
  });

  // Walk forward bar by bar: Warmup period 25 bars
  for (let i = 25; i < candles.length; i++) {
    const currentBar = candles[i];
    const prevBar = candles[i - 1];
    let latestLogId: string | undefined;

    // 1. If currently in a trade, evaluate exits first on current bar
    if (inTrade) {
      idleBarsCount = 0;
      const barsHeld = i - inTrade.entryBar;
      let exitPrice: number | null = null;
      let exitReason: RealBacktestTrade['exitReason'] | null = null;

      // Breakeven logic: if price reached >= 55% towards target, move stop to entry.
      // Somente avaliado a partir da barra seguinte (barsHeld >= 1) para não auto-executar na barra de entrada!
      if (config.useBreakeven && !inTrade.breakevenMoved && barsHeld >= 1) {
        if (inTrade.side === 'BUY') {
          const halfWayTarget = inTrade.entryPrice + (inTrade.takeProfit - inTrade.entryPrice) * 0.55;
          if (currentBar.high >= halfWayTarget) {
            inTrade.stopLoss = inTrade.entryPrice * (1 + config.slippagePercent / 100);
            inTrade.breakevenMoved = true;

            const beLog: BacktestEventLog = {
              id: `log-be-${currentBar.time}`,
              barIndex: i,
              timestamp: currentBar.time,
              type: 'BREAKEVEN',
              title: 'Stop Movido para Breakeven (0 a 0)',
              description: `Preço atingiu 55% do alvo. Stop Loss elevado para ${inTrade.stopLoss.toFixed(2)}. Risco zerado!`,
              price: inTrade.stopLoss,
            };
            eventLogs.push(beLog);
            latestLogId = beLog.id;
          }
        } else {
          // SHORT position breakeven
          const halfWayTarget = inTrade.entryPrice - (inTrade.entryPrice - inTrade.takeProfit) * 0.55;
          if (currentBar.low <= halfWayTarget) {
            inTrade.stopLoss = inTrade.entryPrice * (1 - config.slippagePercent / 100);
            inTrade.breakevenMoved = true;

            const beLog: BacktestEventLog = {
              id: `log-be-${currentBar.time}`,
              barIndex: i,
              timestamp: currentBar.time,
              type: 'BREAKEVEN',
              title: 'Stop Movido para Breakeven (0 a 0)',
              description: `Preço atingiu 55% da queda alvo. Stop Loss baixado para ${inTrade.stopLoss.toFixed(2)}. Risco zerado!`,
              price: inTrade.stopLoss,
            };
            eventLogs.push(beLog);
            latestLogId = beLog.id;
          }
        }
      }

      // Check Stop Loss & Take Profit
      if (inTrade.side === 'BUY') {
        if (currentBar.low <= inTrade.stopLoss) {
          exitPrice = inTrade.stopLoss;
          exitReason = inTrade.breakevenMoved ? 'BREAKEVEN' : 'STOP_LOSS';
        } else if (currentBar.high >= inTrade.takeProfit) {
          exitPrice = inTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          exitPrice = currentBar.close;
          exitReason = 'END_OF_DATA';
        }
      } else {
        // SHORT position exit
        if (currentBar.high >= inTrade.stopLoss) {
          exitPrice = inTrade.stopLoss;
          exitReason = inTrade.breakevenMoved ? 'BREAKEVEN' : 'STOP_LOSS';
        } else if (currentBar.low <= inTrade.takeProfit) {
          exitPrice = inTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          exitPrice = currentBar.close;
          exitReason = 'END_OF_DATA';
        }
      }

      if (exitPrice !== null && exitReason !== null) {
        // Apply conservative slippage
        const finalExitPrice = inTrade.side === 'BUY'
          ? exitPrice * (1 - config.slippagePercent / 100)
          : exitPrice * (1 + config.slippagePercent / 100);

        const pnl = inTrade.side === 'BUY'
          ? (finalExitPrice - inTrade.entryPrice) * inTrade.quantity
          : (inTrade.entryPrice - finalExitPrice) * inTrade.quantity;

        const pnlPercent = inTrade.side === 'BUY'
          ? ((finalExitPrice - inTrade.entryPrice) / inTrade.entryPrice) * 100
          : ((inTrade.entryPrice - finalExitPrice) / inTrade.entryPrice) * 100;

        currentCapital += pnl;

        // Track Drawdown
        if (currentCapital > peakCapital) {
          peakCapital = currentCapital;
        } else {
          const ddVal = peakCapital - currentCapital;
          const ddPct = (ddVal / peakCapital) * 100;
          if (ddVal > maxDrawdownValue) maxDrawdownValue = ddVal;
          if (ddPct > maxDrawdownPercent) maxDrawdownPercent = ddPct;
        }

        const tradeNumber = trades.length + 1;
        trades.push({
          id: `t-${tradeNumber}-${currentBar.time}`,
          tradeNumber,
          entryTime: inTrade.entryTime,
          exitTime: currentBar.time,
          side: inTrade.side,
          entryPrice: parseFloat(inTrade.entryPrice.toFixed(2)),
          exitPrice: parseFloat(finalExitPrice.toFixed(2)),
          quantity: inTrade.quantity,
          pnl: parseFloat(pnl.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          exitReason,
          barsHeld,
          equityAfter: parseFloat(currentCapital.toFixed(2)),
        });

        equityCurve.push({
          time: currentBar.time,
          equity: parseFloat(currentCapital.toFixed(2)),
          tradeNumber,
        });

        // Add trade exit event log
        const exitLog: BacktestEventLog = {
          id: `log-exit-${tradeNumber}-${currentBar.time}`,
          barIndex: i,
          timestamp: currentBar.time,
          type: exitReason === 'TAKE_PROFIT' ? 'TAKE_PROFIT' : exitReason === 'BREAKEVEN' ? 'BREAKEVEN' : 'STOP_LOSS',
          title: exitReason === 'TAKE_PROFIT'
            ? `🎯 Take Profit Executado (Trade #${tradeNumber})`
            : exitReason === 'BREAKEVEN'
            ? `🟡 Saída no Breakeven (Trade #${tradeNumber})`
            : `🛑 Stop Loss Acionado (Trade #${tradeNumber})`,
          description: `Venda a ${finalExitPrice.toFixed(2)} após ${barsHeld} candles. Resultado: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%). Saldo: ${currentCapital.toFixed(2)}.`,
          pnl: parseFloat(pnl.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          price: parseFloat(finalExitPrice.toFixed(2)),
        };
        eventLogs.push(exitLog);
        latestLogId = exitLog.id;

        inTrade = null;
      }
    } else {
      idleBarsCount += 1;
    }

    const currentPnl = currentCapital - config.initialCapital;
    const currentPnlPercent = (currentPnl / config.initialCapital) * 100;

    if (currentPnlPercent < -0.3) {
      wasInDrawdown = true;
    }
    if (currentPnlPercent > peakPnlPercent) {
      peakPnlPercent = currentPnlPercent;
    }

    // Daily Risk Rules & Trailing Goals Check
    if (!inTrade && !dailyTradingHalted) {
      // 1. Comeback Breakeven: se esteve negativo e recuperou para 0 a 0
      if (config.enableComebackBreakeven && wasInDrawdown && currentPnl >= 0 && trades.length >= 2) {
        dailyTradingHalted = true;
        haltReason = 'Trava de Alívio (Comeback Breakeven): Conta recuperou ao 0x0 após drawdown. Capital 100% protegido!';
        const haltLog: BacktestEventLog = {
          id: `log-halt-breakeven-${currentBar.time}`,
          barIndex: i,
          timestamp: currentBar.time,
          type: 'INFO',
          title: '🛡️ Trava de Alívio Ativada (Empate Salvo)',
          description: haltReason,
        };
        eventLogs.push(haltLog);
        latestLogId = haltLog.id;
      }

      // 2. Daily Stop Loss
      const stopLossLimit = config.dailyStopLossPercent ? -Math.abs(config.dailyStopLossPercent) : -2.0;
      if (currentPnlPercent <= stopLossLimit) {
        dailyTradingHalted = true;
        haltReason = `Stop Loss Diário Atingido (${currentPnlPercent.toFixed(2)}%). Circuit breaker ativado para proteger patrimônio!`;
        const haltLog: BacktestEventLog = {
          id: `log-halt-stoploss-${currentBar.time}`,
          barIndex: i,
          timestamp: currentBar.time,
          type: 'INFO',
          title: '🛑 Limite de Perda Diária Atingido',
          description: haltReason,
        };
        eventLogs.push(haltLog);
        latestLogId = haltLog.id;
      }

      // 3. Escada de Metas (Trailing Profit Lock)
      if (config.enableDailyGoals) {
        if (currentPnlPercent >= 10.0) {
          dailyTradingHalted = true;
          haltReason = '🏆 Super Meta Diária Batida (+10%)! Dia encerrado com lucro espetacular!';
          const haltLog: BacktestEventLog = {
            id: `log-halt-meta3-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'INFO',
            title: '🏆 Meta Máxima Atingida (+10%)',
            description: haltReason,
          };
          eventLogs.push(haltLog);
          latestLogId = haltLog.id;
        } else if (peakPnlPercent >= 5.0 && currentPnlPercent <= 3.0) {
          dailyTradingHalted = true;
          haltReason = '🎯 Trava de Recuo (+5% ➔ +3%): Lucro mínimo de 3% garantido no bolso!';
          const haltLog: BacktestEventLog = {
            id: `log-halt-meta2-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'INFO',
            title: '🎯 Trava de Recuo Ativada (+3% garantido)',
            description: haltReason,
          };
          eventLogs.push(haltLog);
          latestLogId = haltLog.id;
        } else if (peakPnlPercent >= 2.0 && currentPnlPercent <= 0.0) {
          dailyTradingHalted = true;
          haltReason = '🔒 Trava de Recuo (+2% ➔ 0x0): Saída no empate protegendo o capital após bater Meta 1!';
          const haltLog: BacktestEventLog = {
            id: `log-halt-meta1-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'INFO',
            title: '🔒 Trava de Recuo Ativada (Capital Protegido)',
            description: haltReason,
          };
          eventLogs.push(haltLog);
          latestLogId = haltLog.id;
        }
      }
    }

    // 2. If not in a trade and trading not halted, evaluate entry conditions based strictly on bar i and past bars
    let signalTriggered = false;
    let signalSide: 'BUY' | 'SELL' | null = null;
    let calculatedScore = 50;

    if (!inTrade && !dailyTradingHalted && i < candles.length - 1) {
      // Toxic hours filter (e.g. first hour of trading or late close)
      let skipDueToToxic = false;
      if (config.filterToxicHours) {
        const date = new Date(currentBar.time);
        const hours = date.getUTCHours();
        // Skip between 12:00 UTC (09:00 BRT) and 13:00 UTC (10:00 BRT opening whip)
        if (config.market === 'B3' && (hours === 12 || hours >= 20)) {
          skipDueToToxic = true;
        }
      }

      if (!skipDueToToxic) {
        const currentClose = currentBar.close;
        const currentEma9 = ema9[i];
        const currentEma21 = ema21[i];
        const currentEma50 = ema50[i];
        const prevEma9 = ema9[i - 1];
        const prevEma21 = ema21[i - 1];
        const currentRsi = rsi14[i];
        const currentVwap = vwap[i];
        const currentAtr = atr14[i] || (currentClose * 0.015);

        switch (config.strategy) {
          case 'confluence_ai': {
            // MSC 3.0 (Maya Smart Confluence) - Macro EMA 50 + Anti-Chop + Leitura de Pavio + Pullback + Slope Direction
            const hasMacroData = i >= 49 && currentEma50 > 0;
            const isMacroBullish = hasMacroData ? currentClose > currentEma50 : true;
            const isMacroBearish = hasMacroData ? currentClose < currentEma50 : true;

            // Filtro de Inclinação (Slope): A média EMA 9 precisa estar ativamente inclinada na direção do trade
            const slopeBuy = currentEma9 > prevEma9 && (currentEma9 - prevEma9) / currentClose >= 0.0001;
            const slopeSell = currentEma9 < prevEma9 && (prevEma9 - currentEma9) / currentClose >= 0.0001;

            // Filtro Anti-Chop: Médias entrelaçadas indicam consolidação lateral sem liquidez
            const emaSpread = Math.abs(currentEma9 - currentEma21) / currentClose;
            const isNotChoppy = emaSpread >= 0.001;

            const isBullish = currentEma9 > currentEma21 && currentClose > currentVwap && isMacroBullish && isNotChoppy && slopeBuy;
            const isBearish = currentEma9 < currentEma21 && currentClose < currentVwap && isMacroBearish && isNotChoppy && slopeSell;
            const distEma9 = Math.abs(currentClose - currentEma9) / currentEma9;
            const isHealthyPullback = distEma9 <= 0.015;

            // Price Action: Análise de Pavios de Rejeição
            const candleRange = Math.max(0.0001, currentBar.high - currentBar.low);
            const upperWick = currentBar.high - Math.max(currentBar.open, currentClose);
            const lowerWick = Math.min(currentBar.open, currentClose) - currentBar.low;
            const upperWickRatio = upperWick / candleRange;
            const lowerWickRatio = lowerWick / candleRange;

            if (isBullish && isHealthyPullback) {
              let score = 45;
              if (currentClose > currentBar.open) score += 15;
              if (currentRsi >= 42 && currentRsi <= 68) score += 15;
              if (currentBar.volume > prevBar.volume * 1.05) score += 15;
              if (currentBar.low <= currentVwap * 1.006 && currentClose > currentVwap) score += 10;
              if (upperWickRatio <= 0.25) score += 10;
              else if (upperWickRatio > 0.40) score -= 25; // Rejeição de topo!

              calculatedScore = Math.max(0, Math.min(100, score));
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (isBearish && isHealthyPullback) {
              let score = 45;
              if (currentClose < currentBar.open) score += 15;
              if (currentRsi >= 32 && currentRsi <= 58) score += 15;
              if (currentBar.volume > prevBar.volume * 1.05) score += 15;
              if (currentBar.high >= currentVwap * 0.994 && currentClose < currentVwap) score += 10;
              if (lowerWickRatio <= 0.25) score += 10;
              else if (lowerWickRatio > 0.40) score -= 25; // Rejeição de fundo!

              calculatedScore = Math.max(0, Math.min(100, score));
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }

          case 'ema_breakout': {
            const bullishCross = prevEma9 <= prevEma21 && currentEma9 > currentEma21;
            const bullishBreakout = currentClose > prevBar.high;
            const bearishCross = prevEma9 >= prevEma21 && currentEma9 < currentEma21;
            const bearishBreakout = currentClose < prevBar.low;

            if (bullishCross && bullishBreakout) {
              calculatedScore = 80 + (currentRsi > 50 ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (bearishCross && bearishBreakout) {
              calculatedScore = 80 + (currentRsi < 50 ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }

          case 'mean_reversion': {
            const oversold = currentRsi <= 35 && currentRsi > rsi14[i - 1];
            const bullishCandle = currentClose > currentBar.open;
            const overbought = currentRsi >= 65 && currentRsi < rsi14[i - 1];
            const bearishCandle = currentClose < currentBar.open;

            if (oversold && bullishCandle) {
              calculatedScore = 80 + (currentBar.low <= prevBar.low ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (overbought && bearishCandle) {
              calculatedScore = 80 + (currentBar.high >= prevBar.high ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }

          case 'vwap_pullback': {
            const nearVwap = Math.abs(currentClose - currentVwap) / currentVwap <= 0.008;
            const bounce = currentClose > currentVwap && currentClose > currentBar.open;
            const reject = currentClose < currentVwap && currentClose < currentBar.open;

            if (nearVwap && bounce) {
              calculatedScore = 85;
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (nearVwap && reject) {
              calculatedScore = 85;
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }
        }

        if (signalTriggered && signalSide) {
          // Real execution happens at the OPEN of the NEXT bar (bar i+1), avoiding lookahead bias!
          const nextBar = candles[i + 1];
          const isBuy = signalSide === 'BUY';
          const entryPrice = isBuy
            ? nextBar.open * (1 + config.slippagePercent / 100)
            : nextBar.open * (1 - config.slippagePercent / 100);

          const stopDistance = Math.max(currentAtr * config.stopLossAtrMultiplier, entryPrice * 0.003);
          const stopLoss = isBuy ? entryPrice - stopDistance : entryPrice + stopDistance;
          const takeProfit = isBuy
            ? entryPrice + stopDistance * config.riskRewardRatio
            : entryPrice - stopDistance * config.riskRewardRatio;

          // Sizing proporcional inteligente:
          // Se FIXED_VALUE: aloca exatamente o valor fixo em R$ (ex: R$ 200 por trade).
          // Se PERCENT: aloca % do capital atual (default: 20%).
          let capitalToAllocate = currentCapital * 0.20;
          if (config.positionSizingType === 'FIXED_VALUE') {
            const fixedAmount = config.positionSizeValue && config.positionSizeValue > 0
              ? config.positionSizeValue
              : 200;
            capitalToAllocate = Math.min(fixedAmount, currentCapital);
          } else if (config.positionSizingType === 'PERCENT' && config.positionSizeValue && config.positionSizeValue > 0) {
            capitalToAllocate = currentCapital * (config.positionSizeValue / 100);
          }

          let quantity = 0;
          if (config.market === 'CRYPTO') {
            quantity = parseFloat((capitalToAllocate / entryPrice).toFixed(6));
          } else {
            const shares = Math.floor(capitalToAllocate / entryPrice);
            quantity = shares > 0 ? shares : (currentCapital >= entryPrice ? 1 : 0);
          }

          // Se o capital não for suficiente para a menor fração/ação, não opera
          if (quantity <= 0) {
            continue;
          }

          inTrade = {
            entryBar: i + 1,
            entryTime: nextBar.time,
            side: signalSide,
            entryPrice,
            stopLoss,
            initialStopLoss: stopLoss,
            takeProfit,
            quantity,
            breakevenMoved: false,
          };

          const entryLog: BacktestEventLog = {
            id: `log-entry-${trades.length + 1}-${nextBar.time}`,
            barIndex: i,
            timestamp: nextBar.time,
            type: 'ENTRY',
            title: isBuy
              ? `🚀 Ordem de Compra Executada (${config.symbol})`
              : `🔻 Ordem de Venda (SHORT) Executada (${config.symbol})`,
            description: `Gatilho ${isBuy ? 'COMPRA' : 'VENDA'} validado com ${calculatedScore}% de confluência. Entrada a ${entryPrice.toFixed(2)}. Alvo: ${takeProfit.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}.`,
            price: parseFloat(entryPrice.toFixed(2)),
            confidenceScore: calculatedScore,
          };
          eventLogs.push(entryLog);
          latestLogId = entryLog.id;
        } else if (idleBarsCount > 0 && idleBarsCount % 20 === 0) {
          // Periodic audit log showing discipline during quiet hours
          const waitLog: BacktestEventLog = {
            id: `log-wait-${i}-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'WAITING',
            title: `Aguardando Oportunidade (${idleBarsCount} candles)`,
            description: `Algoritmo em modo de espera há ${idleBarsCount} barras. Confluência atual ${calculatedScore}% abaixo da nota de corte (${config.confluenceThreshold}%). Capital protegido.`,
            confidenceScore: calculatedScore,
          };
          eventLogs.push(waitLog);
          latestLogId = waitLog.id;
        }
      }
    }

    // 3. Record snapshot frame for dynamic step-by-step playback!
    let floatingPnl = 0;
    let floatingPnlPercent = 0;
    if (inTrade) {
      if (inTrade.side === 'BUY') {
        floatingPnl = (currentBar.close - inTrade.entryPrice) * inTrade.quantity;
        floatingPnlPercent = ((currentBar.close - inTrade.entryPrice) / inTrade.entryPrice) * 100;
      } else {
        floatingPnl = (inTrade.entryPrice - currentBar.close) * inTrade.quantity;
        floatingPnlPercent = ((inTrade.entryPrice - currentBar.close) / inTrade.entryPrice) * 100;
      }
    }

    frames.push({
      barIndex: i,
      time: currentBar.time,
      candle: currentBar,
      status: inTrade ? 'IN_POSITION' : 'IDLE',
      idleBarsCount: inTrade ? 0 : idleBarsCount,
      currentCapital: parseFloat(currentCapital.toFixed(2)),
      confluenceScore: calculatedScore,
      position: inTrade
        ? {
            side: inTrade.side,
            entryPrice: parseFloat(inTrade.entryPrice.toFixed(2)),
            currentPrice: currentBar.close,
            stopLoss: parseFloat(inTrade.stopLoss.toFixed(2)),
            takeProfit: parseFloat(inTrade.takeProfit.toFixed(2)),
            quantity: inTrade.quantity,
            floatingPnl: parseFloat(floatingPnl.toFixed(2)),
            floatingPnlPercent: parseFloat(floatingPnlPercent.toFixed(2)),
            barsHeld: i - inTrade.entryBar,
            breakevenMoved: inTrade.breakevenMoved,
          }
        : null,
      closedTradesCount: trades.length,
      winningTradesCount: trades.filter(t => t.pnl > 0).length,
      losingTradesCount: trades.filter(t => t.pnl < 0).length,
      currentPnl: parseFloat(currentPnl.toFixed(2)),
      currentPnlPercent: parseFloat(currentPnlPercent.toFixed(2)),
      equity: parseFloat((currentCapital + floatingPnl).toFixed(2)),
      lastLogId: latestLogId,
    });
  }

  // Calculate final statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const breakevenTrades = trades.filter(t => t.pnl === 0).length;

  const winRate = totalTrades > 0 ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

  const totalGains = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));

  const profitFactor = totalLosses > 0 ? parseFloat((totalGains / totalLosses).toFixed(2)) : totalGains > 0 ? 99 : 0;
  const netProfit = parseFloat((currentCapital - config.initialCapital).toFixed(2));
  const netProfitPercent = parseFloat(((netProfit / config.initialCapital) * 100).toFixed(2));

  const avgWin = winningTrades > 0 ? parseFloat((totalGains / winningTrades).toFixed(2)) : 0;
  const avgLoss = losingTrades > 0 ? parseFloat((totalLosses / losingTrades).toFixed(2)) : 0;
  const avgTradePnl = totalTrades > 0 ? parseFloat((netProfit / totalTrades).toFixed(2)) : 0;

  const returns = trades.map(t => t.pnlPercent);
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    : 1;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? parseFloat(((meanReturn / stdDev) * Math.sqrt(totalTrades)).toFixed(2)) : 0;

  return {
    id: `bt-real-${Date.now()}`,
    config,
    totalCandles: candles.length,
    dateRange: {
      start: candles[0].time,
      end: candles[candles.length - 1].time,
    },
    initialCapital: config.initialCapital,
    finalCapital: parseFloat(currentCapital.toFixed(2)),
    netProfit,
    netProfitPercent,
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate,
    profitFactor,
    maxDrawdownPercent: parseFloat(maxDrawdownPercent.toFixed(1)),
    maxDrawdownValue: parseFloat(maxDrawdownValue.toFixed(2)),
    sharpeRatio,
    avgTradePnl,
    avgWin,
    avgLoss,
    trades,
    equityCurve,
    isRealData,
    dataSource,
    candles,
    frames,
    eventLogs,
  };
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
            // Scoring formula: prioritize positive net profit, win rate and profit factor with penalties for huge drawdown
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
