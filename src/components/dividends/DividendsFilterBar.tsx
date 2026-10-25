import React from 'react';
import { Search, X, Calendar, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { DividendFilterScope } from '../../types/dividend';

interface DividendsFilterBarProps {
  currentMonthKey: string; // e.g. "2026-11"
  availableMonths: { key: string; label: string }[];
  onSelectMonth: (monthKey: string) => void;
  scope: DividendFilterScope;
  onSelectScope: (scope: DividendFilterScope) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  userPortfolioCount: number;
}

export const DividendsFilterBar: React.FC<DividendsFilterBarProps> = ({
  currentMonthKey,
  availableMonths,
  onSelectMonth,
  scope,
  onSelectScope,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  userPortfolioCount,
}) => {
  const currentMonthIndex = availableMonths.findIndex((m) => m.key === currentMonthKey);

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      onSelectMonth(availableMonths[currentMonthIndex - 1].key);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < availableMonths.length - 1) {
      onSelectMonth(availableMonths[currentMonthIndex + 1].key);
    }
  };

  const currentMonthLabel = availableMonths[currentMonthIndex]?.label || currentMonthKey;

  return (
    <div className="flex flex-col gap-3.5 bg-[#0F1523] p-4 rounded-2xl border border-[#1E293B]">
      {/* Top Row: Month Picker & Search & View Toggle */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Month Selector with Arrows */}
        <div className="flex items-center gap-1.5 bg-[#161F33] p-1 rounded-xl border border-[#1E293B] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentMonthIndex <= 0}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="px-3 py-1 font-mono font-bold text-xs text-white min-w-[130px] text-center tracking-wide">
            {currentMonthLabel}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentMonthIndex >= availableMonths.length - 1}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Próximo mês"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por ticker (MXRF11, PETR4, HGLG11) ou nome..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#161F33] border border-[#1E293B] hover:border-slate-700 focus:border-[#2962FF] text-xs font-mono text-white placeholder-[#64748B] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Grid vs List View Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#161F33] p-1 rounded-xl border border-[#1E293B] shrink-0 self-end lg:self-auto">
          <button
            type="button"
            onClick={() => onToggleViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-[#2962FF] text-white shadow-md shadow-blue-500/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            <Calendar size={13} />
            <span>Calendário</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-[#2962FF] text-white shadow-md shadow-blue-500/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
            }`}
          >
            <List size={13} />
            <span>Lista / Agenda</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Scope Filter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#1E293B]/60">
        <span className="text-[11px] font-mono font-medium text-[#64748B] flex items-center gap-1 shrink-0 mr-1">
          <Filter size={12} />
          Filtrar:
        </span>

        {/* Todas */}
        <button
          onClick={() => onSelectScope('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
            scope === 'all'
              ? 'bg-blue-600/20 text-[#60A5FA] border border-blue-500/40 shadow-sm'
              : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
          }`}
        >
          Todo o Mercado B3
        </button>

        {/* Minha Carteira */}
        <button
          onClick={() => onSelectScope('carteira')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
            scope === 'carteira'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
          }`}
        >
          <span>⭐ Só Minha Carteira</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200">
            {userPortfolioCount}
          </span>
        </button>

        {/* Só FIIs */}
        <button
          onClick={() => onSelectScope('fii')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
            scope === 'fii'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
          }`}
        >
          <span>🏢 Fundos Imobiliários (FIIs)</span>
        </button>

        {/* Só Ações */}
        <button
          onClick={() => onSelectScope('acao')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
            scope === 'acao'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
          }`}
        >
          <span>📈 Ações (Dividendo & JCP)</span>
        </button>

        {/* Data-Com Aberta */}
        <button
          onClick={() => onSelectScope('datacom_aberta')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
            scope === 'datacom_aberta'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
          }`}
        >
          <span>🔔 Data-COM Aberta</span>
        </button>
      </div>
    </div>
  );
};
