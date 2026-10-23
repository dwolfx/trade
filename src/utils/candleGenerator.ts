import { Candle, Timeframe } from '../types/market';

export function generateInitialCandles(basePrice: number, timeframe: Timeframe, count: number = 60): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  
  let intervalMs = 60 * 1000; // 1m
  if (timeframe === '5m') intervalMs = 5 * 60 * 1000;
  if (timeframe === '15m') intervalMs = 15 * 60 * 1000;
  if (timeframe === '1h') intervalMs = 60 * 60 * 1000;
  if (timeframe === '1D') intervalMs = 24 * 60 * 60 * 1000;
  if (timeframe === '1S') intervalMs = 7 * 24 * 60 * 60 * 1000;
  if (timeframe === '1M') intervalMs = 30 * 24 * 60 * 60 * 1000;
  if (timeframe === '1A') intervalMs = 365 * 24 * 60 * 60 * 1000;

  // Walk backwards from basePrice so the latest candle matches basePrice perfectly
  // without any artificial vertical spike or jump.
  let nextOpen = basePrice;
  const volatility = Math.max(0.01, basePrice * 0.0035);

  for (let i = 0; i < count; i++) {
    const time = now - i * intervalMs;
    const close = nextOpen;
    const delta = (Math.random() - 0.49) * volatility;
    const open = Math.max(0.01, close - delta);
    const high = Math.max(open, close) + Math.random() * volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * volatility * 0.6;
    const volume = Math.floor(Math.random() * 80000 + 10000);

    candles.unshift({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });

    nextOpen = open;
  }

  return candles;
}

export function generateNextTick(lastCandle: Candle, timeframe: Timeframe): { updatedCandle: Candle; isNewCandle: boolean } {
  let intervalMs = 60 * 1000;
  if (timeframe === '5m') intervalMs = 5 * 60 * 1000;
  if (timeframe === '15m') intervalMs = 15 * 60 * 1000;
  if (timeframe === '1h') intervalMs = 60 * 60 * 1000;
  if (timeframe === '1D') intervalMs = 24 * 60 * 60 * 1000;

  const now = Date.now();
  const timeSinceLast = now - lastCandle.time;
  const isNewCandle = timeSinceLast >= intervalMs;

  const delta = (Math.random() - 0.49) * (lastCandle.close * 0.0012);
  const newPrice = Math.max(0.01, Number((lastCandle.close + delta).toFixed(2)));

  if (isNewCandle) {
    return {
      updatedCandle: {
        time: now,
        open: lastCandle.close,
        high: Math.max(lastCandle.close, newPrice),
        low: Math.min(lastCandle.close, newPrice),
        close: newPrice,
        volume: Math.floor(Math.random() * 5000 + 500)
      },
      isNewCandle: true
    };
  } else {
    return {
      updatedCandle: {
        ...lastCandle,
        high: Math.max(lastCandle.high, newPrice),
        low: Math.min(lastCandle.low, newPrice),
        close: newPrice,
        volume: lastCandle.volume + Math.floor(Math.random() * 1000 + 100)
      },
      isNewCandle: false
    };
  }
}
