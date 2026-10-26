import { Candle, Timeframe } from '../types/market';

export async function fetchYahooCandles(symbol: string, timeframe: Timeframe): Promise<Candle[] | null> {
  let interval = '1d';
  let range = '1y';

  switch (timeframe) {
    case '1m':
      interval = '1m';
      range = '5d';
      break;
    case '5m':
      interval = '5m';
      range = '5d';
      break;
    case '15m':
      interval = '15m';
      range = '5d';
      break;
    case '1h':
      interval = '60m';
      range = '1mo';
      break;
    case '1D':
      interval = '1d';
      range = '1y';
      break;
    case '1S':
      interval = '1wk';
      range = '2y';
      break;
    case '1M':
      interval = '1mo';
      range = '5y';
      break;
    case '1A':
      interval = '1mo';
      range = 'max';
      break;
  }

  const ticker = symbol.endsWith('.SA') ? symbol : `${symbol}.SA`;

  // Use Vite proxy '/api/yahoo' in browser environments to eliminate CORS completely
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  const baseUrl = isBrowser ? '/api/yahoo' : 'https://query1.finance.yahoo.com';
  const targetUrl = `${baseUrl}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;

  try {
    const res = await fetch(targetUrl, {
      headers: isBrowser ? undefined : { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) return null;

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators.quote[0];
    const opens: number[] = quote.open;
    const highs: number[] = quote.high;
    const lows: number[] = quote.low;
    const closes: number[] = quote.close;
    const volumes: number[] = quote.volume;

    const candles: Candle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (
        opens[i] !== null &&
        highs[i] !== null &&
        lows[i] !== null &&
        closes[i] !== null &&
        !isNaN(opens[i])
      ) {
        candles.push({
          time: timestamps[i] * 1000,
          open: Number(opens[i].toFixed(2)),
          high: Number(highs[i].toFixed(2)),
          low: Number(lows[i].toFixed(2)),
          close: Number(closes[i].toFixed(2)),
          volume: volumes[i] || 1000
        });
      }
    }

    // Always sort candles in strictly ascending chronological order
    candles.sort((a, b) => a.time - b.time);

    return candles.length > 0 ? candles : null;
  } catch {
    // Graceful fallback to initial realistic candles without polluting the console
    return null;
  }
}
