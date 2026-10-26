import React, { useEffect, useMemo } from 'react';
import { X, Zap, Briefcase, Eye, EyeOff } from 'lucide-react';
import { OrderPad } from '../OrderPad';
import { useMarket } from '../../context/MarketContext';
import { formatBRL } from '../../utils/formatters';
import { AssetInspectionChart } from './AssetInspectionChart';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol?: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  symbol,
}) => {
  const {
    assets,
    activeAsset,
    setActiveAsset,
    selectOrCreateAsset,
    mode,
    setMode,
    showBalance,
    setShowBalance,
    demoBalance,
    liveBalance,
    portfolio,
  } = useMarket();

  const targetSymbol = symbol || activeAsset.symbol;

  // If a symbol is specified, switch the active asset on open
  useEffect(() => {
    if (isOpen && symbol) {
      const found = assets.find(a => a.symbol === symbol);
      if (found) {
        setActiveAsset(found);
      } else {
        selectOrCreateAsset(symbol);
      }
    }
  }, [isOpen, symbol, assets, setActiveAsset, selectOrCreateAsset]);

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

  // Target asset object
  const targetAsset = useMemo(() => {
    return assets.find(a => a.symbol === targetSymbol) || activeAsset;
  }, [assets, targetSymbol, activeAsset]);

  // Check current holdings for target asset
  const existingPosition = useMemo(() => {
    return portfolio.find(p => p.symbol === targetSymbol);
  }, [portfolio, targetSymbol]);

  const currentCash = mode === 'DEMO' ? demoBalance : liveBalance;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex justify-end transition-opacity">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel (vindo da direita para a esquerda) */}
      <div
        className={`relative w-full max-w-md sm:max-w-lg lg:max-w-4xl xl:max-w-5xl bg-[#0F1523] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300 transition-all ${
          mode === 'DEMO' ? 'border-l-2 border-l-[#F59E0B]' : 'border-l-2 border-l-[#38BDF8]'
        }`}
      >
        {/* Drawer Top Header */}
        <div className="p-4 px-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F19] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#60A5FA] flex items-center justify-center font-bold shadow-sm">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Boleta Rápida B3</span>
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#161F33] text-[#60A5FA] font-mono border border-blue-500/30 font-bold">
                  {targetSymbol}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-[#60A5FA] border border-blue-500/20">
                  {targetAsset.category === 'fiis' ? 'Fundo Imobiliário' : 'Ação B3'}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate max-w-xs sm:max-w-md">
                {targetAsset.name} · Cotação ao vivo, histórico e análise de vertente para decisão consciente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
            title="Fechar boleta"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1E293B]">
          {/* Left Column: Asset Intelligence, Interactive Chart & Trend ("O que está acontecendo?") */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
            <AssetInspectionChart
              asset={targetAsset}
              userPosition={existingPosition}
              showBalance={showBalance}
            />
          </div>

          {/* Right Column: Execution Controls & Boleta */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-4 bg-[#0B0F19]/40 overflow-y-auto">
            {/* Mode Switch & Balance */}
            <div className="flex items-center justify-between gap-3 bg-[#0B0F19] p-3 rounded-2xl border border-[#1E293B]">
              <div className="flex items-center bg-[#141C2E] p-1 rounded-xl border border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setMode('DEMO')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition-all flex items-center gap-1.5 ${
                    mode === 'DEMO'
                      ? 'bg-[#F59E0B] text-black shadow-md shadow-amber-500/30'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${mode === 'DEMO' ? 'bg-black' : 'bg-transparent'}`} />
                  DEMO
                </button>
                <button
                  type="button"
                  onClick={() => setMode('LIVE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition-all flex items-center gap-1.5 ${
                    mode === 'LIVE'
                      ? 'bg-[#38BDF8] text-black shadow-md shadow-sky-500/30'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${mode === 'LIVE' ? 'bg-black' : 'bg-transparent'}`} />
                  LIVE
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#141C2E] px-3 py-1.5 rounded-xl border border-[#1E293B] text-xs font-mono">
                <span className="text-[#64748B] text-[10px] uppercase font-bold">
                  {mode === 'DEMO' ? 'Simulado:' : 'Saldo Real:'}
                </span>
                <strong className="text-white">
                  {showBalance ? formatBRL(currentCash) : '••••••••••'}
                </strong>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-[#94A3B8] hover:text-white transition-colors ml-1"
                  title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
                >
                  {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              </div>
            </div>

            {/* Existing Holdings Mini Badge */}
            {existingPosition && existingPosition.quantity > 0 && (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <Briefcase size={13} className="text-[#60A5FA]" />
                  <span>Sua Custódia:</span>
                  <strong className="text-white">{existingPosition.quantity} cotas</strong>
                </span>
                <span className={`font-bold ${existingPosition.plPercent >= 0 ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}`}>
                  {existingPosition.plPercent >= 0 ? '+' : ''}{existingPosition.plPercent.toFixed(2)}%
                </span>
              </div>
            )}

            {/* Boleta Pad */}
            <OrderPad />
          </div>
        </div>
      </div>
    </div>
  );
};
