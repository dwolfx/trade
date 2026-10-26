export type NewsCategory = 'todas' | 'carteira' | 'cvm' | 'acoes' | 'macro' | 'cripto';
export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';
export type NewsSource = 'CVM / B3' | 'Brazil Journal' | 'InfoMoney' | 'Valor PRO' | 'Reuters' | 'CryptoPanic';
export type NewsActionSignal = 'COMPRAR' | 'VENDER' | 'MANTER';
export type NewsTimeRange = 'aovivo' | 'hoje' | 'semana' | '15dias' | 'mes' | 'todas';

export interface NewsItemAction {
  signal: NewsActionSignal;
  targetSymbol?: string;
  reason?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  aiSummary?: string;
  keyTakeaways?: string[];
  action?: NewsItemAction;
  imageUrl?: string;
  source: NewsSource;
  category: 'cvm' | 'acoes' | 'macro' | 'cripto';
  sentiment: NewsSentiment;
  publishedAt: string;
  timestamp: number;
  relatedTickers: string[];
  isBreaking?: boolean;
  readTime?: string;
  url?: string;
}
