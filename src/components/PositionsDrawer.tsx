import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Briefcase, History, X, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface PositionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PositionsDrawer: React.FC<PositionsDrawerProps> = ({ isOpen, onClose }) => {
  const { portfolio, orders, executeOrder, setActiveAsset, assets } = useMarket();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders'>('positions');

  if (!isOpen) return null;

  const totalInvested = portfolio.reduce((acc, p) => acc + p.totalInvested, 0);
  const totalCurrentValue = portfolio.reduce((acc, p) => acc + p.currentValue, 0);
  const totalPL = totalCurrentValue - totalInvested;
  const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
  const isPositive = totalPL >= 0;

  const handleClosePosition = (symbol: string, quantity: number, price: number) => {
    executeOrder({
      symbol,
      side: 'sell',
      type: 'market',
      quantity,
      price
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-[#0F1523] border-l border-[#1E293B] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#161F33] flex items-center justify-center text-[#60A5FA]">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Gestão da Carteira & Histórico
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Acompanhe seus ativos em custódia e execuções B3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141C2E] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Portfolio Summary Card */}
        <div className="p-5 bg-[#0B0F19] border-b border-[#1E293B] grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] text-[#64748B] uppercase font-bold tracking-wider">
              Patrimônio em Ações
            </span>
            <div className="text-xl font-black font-mono text-white mt-0.5">
              R$ {totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
              Custo: R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#64748B] uppercase font-bold tracking-wider">
              Lucro / Prejuízo (P&L)
            </span>
            <div
              className={`text-xl font-black font-mono flex items-center justify-end gap-1 mt-0.5 ${
                isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
              }`}
            >
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {isPositive ? '+' : ''}
              R$ {totalPL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              className={`text-[11px] font-bold font-mono ${
                isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
              }`}
            >
              {isPositive ? '+' : ''}
              {totalPLPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Tab Controls: Posições vs Ordens */}
        <div className="flex border-b border-[#1E293B] px-5 bg-[#0F1523]">
          <button
            onClick={() => setActiveTab('positions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'positions'
                ? 'border-[#2962FF] text-white'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Briefcase size={14} />
            <span>Posições em Custódia ({portfolio.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#2962FF] text-white'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <History size={14} />
            <span>Ordens Executadas ({orders.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeTab === 'positions' ? (
            portfolio.length > 0 ? (
              portfolio.map(pos => {
                const posPositive = pos.plValue >= 0;
                return (
                  <div
                    key={pos.symbol}
                    className="p-4 bg-[#141C2E] border border-[#1E293B] rounded-xl flex flex-col gap-3 hover:border-[#334155] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono text-base">{pos.symbol}</span>
                          <span className="text-xs text-[#94A3B8]">{pos.name}</span>
                        </div>
                        <span className="text-xs font-mono text-[#64748B]">
                          {pos.quantity} ações · PM: R$ {pos.avgPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-sm font-bold text-white block">
                          R$ {pos.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            posPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
                          }`}
                        >
                          {posPositive ? '+' : ''}
                          R$ {pos.plValue.toFixed(2)} ({posPositive ? '+' : ''}{pos.plPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1E293B]/70 flex items-center justify-between">
                      <button
                        onClick={() => {
                          const asset = assets.find(a => a.symbol === pos.symbol);
                          if (asset) setActiveAsset(asset);
                          onClose();
                        }}
                        className="text-xs font-semibold text-[#60A5FA] hover:underline"
                      >
                        Ver no Gráfico & Boleta →
                      </button>

                      <button
                        onClick={() => handleClosePosition(pos.symbol, pos.quantity, pos.currentPrice)}
                        className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-[#F43F5E] border border-rose-500/20 rounded-lg text-xs font-bold transition-all"
                      >
                        Zerar Posição
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-sm text-[#64748B]">
                Você ainda não possui posições compradas nesta conta.
              </div>
            )
          ) : (
            /* Orders History List */
            orders.length > 0 ? (
              orders.map(order => (
                <div
                  key={order.id}
                  className="p-3.5 bg-[#141C2E] border border-[#1E293B] rounded-xl flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${
                        order.side === 'buy'
                          ? 'bg-sky-500/20 text-[#38BDF8] border border-sky-500/30'
                          : 'bg-rose-500/20 text-[#F43F5E] border border-rose-500/30'
                      }`}
                    >
                      {order.side === 'buy' ? 'COMPRA' : 'VENDA'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{order.symbol}</span>
                        <span className="text-[#94A3B8] text-[11px]">
                          {order.quantity} un @ R$ {order.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#64748B]">
                        {new Date(order.timestamp).toLocaleTimeString('pt-BR')} · Modo {order.mode}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-white block">
                      R$ {order.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#38BDF8] flex items-center justify-end gap-1">
                      <CheckCircle2 size={11} /> Executada
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-sm text-[#64748B]">
                Nenhuma ordem executada ainda.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
