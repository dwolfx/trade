import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, ChevronDown, Check, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { searchBrapiAssets, BrapiSearchResult } from '../services/brapiService';
import { BrazilFlag } from './common/BrazilFlag';

export const SearchAndExchange: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedExchange,
    setSelectedExchange,
    assets,
    selectOrCreateAsset
  } = useMarket();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExchangeOpen, setIsExchangeOpen] = useState(false);
  const [brapiResults, setBrapiResults] = useState<BrapiSearchResult[]>([]);
  const [isSearchingBrapi, setIsSearchingBrapi] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const exchangeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (exchangeRef.current && !exchangeRef.current.contains(event.target as Node)) {
        setIsExchangeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search on Brapi API
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setBrapiResults([]);
      setIsSearchingBrapi(false);
      return;
    }

    setIsSearchingBrapi(true);
    const timer = setTimeout(async () => {
      const results = await searchBrapiAssets(searchQuery);
      setBrapiResults(results);
      setIsSearchingBrapi(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Local assets matching query
  const localMatches = assets.filter(
    a =>
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter out any Brapi results already in local matches
  const uniqueBrapiResults = brapiResults.filter(
    br => !localMatches.some(lm => lm.symbol.toUpperCase() === br.stock.toUpperCase())
  );

  const handleSelectLocal = (symbol: string) => {
    selectOrCreateAsset(symbol);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSelectBrapi = (item: BrapiSearchResult) => {
    selectOrCreateAsset(item.stock, {
      name: item.name,
      price: item.close || 10.0,
      changePercent: item.change || 0.0,
      category: item.stock.endsWith('11') ? 'fiis' : 'acoes'
    });
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (localMatches.length > 0) {
        handleSelectLocal(localMatches[0].symbol);
      } else if (uniqueBrapiResults.length > 0) {
        handleSelectBrapi(uniqueBrapiResults[0]);
      } else if (searchQuery.trim().length >= 3) {
        // Direct ticker attempt (e.g. user typed TAEE11 or ABEV3)
        selectOrCreateAsset(searchQuery.trim().toUpperCase());
        setSearchQuery('');
        setIsSearchOpen(false);
      }
    }
  };

  const exchanges = [
    { id: 'B3', name: 'B3 BRASIL', flag: '🇧🇷', subtitle: 'Bolsa Oficial · Tempo Real' },
    { id: 'NASDAQ', name: 'NASDAQ / NYSE', flag: '🇺🇸', subtitle: 'Mercado Americano (15m delay)' },
    { id: 'BINANCE', name: 'CRIPTO GLOBAL', flag: '🪙', subtitle: 'Bitcoin & Altcoins 24/7' }
  ];

  const currentEx = exchanges.find(e => e.id === selectedExchange) || exchanges[0];

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
      {/* Search Input Box */}
      <div ref={searchRef} className="relative flex-1 w-full">
        <div className="h-14 bg-[#0F1523] border border-[#1E293B] rounded-2xl px-5 flex items-center gap-3.5 focus-within:border-[#2962FF] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm">
          {isSearchingBrapi ? (
            <Loader2 size={20} className="text-[#2962FF] animate-spin" />
          ) : (
            <Search size={20} className="text-[#64748B]" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Pesquisar ativo na B3 (ex: PETR4, VALE3...)"
            className="w-full bg-transparent text-sm font-medium text-white placeholder-[#64748B] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setBrapiResults([]);
              }}
              className="text-xs text-[#94A3B8] hover:text-white px-2 py-1 rounded bg-[#161F33]"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[#0F1523] border border-[#1E293B] rounded-2xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
            {/* Direct Ticker suggestion if user typed a symbol */}
            {searchQuery.trim().length >= 3 && !localMatches.some(m => m.symbol === searchQuery.trim().toUpperCase()) && (
              <div
                onClick={() => {
                  selectOrCreateAsset(searchQuery.trim().toUpperCase());
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="px-3 py-2.5 mb-1 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-blue-500/30 cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#60A5FA] font-mono text-sm">
                    ⚡ Buscar cotação ao vivo de "{searchQuery.trim().toUpperCase()}"
                  </span>
                </div>
                <span className="text-[10px] bg-[#2962FF] text-white px-2 py-0.5 rounded font-bold">
                  Enter ↵
                </span>
              </div>
            )}

            {/* Local Assets Results */}
            {localMatches.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Ativos Recentes no Terminal
                </div>
                {localMatches.map(asset => (
                  <div
                    key={asset.symbol}
                    onClick={() => handleSelectLocal(asset.symbol)}
                    className="px-3 py-2 rounded-xl hover:bg-[#161F33] cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white group-hover:text-[#60A5FA] font-mono text-sm">
                        {asset.symbol}
                      </span>
                      <span className="text-xs text-[#94A3B8] truncate max-w-[220px]">
                        {asset.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="font-semibold text-white">
                        R$ {asset.price.toFixed(2)}
                      </span>
                      <span
                        className={`flex items-center gap-0.5 font-bold px-2 py-0.5 rounded text-[11px] ${
                          asset.changePercent >= 0
                            ? 'bg-sky-500/10 text-[#38BDF8]'
                            : 'bg-rose-500/10 text-[#F43F5E]'
                        }`}
                      >
                        {asset.changePercent >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {asset.changePercent >= 0 ? `+${asset.changePercent.toFixed(2)}%` : `${asset.changePercent.toFixed(2)}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Brapi Live Catalog Results */}
            {uniqueBrapiResults.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between border-t border-[#1E293B] pt-2">
                  <span>Resultados Oficiais B3 (Brapi)</span>
                  <span className="text-[10px] text-[#60A5FA] font-normal">{uniqueBrapiResults.length} encontrados</span>
                </div>
                {uniqueBrapiResults.map(item => (
                  <div
                    key={item.stock}
                    onClick={() => handleSelectBrapi(item)}
                    className="px-3 py-2 rounded-xl hover:bg-[#161F33] cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt={item.stock}
                          className="w-5 h-5 rounded-full object-contain bg-white/5 p-0.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs">🇧🇷</span>
                      )}
                      <span className="font-bold text-white group-hover:text-[#60A5FA] font-mono text-sm">
                        {item.stock}
                      </span>
                      <span className="text-xs text-[#94A3B8] truncate max-w-[200px]">
                        {item.name}
                      </span>
                      {item.sector && (
                        <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-[#141C2E] text-[#64748B]">
                          {item.sector}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      {item.close !== undefined && item.close !== null && (
                        <span className="font-semibold text-white">
                          R$ {item.close.toFixed(2)}
                        </span>
                      )}
                      {item.change !== undefined && item.change !== null && (
                        <span
                          className={`flex items-center gap-0.5 font-bold px-2 py-0.5 rounded text-[11px] ${
                            item.change >= 0
                              ? 'bg-sky-500/10 text-[#38BDF8]'
                              : 'bg-rose-500/10 text-[#F43F5E]'
                          }`}
                        >
                          {item.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {item.change >= 0 ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {localMatches.length === 0 && uniqueBrapiResults.length === 0 && !isSearchingBrapi && searchQuery.trim().length >= 2 && (
              <div className="py-6 text-center text-xs text-[#64748B]">
                Pressione <strong className="text-white">Enter ↵</strong> para tentar carregar "{searchQuery.toUpperCase()}" diretamente da B3.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exchange Selector Dropdown */}
      <div ref={exchangeRef} className="relative w-full md:w-72">
        <button
          onClick={() => setIsExchangeOpen(!isExchangeOpen)}
          className="h-14 w-full bg-[#0F1523] border border-[#1E293B] rounded-2xl px-4 flex items-center justify-between hover:bg-[#141C2E] hover:border-[#334155] transition-all text-left shadow-sm"
        >
          <div className="flex items-center gap-3">
            {currentEx.id === 'B3' ? <BrazilFlag size="lg" /> : <span className="text-2xl">{currentEx.flag}</span>}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight">{currentEx.name}</span>
              <span className="text-[11px] text-[#64748B] font-medium">{currentEx.subtitle}</span>
            </div>
          </div>
          <ChevronDown size={18} className="text-[#94A3B8]" />
        </button>

        {isExchangeOpen && (
          <div className="absolute top-16 right-0 left-0 bg-[#0F1523] border border-[#1E293B] rounded-2xl shadow-2xl p-2 z-50">
            {exchanges.map(ex => (
              <div
                key={ex.id}
                onClick={() => {
                  setSelectedExchange(ex.id);
                  setIsExchangeOpen(false);
                }}
                className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                  selectedExchange === ex.id
                    ? 'bg-[#161F33] text-white border border-blue-500/30'
                    : 'hover:bg-[#141C2E] text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ex.flag}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white">{ex.name}</span>
                    <span className="text-[10px] text-[#64748B]">{ex.subtitle}</span>
                  </div>
                </div>
                {selectedExchange === ex.id && <Check size={16} className="text-[#2962FF]" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
