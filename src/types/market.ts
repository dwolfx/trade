export interface StockAsset {
  symbol: string;
  name: string;
  exchange: 'B3' | 'NASDAQ' | 'BINANCE';
  price: number;
  changePercent: number;
  changeValue: number;
  volume: string;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  category: 'acoes' | 'fiis' | 'bdr' | 'cripto';
  isFavorite?: boolean;
  lastSearched?: string;
  tradesCount?: number;
}

export interface Candle {
  time: number; // timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop';

export interface ExecutedOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  total: number;
  fees: number;
  timestamp: number;
  mode: 'DEMO' | 'LIVE';
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  plValue: number;
  plPercent: number;
}

export type FeaturedTab = 'recent' | 'favorites' | 'portfolio' | 'most_traded';
export type PortfolioCategory = 'todos' | 'acoes' | 'fiis' | 'cdb' | 'poupanca' | 'daytrade';

export interface DividendEvent {
  id: string;
  symbol: string;
  name: string;
  type: 'Dividendo' | 'JCP' | 'Rendimento';
  dateCom: string;
  paymentDate: string;
  valuePerShare: number;
  quantity: number;
  totalAmount: number;
  status: 'previsto' | 'pago';
}

export interface NonEquityAsset {
  id: string;
  name: string;
  category: 'cdb' | 'poupanca' | 'daytrade';
  institution: string;
  investedAmount: number;
  currentAmount: number;
  plValue: number;
  plPercent: number;
  rateDescription: string;
  liquidity: string;
  dueDate?: string;
}
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1D' | '1S' | '1M' | '1A';
export type ActiveNav = 'noticias' | 'bolsa' | 'daytrade' | 'cripto' | 'dividendos' | 'carteira';
