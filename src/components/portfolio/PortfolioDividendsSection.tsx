import React, { useState } from 'react';
import { DividendEvent } from '../../types/market';
import { Calendar, CheckCircle2, Clock, Sparkles, Wallet } from 'lucide-react';

interface PortfolioDividendsSectionProps {
  upcomingDividends: DividendEvent[];
  recentPaidDividends: DividendEvent[];
  showBalance: boolean;
}

export const PortfolioDividendsSection: React.FC<PortfolioDividendsSectionProps> = ({
  upcomingDividends,
  recentPaidDividends,
  showBalance,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');

  const upcomingTotal = upcomingDividends.reduce((acc, d) => acc + d.totalAmount, 0);
  const paidTotal = recentPaidDividends.reduce((acc, d) => acc + d.totalAmount, 0);

  const formatCurrency = (val: number) => {
    if (!showBalance) return '••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="h-full p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col gap-4">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              Central de Dividendos & Proventos
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-[#F59E0B] border border-amber-500/20 flex items-center gap-1">
              <Sparkles size={11} /> Renda Passiva
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Previsão de depósitos automáticos direto na sua conta TradeCraft
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-[#161F33] p-1 rounded-xl border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-[#2962FF] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Clock size={13} />
            <span>Próximos a Receber ({upcomingDividends.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'recent'
                ? 'bg-[#0284C7] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Últimos 3 Recebidos</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="py-3 px-4 rounded-xl bg-[#121929] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
            <Wallet size={16} />
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
              {activeTab === 'upcoming' ? 'Total Agendado a Receber' : 'Total dos Últimos 3 Recebidos'}
            </span>
            <span className="text-base font-black font-mono text-white">
              {activeTab === 'upcoming' ? formatCurrency(upcomingTotal) : formatCurrency(paidTotal)}
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-[#94A3B8]">
          <span>Estratégia Bola de Neve: </span>
          <span className="text-[#38BDF8] font-bold">100% Reinvestimento Ativo</span>
        </div>
      </div>

      {/* Dividend List */}
      <div className="space-y-3">
        {activeTab === 'upcoming' ? (
          upcomingDividends.map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#121929]/70 border border-[#1E293B]/60 hover:border-[#334155] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#161F33] border border-[#1E293B] flex items-center justify-center font-black font-mono text-xs text-white">
                  {item.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'Dividendo'
                          ? 'bg-blue-500/15 text-[#60A5FA]'
                          : item.type === 'JCP'
                          ? 'bg-purple-500/15 text-[#C084FC]'
                          : 'bg-sky-500/15 text-[#38BDF8]'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5 flex items-center gap-2">
                    <span>Data COM: {item.dateCom}</span>
                    <span>•</span>
                    <span className="text-amber-400/90 font-medium flex items-center gap-1">
                      <Calendar size={11} /> Pagamento: {item.paymentDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Values */}
              <div className="text-left sm:text-right font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1E293B]">
                <div className="text-sm font-black text-white">
                  {formatCurrency(item.totalAmount)}
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  {item.quantity} cotas × R$ {item.valuePerShare.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Recent 3 Paid */
          recentPaidDividends.slice(0, 3).map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#121929]/70 border border-[#1E293B]/60 hover:border-[#334155] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-black font-mono text-xs text-[#38BDF8]">
                  {item.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/15 text-[#38BDF8] flex items-center gap-1">
                      <CheckCircle2 size={10} /> Depositado
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                    Pago em {item.paymentDate} • {item.type}
                  </div>
                </div>
              </div>

              {/* Right Values */}
              <div className="text-left sm:text-right font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1E293B]">
                <div className="text-sm font-black text-[#38BDF8]">
                  +{formatCurrency(item.totalAmount)}
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  {item.quantity} cotas × R$ {item.valuePerShare.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
