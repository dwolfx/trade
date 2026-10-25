import React, { useState } from 'react';
import { IntegrationAccount, IntegrationCategory } from '../../types/settings';
import {
  Link2,
  RefreshCw,
  CheckCircle2,
  Unlink,
  KeyRound,
  ShieldCheck,
  PlusCircle,
  X,
  Search,
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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [accountAliasInput, setAccountAliasInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesCategory = selectedCategory === 'all' || acc.category === selectedCategory;
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = accounts.filter((a) => a.status === 'connected').length;

  const handleSync = (account: IntegrationAccount) => {
    setSyncingId(account.id);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `Hoje, ${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      const updated = accounts.map((a) =>
        a.id === account.id ? { ...a, lastSync: timeStr, status: 'connected' as const } : a
      );
      onUpdateAccounts(updated);
      setSyncingId(null);
      showToast(`${account.name} sincronizado com sucesso!`);
    }, 1000);
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
    showToast(`Conexão com ${account.name} desvinculada com sucesso.`);
  };

  const openConnectModal = (account: IntegrationAccount) => {
    setModalAccount(account);
    setApiKeyInput('');
    setApiSecretInput('');
    setAccountAliasInput(
      account.category === 'b3'
        ? `${account.name} - Titularidade B3`
        : account.category === 'crypto'
        ? 'Carteira Spot API'
        : 'Broker Global Account'
    );
  };

  const handleConfirmConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAccount) return;

    const maskedKey = apiKeyInput.trim()
      ? `${apiKeyInput.slice(0, 4)}••••••••••••${apiKeyInput.slice(-4)}`
      : 'open_finance_live_auth';

    const updated = accounts.map((a) =>
      a.id === modalAccount.id
        ? {
            ...a,
            status: 'connected' as const,
            lastSync: 'Agora',
            connectedAccountName: accountAliasInput || modalAccount.name,
            apiKeyMasked: modalAccount.category === 'crypto' ? maskedKey : undefined,
          }
        : a
    );

    onUpdateAccounts(updated);
    setModalAccount(null);
    showToast(`Parabéns! ${modalAccount.name} foi conectado com sucesso.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-[#10172A] border border-sky-500/40 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-[#38BDF8] flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Security & Open Finance Compliance */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-[#141C2E] to-[#0F1523] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[#60A5FA] flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Conexões Criptografadas & Open Finance
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-sky-500/30">
                AES-256
              </span>
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Suas chaves e tokens são armazenados com segurança de ponta a ponta. Saques são
              permanentemente bloqueados via API para sua proteção total.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-right">
            <span className="text-[10px] text-[#64748B] block">Conectadas</span>
            <span className="text-white font-bold">
              <span className="text-[#38BDF8]">{connectedCount}</span> / {accounts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0F1523] border border-[#1E293B] rounded-xl overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Todas ({accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('b3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'b3'
                ? 'bg-blue-600/30 text-[#60A5FA] border border-blue-500/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            B3 & Nacionais
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('crypto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'crypto'
                ? 'bg-purple-600/30 text-[#C084FC] border border-purple-500/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Cripto Global
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('global')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'global'
                ? 'bg-sky-600/30 text-[#38BDF8] border border-sky-500/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Bolsas EUA & Global
          </button>
        </div>

        {/* Search */}
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

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAccounts.map((account) => {
          const isConnected = account.status === 'connected';
          const isSyncing = syncingId === account.id;

          return (
            <div
              key={account.id}
              className={`p-4 sm:p-5 rounded-2xl bg-[#0F1523] border transition-all flex flex-col justify-between ${
                isConnected
                  ? 'border-sky-500/30 hover:border-sky-500/50 shadow-lg shadow-sky-500/5'
                  : 'border-[#1E293B] hover:border-[#334155]'
              }`}
            >
              <div>
                {/* Header: Title, Category Badge & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        account.category === 'b3'
                          ? 'bg-blue-500/10 text-[#60A5FA] border border-blue-500/30'
                          : account.category === 'crypto'
                          ? 'bg-purple-500/10 text-[#C084FC] border border-purple-500/30'
                          : 'bg-sky-500/10 text-[#38BDF8] border border-sky-500/30'
                      }`}
                    >
                      {account.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {account.name}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#141C2E] text-[#94A3B8] border border-[#1E293B]">
                          {account.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed line-clamp-2">
                        {account.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isConnected
                        ? 'bg-sky-500/15 text-[#38BDF8] border border-sky-500/30'
                        : 'bg-[#1E293B]/70 text-[#94A3B8] border border-[#334155]/50'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-[#38BDF8] animate-pulse' : 'bg-[#64748B]'
                      }`}
                    />
                    {isConnected ? 'Ativo' : 'Offline'}
                  </span>
                </div>

                {/* Connected Details Bar */}
                {isConnected && (
                  <div className="mt-4 p-3 rounded-xl bg-[#141C2E]/80 border border-[#1E293B] text-[11px] space-y-1.5">
                    {account.connectedAccountName && (
                      <div className="flex items-center justify-between text-[#CBD5E1]">
                        <span className="text-[#64748B]">Conta:</span>
                        <span className="font-semibold">{account.connectedAccountName}</span>
                      </div>
                    )}
                    {account.apiKeyMasked && (
                      <div className="flex items-center justify-between text-[#CBD5E1]">
                        <span className="text-[#64748B]">Chave API:</span>
                        <span className="font-mono text-[#94A3B8]">{account.apiKeyMasked}</span>
                      </div>
                    )}
                    {account.lastSync && (
                      <div className="flex items-center justify-between text-[#64748B] pt-1 border-t border-[#1E293B]/60">
                        <span>Última Sincronização:</span>
                        <span className="text-white font-mono">{account.lastSync}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSync(account)}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141C2E] hover:bg-[#1E293B] text-white border border-[#1E293B] transition-colors disabled:opacity-50"
                      title="Sincronizar saldos e ordens"
                    >
                      <RefreshCw size={13} className={isSyncing ? 'animate-spin text-[#38BDF8]' : ''} />
                      <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(account)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors"
                      title="Desconectar e remover chaves"
                    >
                      <Unlink size={13} />
                      <span>Desconectar</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => openConnectModal(account)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#141C2E] hover:bg-blue-600 text-white hover:text-white border border-blue-500/30 hover:border-transparent transition-all group shadow-sm"
                  >
                    <PlusCircle size={14} className="text-[#60A5FA] group-hover:text-white" />
                    <span>Conectar {account.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-[#0F1523] border border-[#1E293B] p-6">
          <p className="text-sm text-[#94A3B8]">
            Nenhuma corretora ou exchange encontrada para o filtro selecionado.
          </p>
        </div>
      )}

      {/* Connection Modal */}
      {modalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#60A5FA] flex items-center justify-center font-bold text-xs">
                  <Link2 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Conectar com {modalAccount.name}
                  </h3>
                  <span className="text-[11px] text-[#94A3B8]">{modalAccount.badge}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAccount(null)}
                className="w-8 h-8 rounded-lg bg-[#141C2E] text-[#94A3B8] hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmConnect} className="mt-4 space-y-4">
              {modalAccount.category === 'b3' ? (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-[#94A3B8] space-y-2">
                  <p className="font-semibold text-white flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#38BDF8]" />
                    Protocolo Open Finance & DMA2 B3
                  </p>
                  <p>
                    A conexão com {modalAccount.name} importará automaticamente sua custódia,
                    proventos provisionados e histórico de ordens com assinatura digital CVM.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-[#94A3B8] space-y-2">
                  <p className="font-semibold text-white flex items-center gap-2">
                    <KeyRound size={14} className="text-[#C084FC]" />
                    Chaves de API Seguras
                  </p>
                  <p>
                    Crie uma chave de API na sua conta da {modalAccount.name} com permissão de
                    <strong> Leitura de Saldo</strong> e <strong>Trading Spot</strong>. NUNCA habilite
                    permissões de saque (Withdrawal).
                  </p>
                </div>
              )}

              {/* Alias Name */}
              <div>
                <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
                  Identificação da Conta (Apelido)
                </label>
                <input
                  type="text"
                  required
                  value={accountAliasInput}
                  onChange={(e) => setAccountAliasInput(e.target.value)}
                  placeholder="Ex: Minha Conta XP Titular"
                  className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* API Keys for Crypto or Global */}
              {modalAccount.category !== 'b3' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
                      API Key
                    </label>
                    <input
                      type="text"
                      required
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Insira a API Key pública fornecida pela corretora"
                      className="w-full font-mono bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
                      API Secret
                    </label>
                    <input
                      type="password"
                      required
                      value={apiSecretInput}
                      onChange={(e) => setApiSecretInput(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full font-mono bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAccount(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#141C2E] hover:bg-[#1E293B] text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all"
                >
                  Confirmar e Conectar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
