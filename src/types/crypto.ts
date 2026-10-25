export type CryptoCategory = 'todos' | 'top' | 'layer1' | 'defi' | 'meme' | 'stablecoin';

export type CryptoQuoteCurrency = 'BRL' | 'USDT';

export interface CryptoAsset {
  symbol: string;         // e.g. 'BTCBRL'
  baseAsset: string;      // e.g. 'BTC'
  quoteAsset: string;     // e.g. 'BRL'
  name: string;           // e.g. 'Bitcoin'
  iconUrl?: string;
  price: number;
  changePercent24h: number;
  changeValue24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  category: CryptoCategory;
  circulatingSupply?: string;
  marketCap?: number;
}

export interface CryptoCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CryptoTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1S';

export interface FearAndGreedData {
  value: number;          // 0-100
  classification: string; // e.g. 'Ganância Extrema', 'Ganância', 'Neutro', 'Medo'
  lastUpdate: string;
}
