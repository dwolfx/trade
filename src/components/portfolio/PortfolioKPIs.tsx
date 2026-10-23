import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, CalendarCheck, ShieldCheck } from 'lucide-react';

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
      <div className="p-5 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between relative overflow-hidden group hover:border-[#334155] transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
        <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
          <span className="uppercase tracking-wider">Patrimônio Consolidado</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#60A5FA] flex items-center justify-center">
            <DollarSign size={16} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {formatCurrency(totalPatrimony)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B] font-mono">
            <span>Custo: {formatCurrency(totalInvested)}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px]">
          <span className="text-[#94A3B8]">Atualizado em tempo real</span>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] transition-colors ${
            mode === 'DEMO'
              ? 'bg-amber-500/15 text-[#F59E0B] border border-amber-500/30'
              : 'bg-sky-500/15 text-[#38BDF8] border border-sky-500/30'
          }`}>
            {mode === 'DEMO' ? 'Simulado B3' : 'Custódia Real B3'}
          </span>
        </div>
      </div>

      {/* 2. Total Profit / Loss */}
      <div className="p-5 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between relative overflow-hidden group hover:border-[#334155] transition-all">
        <div className={`absolute top-0 right-0 w-24 h-24 ${isPositive ? 'bg-sky-500/5' : 'bg-rose-500/5'} rounded-full blur-2xl pointer-events-none`} />
        <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
          <span className="uppercase tracking-wider">Lucro / Prejuízo (P&L)</span>
          <div className={`w-8 h-8 rounded-xl ${isPositive ? 'bg-sky-500/10 text-[#38BDF8]' : 'bg-rose-500/10 text-[#F43F5E]'} flex items-center justify-center`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-black font-mono tracking-tight flex items-center gap-1.5 ${isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}`}>
            {showBalance ? (
              <span>{isPositive ? '+' : ''}{formatCurrency(totalPL)}</span>
            ) : (
              '••••••••••'
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-sky-500/15 text-[#38BDF8]' : 'bg-rose-500/15 text-[#F43F5E]'}`}>
              {isPositive ? '+' : ''}{totalPLPercent.toFixed(2)}%
            </span>
            <span className="text-[11px] text-[#64748B]">retorno histórico</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px]">
          <span className="text-[#94A3B8]">Superando CDI</span>
          <span className="text-[#38BDF8] font-mono font-bold text-[10px]">+142% do CDI</span>
        </div>
      </div>

      {/* 3. Upcoming Dividends */}
      <div className="p-5 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between relative overflow-hidden group hover:border-[#334155] transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
          <span className="uppercase tracking-wider">Próximos Proventos</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
            <CalendarCheck size={16} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {formatCurrency(upcomingDividendsTotal)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#94A3B8]">
            <span className="text-amber-400 font-bold">4 pagamentos</span>
            <span className="text-[#64748B]">agendados para este ciclo</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px]">
          <span className="text-[#94A3B8]">Próximo depósito</span>
          <span className="text-white font-mono font-semibold text-[10px]">14/11 (HGLG11)</span>
        </div>
      </div>

      {/* 4. Strategic Macro Allocation (3 Pilares: Ações | FIIs | Renda Fixa) */}
      <div className="p-5 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between relative overflow-hidden group hover:border-[#334155] transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
          <span className="uppercase tracking-wider">Alocação Macro (3 Pilares)</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-[#818CF8] flex items-center justify-center">
            <PieChart size={16} />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {/* 3 Pillars indicators */}
          <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
            <div className="flex items-center gap-1 text-[#60A5FA]">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0"></span>
              <span className="truncate">Ações {stocksPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1 text-[#C084FC]">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] flex-shrink-0"></span>
              <span className="truncate">FIIs {fiisPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1 text-[#06B6D4]">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] flex-shrink-0"></span>
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
        <div className="mt-3 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px]">
          <span className="text-[#94A3B8] flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#38BDF8]" /> Tri-Balanceado
          </span>
          <span className="text-white text-[10px] font-mono">Ações • FIIs • RF</span>
        </div>
      </div>
    </div>
  );
};
