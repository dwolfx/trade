import { UserProfile, IntegrationAccount, ActiveSession, TerminalPreferences } from '../types/settings';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Victor Hugo',
  email: 'victor9009@gmail.com',
  phone: '+55 (11) 98765-4321',
  role: 'Product Designer & Trader',
  cpf: '438.921.848-12',
  avatarInitials: 'VH',
  bio: 'Product Designer com skills de Front-end. Focado em cockpits de trading e interfaces de alta performance para a B3.',
};

export const INITIAL_INTEGRATIONS: IntegrationAccount[] = [
  // B3 & Corretoras Nacionais
  {
    id: 'b3_open_finance',
    name: 'Área do Investidor B3',
    category: 'b3',
    description: 'Sincronização oficial de toda sua custódia consolidada, notas de corretagem e proventos via canal oficial da B3.',
    badge: 'Open Finance Oficial',
    status: 'disconnected',
  },
  {
    id: 'btg_pactual',
    name: 'BTG Pactual',
    category: 'b3',
    description: 'Ações, FIIs, Renda Fixa e contratos futuros (Mini-índice e Mini-dólar) com roteamento direto DMA2.',
    badge: 'Banco & Corretora',
    status: 'disconnected',
  },
  {
    id: 'xp_investimentos',
    name: 'XP Investimentos',
    category: 'b3',
    description: 'Leitura de custódia, extrato de proventos e execução de ordens em Ações e Fundos Imobiliários.',
    badge: 'Corretora B3',
    status: 'disconnected',
  },
  {
    id: 'clear_corretora',
    name: 'Clear Corretora',
    category: 'b3',
    description: 'Focada em Day Trade sem taxa de corretagem para mini-contratos e ações no mercado fracionário/padrão.',
    badge: 'Day Trade B3',
    status: 'disconnected',
  },
  {
    id: 'nuinvest',
    name: 'Nubank / NuInvest',
    category: 'b3',
    description: 'Importação de investimentos em Ações, BDRs e Fundos Imobiliários integrados à conta Nubank.',
    badge: 'Fintech B3',
    status: 'disconnected',
  },

  // Cripto Global
  {
    id: 'binance',
    name: 'Binance',
    category: 'crypto',
    description: 'Maior exchange global de criptomoedas. Conexão via API restrita apenas para leitura de saldo e trading spot.',
    badge: 'Cripto Global',
    status: 'disconnected',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    category: 'crypto',
    description: 'Negociação de Bitcoin, Ethereum e altcoins com livro de ofertas de baixa latência e pares em BRL/USDT.',
    badge: 'Derivativos & Spot',
    status: 'disconnected',
  },
  {
    id: 'mercado_bitcoin',
    name: 'Mercado Bitcoin',
    category: 'crypto',
    description: 'Exchange nacional regulada com depósitos e saques instantâneos via Pix e custódia em reais (BRL).',
    badge: 'Brasil Pix BRL',
    status: 'disconnected',
  },

  // Bolsas Internacionais (US & Global)
  {
    id: 'avenue',
    name: 'Avenue Securities',
    category: 'global',
    description: 'Investimentos em ações de Wall Street (NYSE, NASDAQ), ETFs e REITs americanos com conversão cambial direta.',
    badge: 'EUA em Reais',
    status: 'disconnected',
  },
  {
    id: 'interactive_brokers',
    name: 'Interactive Brokers (IBKR)',
    category: 'global',
    description: 'Acesso institucional a mais de 150 mercados e bolsas no mundo (EUA, Europa, Ásia) com taxas ultra baixas.',
    badge: '150+ Bolsas',
    status: 'disconnected',
  },
  {
    id: 'alpaca',
    name: 'Alpaca Markets',
    category: 'global',
    description: 'Plataforma para traders que utilizam automação e APIs para operar o mercado norte-americano.',
    badge: 'API Algo Trading',
    status: 'disconnected',
  },
];

export const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: 'sess_1',
    device: 'Windows 11 PC (Desktop)',
    browser: 'Google Chrome 128.0',
    location: 'São Paulo, Brasil',
    ip: '177.18.240.12',
    lastActive: 'Ativo agora neste dispositivo',
    isCurrent: true,
  },
  {
    id: 'sess_2',
    device: 'iPhone 15 Pro Max',
    browser: 'Safari Mobile 18.0',
    location: 'São Paulo, Brasil',
    ip: '179.108.92.44',
    lastActive: 'Há 2 horas',
    isCurrent: false,
  },
  {
    id: 'sess_3',
    device: 'MacBook Pro 16"',
    browser: 'Safari macOS',
    location: 'Campinas, Brasil',
    ip: '189.40.112.5',
    lastActive: 'Há 3 dias',
    isCurrent: false,
  },
];

export const INITIAL_TERMINAL_PREFERENCES: TerminalPreferences = {
  defaultMode: 'DEMO',
  soundEnabled: true,
  mayaBreakoutAlerts: true,
  mayaDividendAlerts: true,
  mayaNewsAlerts: true,
  highContrastColorblind: true,
  autoRefreshQuotes: true,
};
