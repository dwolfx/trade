import { DividendEvent, NonEquityAsset } from '../types/market';

export const INITIAL_NON_EQUITY_ASSETS: NonEquityAsset[] = [
  {
    id: 'cdb-1',
    name: 'CDB Banco Inter Liquidez Diária',
    category: 'cdb',
    institution: 'Banco Inter',
    investedAmount: 18000.00,
    currentAmount: 19450.80,
    plValue: 1450.80,
    plPercent: 8.06,
    rateDescription: '102% do CDI',
    liquidity: 'Diária D+0',
    dueDate: '2028-10-15'
  },
  {
    id: 'cdb-2',
    name: 'Tesouro Selic 2029',
    category: 'cdb',
    institution: 'Tesouro Direto',
    investedAmount: 12000.00,
    currentAmount: 12980.40,
    plValue: 980.40,
    plPercent: 8.17,
    rateDescription: 'Selic + 0,15% a.a.',
    liquidity: 'D+1',
    dueDate: '2029-03-01'
  },
  {
    id: 'poup-1',
    name: 'Poupança Caixa Reserva',
    category: 'poupanca',
    institution: 'Caixa Econômica',
    investedAmount: 8500.00,
    currentAmount: 8940.20,
    plValue: 440.20,
    plPercent: 5.18,
    rateDescription: 'TR + 0,5% a.m.',
    liquidity: 'Imediata 24/7'
  },
  {
    id: 'dt-1',
    name: 'Margem Alocada Day Trade B3',
    category: 'daytrade',
    institution: 'TradeCraft Clear Broker',
    investedAmount: 5000.00,
    currentAmount: 5740.00,
    plValue: 740.00,
    plPercent: 14.80,
    rateDescription: 'Mini-Índice (WIN) & Mini-Dólar (WDO)',
    liquidity: 'Intradiária (Kill Switch)'
  }
];

export const UPCOMING_DIVIDENDS: DividendEvent[] = [
  {
    id: 'div-1',
    symbol: 'PETR4',
    name: 'Petróleo Brasileiro S.A.',
    type: 'Dividendo',
    dateCom: '18/11/2026',
    paymentDate: '28/11/2026',
    valuePerShare: 1.45,
    quantity: 200,
    totalAmount: 290.00,
    status: 'previsto'
  },
  {
    id: 'div-2',
    symbol: 'HGLG11',
    name: 'CSHG Logística FII',
    type: 'Rendimento',
    dateCom: '31/10/2026',
    paymentDate: '14/11/2026',
    valuePerShare: 1.10,
    quantity: 50,
    totalAmount: 55.00,
    status: 'previsto'
  },
  {
    id: 'div-3',
    symbol: 'BBAS3',
    name: 'Banco do Brasil S.A.',
    type: 'JCP',
    dateCom: '25/11/2026',
    paymentDate: '08/12/2026',
    valuePerShare: 0.84,
    quantity: 300,
    totalAmount: 252.00,
    status: 'previsto'
  },
  {
    id: 'div-4',
    symbol: 'WEGE3',
    name: 'WEG S.A.',
    type: 'Dividendo',
    dateCom: '02/12/2026',
    paymentDate: '18/12/2026',
    valuePerShare: 0.32,
    quantity: 100,
    totalAmount: 32.00,
    status: 'previsto'
  }
];

export const RECENT_PAID_DIVIDENDS: DividendEvent[] = [
  {
    id: 'paid-1',
    symbol: 'WEGE3',
    name: 'WEG S.A.',
    type: 'Dividendo',
    dateCom: '28/09/2026',
    paymentDate: '15/10/2026',
    valuePerShare: 0.28,
    quantity: 100,
    totalAmount: 28.00,
    status: 'pago'
  },
  {
    id: 'paid-2',
    symbol: 'PETR4',
    name: 'Petróleo Brasileiro S.A.',
    type: 'JCP',
    dateCom: '12/09/2026',
    paymentDate: '02/10/2026',
    valuePerShare: 1.22,
    quantity: 200,
    totalAmount: 244.00,
    status: 'pago'
  },
  {
    id: 'paid-3',
    symbol: 'HGLG11',
    name: 'CSHG Logística FII',
    type: 'Rendimento',
    dateCom: '31/08/2026',
    paymentDate: '14/09/2026',
    valuePerShare: 1.10,
    quantity: 50,
    totalAmount: 55.00,
    status: 'pago'
  }
];

export interface HistoryDataPoint {
  date: string;
  equityValue: number;
  totalPatrimony: number;
  plAccumulated: number;
}

export type PortfolioTimeframeRange = 'HOJE' | '1S' | '1M' | '3M' | '6M' | '1A' | 'ALL';

export const PORTFOLIO_HISTORY_BY_TIMEFRAME: Record<PortfolioTimeframeRange, HistoryDataPoint[]> = {
  'HOJE': [
    { date: '10:00', equityValue: 31050, totalPatrimony: 72400, plAccumulated: 5290 },
    { date: '11:00', equityValue: 31120, totalPatrimony: 72550, plAccumulated: 5440 },
    { date: '12:00', equityValue: 31080, totalPatrimony: 72480, plAccumulated: 5370 },
    { date: '13:00', equityValue: 31150, totalPatrimony: 72600, plAccumulated: 5490 },
    { date: '14:00', equityValue: 31210, totalPatrimony: 72720, plAccumulated: 5610 },
    { date: '15:00', equityValue: 31180, totalPatrimony: 72680, plAccumulated: 5570 },
    { date: '16:00', equityValue: 31230, totalPatrimony: 72760, plAccumulated: 5650 },
    { date: '17:00', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
    { date: '18:00', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
  ],
  '1S': [
    { date: 'Dom', equityValue: 30800, totalPatrimony: 71900, plAccumulated: 5200 },
    { date: 'Seg', equityValue: 30950, totalPatrimony: 72200, plAccumulated: 5380 },
    { date: 'Ter', equityValue: 31100, totalPatrimony: 72500, plAccumulated: 5530 },
    { date: 'Qua', equityValue: 31020, totalPatrimony: 72350, plAccumulated: 5420 },
    { date: 'Qui', equityValue: 31180, totalPatrimony: 72650, plAccumulated: 5590 },
    { date: 'Sex', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
    { date: 'Sáb', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
  ],
  '1M': [
    { date: 'Sem 1', equityValue: 29800, totalPatrimony: 70200, plAccumulated: 4600 },
    { date: 'Sem 2', equityValue: 30100, totalPatrimony: 70900, plAccumulated: 4920 },
    { date: 'Sem 3', equityValue: 30600, totalPatrimony: 71500, plAccumulated: 5200 },
    { date: 'Sem 4', equityValue: 30900, totalPatrimony: 72100, plAccumulated: 5450 },
    { date: 'Hoje', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
  ],
  '3M': [
    { date: 'Ago/26', equityValue: 28200, totalPatrimony: 67900, plAccumulated: 3820 },
    { date: 'Set/26', equityValue: 29100, totalPatrimony: 69400, plAccumulated: 4350 },
    { date: 'Out/26', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
  ],
  '6M': [
    { date: 'Mai/26', equityValue: 24800, totalPatrimony: 62000, plAccumulated: 1100 },
    { date: 'Jun/26', equityValue: 25400, totalPatrimony: 63500, plAccumulated: 1850 },
    { date: 'Jul/26', equityValue: 26900, totalPatrimony: 65800, plAccumulated: 2900 },
    { date: 'Ago/26', equityValue: 28200, totalPatrimony: 67900, plAccumulated: 3820 },
    { date: 'Set/26', equityValue: 29100, totalPatrimony: 69400, plAccumulated: 4350 },
    { date: 'Out/26', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
  ],
  '1A': [
    { date: 'Nov/25', equityValue: 21500, totalPatrimony: 54000, plAccumulated: -400 },
    { date: 'Dez/25', equityValue: 22100, totalPatrimony: 55600, plAccumulated: 150 },
    { date: 'Jan/26', equityValue: 22800, totalPatrimony: 57200, plAccumulated: 350 },
    { date: 'Fev/26', equityValue: 23300, totalPatrimony: 58400, plAccumulated: 520 },
    { date: 'Mar/26', equityValue: 23900, totalPatrimony: 59800, plAccumulated: 780 },
    { date: 'Abr/26', equityValue: 24300, totalPatrimony: 60900, plAccumulated: 950 },
    { date: 'Mai/26', equityValue: 24800, totalPatrimony: 62000, plAccumulated: 1100 },
    { date: 'Jun/26', equityValue: 25400, totalPatrimony: 63500, plAccumulated: 1850 },
    { date: 'Jul/26', equityValue: 26900, totalPatrimony: 65800, plAccumulated: 2900 },
    { date: 'Ago/26', equityValue: 28200, totalPatrimony: 67900, plAccumulated: 3820 },
    { date: 'Set/26', equityValue: 29100, totalPatrimony: 69400, plAccumulated: 4350 },
    { date: 'Out/26', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
  ],
  'ALL': [
    { date: '2024', equityValue: 12000, totalPatrimony: 32000, plAccumulated: -950 },
    { date: '2025 S1', equityValue: 16500, totalPatrimony: 43000, plAccumulated: 420 },
    { date: '2025 S2', equityValue: 21500, totalPatrimony: 54000, plAccumulated: 1200 },
    { date: '2026 S1', equityValue: 25400, totalPatrimony: 63500, plAccumulated: 2900 },
    { date: 'Atual', equityValue: 31250, totalPatrimony: 72800, plAccumulated: 5690 },
  ]
};

export const PORTFOLIO_HISTORY_DATA = PORTFOLIO_HISTORY_BY_TIMEFRAME['6M'];
