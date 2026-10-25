import React, { useState } from 'react';
import { HeaderTopbar } from './components/HeaderTopbar';
import { SearchAndExchange } from './components/SearchAndExchange';
import { FeaturedCards } from './components/FeaturedCards';
import { CandleChart } from './components/CandleChart';
import { AssetsTable } from './components/AssetsTable';
import { OrderPad } from './components/OrderPad';
import { PositionsDrawer } from './components/PositionsDrawer';
import { OrderModal } from './components/order/OrderModal';
import { PortfolioPage } from './components/portfolio/PortfolioPage';
import { NewsPage } from './components/news/NewsPage';
import { CryptoPage } from './components/crypto/CryptoPage';
import { DividendsCalendarPage } from './components/dividends/DividendsCalendarPage';
import { PageHeader } from './components/common/PageHeader';
import { EmptyState } from './components/common/EmptyState';
import { useMarket } from './context/MarketContext';
import { useNavigationRouter } from './hooks/useNavigationRouter';
import {
  CalendarDays,
  Zap,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Newspaper,
  ArrowLeft,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeNav, setActiveNav } = useNavigationRouter();
  const [isPositionsOpen, setIsPositionsOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalSymbol, setOrderModalSymbol] = useState<string>('PETR4');
  const { toastMessage, mode, setMode, portfolio, activeAsset } = useMarket();

  const isDemo = mode === 'DEMO';

  const handleOpenOrder = (symbol?: string) => {
    if (symbol) {
      setOrderModalSymbol(symbol);
    } else {
      setOrderModalSymbol(activeAsset.symbol);
    }
    setIsOrderModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen text-[#F8FAFC] flex flex-col font-sans transition-colors duration-300 ${
        isDemo
          ? 'bg-[#0B0F19] bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,rgba(245,158,11,0.08),rgba(11,15,25,1))] border-t-4 border-[#F59E0B] selection:bg-[#F59E0B] selection:text-black'
          : 'bg-[#0B0F19] bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,rgba(56,189,248,0.08),rgba(11,15,25,1))] border-t-4 border-[#38BDF8] selection:bg-[#38BDF8] selection:text-black'
      }`}
    >
      {/* Global Environment Status Bar (Fluid & Responsive) */}
      <div
        className={`py-1.5 px-3 sm:px-6 text-[11px] sm:text-xs font-mono font-bold flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-4 select-none transition-colors border-b ${
          isDemo
            ? 'bg-gradient-to-r from-amber-600/30 via-amber-500/35 to-amber-600/30 border-amber-500/40 text-amber-200'
            : 'bg-gradient-to-r from-sky-950/40 via-sky-900/30 to-sky-950/40 border-sky-500/30 text-sky-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isDemo ? 'bg-[#F59E0B] animate-pulse' : 'bg-[#38BDF8]'
            }`}
          />
          <span className="truncate">
            {isDemo ? (
              <>
                <span className="hidden sm:inline">
                  ⚠️ AMBIENTE DE SIMULAÇÃO (CONTA DEMO) · Saldo e ordens virtuais sem risco
                </span>
                <span className="sm:hidden">⚠️ SIMULADOR (DEMO) · Sem risco</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  🛡️ CONTA REAL B3 (MODO LIVE ATIVO) · Execução com envio real de ordens e custódia
                </span>
                <span className="sm:hidden">🛡️ CONTA REAL B3 (LIVE)</span>
              </>
            )}
          </span>
        </div>
        <button
          onClick={() => setMode(isDemo ? 'LIVE' : 'DEMO')}
          className={`text-[11px] underline hover:text-white transition-colors cursor-pointer font-sans font-semibold shrink-0 ml-auto ${
            isDemo ? 'text-amber-300' : 'text-sky-300'
          }`}
        >
          <span className="hidden sm:inline">
            {isDemo ? 'Alternar para Conta Real (LIVE) →' : 'Alternar para Modo Simulado (DEMO) →'}
          </span>
          <span className="sm:hidden">
            {isDemo ? 'Mudar p/ LIVE →' : 'Mudar p/ DEMO →'}
          </span>
        </button>
      </div>

      {/* Topbar Global Navigation */}
      <HeaderTopbar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Main Content Area (With bottom padding clearance for mobile bottom bar) */}
      <main className="tc-container flex-1 py-4 sm:py-6 pb-24 xl:pb-8 flex flex-col gap-6">
        {activeNav === 'bolsa' && (
          <>
            {/* Standardized Page Header */}
            <PageHeader
              icon={TrendingUp}
              title="Bolsa de Valores B3"
              badge={{
                text: 'MERCADO AO VIVO',
                variant: 'sky',
                pulse: true,
              }}
              subtitle="Cotações em tempo real, candlesticks e livro de ofertas de Ações e FIIs"
              rightActions={
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F1523] border border-[#1E293B] text-xs font-mono text-[#94A3B8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                    <span>DMA2 Conectado</span>
                  </span>
                </div>
              }
            />

            {/* Search Input & Exchange Selector Dropdown */}
            <SearchAndExchange />

            {/* Featured Cards (4 Opções de Filtro Oficiais) */}
            <FeaturedCards />

            {/* Main Trading Area: 2 Columns (Central Chart & Asset Table | Right Order Pad) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left & Central Panel (8 / 12 cols on desktop) */}
              <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
                <CandleChart onOpenOrder={handleOpenOrder} />
                <AssetsTable />
              </div>

              {/* Right Panel: Boleta de Ordem Manual (Desktop only: 4 / 12 cols, hidden on mobile) */}
              <div className="hidden lg:block lg:col-span-4 sticky top-24">
                <OrderPad />
              </div>
            </div>

            {/* Mobile Floating Quick Trade Bar (Home / Bolsa view only) */}
            <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30 p-2 sm:p-2.5 rounded-2xl bg-[#0F1523]/95 border border-[#1E293B] backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2.5 min-w-0 pl-1">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-[#60A5FA] flex items-center justify-center font-bold font-mono text-xs shrink-0">
                  ⚡
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black font-mono text-white flex items-center gap-1.5 truncate">
                    {activeAsset.symbol}
                    <span className={`text-[10px] font-bold ${activeAsset.changePercent >= 0 ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}`}>
                      {activeAsset.changePercent >= 0 ? '+' : ''}{activeAsset.changePercent.toFixed(2)}%
                    </span>
                  </span>
                  <span className="text-[11px] font-bold font-mono text-[#94A3B8]">
                    R$ {activeAsset.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenOrder(activeAsset.symbol)}
                className="px-4 py-2 rounded-xl bg-[#2962FF] hover:bg-[#1D4ED8] text-white font-bold text-xs font-sans shadow-lg shadow-blue-500/25 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
              >
                <Zap size={14} className="fill-white" />
                <span>Operar Boleta</span>
              </button>
            </div>
          </>
        )}

        {/* Minha Carteira Consolidada */}
        {activeNav === 'carteira' && (
          <PortfolioPage onNavigate={setActiveNav} />
        )}

        {/* Notícias Feed */}
        {activeNav === 'noticias' && (
          <NewsPage onNavigate={setActiveNav} />
        )}

        {/* Daytrade Cockpit Preview */}
        {activeNav === 'daytrade' && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            <PageHeader
              icon={Zap}
              title="Day Trade Cockpit"
              badge={{
                text: 'FASE 3 · EM DESENVOLVIMENTO',
                variant: 'amber',
                pulse: true,
              }}
              subtitle="Ambiente de alta densidade para mini-índice (WIN) e mini-dólar (WDO) com margem reduzida"
            />

            <EmptyState
              icon={Zap}
              title="Cockpit de Alta Densidade B3 (Em Desenvolvimento)"
              description="Em breve você terá acesso ao SuperDOM vertical, Times & Trades com agressão de mercado e roteamento DMA com Trailing Stop automático."
              action={{
                label: 'Voltar ao Home Broker',
                onClick: () => setActiveNav('bolsa'),
                icon: ArrowLeft,
              }}
              className="max-w-2xl mx-auto py-16"
            />
          </div>
        )}

        {/* Cripto 24/7 Global */}
        {activeNav === 'cripto' && (
          <CryptoPage onNavigate={setActiveNav} />
        )}

        {/* Calendário & Mapa de Dividendos */}
        {activeNav === 'dividendos' && (
          <DividendsCalendarPage onNavigate={setActiveNav} />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (< xl) */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F1523]/95 backdrop-blur-md border-t border-[#1E293B] px-2 py-2 flex items-center justify-around shadow-2xl">
        {/* Bolsa */}
        <button
          onClick={() => setActiveNav('bolsa')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            activeNav === 'bolsa'
              ? 'text-[#60A5FA] font-bold'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <TrendingUp size={18} />
          <span className="text-[10px] leading-none">Bolsa</span>
          {activeNav === 'bolsa' && (
            <span className="w-1 h-1 rounded-full bg-[#38BDF8] mt-0.5" />
          )}
        </button>

        {/* Minha Carteira */}
        <button
          onClick={() => setActiveNav('carteira')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            activeNav === 'carteira'
              ? 'text-[#60A5FA] font-bold'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <div className="relative">
            <Briefcase size={18} />
            {portfolio.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-[#38BDF8] text-black text-[9px] font-black rounded-full font-mono">
                {portfolio.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none">Carteira</span>
          {activeNav === 'carteira' && (
            <span className="w-1 h-1 rounded-full bg-[#38BDF8] mt-0.5" />
          )}
        </button>

        {/* Notícias */}
        <button
          onClick={() => setActiveNav('noticias')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            activeNav === 'noticias'
              ? 'text-[#60A5FA] font-bold'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <div className="relative">
            <Newspaper size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <span className="text-[10px] leading-none">Notícias</span>
          {activeNav === 'noticias' && (
            <span className="w-1 h-1 rounded-full bg-[#38BDF8] mt-0.5" />
          )}
        </button>

        {/* Daytrade */}
        <button
          onClick={() => setActiveNav('daytrade')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeNav === 'daytrade'
              ? 'text-white font-bold'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Zap size={18} />
          <span className="text-[10px] leading-none">Daytrade</span>
        </button>

        {/* Dividendos */}
        <button
          onClick={() => setActiveNav('dividendos')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeNav === 'dividendos'
              ? 'text-[#38BDF8] font-bold'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <CalendarDays size={18} />
          <span className="text-[10px] leading-none">Proventos</span>
        </button>
      </nav>

      {/* Positions & Orders Drawer Modal */}
      <PositionsDrawer
        isOpen={isPositionsOpen}
        onClose={() => setIsPositionsOpen(false)}
      />

      {/* Order Modal Drawer (Mobile Boleta & Quick Trade Everywhere) */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        symbol={orderModalSymbol}
      />

      {/* Floating Real-time Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-20 xl:bottom-6 right-4 sm:right-6 z-50 bg-[#0F1523] border border-sky-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={20} className="text-[#38BDF8]" />
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
