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
    name: 'Open Finance B3 (Bolsa Oficial)',
    category: 'b3',
    description: 'Sincronização oficial de custódia consolidada, notas de corretagem e proventos via CVM/B3.',
    badge: 'Oficial B3',
    status: 'connected',
    lastSync: 'Hoje, 10:45',
    connectedAccountName: 'B3 Custódia Unificada',
  },
  {
    id: 'btg_pactual',
    name: 'BTG Pactual',
    category: 'b3',
    description: 'Integração de ordens diretas via protocolo DMA2 e extrato de Renda Fixa / CDBs.',
    badge: 'Banco & Corretora',
    status: 'connected',
    lastSync: 'Hoje, 14:20',
    connectedAccountName: 'Conta Investimento BTG (Ag 0001 · 84920-1)',
  },
  {
    id: 'xp_investimentos',
    name: 'XP Investimentos',
    category: 'b3',
    description: 'Conexão de custódia de Ações, FIIs e COE com leitura de notas de corretagem.',
    badge: 'Corretora',
    status: 'connected',
    lastSync: 'Ontem, 18:00',
    connectedAccountName: 'XP Digital (Conta 349102-8)',
  },
  {
    id: 'clear_corretora',
    name: 'Clear Corretora',
    category: 'b3',
    description: 'Envio de ordens de Daytrade com margem reduzida para mini-índice e mini-dólar.',
    badge: 'Daytrade B3',
    status: 'disconnected',
  },
  {
    id: 'nuinvest',
    name: 'NuInvest / Nubank',
    category: 'b3',
    description: 'Sincronização de caixinhas, RDBs e portfólio de ações do Nubank.',
    badge: 'Fintech',
    status: 'disconnected',
  },

  // Cripto Global
  {
    id: 'binance',
    name: 'Binance',
    category: 'crypto',
    description: 'Conexão via API Key Oficial (Restrita para leitura de saldo e trading spot).',
    badge: 'Top 1 Cripto',
    status: 'connected',
    lastSync: 'Há 5 minutos',
    connectedAccountName: 'Conta Spot Principal',
    apiKeyMasked: 'vm_live_79a2••••••••••••4f81',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    category: 'crypto',
    description: 'Trading de derivativos e pares em BRL/USDT com livro de ofertas de baixa latência.',
    badge: 'Derivativos',
    status: 'disconnected',
  },
  {
    id: 'mercado_bitcoin',
    name: 'Mercado Bitcoin',
    category: 'crypto',
    description: 'Corretora brasileira regulada pelo Banco Central com saques Pix instantâneos.',
    badge: 'Brasil Pix',
    status: 'disconnected',
  },

  // Bolsas Internacionais (US & Global)
  {
    id: 'avenue',
    name: 'Avenue Securities',
    category: 'global',
    description: 'Acesso ao mercado americano (NYSE / NASDAQ) com relatórios prontos para DIRPF.',
    badge: 'EUA BRL/USD',
    status: 'connected',
    lastSync: 'Hoje, 12:00',
    connectedAccountName: 'Avenue Banking & Invest',
  },
  {
    id: 'interactive_brokers',
    name: 'Interactive Brokers (IBKR)',
    category: 'global',
    description: 'Acesso a mais de 150 mercados globais com taxas institucionais ultra-baixas.',
    badge: 'Global 150+ Bolsas',
    status: 'disconnected',
  },
  {
    id: 'alpaca',
    name: 'Alpaca Markets',
    category: 'global',
    description: 'API automatizada para algoritmos de negociação em ações americanas sem corretagem.',
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
