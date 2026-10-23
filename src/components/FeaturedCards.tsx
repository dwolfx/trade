import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { FeaturedTab, StockAsset } from '../types/market';
import { Star, TrendingUp, TrendingDown, ArrowUpRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const FeaturedCards: React.FC = () => {
  const {
    featuredTab,
    setFeaturedTab,
    assets,
    activeAsset,
    setActiveAsset,
    toggleFavorite,
    portfolio,
    recentSymbols,
    favoriteSymbols,
    prefetchAsset
  } = useMarket();

  const [startIndex, setStartIndex] = useState<number>(0);
  const VISIBLE_COUNT = 4;

  // Reset carousel position when switching tabs
  const handleTabChange = (tabId: FeaturedTab) => {
    setFeaturedTab(tabId);
    setStartIndex(0);
  };

  // Get full list of assets for the active tab
  const getAllTabAssets = (): StockAsset[] => {
    switch (featuredTab) {
      case 'portfolio': {
        const portfolioSymbols = portfolio.map(p => p.symbol);
        return assets.filter(a => portfolioSymbols.includes(a.symbol));
      }
      case 'recent': {
        const recents: StockAsset[] = [];
        for (const sym of recentSymbols) {
          const match = assets.find(a => a.symbol === sym);
          if (match && !recents.some(r => r.symbol === sym)) {
            recents.push(match);
          } else if (!match) {
            recents.push({
              symbol: sym,
              name: sym,
              exchange: 'B3',
              price: 10.0,
              changePercent: 0,
              changeValue: 0,
              volume: 'R$ 0M',
              high: 10.0,
              low: 10.0,
              open: 10.0,
              previousClose: 10.0,
              category: sym.endsWith('11') ? 'fiis' : 'acoes',
            });
          }
        }
        return recents;
      }
      case 'favorites': {
        return favoriteSymbols.map(sym => {
          const match = assets.find(a => a.symbol === sym);
          if (match) return match;
          return {
            symbol: sym,
            name: sym,
            exchange: 'B3',
            price: 10.0,
            changePercent: 0,
            changeValue: 0,
            volume: 'R$ 0M',
            high: 10.0,
            low: 10.0,
            open: 10.0,
            previousClose: 10.0,
            category: sym.endsWith('11') ? 'fiis' : 'acoes',
            isFavorite: true,
          };
        });
      }
      case 'most_traded':
      default:
        return [...assets].sort((a, b) => (b.tradesCount || 0) - (a.tradesCount || 0));
    }
  };

  const allAssets = getAllTabAssets();
  const totalCount = allAssets.length;
  const maxStartIndex = Math.max(0, totalCount - VISIBLE_COUNT);
  const effectiveStartIndex = Math.min(startIndex, maxStartIndex);

  const displayedAssets = allAssets.slice(effectiveStartIndex, effectiveStartIndex + VISIBLE_COUNT);

  // Lazy Preload: Visible cards + Next lookahead card (buffer de 1 item à frente)
  useEffect(() => {
    if (!prefetchAsset || allAssets.length === 0) return;

    // 1. Preload any currently visible card if missing quote data
    displayedAssets.forEach(a => {
      prefetchAsset(a.symbol);
    });

    // 2. Lookahead buffer: quando exibe 4, o 5º já é carregado; ao avançar para o 5º, carrega o 6º, etc.
    const lookaheadIndex = effectiveStartIndex + VISIBLE_COUNT;
    if (lookaheadIndex < allAssets.length) {
      const nextInLine = allAssets[lookaheadIndex];
      if (nextInLine) {
        prefetchAsset(nextInLine.symbol);
      }
    }
  }, [effectiveStartIndex, featuredTab, allAssets.length, prefetchAsset]);

  const handlePrev = () => {
    setStartIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex(prev => Math.min(maxStartIndex, prev + 1));
  };

  const tabs: { id: FeaturedTab; label: string; icon: string }[] = [
    { id: 'recent', label: 'Últimas pesquisadas', icon: '🕒' },
    { id: 'most_traded', label: 'Mais negociadas', icon: '🔥' },
    { id: 'favorites', label: 'Favoritos', icon: '⭐' },
    { id: 'portfolio', label: 'Minha carteira', icon: '💼' },
  ];

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header and Filter Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            Principais Ofertas em Destaque
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#161F33] text-[#94A3B8] font-normal">
              B3
            </span>
          </h2>

          {/* Carousel Position Indicator */}
          {totalCount > VISIBLE_COUNT && (
            <span
              data-testid="carousel-indicator"
              className="text-xs font-mono font-medium text-[#64748B] bg-[#0F1523] px-2.5 py-0.5 rounded-lg border border-[#1E293B]"
            >
              {effectiveStartIndex + 1}-{Math.min(effectiveStartIndex + VISIBLE_COUNT, totalCount)} de {totalCount}
            </span>
          )}
        </div>

        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Segmented Control (4 Opções) */}
          <div className="flex items-center bg-[#0F1523] border border-[#1E293B] p-1 rounded-xl w-max sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  featuredTab === tab.id
                    ? 'bg-[#1E293B] text-white shadow-sm border border-blue-500/20'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#141C2E]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid Carousel OR Clean Empty State */}
      {displayedAssets.length > 0 ? (
        <div className="relative w-full group/carousel">
          {/* Carousel Side Left Arrow */}
          {totalCount > VISIBLE_COUNT && (
            <button
              onClick={handlePrev}
              disabled={effectiveStartIndex === 0}
              aria-label="Card anterior"
              title="Ver anterior"
              className={`absolute -left-3 sm:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0F1523]/95 backdrop-blur-md border border-[#1E293B] text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:bg-[#1E293B] hover:border-blue-500/60 hover:scale-110 active:scale-95 ${
                effectiveStartIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 transition-all duration-300">
          {displayedAssets.map(asset => {
            const isActive = asset.symbol === activeAsset.symbol;
            const isPositive = asset.changePercent >= 0;
            const isFav = favoriteSymbols.includes(asset.symbol);

            return (
              <div
                key={asset.symbol}
                onClick={() => setActiveAsset(asset)}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#141C2E] border-[#2962FF] ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
                    : 'bg-[#0F1523] border-[#1E293B] hover:border-[#334155] hover:bg-[#121A2B]'
                }`}
              >
                {/* Card Header: Ticker & Star */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg font-black tracking-tight text-white font-mono group-hover:text-[#60A5FA] transition-colors">
                        {asset.symbol}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#38BDF8] animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-[#94A3B8] block truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[150px]">
                      {asset.name}
                    </span>
                  </div>

                  {/* Favorite Star Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(asset.symbol);
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isFav
                        ? 'text-[#F59E0B] bg-amber-500/10 hover:bg-amber-500/20'
                        : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E293B]'
                    }`}
                    title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Star size={15} fill={isFav ? '#F59E0B' : 'none'} />
                  </button>
                </div>

                {/* Price & Change Pill */}
                <div className="my-2 sm:my-3 flex flex-col xs:flex-row xs:items-baseline justify-between gap-1">
                  <span className="text-base sm:text-2xl font-bold font-mono tracking-tight text-white whitespace-nowrap">
                    R$ {asset.price.toFixed(2)}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg self-start xs:self-auto ${
                      isPositive
                        ? 'bg-sky-500/10 text-[#38BDF8] border border-sky-500/20'
                        : 'bg-rose-500/10 text-[#F43F5E] border border-rose-500/20'
                    }`}
                  >
                    {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {isPositive ? `+${asset.changePercent.toFixed(2)}%` : `${asset.changePercent.toFixed(2)}%`}
                  </span>
                </div>

                {/* Footer info & Action Button */}
                <div className="pt-2 border-t border-[#1E293B]/70 flex items-center justify-between text-[10px] sm:text-[11px] gap-1">
                  <span className="text-[#64748B] truncate max-w-[70px] sm:max-w-[140px]">
                    Vol {asset.volume}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAsset(asset);
                    }}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-semibold flex items-center gap-1 transition-all text-[10px] sm:text-xs shrink-0 ${
                      isActive
                        ? 'bg-[#2962FF] text-white shadow-sm'
                        : 'bg-[#161F33] text-[#94A3B8] group-hover:text-white group-hover:bg-[#1E293B]'
                    }`}
                  >
                    <span>{isActive ? 'No Gráfico' : 'Ver'}</span>
                    <ArrowUpRight size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Side Right Arrow */}
        {totalCount > VISIBLE_COUNT && (
          <button
            onClick={handleNext}
            disabled={effectiveStartIndex >= maxStartIndex}
            aria-label="Próximo card"
            title="Carregar e ver próximo"
            className={`absolute -right-3 sm:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0F1523]/95 backdrop-blur-md border border-[#1E293B] text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:bg-[#1E293B] hover:border-blue-500/60 hover:scale-110 active:scale-95 ${
              effectiveStartIndex >= maxStartIndex
                ? 'opacity-0 pointer-events-none'
                : 'opacity-90 hover:opacity-100'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      ) : (
        /* Clean Empty State */
        <div className="p-8 bg-[#0F1523] border border-[#1E293B] rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#141C2E] flex items-center justify-center text-[#64748B] mb-3">
            {featuredTab === 'recent' && <Search size={22} />}
            {featuredTab === 'favorites' && <Star size={22} />}
            {featuredTab === 'portfolio' && <span className="text-xl">💼</span>}
            {featuredTab === 'most_traded' && <span className="text-xl">🔥</span>}
          </div>
          <h4 className="text-sm font-bold text-white mb-1">
            {featuredTab === 'recent' && 'Nenhuma pesquisa recente'}
            {featuredTab === 'favorites' && 'Nenhum favorito selecionado'}
            {featuredTab === 'portfolio' && 'Nenhum ativo na carteira'}
            {featuredTab === 'most_traded' && 'Nenhum ativo disponível'}
          </h4>
          <p className="text-xs text-[#94A3B8] max-w-sm">
            {featuredTab === 'recent' && 'Os ativos que você pesquisar na barra de busca acima aparecerão aqui automaticamente.'}
            {featuredTab === 'favorites' && 'Clique na estrelinha (⭐) de qualquer ativo no gráfico ou na tabela para adicioná-lo aos seus favoritos.'}
            {featuredTab === 'portfolio' && 'Compre ações pela boleta ao lado para acompanhar seus ativos em custódia aqui.'}
            {featuredTab === 'most_traded' && 'Carregando destaques do pregão.'}
          </p>
        </div>
      )}
    </div>
  );
};
