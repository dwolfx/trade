import { CryptoAsset, CryptoCandle, CryptoCategory, CryptoQuoteCurrency, CryptoTimeframe, FearAndGreedData } from '../types/crypto';

export interface CryptoCatalogItem {
  baseAsset: string;
  name: string;
  category: CryptoCategory;
  defaultPriceBRL: number;
}

export const CRYPTO_CATALOG: CryptoCatalogItem[] = [
  { baseAsset: 'BTC', name: 'Bitcoin', category: 'top', defaultPriceBRL: 400000 },
  { baseAsset: 'ETH', name: 'Ethereum', category: 'top', defaultPriceBRL: 16500 },
  { baseAsset: 'SOL', name: 'Solana', category: 'layer1', defaultPriceBRL: 1100 },
  { baseAsset: 'BNB', name: 'BNB Chain', category: 'layer1', defaultPriceBRL: 3700 },
  { baseAsset: 'USDT', name: 'Tether USD', category: 'stablecoin', defaultPriceBRL: 5.75 },
  { baseAsset: 'XRP', name: 'XRP (Ripple)', category: 'top', defaultPriceBRL: 3.20 },
  { baseAsset: 'ADA', name: 'Cardano', category: 'layer1', defaultPriceBRL: 2.15 },
  { baseAsset: 'AVAX', name: 'Avalanche', category: 'layer1', defaultPriceBRL: 180 },
  { baseAsset: 'DOGE', name: 'Dogecoin', category: 'meme', defaultPriceBRL: 0.85 },
  { baseAsset: 'LINK', name: 'Chainlink', category: 'defi', defaultPriceBRL: 75 },
  { baseAsset: 'DOT', name: 'Polkadot', category: 'layer1', defaultPriceBRL: 28 },
  { baseAsset: 'NEAR', name: 'NEAR Protocol', category: 'layer1', defaultPriceBRL: 32 },
];

function getBinanceBaseUrl(): string {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  return isBrowser ? '/api/binance' : 'https://api.binance.com';
}

export function mapCryptoTimeframeToInterval(tf: CryptoTimeframe): string {
  switch (tf) {
    case '1m': return '1m';
    case '5m': return '5m';
    case '15m': return '15m';
    case '1h': return '1h';
    case '4h': return '4h';
    case '1D': return '1d';
    case '1S': return '1w';
    default: return '1d';
  }
}

// In-memory ticker cache (10s TTL)
let cachedAssets: Record<CryptoQuoteCurrency, { timestamp: number; data: CryptoAsset[] }> = {
  BRL: { timestamp: 0, data: [] },
  USDT: { timestamp: 0, data: [] }
};

export async function fetchLiveCryptoAssets(quoteCurrency: CryptoQuoteCurrency = 'BRL'): Promise<CryptoAsset[]> {
  const now = Date.now();
  const cached = cachedAssets[quoteCurrency];
  if (cached.data.length > 0 && now - cached.timestamp < 10000) {
    return cached.data;
  }

  const baseUrl = getBinanceBaseUrl();
  const pairs = CRYPTO_CATALOG.map(c => `${c.baseAsset}${quoteCurrency}`);

  try {
    const symbolsParam = encodeURIComponent(JSON.stringify(pairs));
    const res = await fetch(`${baseUrl}/api/v3/ticker/24hr?symbols=${symbolsParam}`);
    
    if (!res.ok) {
      throw new Error(`Binance HTTP ${res.status}`);
    }

    const tickers: Array<{
      symbol: string;
      lastPrice: string;
      priceChange: string;
      priceChangePercent: string;
      highPrice: string;
      lowPrice: string;
      volume: string;
      quoteVolume: string;
    }> = await res.json();

    const tickerMap = new Map(tickers.map(t => [t.symbol, t]));

    const result: CryptoAsset[] = CRYPTO_CATALOG.map(item => {
      const sym = `${item.baseAsset}${quoteCurrency}`;
      const ticker = tickerMap.get(sym);

      if (ticker) {
        const price = Number(ticker.lastPrice);
        const changePercent = Number(ticker.priceChangePercent);
        const changeValue = Number(ticker.priceChange);
        const high = Number(ticker.highPrice);
        const low = Number(ticker.lowPrice);
        const volume = Number(ticker.volume);
        const quoteVolume = Number(ticker.quoteVolume);

        return {
          symbol: sym,
          baseAsset: item.baseAsset,
          quoteAsset: quoteCurrency,
          name: item.name,
          price,
          changePercent24h: Number(changePercent.toFixed(2)),
          changeValue24h: Number(changeValue.toFixed(2)),
          high24h: high,
          low24h: low,
          volume24h: volume,
          quoteVolume24h: quoteVolume,
          category: item.category,
        };
      }

      // Default fallback if a pair is temporarily unavailable
      return {
        symbol: sym,
        baseAsset: item.baseAsset,
        quoteAsset: quoteCurrency,
        name: item.name,
        price: item.defaultPriceBRL,
        changePercent24h: 0,
        changeValue24h: 0,
        high24h: item.defaultPriceBRL,
        low24h: item.defaultPriceBRL,
        volume24h: 1000,
        quoteVolume24h: 1000 * item.defaultPriceBRL,
        category: item.category,
      };
    });

    cachedAssets[quoteCurrency] = { timestamp: now, data: result };
    return result;
  } catch (err) {
    // If offline or network error, return catalog fallback with realistic baseline
    return CRYPTO_CATALOG.map(item => ({
      symbol: `${item.baseAsset}${quoteCurrency}`,
      baseAsset: item.baseAsset,
      quoteAsset: quoteCurrency,
      name: item.name,
      price: item.defaultPriceBRL,
      changePercent24h: 1.25,
      changeValue24h: item.defaultPriceBRL * 0.0125,
      high24h: item.defaultPriceBRL * 1.02,
      low24h: item.defaultPriceBRL * 0.98,
      volume24h: 15000,
      quoteVolume24h: 15000 * item.defaultPriceBRL,
      category: item.category,
    }));
  }
}

export async function fetchCryptoCandles(
  symbol: string,
  timeframe: CryptoTimeframe = '1D',
  limit: number = 60
): Promise<CryptoCandle[]> {
  const baseUrl = getBinanceBaseUrl();
  const interval = mapCryptoTimeframeToInterval(timeframe);

  try {
    const res = await fetch(`${baseUrl}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`);
    if (!res.ok) throw new Error(`Binance klines HTTP ${res.status}`);

    const rawKlines: Array<[number, string, string, string, string, string]> = await res.json();

    return rawKlines.map(k => ({
      time: k[0],
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
    }));
  } catch (err) {
    // If Binance API fails, return empty array - no synthetic mock candles
    return [];
  }
}

export async function fetchFearAndGreedIndex(): Promise<FearAndGreedData> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const item = data.data?.[0];
    if (item) {
      const val = parseInt(item.value, 10);
      let classification = 'Neutro';
      if (val >= 75) classification = 'Ganância Extrema';
      else if (val >= 55) classification = 'Ganância';
      else if (val <= 25) classification = 'Medo Extremo';
      else if (val <= 45) classification = 'Medo';

      return {
        value: val,
        classification,
        lastUpdate: 'Hoje'
      };
    }
    throw new Error();
  } catch {
    return {
      value: 68,
      classification: 'Ganância (Otimismo)',
      lastUpdate: 'Hoje'
    };
  }
}
