import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, List, Sparkles } from 'lucide-react';

interface DividendsMonthBarProps {
  currentMonthKey: string;
  availableMonths: { key: string; label: string }[];
  onSelectMonth: (monthKey: string) => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  filteredCount: number;
}

export const DividendsMonthBar: React.FC<DividendsMonthBarProps> = ({
  currentMonthKey,
  availableMonths,
  onSelectMonth,
  viewMode,
  onToggleViewMode,
  filteredCount,
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
  const isCurrentDefaultMonth = currentMonthKey === '2026-11';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-[#0F1523] via-[#161F33] to-[#0F1523] rounded-2xl border border-blue-500/30 shadow-lg">
      {/* Left: Prominent Month Navigation with only Arrows & Month Title */}
      <div className="flex items-center gap-2">
        {/* Arrow Left */}
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={currentMonthIndex <= 0}
          className="p-2 rounded-xl bg-[#0F1523] hover:bg-[#1E293B] border border-[#1E293B] hover:border-slate-600 text-[#94A3B8] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
          title="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Big Month Title */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0F1523] border border-blue-500/30">
          <Calendar size={16} className="text-[#60A5FA]" />
          <span className="text-base sm:text-lg font-mono font-black text-white tracking-tight">
            {currentMonthLabel}
          </span>
          {isCurrentDefaultMonth && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-[#38BDF8] border border-sky-500/30">
              Mês Atual
            </span>
          )}
        </div>

        {/* Arrow Right */}
        <button
          type="button"
          onClick={handleNextMonth}
          disabled={currentMonthIndex >= availableMonths.length - 1}
          className="p-2 rounded-xl bg-[#0F1523] hover:bg-[#1E293B] border border-[#1E293B] hover:border-slate-600 text-[#94A3B8] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
          title="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Right: Event count badge & View Mode switcher */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#94A3B8]">
          <Sparkles size={13} className="text-amber-400" />
          <strong className="text-white font-bold">{filteredCount}</strong> {filteredCount === 1 ? 'provento' : 'proventos'}
        </span>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0F1523] p-1 rounded-xl border border-[#1E293B]">
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
    </div>
  );
};
