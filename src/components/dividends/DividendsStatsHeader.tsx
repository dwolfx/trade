import React from 'react';
import { CalendarDays, DollarSign, Clock, Building2, TrendingUp, Sparkles } from 'lucide-react';
import { DividendCalendarItem } from '../../types/dividend';
import { PortfolioPosition } from '../../types/market';

interface DividendsStatsHeaderProps {
  currentMonthName: string;
  monthItems: DividendCalendarItem[];
  userPortfolioMap: Map<string, PortfolioPosition>;
  onSelectUpcoming: (symbol: string) => void;
}

export const DividendsStatsHeader: React.FC<DividendsStatsHeaderProps> = ({
  currentMonthName,
  monthItems,
  userPortfolioMap,
  onSelectUpcoming,
}) => {
  // Compute total user will receive in this month based on their portfolio
  const userMonthEvents = monthItems.filter((item) => userPortfolioMap.has(item.symbol.toUpperCase()));

  const totalUserAmount = userMonthEvents.reduce((acc, item) => {
    const pos = userPortfolioMap.get(item.symbol.toUpperCase());
    const qty = pos ? pos.quantity : 0;
    return acc + qty * item.valuePerShare;
  }, 0);

  // Find next upcoming payment from user portfolio
  const now = new Date();
  const sortedUpcoming = [...userMonthEvents].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  );
  const nextUserEvent = sortedUpcoming.find((item) => new Date(item.paymentDate) >= now) || sortedUpcoming[0];

  // Count FIIs vs Stocks
  const fiiCount = monthItems.filter((m) => m.category === 'fii').length;
  const acaoCount = monthItems.filter((m) => m.category === 'acao').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Total Previsto para Minha Carteira */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-blue-500/30 shadow-lg relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
            <DollarSign size={14} />
            Previsto na Carteira ({currentMonthName})
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-[#60A5FA] border border-blue-500/30">
            {userMonthEvents.length} {userMonthEvents.length === 1 ? 'ativo' : 'ativos'}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-mono font-black text-white">
            R$ {totalUserAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" />
          <span>Baseado na custódia das suas cotas atuais</span>
        </p>
      </div>

      {/* Card 2: Próximo Pagamento */}
      <div className="p-4 rounded-2xl bg-[#0F1523] border border-[#1E293B] shadow-md hover:border-slate-700 transition-colors relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Clock size={14} className="text-amber-400" />
            Próximo Pinga-Pinga
          </span>
          {nextUserEvent && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {nextUserEvent.paymentDateDisplay}
            </span>
          )}
        </div>
        {nextUserEvent ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-bold text-white flex items-center gap-2">
                {nextUserEvent.symbol}
                <span className="text-xs font-normal text-[#94A3B8]">({nextUserEvent.type})</span>
              </span>
              <button
                onClick={() => onSelectUpcoming(nextUserEvent.symbol)}
                className="text-[11px] font-mono text-[#60A5FA] hover:underline"
              >
                Ver detalhes →
              </button>
            </div>
            <p className="text-[11px] text-sky-400 font-mono mt-1">
              R$ {nextUserEvent.valuePerShare.toFixed(2)} / cota · Total: R${' '}
              {((userPortfolioMap.get(nextUserEvent.symbol.toUpperCase())?.quantity || 0) * nextUserEvent.valuePerShare).toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#64748B] mt-2">Nenhum provento pendente para este mês</p>
        )}
      </div>

      {/* Card 3: Oportunidades do Mês no Mercado B3 */}
      <div className="p-4 rounded-2xl bg-[#0F1523] border border-[#1E293B] shadow-md hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <CalendarDays size={14} className="text-sky-400" />
            Agenda Geral B3
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            {monthItems.length} pagamentos
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-bold text-white">{monthItems.length}</span>
          <span className="text-xs text-[#94A3B8]">proventos mapeados</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#94A3B8]">
          <span className="flex items-center gap-1 text-sky-400">
            <Building2 size={12} />
            {fiiCount} FIIs
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1 text-blue-400">
            <TrendingUp size={12} />
            {acaoCount} Ações
          </span>
        </div>
      </div>

      {/* Card 4: Foco em Renda Passiva */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F1523] to-[#162338] border border-sky-500/30 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
            <Building2 size={14} />
            FIIs: Renda Isenta Mensal
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            IR 0%
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-bold text-white">100%</span>
          <span className="text-xs text-[#94A3B8]">dos FIIs pagam no mês</span>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-1">
          Concentração de pagamentos entre os dias <strong className="text-white">12 e 15</strong>.
        </p>
      </div>
    </div>
  );
};
