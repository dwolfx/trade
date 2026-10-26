import { Candle, Timeframe } from '../types/market';

function getPreviousTradingTimestamp(currentTimestamp: number, intervalMs: number): number {
  let prev = currentTimestamp - intervalMs;
  const d = new Date(prev);
  const timeInMinutes = d.getHours() * 60 + d.getMinutes();
  const marketOpen = 10 * 60; // 10:00
  const marketClose = 17 * 60; // 17:00

  // If before market open, step back to 17:00 of the previous business day
  if (timeInMinutes < marketOpen) {
    d.setDate(d.getDate() - 1);
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() - 1);
    }
    d.setHours(17, 0, 0, 0);
    prev = d.getTime();
  } else if (timeInMinutes > marketClose) {
    d.setHours(17, 0, 0, 0);
    prev = d.getTime();
  }
  return prev;
}

export function generateInitialCandles(basePrice: number, timeframe: Timeframe, count: number = 60): Candle[] {
  const candles: Candle[] = [];
  
  // Align start to a valid market trading moment
  let cursorTime = Date.now();
  const nowDate = new Date(cursorTime);
  // If weekend, go back to Friday 17:00
  if (nowDate.getDay() === 6) {
    nowDate.setDate(nowDate.getDate() - 1);
    nowDate.setHours(17, 0, 0, 0);
    cursorTime = nowDate.getTime();
  } else if (nowDate.getDay() === 0) {
    nowDate.setDate(nowDate.getDate() - 2);
    nowDate.setHours(17, 0, 0, 0);
    cursorTime = nowDate.getTime();
  }
  
  let intervalMs = 60 * 1000; // 1m
  const isIntraday = timeframe === '1m' || timeframe === '5m' || timeframe === '15m' || timeframe === '1h';

  if (timeframe === '5m') intervalMs = 5 * 60 * 1000;
  if (timeframe === '15m') intervalMs = 15 * 60 * 1000;
  if (timeframe === '1h') intervalMs = 60 * 60 * 1000;
  if (timeframe === '1D') intervalMs = 24 * 60 * 60 * 1000;
  if (timeframe === '1S') intervalMs = 7 * 24 * 60 * 60 * 1000;
  if (timeframe === '1M') intervalMs = 30 * 24 * 60 * 60 * 1000;
  if (timeframe === '1A') intervalMs = 365 * 24 * 60 * 60 * 1000;

  // Walk backwards from basePrice so the latest candle matches basePrice perfectly
  let nextOpen = basePrice;
  const volatility = Math.max(0.01, basePrice * 0.0035);

  for (let i = 0; i < count; i++) {
    const time = cursorTime;
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
    cursorTime = isIntraday
      ? getPreviousTradingTimestamp(cursorTime, intervalMs)
      : cursorTime - intervalMs;
  }

  // Ensure ascending chronological order
  candles.sort((a, b) => a.time - b.time);

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
