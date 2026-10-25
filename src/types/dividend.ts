export type DividendCategory = 'acao' | 'fii';
export type DividendType = 'Dividendo' | 'JCP' | 'Rendimento';
export type DividendStatus = 'previsto' | 'pago' | 'confirmado';

export interface DividendCalendarItem {
  id: string;
  symbol: string;
  name: string;
  category: DividendCategory;
  type: DividendType;
  paymentDate: string; // ISO format "YYYY-MM-DD"
  paymentDateDisplay: string; // "DD/MM/YYYY"
  dateCom: string; // ISO format "YYYY-MM-DD"
  dateComDisplay: string; // "DD/MM/YYYY"
  valuePerShare: number;
  yieldPercent?: number; // e.g. 1.08%
  status: DividendStatus;
  description?: string;
}

export type DividendOriginFilter = 'carteira' | 'mercado';
export type DividendCategoryFilter = 'all' | 'fii' | 'acao' | 'datacom_aberta';
export type DividendFilterScope = 'all' | 'carteira' | 'fii' | 'acao' | 'datacom_aberta';
