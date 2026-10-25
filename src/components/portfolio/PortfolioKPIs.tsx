import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, CalendarCheck, ShieldCheck } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

interface PortfolioKPIsProps {
  totalPatrimony: number;
  totalInvested: number;
  totalPL: number;
  totalPLPercent: number;
  upcomingDividendsTotal: number;
  stocksPercent: number;
  fiisPercent: number;
  fixedIncomePercent: number;
  showBalance: boolean;
  mode?: 'DEMO' | 'LIVE';
}

export const PortfolioKPIs: React.FC<PortfolioKPIsProps> = ({
  totalPatrimony,
  totalInvested,
  totalPL,
  totalPLPercent,
  upcomingDividendsTotal,
  stocksPercent,
  fiisPercent,
  fixedIncomePercent,
  showBalance,
  mode = 'DEMO',
}) => {
  const isPositive = totalPL >= 0;

  const formatCurrency = (val: number) => {
    if (!showBalance) return '••••••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Patrimony */}
      <MetricCard
        label="Patrimônio Consolidado"
        icon={DollarSign}
        iconBg="bg-blue-500/10"
        iconColor="text-[#60A5FA]"
        value={formatCurrency(totalPatrimony)}
        subValue={<span>Custo: {formatCurrency(totalInvested)}</span>}
        footerLeft="Atualizado em tempo real"
        badge={{
          text: mode === 'DEMO' ? 'Simulado B3' : 'Custódia Real B3',
          variant: mode === 'DEMO' ? 'amber' : 'sky',
        }}
      />

      {/* 2. Total Profit / Loss */}
      <MetricCard
        label="Lucro / Prejuízo (P&L)"
        icon={isPositive ? TrendingUp : TrendingDown}
        iconBg={isPositive ? 'bg-sky-500/10' : 'bg-rose-500/10'}
        iconColor={isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}
        value={
          <span className={isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}>
            {showBalance ? `${isPositive ? '+' : ''}${formatCurrency(totalPL)}` : '••••••••••'}
          </span>
        }
        subValue={
          <>
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                isPositive ? 'bg-sky-500/15 text-[#38BDF8]' : 'bg-rose-500/15 text-[#F43F5E]'
              }`}
            >
              {isPositive ? '+' : ''}{totalPLPercent.toFixed(2)}%
            </span>
            <span className="text-[11px] text-[#64748B]">retorno histórico</span>
          </>
        }
        footerLeft="Superando CDI"
        footerRight={<span className="text-[#38BDF8] font-mono font-bold text-[10px]">+142% do CDI</span>}
      />

      {/* 3. Upcoming Dividends */}
      <MetricCard
        label="Próximos Proventos"
        icon={CalendarCheck}
        iconBg="bg-amber-500/10"
        iconColor="text-[#F59E0B]"
        value={formatCurrency(upcomingDividendsTotal)}
        subValue={
          <>
            <span className="text-amber-400 font-bold">4 pagamentos</span>
            <span className="text-[#64748B]">agendados para este ciclo</span>
          </>
        }
        footerLeft="Próximo depósito"
        footerRight={<span className="text-white font-mono font-semibold text-[10px]">14/11 (HGLG11)</span>}
      />

      {/* 4. Strategic Macro Allocation (3 Pilares) */}
      <MetricCard
        label="Alocação Macro (3 Pilares)"
        icon={PieChart}
        iconBg="bg-indigo-500/10"
        iconColor="text-[#818CF8]"
        value={null}
        footerLeft={
          <span className="text-[#94A3B8] flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#38BDF8]" /> Tri-Balanceado
          </span>
        }
        footerRight={<span className="text-white text-[10px] font-mono">Ações • FIIs • RF</span>}
      >
        <div className="space-y-2 mt-1">
          {/* 3 Pillars indicators */}
          <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
            <div className="flex items-center gap-1 text-[#60A5FA]">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0" />
              <span className="truncate">Ações {stocksPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1 text-[#C084FC]">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] flex-shrink-0" />
              <span className="truncate">FIIs {fiisPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1 text-[#06B6D4]">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] flex-shrink-0" />
              <span className="truncate">RF {fixedIncomePercent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Tri-color Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-[#161F33] overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-[#2962FF] to-[#3B82F6] transition-all duration-300"
              style={{ width: `${stocksPercent}%` }}
              title={`Ações: ${stocksPercent.toFixed(1)}%`}
            />
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] transition-all duration-300"
              style={{ width: `${fiisPercent}%` }}
              title={`FIIs: ${fiisPercent.toFixed(1)}%`}
            />
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${fixedIncomePercent}%` }}
              title={`Renda Fixa & Caixa: ${fixedIncomePercent.toFixed(1)}%`}
            />
          </div>
        </div>
      </MetricCard>
    </div>
  );
};
