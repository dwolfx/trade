import React, { useState, useEffect } from 'react';
import { SettingsTab, UserProfile, IntegrationAccount, ActiveSession, TerminalPreferences } from '../../types/settings';
import {
  INITIAL_USER_PROFILE,
  INITIAL_INTEGRATIONS,
  INITIAL_SESSIONS,
  INITIAL_TERMINAL_PREFERENCES,
} from '../../data/mockSettings';
import { ProfileTab } from './ProfileTab';
import { ConnectionsTab } from './ConnectionsTab';
import { SecurityTab } from './SecurityTab';
import { TerminalPreferencesTab } from './TerminalPreferencesTab';
import {
  User,
  Link2,
  ShieldCheck,
  Sliders,
  X,
  Settings,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'perfil',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [accounts, setAccounts] = useState<IntegrationAccount[]>(INITIAL_INTEGRATIONS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [preferences, setPreferences] = useState<TerminalPreferences>(INITIAL_TERMINAL_PREFERENCES);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const connectedAccountsCount = accounts.filter((a) => a.status === 'connected').length;

  const handleRevokeOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  const navItems = [
    {
      id: 'perfil' as SettingsTab,
      label: 'Meu Perfil',
      description: 'Dados cadastrais, e-mail e CPF',
      icon: User,
    },
    {
      id: 'conexoes' as SettingsTab,
      label: 'Conectar Contas',
      description: 'B3, Cripto & Bolsas Globais',
      icon: Link2,
      badge: `${connectedAccountsCount} ativas`,
    },
    {
      id: 'seguranca' as SettingsTab,
      label: 'Segurança & Acesso',
      description: 'Senha, 2FA e sessões ativas',
      icon: ShieldCheck,
    },
    {
      id: 'terminal' as SettingsTab,
      label: 'Terminal & Maya IA',
      description: 'Alertas inteligentes e ambiente',
      icon: Sliders,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[94vh] sm:h-[88vh] max-h-[860px] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#0F1523] border-b border-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2962FF] to-[#3B82F6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Settings size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Central de Configurações & Administração
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-sky-500/30">
                  TradeCraft PRO
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] hidden xs:block">
                Gerencie conexões com corretoras, chaves de API, credenciais e IA co-piloto
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#141C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
            aria-label="Fechar configurações"
            title="Fechar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile Horizontal Navigation Tabs (< md) */}
        <div className="md:hidden px-3 py-2 bg-[#0F1523] border-b border-[#1E293B] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1E293B] text-[#38BDF8] border border-sky-500/30 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#141C2E]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Split: Desktop Sidebar + Content Panel */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Desktop Left Sidebar (>= md) */}
          <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0F1523]/80 border-r border-[#1E293B] p-4 shrink-0 justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#64748B] px-3 py-1 block">
                Navegação
              </span>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-[#161F33] text-white border border-blue-500/30 shadow-md shadow-blue-500/5'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#141C2E]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-[#2962FF] text-white shadow-sm'
                          : 'bg-[#141C2E] text-[#64748B]'
                      }`}
                    >
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-[#1E293B] text-[#38BDF8] rounded border border-sky-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748B] block truncate mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Trader mini card footer */}
            <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2962FF] to-[#3B82F6] flex items-center justify-center font-bold text-white text-xs">
                  {userProfile.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate text-xs">{userProfile.name}</div>
                  <div className="text-[10px] text-[#64748B] truncate">{userProfile.email}</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#0B0F19]">
            <div className="max-w-3xl mx-auto">
              {activeTab === 'perfil' && (
                <ProfileTab profile={userProfile} onSave={setUserProfile} />
              )}
              {activeTab === 'conexoes' && (
                <ConnectionsTab accounts={accounts} onUpdateAccounts={setAccounts} />
              )}
              {activeTab === 'seguranca' && (
                <SecurityTab sessions={sessions} onRevokeOtherSessions={handleRevokeOtherSessions} />
              )}
              {activeTab === 'terminal' && (
                <TerminalPreferencesTab
                  preferences={preferences}
                  onSave={setPreferences}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
