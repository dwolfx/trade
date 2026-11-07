import { Candle, Timeframe } from '../../types/market';
import { BotMarket } from '../../types/daytrade';
import { CryptoTimeframe } from '../../types/crypto';
import { fetchYahooCandles } from '../yahooFinanceService';
import { fetchCryptoCandles } from '../binanceService';
import { getLiveUsdRate } from '../currencyService';
import { BacktestPeriod, BACKTEST_PERIOD_CONFIG } from './types';

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

export async function fetchHistoricalCandlesForBacktest(
  symbol: string,
  market: BotMarket,
  timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D',
  period: BacktestPeriod = '30d',
  specificDate?: string
): Promise<{ candles: Candle[]; isReal: boolean; source: string }> {
  const periodMeta = BACKTEST_PERIOD_CONFIG[period] || BACKTEST_PERIOD_CONFIG['30d'];

  let startTimeMs: number | undefined;
  let endTimeMs: number | undefined;
  if (specificDate) {
    const startOfTarget = new Date(`${specificDate}T00:00:00Z`).getTime();
    const tfMinutes =
      timeframe === '1m' ? 1 :
      timeframe === '3m' ? 3 :
      timeframe === '5m' ? 5 :
      timeframe === '15m' ? 15 :
      timeframe === '30m' ? 30 : 60;
    startTimeMs = startOfTarget - 35 * tfMinutes * 60 * 1000;
    endTimeMs = startOfTarget + 24 * 60 * 60 * 1000;
  }

  try {
    if (market === 'CRYPTO') {
      const cryptoTf: CryptoTimeframe = timeframe === '1D' ? '1D' : (timeframe as CryptoTimeframe);
      const rawSymbol = symbol.toUpperCase().replace(/\.SA$/, '');

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
