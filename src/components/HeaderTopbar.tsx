import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  Eye,
  EyeOff,
  Bell,
  Settings,
  Menu,
  X,
  TrendingUp,
  Briefcase,
  Newspaper,
  Zap,
  Coins,
  CalendarDays,
  Flame,
  User,
  Link2,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { ActiveNav } from '../types/market';
import { SettingsModal } from './settings/SettingsModal';
import { SettingsTab } from '../types/settings';

interface HeaderTopbarProps {
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  onOpenPositions?: () => void;
}

export const HeaderTopbar: React.FC<HeaderTopbarProps> = ({
  activeNav,
  setActiveNav,
  onOpenPositions,
}) => {
  const {
    mode,
    setMode,
    showBalance,
    setShowBalance,
    demoBalance,
    liveBalance,
    portfolio,
  } = useMarket();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('perfil');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentBalance = mode === 'DEMO' ? demoBalance : liveBalance;

  return (
    <>
      <header className="h-[64px] sm:h-[72px] bg-[#0B0F19] border-b border-[#1E293B] px-3 sm:px-6 flex items-center justify-between select-none sticky top-0 z-40">
        {/* Left: Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-4 xl:gap-8 min-w-0">
          {/* Logo */}
          <div
            onClick={() => {
              setActiveNav('bolsa');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            title="Ir para Bolsa de Valores (Início)"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#2962FF] to-[#60A5FA] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-lg sm:text-xl">⚡</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
                TradeCraft{' '}
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-[#60A5FA] border border-blue-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-[#64748B] font-medium mt-0.5 hidden xs:block">
                Terminal B3 Multi-Mercado
              </span>
            </div>
          </div>

          {/* Global Navigation (Desktop >= xl) */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setActiveNav('noticias')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'noticias'
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              Notícias
            </button>
            <button
              onClick={() => setActiveNav('bolsa')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                activeNav === 'bolsa'
                  ? 'bg-[#161F33] text-[#60A5FA] border border-blue-500/30 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              <span>Bolsa de Valores</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveNav('heatmap')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeNav === 'heatmap'
                  ? 'bg-[#161F33] text-[#38BDF8] border border-sky-500/30 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              <Flame size={15} className={activeNav === 'heatmap' ? 'text-[#38BDF8]' : 'text-amber-400'} />
              <span>Mapa de Calor</span>
            </button>
            <button
              onClick={() => setActiveNav('daytrade')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'daytrade'
                  ? 'bg-[#1E293B] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              Daytrade
            </button>
            <button
              onClick={() => setActiveNav('cripto')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'cripto'
                  ? 'bg-[#1E293B] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              Cripto
            </button>
            <button
              onClick={() => setActiveNav('dividendos')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'dividendos'
                  ? 'bg-[#1E293B] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              Dividendos
            </button>
            <button
              onClick={() => {
                setActiveNav('carteira');
                onOpenPositions?.();
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeNav === 'carteira'
                  ? 'bg-[#161F33] text-[#60A5FA] border border-blue-500/30 shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              <span>Minha Carteira</span>
              {portfolio.length > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.2 bg-[#1E293B] text-[#38BDF8] rounded border border-sky-500/30">
                  {portfolio.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Switch Mode Container (DEMO / LIVE) */}
          <div className="flex items-center bg-[#0F1523] p-0.5 sm:p-1 rounded-full border border-[#1E293B]">
            <button
              onClick={() => setMode('DEMO')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black transition-all ${
                mode === 'DEMO'
                  ? 'bg-[#F59E0B] text-black shadow-md shadow-amber-500/30 ring-1 ring-amber-400'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  mode === 'DEMO' ? 'bg-black' : 'bg-transparent'
                }`}
              ></span>
              DEMO
            </button>
            <button
              onClick={() => setMode('LIVE')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black transition-all ${
                mode === 'LIVE'
                  ? 'bg-[#38BDF8] text-black shadow-md shadow-sky-500/30 ring-1 ring-sky-300'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  mode === 'LIVE' ? 'bg-black' : 'bg-transparent'
                }`}
              ></span>
              LIVE
            </button>
          </div>

          {/* Wallet Balance Widget (Desktop & Tablet >= md) */}
          <div
            className={`hidden md:flex bg-[#0F1523] border px-3 sm:px-3.5 py-1.5 rounded-xl items-center gap-2.5 sm:gap-3 transition-colors ${
              mode === 'DEMO' ? 'border-amber-500/30' : 'border-sky-500/30'
            }`}
          >
            <div className="flex flex-col text-left">
              <span
                className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${
                  mode === 'DEMO' ? 'text-[#F59E0B]' : 'text-[#38BDF8]'
                }`}
              >
                {mode === 'DEMO' ? 'Saldo Simulado' : 'Saldo Disponível'}
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#F8FAFC]">
                {showBalance
                  ? `R$ ${currentBalance.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '••••••••••'}
              </span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#141C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
              title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
            >
              {showBalance ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          </div>

          {/* Notifications Icon (Desktop >= lg) */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0F1523] border border-[#1E293B] hover:bg-[#161F33] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors relative"
              title="Notificações B3"
            >
              <Bell size={17} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F59E0B] ring-2 ring-[#0B0F19]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Notificações B3
                  </span>
                  <span className="text-[10px] text-[#60A5FA] cursor-pointer hover:underline">
                    Marcar lidas
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 text-left">
                  <div className="p-2.5 rounded-xl bg-[#141C2E] border border-[#1E293B]/60 text-xs">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>⚡ PETR4 rompeu R$ 38,40</span>
                      <span className="text-[10px] text-[#64748B]">há 5m</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      Alta acumulada de +2,14% na sessão.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141C2E] border border-[#1E293B]/60 text-xs">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>📢 WEGE3 Anúncio de Dividendos</span>
                      <span className="text-[10px] text-[#64748B]">há 1h</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      Aprovado pagamento de R$ 0,28 por ação.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Icon (Desktop >= lg) */}
          <button
            onClick={() => {
              setSettingsInitialTab('terminal');
              setShowSettingsModal(true);
            }}
            className="hidden lg:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0F1523] border border-[#1E293B] hover:bg-[#161F33] text-[#94A3B8] hover:text-white items-center justify-center transition-colors"
            title="Configurações do Terminal"
          >
            <Settings size={17} />
          </button>

          {/* Avatar Victor Hugo (Desktop >= sm) */}
          <div ref={userMenuRef} className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1E293B] relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[#161F33] transition-colors cursor-pointer group"
              title="Menu Victor Hugo"
              aria-expanded={isUserMenuOpen}
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#2962FF] to-[#3B82F6] flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-md relative"
              >
                <span>VH</span>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#0B0F19] rounded-full transition-colors ${
                    mode === 'DEMO' ? 'bg-[#F59E0B]' : 'bg-[#38BDF8]'
                  }`}
                />
              </div>
              <ChevronDown
                size={14}
                className={`text-[#94A3B8] transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180 text-white' : 'group-hover:text-white'
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#0F1523] border border-[#1E293B] rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                {/* Header User Card */}
                <div className="p-3 bg-[#141C2E] rounded-xl border border-[#1E293B] mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Victor Hugo</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-[#60A5FA] border border-blue-500/30">
                      PRO TRADER
                    </span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] block truncate mt-0.5">
                    victor9009@gmail.com
                  </span>
                  <div className="mt-2 pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px]">
                    <span className="text-[#64748B]">Ambiente Ativo:</span>
                    <span
                      className={
                        mode === 'DEMO' ? 'text-amber-400 font-bold' : 'text-[#38BDF8] font-bold'
                      }
                    >
                      Conta {mode}
                    </span>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsInitialTab('perfil');
                      setShowSettingsModal(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-colors text-left"
                  >
                    <User size={15} className="text-[#60A5FA]" />
                    <span>Meu Perfil & Documentos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettingsInitialTab('conexoes');
                      setShowSettingsModal(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-colors text-left"
                  >
                    <Link2 size={15} className="text-[#38BDF8]" />
                    <div className="flex-1 flex items-center justify-between">
                      <span>Conectar Contas (B3/Cripto)</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-blue-500/20 text-[#60A5FA] rounded">
                        Open Finance
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettingsInitialTab('seguranca');
                      setShowSettingsModal(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-colors text-left"
                  >
                    <ShieldCheck size={15} className="text-[#A78BFA]" />
                    <span>Segurança & Senha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSettingsInitialTab('terminal');
                      setShowSettingsModal(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white hover:bg-[#1E293B] transition-colors text-left"
                  >
                    <Settings size={15} className="text-[#F59E0B]" />
                    <span>Preferências do Terminal</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-[#1E293B]" />

                {/* Quick Switch Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'DEMO' ? 'LIVE' : 'DEMO');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors text-left"
                >
                  <span>Mudar para {mode === 'DEMO' ? 'LIVE' : 'DEMO'}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      mode === 'DEMO' ? 'text-[#38BDF8] bg-sky-500/10' : 'text-[#F59E0B] bg-amber-500/10'
                    }`}
                  >
                    {mode === 'DEMO' ? 'CONTA REAL' : 'SIMULADOR'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button (< xl) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0F1523] border border-[#1E293B] hover:bg-[#161F33] text-[#94A3B8] hover:text-white flex items-center justify-center transition-all relative"
          >
            {isMobileMenuOpen ? (
              <X size={19} className="text-white" />
            ) : (
              <Menu size={19} />
            )}
            {portfolio.length > 0 && !isMobileMenuOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#38BDF8] ring-2 ring-[#0B0F19]" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Visible on screen < xl when toggled) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-h-[90vh] bg-[#0F1523] border-t border-[#1E293B] rounded-t-3xl shadow-2xl overflow-y-auto flex flex-col p-4 sm:p-6 pb-8 animate-in slide-in-from-bottom duration-300">
            {/* Top Drag Handle */}
            <div className="w-12 h-1.5 bg-[#334155] rounded-full mx-auto mb-4" />

            {/* User Profile Header in Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div
                onClick={() => {
                  setSettingsInitialTab('perfil');
                  setShowSettingsModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 cursor-pointer group"
                title="Abrir Perfil e Configurações"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2962FF] to-[#3B82F6] flex items-center justify-center font-bold text-white text-base shadow-md relative group-hover:scale-105 transition-transform">
                  <span>VH</span>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-[#0B0F19] rounded-full ${
                      mode === 'DEMO' ? 'bg-[#F59E0B]' : 'bg-[#38BDF8]'
                    }`}
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-[#60A5FA] transition-colors flex items-center gap-1.5">
                    <span>Victor Hugo</span>
                    <span className="text-[10px] text-[#60A5FA]">⚙</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                    <span>Product Designer</span>
                    <span>•</span>
                    <span
                      className={
                        mode === 'DEMO'
                          ? 'text-amber-400 font-bold'
                          : 'text-[#38BDF8] font-bold'
                      }
                    >
                      Conta {mode}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#141C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Wallet Balance Card */}
            <div
              className={`mt-4 p-4 rounded-2xl bg-[#141C2E] border transition-colors ${
                mode === 'DEMO' ? 'border-amber-500/30' : 'border-sky-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    mode === 'DEMO' ? 'text-[#F59E0B]' : 'text-[#38BDF8]'
                  }`}
                >
                  {mode === 'DEMO' ? 'Saldo Simulado' : 'Saldo Disponível'}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white"
                  title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
                >
                  {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{showBalance ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {showBalance
                  ? `R$ ${currentBalance.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '••••••••••'}
              </div>
              <div className="mt-2 pt-2 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Custódia Integrada B3</span>
                <span className="font-mono text-white">
                  {portfolio.length} ativos na carteira
                </span>
              </div>
            </div>

            {/* Navigation Links in Drawer */}
            <div className="mt-4 space-y-1">
              <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#64748B] px-3 py-1">
                Navegação Principal
              </div>

              {/* Bolsa de Valores */}
              <button
                onClick={() => {
                  setActiveNav('bolsa');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === 'bolsa'
                    ? 'bg-[#161F33] text-[#60A5FA] border border-blue-500/30 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#60A5FA] flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <span>Bolsa de Valores</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              </button>

              {/* Mapa de Calor */}
              <button
                onClick={() => {
                  setActiveNav('heatmap');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === 'heatmap'
                    ? 'bg-[#161F33] text-[#38BDF8] border border-sky-500/30 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#38BDF8] flex items-center justify-center">
                    <Flame size={16} />
                  </div>
                  <span>Mapa de Calor (Heatmap)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Treemap
                </span>
              </button>

              {/* Minha Carteira */}
              <button
                onClick={() => {
                  setActiveNav('carteira');
                  onOpenPositions?.();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === 'carteira'
                    ? 'bg-[#161F33] text-[#60A5FA] border border-blue-500/30 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#38BDF8] flex items-center justify-center">
                    <Briefcase size={16} />
                  </div>
                  <span>Minha Carteira</span>
                </div>
                {portfolio.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#1E293B] text-[#38BDF8] rounded-full border border-sky-500/30 font-mono">
                    {portfolio.length} ativos
                  </span>
                )}
              </button>

              {/* Notícias */}
              <button
                onClick={() => {
                  setActiveNav('noticias');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === 'noticias'
                    ? 'bg-[#161F33] text-[#60A5FA] border border-blue-500/30 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-[#818CF8] flex items-center justify-center">
                    <Newspaper size={16} />
                  </div>
                  <span>Notícias & Radar B3</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Ao Vivo
                </span>
              </button>

              {/* Daytrade */}
              <button
                onClick={() => {
                  setActiveNav('daytrade');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === 'daytrade'
                    ? 'bg-[#161F33] text-white'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <span>Daytrade Cockpit</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">Fase 3</span>
              </button>

              {/* Cripto */}
              <button
                onClick={() => {
                  setActiveNav('cripto');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === 'cripto'
                    ? 'bg-[#161F33] text-white'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-[#C084FC] flex items-center justify-center">
                    <Coins size={16} />
                  </div>
                  <span>Cripto Global</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">24/7</span>
              </button>

              {/* Dividendos */}
              <button
                onClick={() => {
                  setActiveNav('dividendos');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === 'dividendos'
                    ? 'bg-[#161F33] text-white'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-[#38BDF8] flex items-center justify-center">
                    <CalendarDays size={16} />
                  </div>
                  <span>Dividendos & Proventos</span>
                </div>
                <span className="text-[10px] text-[#38BDF8] font-mono font-bold">YoC</span>
              </button>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="mt-5 pt-4 border-t border-[#1E293B] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#141C2E] hover:bg-[#1E293B] text-xs font-semibold text-white border border-[#1E293B] transition-colors"
                >
                  <Settings size={15} className="text-[#60A5FA]" />
                  <span>Configurações</span>
                </button>
                <button
                  onClick={() => {
                    setShowNotifications(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#141C2E] hover:bg-[#1E293B] text-xs font-semibold text-white border border-[#1E293B] transition-colors"
                >
                  <Bell size={15} className="text-[#F59E0B]" />
                  <span>Notificações</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-[11px] text-[#94A3B8] flex items-center justify-between">
                <span>
                  Corretagem TradeCraft: <strong className="text-[#38BDF8]">ZERO</strong>
                </span>
                <span>
                  Emolumentos: <strong className="text-white font-mono">0,030%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (Global) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={settingsInitialTab}
      />
    </>
  );
};
