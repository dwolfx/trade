import React, { useEffect, useMemo } from 'react';
import { X, Zap, Briefcase, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { OrderPad } from '../OrderPad';
import { useMarket } from '../../context/MarketContext';
import { formatBRL } from '../../utils/formatters';

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
      <div className={`relative w-full max-w-md sm:max-w-lg bg-[#0F1523] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300 overflow-y-auto transition-colors ${
        mode === 'DEMO' ? 'border-l-2 border-l-[#F59E0B]' : 'border-l-2 border-l-[#38BDF8]'
      }`}>
        {/* Drawer Top Header */}
        <div className="p-4 px-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F19] sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#60A5FA] flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Boleta Rápida B3</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#161F33] text-[#60A5FA] font-mono border border-blue-500/30 font-bold">
                  {targetSymbol}
                </span>
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                Execute ordens de compra e venda sem sair da tela
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

        {/* Top Drawer Controls: DEMO/LIVE Switch + Saldo + Custódia */}
        <div className="p-4 px-5 bg-[#0B0F19]/90 border-b border-[#1E293B] space-y-3">
          {/* Row 1: Mode Switch & Balance */}
          <div className="flex items-center justify-between gap-3">
            {/* Mode Switch Button */}
            <div className="flex items-center bg-[#141C2E] p-1 rounded-xl border border-[#1E293B]">
              <button
                type="button"
                onClick={() => setMode('DEMO')}
                className={`px-3 py-1 rounded-lg text-xs font-black font-mono transition-all flex items-center gap-1.5 ${
                  mode === 'DEMO'
                    ? 'bg-[#F59E0B] text-black shadow-md shadow-amber-500/30 ring-1 ring-amber-400'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${mode === 'DEMO' ? 'bg-black' : 'bg-transparent'}`}></span>
                DEMO
              </button>
              <button
                type="button"
                onClick={() => setMode('LIVE')}
                className={`px-3 py-1 rounded-lg text-xs font-black font-mono transition-all flex items-center gap-1.5 ${
                  mode === 'LIVE'
                    ? 'bg-[#38BDF8] text-black shadow-md shadow-sky-500/30 ring-1 ring-sky-300'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${mode === 'LIVE' ? 'bg-black' : 'bg-transparent'}`}></span>
                LIVE
              </button>
            </div>

            {/* Wallet Balance Info */}
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

          {/* Row 2: Asset Custody Status Banner */}
          {existingPosition && existingPosition.quantity > 0 ? (
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-[#38BDF8] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Briefcase size={13} />
              </div>
              <div className="flex-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">
                    Na Carteira {mode === 'DEMO' ? 'DEMO' : 'LIVE'}: {existingPosition.quantity} ações
                  </span>
                  <span
                    className={`font-bold ${
                      existingPosition.plPercent >= 0 ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
                    }`}
                  >
                    {existingPosition.plPercent >= 0 ? '+' : ''}
                    {existingPosition.plPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5 flex flex-wrap items-center gap-2">
                  <span>PM: R$ {existingPosition.avgPrice.toFixed(2)}</span>
                  <span>•</span>
                  <span>Posição: R$ {existingPosition.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center gap-2 text-xs text-[#94A3B8]">
              <ShieldCheck size={14} className="text-[#60A5FA]" />
              <span>
                Você <strong className="text-white">não possui</strong> cotas de {targetSymbol} na conta <strong className={mode === 'DEMO' ? 'text-[#F59E0B]' : 'text-[#38BDF8]'}>{mode}</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Embedded Order Pad */}
        <div className="p-5 flex-1">
          <OrderPad />
        </div>
      </div>
    </div>
  );
};

export const OrderDrawer = OrderModal;
