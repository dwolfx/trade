export type SettingsTab = 'perfil' | 'conexoes' | 'seguranca' | 'terminal';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  cpf: string;
  avatarInitials: string;
  bio?: string;
}

export type IntegrationCategory = 'b3' | 'crypto' | 'global';

export interface IntegrationAccount {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  badge: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  connectedAccountName?: string;
  apiKeyMasked?: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface TerminalPreferences {
  defaultMode: 'DEMO' | 'LIVE';
  soundEnabled: boolean;
  mayaBreakoutAlerts: boolean;
  mayaDividendAlerts: boolean;
  mayaNewsAlerts: boolean;
  highContrastColorblind: boolean;
  autoRefreshQuotes: boolean;
}
