import React from 'react';
import { Search, X, Building2, TrendingUp, Sparkles, Globe, Clock, Filter } from 'lucide-react';
import { DividendOriginFilter, DividendCategoryFilter } from '../../types/dividend';

interface DividendsFilterBarProps {
  originFilter: DividendOriginFilter;
  onSelectOrigin: (origin: DividendOriginFilter) => void;
  categoryFilter: DividendCategoryFilter;
  onSelectCategory: (category: DividendCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Sub-filter counts based on current origin
  counts: {
    total: number;
    fii: number;
    acao: number;
    datacomAberta: number;
    carteiraTotal: number;
    mercadoTotal: number;
  };
}

export const DividendsFilterBar: React.FC<DividendsFilterBarProps> = ({
  originFilter,
  onSelectOrigin,
  categoryFilter,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const safeCounts = counts || {
    total: 0,
    fii: 0,
    acao: 0,
    datacomAberta: 0,
    carteiraTotal: 0,
    mercadoTotal: 0,
  };

  return (
    <div className="flex flex-col gap-3.5 bg-[#0F1523] p-4 rounded-2xl border border-[#1E293B]">
      {/* Row 1: Nível 1 - Filtro Principal (Minha Carteira vs Todo Mercado B3) + Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Origin Level 1 Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onSelectOrigin('carteira')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              originFilter === 'carteira'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
            }`}
          >
            <Sparkles size={13} className={originFilter === 'carteira' ? 'fill-white' : 'text-amber-400'} />
            <span>Minha Carteira</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                originFilter === 'carteira' ? 'bg-black/25 text-white' : 'bg-amber-500/15 text-amber-300'
              }`}
            >
              {safeCounts.carteiraTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectOrigin('mercado')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              originFilter === 'mercado'
                ? 'bg-[#2962FF] text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
            }`}
          >
            <Globe size={13} />
            <span>Todo o Mercado B3</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                originFilter === 'mercado' ? 'bg-black/25 text-white' : 'bg-[#1E293B] text-[#94A3B8]'
              }`}
            >
              {safeCounts.mercadoTotal}
            </span>
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
      </div>

      {/* Row 2: Nível 2 - Sub-filtros por Classe de Ativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#1E293B]/60">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono font-semibold text-[#64748B] shrink-0 mr-1 uppercase flex items-center gap-1">
            <Filter size={11} />
            Sub-filtro:
          </span>

          {/* Todos */}
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-[#1E293B] text-white border border-slate-600 shadow-sm'
                : 'bg-[#161F33]/70 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-slate-300">
              {safeCounts.total}
            </span>
          </button>

          {/* Sub-filtro FIIs */}
          <button
            type="button"
            onClick={() => onSelectCategory('fii')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              categoryFilter === 'fii'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                : 'bg-[#161F33]/70 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
            }`}
          >
            <Building2 size={12} className={categoryFilter === 'fii' ? 'text-emerald-300' : 'text-[#64748B]'} />
            <span>Fundos Imobiliários (FIIs)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === 'fii' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-black/30 text-slate-400'
              }`}
            >
              {safeCounts.fii}
            </span>
          </button>

          {/* Sub-filtro Ações */}
          <button
            type="button"
            onClick={() => onSelectCategory('acao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              categoryFilter === 'acao'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm ring-1 ring-sky-500/20'
                : 'bg-[#161F33]/70 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
            }`}
          >
            <TrendingUp size={12} className={categoryFilter === 'acao' ? 'text-sky-300' : 'text-[#64748B]'} />
            <span>Ações (Stocks)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === 'acao' ? 'bg-sky-500/30 text-sky-200' : 'bg-black/30 text-slate-400'
              }`}
            >
              {safeCounts.acao}
            </span>
          </button>

          {/* Sub-filtro Data-COM Aberta */}
          <button
            type="button"
            onClick={() => onSelectCategory('datacom_aberta')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              categoryFilter === 'datacom_aberta'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm ring-1 ring-purple-500/20'
                : 'bg-[#161F33]/70 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
            }`}
          >
            <Clock size={12} className={categoryFilter === 'datacom_aberta' ? 'text-purple-300' : 'text-[#64748B]'} />
            <span>Data-COM Aberta</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === 'datacom_aberta' ? 'bg-purple-500/30 text-purple-200' : 'bg-black/30 text-slate-400'
              }`}
            >
              {safeCounts.datacomAberta}
            </span>
          </button>
        </div>

        {/* Legend Hint */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-[#64748B] shrink-0">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            FII (Verde)
          </span>
          <span className="flex items-center gap-1 text-[#60A5FA]">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
            Ação (Azul)
          </span>
        </div>
      </div>
    </div>
  );
};
