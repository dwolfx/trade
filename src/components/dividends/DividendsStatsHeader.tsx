import React from 'react';
import { CalendarDays, DollarSign, Clock, Building2, TrendingUp, Sparkles } from 'lucide-react';
import { DividendCalendarItem } from '../../types/dividend';
import { PortfolioPosition } from '../../types/market';
import { MetricCard } from '../common/MetricCard';

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
      {/* Card 1: Previsto na Carteira */}
      <MetricCard
        label={`Previsto na Carteira (${currentMonthName})`}
        icon={DollarSign}
        iconBg="bg-blue-500/10"
        iconColor="text-[#60A5FA]"
        value={`R$ ${totalUserAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subValue={
          <span className="flex items-center gap-1 text-[#94A3B8]">
            <Sparkles size={12} className="text-amber-400" />
            Baseado na custódia das suas cotas atuais
          </span>
        }
        badge={{
          text: `${userMonthEvents.length} ${userMonthEvents.length === 1 ? 'ativo' : 'ativos'}`,
          variant: 'blue',
        }}
      />

      {/* Card 2: Próximo Pinga-Pinga */}
      <MetricCard
        label="Próximo Pinga-Pinga"
        icon={Clock}
        iconBg="bg-amber-500/10"
        iconColor="text-[#F59E0B]"
        badge={
          nextUserEvent
            ? { text: nextUserEvent.paymentDateDisplay, variant: 'amber' }
            : undefined
        }
        value={
          nextUserEvent ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xl font-mono font-bold text-white flex items-center gap-2">
                {nextUserEvent.symbol}
                <span className="text-xs font-normal text-[#94A3B8]">({nextUserEvent.type})</span>
              </span>
              <button
                type="button"
                onClick={() => onSelectUpcoming(nextUserEvent.symbol)}
                className="text-[11px] font-mono text-[#60A5FA] hover:underline"
              >
                Ver detalhes →
              </button>
            </div>
          ) : (
            <span className="text-sm font-normal text-[#64748B]">Nenhum provento pendente para este mês</span>
          )
        }
        subValue={
          nextUserEvent ? (
            <span className="text-[11px] text-[#38BDF8] font-mono">
              R$ {nextUserEvent.valuePerShare.toFixed(2)} / cota · Total: R${' '}
              {((userPortfolioMap.get(nextUserEvent.symbol.toUpperCase())?.quantity || 0) * nextUserEvent.valuePerShare).toFixed(2)}
            </span>
          ) : null
        }
      />

      {/* Card 3: Agenda Geral B3 */}
      <MetricCard
        label="Agenda Geral B3"
        icon={CalendarDays}
        iconBg="bg-sky-500/10"
        iconColor="text-[#38BDF8]"
        badge={{
          text: `${monthItems.length} pagamentos`,
          variant: 'sky',
        }}
        value={
          <div className="flex items-baseline gap-2">
            <span>{monthItems.length}</span>
            <span className="text-xs font-normal text-[#94A3B8]">proventos mapeados</span>
          </div>
        }
        subValue={
          <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
            <span className="flex items-center gap-1 text-[#38BDF8]">
              <Building2 size={12} />
              {fiiCount} FIIs
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-[#60A5FA]">
              <TrendingUp size={12} />
              {acaoCount} Ações
            </span>
          </div>
        }
      />

      {/* Card 4: FIIs: Renda Isenta Mensal */}
      <MetricCard
        label="FIIs: Renda Isenta Mensal"
        icon={Building2}
        iconBg="bg-sky-500/10"
        iconColor="text-[#38BDF8]"
        badge={{
          text: 'IR 0%',
          variant: 'sky',
        }}
        value={
          <div className="flex items-baseline gap-2">
            <span>100%</span>
            <span className="text-xs font-normal text-[#94A3B8]">dos FIIs pagam no mês</span>
          </div>
        }
        subValue={
          <span className="text-[11px] text-[#94A3B8]">
            Concentração de pagamentos entre os dias <strong className="text-white">12 e 15</strong>.
          </span>
        }
      />
    </div>
  );
};
