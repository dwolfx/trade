import { Timeframe } from '../types/market';

export interface BrapiQuoteResponse {
  results: Array<{
    symbol: string;
    shortName: string;
    longName: string;
    currency: string;
    regularMarketPrice: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketTime: string;
    marketCap: number;
    regularMarketVolume: number;
    regularMarketPreviousClose: number;
    regularMarketOpen: number;
    logourl?: string;
    historicalDataPrice?: Array<{
      date: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  }>;
}

export interface BrapiSearchResult {
  stock: string;
  name: string;
  close: number;
  change: number;
  volume: number;
  market_cap?: number;
  logo?: string;
  sector?: string;
  type?: string;
}

const BRAPI_TOKEN = '6TbHWbEPR3BtQvTgrXyc3q';

export function getTimeframeParams(tf: Timeframe): { range: string; interval: string } {
  switch (tf) {
    case '1m': return { range: '1d', interval: '1m' };
    case '5m': return { range: '1d', interval: '5m' };
    case '15m': return { range: '5d', interval: '15m' };
    case '1h': return { range: '5d', interval: '60m' };
    case '1D': return { range: '3mo', interval: '1d' };
    case '1S': return { range: '1y', interval: '1wk' };
    case '1M': return { range: '2y', interval: '1mo' };
    case '1A': return { range: '5y', interval: '1mo' };
    default: return { range: '3mo', interval: '1d' };
  }
}

// In-memory cache to respect rate limits
const cache = new Map<string, { timestamp: number; data: BrapiQuoteResponse['results'][0] }>();
const CACHE_TTL = 30 * 1000; // 30s cache

export async function fetchBrapiQuote(
  symbol: string,
  range: string = '3mo',
  interval: string = '1d'
): Promise<BrapiQuoteResponse['results'][0] | null> {
  // Brapi Free Plan only permits interval='1d'. Sanitize to avoid HTTP 400:
  const safeInterval = interval === '1d' ? '1d' : '1d';
  const safeRange = range;

  const cacheKey = `${symbol}_${safeRange}_${safeInterval}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://brapi.dev/api/quote/${encodeURIComponent(symbol)}?range=${safeRange}&interval=${safeInterval}&token=${BRAPI_TOKEN}`);
    if (!res.ok) {
      return null;
    }
    const data: BrapiQuoteResponse = await res.json();
    if (data.results && data.results.length > 0) {
      const quote = data.results[0];
      cache.set(cacheKey, { timestamp: Date.now(), data: quote });
      return quote;
    }
    return null;
  } catch {
    return null;
  }
}

// Search across all B3 stocks via Brapi
export async function searchBrapiAssets(query: string): Promise<BrapiSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(`https://brapi.dev/api/quote/list?search=${encodeURIComponent(query.trim())}&limit=12&token=${BRAPI_TOKEN}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.stocks && Array.isArray(data.stocks)) {
      const queryEndsWithF = query.trim().toUpperCase().endsWith('F');
      return data.stocks.filter((s: BrapiSearchResult) => {
        if (!queryEndsWithF && s.stock.endsWith('F') && s.stock.length > 5) {
          return false;
        }
        return true;
      });
    }
    return [];
  } catch (err) {
    console.error('Error searching Brapi assets:', err);
    return [];
  }
}
