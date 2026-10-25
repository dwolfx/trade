import React, { useState } from 'react';
import { IntegrationAccount, IntegrationCategory } from '../../types/settings';
import {
  Link2,
  RefreshCw,
  CheckCircle2,
  Unlink,
  ShieldCheck,
  Plus,
  X,
  Search,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ConnectionsTabProps {
  accounts: IntegrationAccount[];
  onUpdateAccounts: (updated: IntegrationAccount[]) => void;
}

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  accounts,
  onUpdateAccounts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [modalAccount, setModalAccount] = useState<IntegrationAccount | null>(null);

  // Modal form states
  const [connectionMode, setConnectionMode] = useState<'demo' | 'real'>('demo');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [accountAliasInput, setAccountAliasInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const connectedAccounts = accounts.filter((a) => a.status === 'connected');
  const availableAccounts = accounts.filter((a) => a.status !== 'connected');

  const filteredAvailable = availableAccounts.filter((acc) => {
    const matchesCategory = selectedCategory === 'all' || acc.category === selectedCategory;
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSync = (account: IntegrationAccount) => {
    setSyncingId(account.id);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `Hoje, ${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      const updated = accounts.map((a) =>
        a.id === account.id ? { ...a, lastSync: timeStr } : a
      );
      onUpdateAccounts(updated);
      setSyncingId(null);
      showToast(`${account.name} sincronizado com sucesso!`);
    }, 900);
  };

  const handleDisconnect = (account: IntegrationAccount) => {
    const updated = accounts.map((a) =>
      a.id === account.id
        ? {
            ...a,
            status: 'disconnected' as const,
            lastSync: undefined,
            connectedAccountName: undefined,
            apiKeyMasked: undefined,
          }
        : a
    );
    onUpdateAccounts(updated);
    showToast(`Conexão com ${account.name} desvinculada.`);
  };

  const openConnectModal = (account: IntegrationAccount) => {
    setModalAccount(account);
    setConnectionMode('demo');
    setApiKeyInput('');
    setApiSecretInput('');
    setAccountAliasInput(
      account.category === 'b3'
        ? `${account.name} (Titular)`
        : account.category === 'crypto'
        ? `${account.name} Spot Principal`
        : `${account.name} Global Account`
    );
  };

  const handleConfirmConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAccount) return;

    const isDemo = connectionMode === 'demo';
    const maskedKey = isDemo
      ? 'demo_sandbox••••••••••••77a1'
      : apiKeyInput.trim()
      ? `${apiKeyInput.slice(0, 4)}••••••••••••${apiKeyInput.slice(-4)}`
      : 'open_finance_live_token';

    const accountName = isDemo
      ? `${accountAliasInput} [Simulação]`
      : accountAliasInput;

    const updated = accounts.map((a) =>
      a.id === modalAccount.id
        ? {
            ...a,
            status: 'connected' as const,
            lastSync: 'Agora',
            connectedAccountName: accountName,
            apiKeyMasked: modalAccount.category !== 'b3' ? maskedKey : undefined,
          }
        : a
    );

    onUpdateAccounts(updated);
    setModalAccount(null);
    showToast(`Tudo pronto! ${modalAccount.name} foi conectado com sucesso.`);
  };

  // Helper for brand badge styling
  const getBrandBadge = (account: IntegrationAccount) => {
    if (account.category === 'b3') {
      return {
        bg: 'bg-blue-500/10 text-[#60A5FA] border-blue-500/25',
        label: '🇧🇷 Brasil (B3)',
      };
    }
    if (account.category === 'crypto') {
      return {
        bg: 'bg-purple-500/10 text-[#C084FC] border-purple-500/25',
        label: '🪙 Criptomoedas',
      };
    }
    return {
      bg: 'bg-sky-500/10 text-[#38BDF8] border-sky-500/25',
      label: '🌐 Global / EUA',
    };
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#10172A] border border-sky-500/40 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-[#38BDF8] flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Explanatory Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900/25 via-[#141C2E] to-[#0F1523] border border-blue-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Central de Conexões Financeiras
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-sky-500/30">
                100% Seguro
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed max-w-2xl">
              Conecte suas contas reais de investimento para acompanhar custódia consolidada e operar
              pelo terminal. Suas contas começam <strong>desconectadas</strong> para sua total privacidade,
              e você pode testá-las tanto em modo de simulação quanto com chaves reais.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-[#0B0F19] border border-[#1E293B] text-right font-mono shrink-0 self-start">
            <span className="text-[10px] text-[#64748B] uppercase block">Conectadas</span>
            <span className="text-sm font-bold text-white">
              <span className="text-[#38BDF8]">{connectedAccounts.length}</span> de {accounts.length}
            </span>
          </div>
        </div>

        {/* 3 Pillars of Security */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1E293B]/70">
          <div className="flex items-center gap-2.5 text-xs text-[#CBD5E1]">
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-[#38BDF8] flex items-center justify-center shrink-0">
              <Lock size={13} />
            </div>
            <span>
              <strong>Sem Acesso a Saques:</strong> Suas ordens são protegidas e o saldo não sai da sua corretora.
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#CBD5E1]">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-[#60A5FA] flex items-center justify-center shrink-0">
              <ShieldCheck size={13} />
            </div>
            <span>
              <strong>Open Finance B3:</strong> Protocolo oficial regulamentado pelo Banco Central e CVM.
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#CBD5E1]">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-[#C084FC] flex items-center justify-center shrink-0">
              <Sparkles size={13} />
            </div>
            <span>
              <strong>Modo Teste Disponível:</strong> Você pode simular qualquer conexão antes de pôr dados reais.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Contas Conectadas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-[#94A3B8] flex items-center gap-2">
            <span>Suas Contas Conectadas</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#141C2E] text-white">
              {connectedAccounts.length}
            </span>
          </h4>
        </div>

        {connectedAccounts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0F1523] border border-dashed border-[#1E293B] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#141C2E] text-[#64748B] flex items-center justify-center mx-auto">
              <Link2 size={20} />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white">
              Nenhuma corretora ou exchange conectada no momento
            </p>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Escolha uma das instituições na lista abaixo e clique em <strong>+ Conectar</strong> para
              sincronizar seus investimentos ou fazer um teste simulado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedAccounts.map((account) => {
              const isSyncing = syncingId === account.id;
              const brand = getBrandBadge(account);

              return (
                <div
                  key={account.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0F1523] border border-sky-500/40 shadow-lg shadow-sky-500/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2962FF] to-[#3B82F6] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                          {account.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-white">{account.name}</h5>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${brand.bg}`}
                            >
                              {brand.label}
                            </span>
                          </div>
                          <span className="text-xs text-[#94A3B8] mt-0.5 block">
                            {account.connectedAccountName || 'Conta Ativa'}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-[#38BDF8] border border-sky-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                        CONECTADO
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-[#141C2E] border border-[#1E293B] text-[11px] space-y-1 text-[#94A3B8]">
                      {account.apiKeyMasked && (
                        <div className="flex items-center justify-between">
                          <span>Chave / Token:</span>
                          <span className="font-mono text-white">{account.apiKeyMasked}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Última sincronização:</span>
                        <span className="text-white font-semibold">{account.lastSync || 'Agora'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSync(account)}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#141C2E] hover:bg-[#1E293B] text-white border border-[#1E293B] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        size={13}
                        className={isSyncing ? 'animate-spin text-[#38BDF8]' : ''}
                      />
                      <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(account)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F43F5E] hover:bg-rose-500/10 transition-colors"
                    >
                      <Unlink size={13} />
                      <span>Desconectar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Disponíveis para Conectar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-[#94A3B8]">
            Adicionar Nova Conexão
          </h4>

          {/* Search box */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar corretora ou exchange..."
              className="w-full bg-[#0F1523] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0F1523] border border-[#1E293B] rounded-2xl overflow-x-auto scrollbar-none mb-4">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Todas ({availableAccounts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('b3')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'b3'
                ? 'bg-blue-600/25 text-[#60A5FA] border border-blue-500/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            🇧🇷 Corretoras B3
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('crypto')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'crypto'
                ? 'bg-purple-600/25 text-[#C084FC] border border-purple-500/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            🪙 Criptomoedas
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('global')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'global'
                ? 'bg-sky-600/25 text-[#38BDF8] border border-sky-500/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            🌐 Bolsas EUA & Global
          </button>
        </div>

        {/* Available Integrations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAvailable.map((account) => {
            const brand = getBrandBadge(account);

            return (
              <div
                key={account.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#0F1523] border border-[#1E293B] hover:border-[#334155] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${brand.bg}`}
                      >
                        {account.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-white tracking-tight">
                            {account.name}
                          </h5>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#141C2E] text-[#94A3B8] border border-[#1E293B]">
                            {account.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748B] block mt-0.5">
                          {brand.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed">
                    {account.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => openConnectModal(account)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#141C2E] hover:bg-[#2962FF] text-white hover:text-white border border-[#1E293B] hover:border-transparent transition-all group shadow-sm"
                  >
                    <Plus size={14} className="text-[#60A5FA] group-hover:text-white" />
                    <span>Conectar {account.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Connect Modal */}
      {modalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0F1523] border border-[#1E293B] rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2962FF] to-[#3B82F6] text-white font-bold text-sm flex items-center justify-center">
                  {modalAccount.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Conectar {modalAccount.name}
                  </h3>
                  <span className="text-[11px] text-[#94A3B8]">{modalAccount.badge}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAccount(null)}
                className="w-8 h-8 rounded-xl bg-[#141C2E] text-[#94A3B8] hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmConnect} className="mt-4 space-y-4">
              {/* Choice of Connection Mode */}
              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1.5 uppercase font-mono">
                  Escolha como deseja conectar:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0F19] rounded-2xl border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setConnectionMode('demo')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                      connectionMode === 'demo'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span>🚀 Modo Teste (Demo)</span>
                    <span className="text-[10px] opacity-80 font-normal">Sem precisar de chaves</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConnectionMode('real')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                      connectionMode === 'real'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span>🔑 Conexão Real</span>
                    <span className="text-[10px] opacity-80 font-normal">Chaves ou Open Finance</span>
                  </button>
                </div>
              </div>

              {connectionMode === 'demo' ? (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-[#94A3B8] space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Sparkles size={15} className="text-[#38BDF8]" />
                    <span>Conexão Simulada Imediata</span>
                  </div>
                  <p className="leading-relaxed">
                    Você pode conectar agora com dados de demonstração para testar como o TradeCraft
                    exibe sua custódia, cotações e extrato. Nenhuma credencial real será solicitada.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#0B0F19] border border-[#1E293B] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck size={16} className="text-[#38BDF8]" />
                    <span>Instruções para Conexão Segura</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    {modalAccount.category === 'b3'
                      ? 'Na B3, sua conexão é autenticada através do protocolo oficial Open Finance com consentimento CVM. Você pode ler sua carteira e enviar ordens sob sua confirmação.'
                      : 'Na exchange, crie uma API Key com permissão de "Leitura de Saldo" e "Trading Spot". NUNCA marque a opção de Saque (Withdrawal).'}
                  </p>

                  {modalAccount.category !== 'b3' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-[#CBD5E1] block mb-1">
                          API Key
                        </label>
                        <input
                          type="text"
                          required={connectionMode === 'real'}
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder="Insira sua chave pública gerada na corretora"
                          className="w-full font-mono bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#CBD5E1] block mb-1">
                          API Secret
                        </label>
                        <input
                          type="password"
                          required={connectionMode === 'real'}
                          value={apiSecretInput}
                          onChange={(e) => setApiSecretInput(e.target.value)}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="w-full font-mono bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Alias Name */}
              <div>
                <label className="text-xs font-bold text-[#CBD5E1] block mb-1.5">
                  Apelido da Conta no TradeCraft
                </label>
                <input
                  type="text"
                  required
                  value={accountAliasInput}
                  onChange={(e) => setAccountAliasInput(e.target.value)}
                  placeholder="Ex: Minha Conta Titular"
                  className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAccount(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#141C2E] hover:bg-[#1E293B] text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all"
                >
                  {connectionMode === 'demo' ? 'Ativar Modo Demonstração' : 'Confirmar e Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
