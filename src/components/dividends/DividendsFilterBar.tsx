import React from 'react';
import { Search, X, Building2, TrendingUp, Sparkles, Globe, Clock, Heart, Filter, Check } from 'lucide-react';
import { DividendOrigin, DividendCategoryFilter } from '../../types/dividend';

interface DividendsFilterBarProps {
  selectedOrigins: DividendOrigin[];
  onToggleOrigin: (origin: DividendOrigin) => void;
  categoryFilter: DividendCategoryFilter;
  onSelectCategory: (category: DividendCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Sub-filter counts based on current origin
  counts: {
    total: number;
    fii: number;
    acao: number;
    internacional: number;
    datacomAberta: number;
    carteiraTotal: number;
    favoritosTotal: number;
    mercadoTotal: number;
  };
}

export const DividendsFilterBar: React.FC<DividendsFilterBarProps> = ({
  selectedOrigins,
  onToggleOrigin,
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
    internacional: 0,
    datacomAberta: 0,
    carteiraTotal: 0,
    favoritosTotal: 0,
    mercadoTotal: 0,
  };

  const isCarteiraActive = selectedOrigins.includes('carteira');
  const isFavoritosActive = selectedOrigins.includes('favoritos');
  const isMercadoActive = selectedOrigins.includes('mercado');

  return (
    <div className="flex flex-col gap-3.5 bg-[#0F1523] p-4 rounded-2xl border border-[#1E293B]">
      {/* Row 1: Nível 1 - Origem Múltipla (Minha Carteira + Meus Favoritos + Todo o Mercado) + Busca */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Origin Multi-selector (User can combine Carteira + Favoritos simultaneously!) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono font-semibold text-[#64748B] shrink-0 mr-1 uppercase">
            Origem:
          </span>

          {/* 1. Minha Carteira (Toggleable) */}
          <button
            type="button"
            onClick={() => onToggleOrigin('carteira')}
            aria-pressed={isCarteiraActive}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border ${
              isCarteiraActive
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white border-amber-400/50 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30'
                : 'bg-[#161F33] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-slate-700'
            }`}
          >
            {isCarteiraActive ? (
              <Check size={13} className="text-white stroke-[3]" />
            ) : (
              <Sparkles size={13} className="text-amber-400" />
            )}
            <span>Minha Carteira</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isCarteiraActive ? 'bg-black/25 text-white' : 'bg-amber-500/15 text-amber-300'
              }`}
            >
              {safeCounts.carteiraTotal}
            </span>
          </button>

          {/* 2. Meus Favoritos (Toggleable - Adds to view!) */}
          <button
            type="button"
            onClick={() => onToggleOrigin('favoritos')}
            aria-pressed={isFavoritosActive}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border ${
              isFavoritosActive
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white border-rose-400/50 shadow-md shadow-rose-500/20 ring-1 ring-rose-400/30'
                : 'bg-[#161F33] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-slate-700'
            }`}
          >
            {isFavoritosActive ? (
              <Check size={13} className="text-white stroke-[3]" />
            ) : (
              <Heart size={13} className="text-rose-400" />
            )}
            <span>Meus Favoritos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isFavoritosActive ? 'bg-black/25 text-white' : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              {safeCounts.favoritosTotal}
            </span>
          </button>

          {/* 3. Todo o Mercado (Toggleable) */}
          <button
            type="button"
            onClick={() => onToggleOrigin('mercado')}
            aria-pressed={isMercadoActive}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border ${
              isMercadoActive
                ? 'bg-[#2962FF] text-white border-blue-400/50 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30'
                : 'bg-[#161F33] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-slate-700'
            }`}
          >
            {isMercadoActive ? (
              <Check size={13} className="text-white stroke-[3]" />
            ) : (
              <Globe size={13} />
            )}
            <span>Todo o Mercado</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isMercadoActive ? 'bg-black/25 text-white' : 'bg-[#1E293B] text-[#94A3B8]'
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
            placeholder="Buscar por ticker (MXRF11, PETR4, AAPL) ou empresa..."
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
            Classe:
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
            <span>FIIs (Imobiliários)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === 'fii' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-black/30 text-slate-400'
              }`}
            >
              {safeCounts.fii}
            </span>
          </button>

          {/* Sub-filtro Ações B3 */}
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
            <span>Ações B3</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === 'acao' ? 'bg-sky-500/30 text-sky-200' : 'bg-black/30 text-slate-400'
              }`}
            >
              {safeCounts.acao}
            </span>
          </button>

          {/* Sub-filtro Internacionais (Stocks) */}
          <button
            type="button"
            onClick={() => onSelectCategory('internacional')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              categoryFilter === 'internacional'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-[#161F33]/70 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent'
            }`}
          >
            <Globe size={12} className={categoryFilter === 'internacional' ? 'text-indigo-300' : 'text-[#64748B]'} />
            <span>Internacionais (US$)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categoryFilter === 'internacional' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-black/30 text-slate-400'
              }`}
            >
              {safeCounts.internacional}
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
        <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-[#64748B] shrink-0">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            FII
          </span>
          <span className="flex items-center gap-1 text-[#60A5FA]">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
            Ação B3
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Global (US$)
          </span>
        </div>
      </div>
    </div>
  );
};
