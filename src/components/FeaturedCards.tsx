import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { FeaturedTab, StockAsset } from '../types/market';
import { ChevronLeft, ChevronRight, Search, Star, Briefcase, Flame } from 'lucide-react';
import { EmptyState } from './common/EmptyState';
import { AssetCard } from './common/AssetCard';

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
              <AssetCard
                key={asset.symbol}
                symbol={asset.symbol}
                name={asset.name}
                priceFormatted={`R$ ${asset.price.toFixed(2)}`}
                changePercent={asset.changePercent}
                changePercentFormatted={isPositive ? `+${asset.changePercent.toFixed(2)}%` : `${asset.changePercent.toFixed(2)}%`}
                volumeFormatted={`Vol ${asset.volume}`}
                isActive={isActive}
                isFavorite={isFav}
                onToggleFavorite={() => toggleFavorite(asset.symbol)}
                onClick={() => setActiveAsset(asset)}
                actionLabel={isActive ? 'No Gráfico' : 'Ver'}
              />
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
        /* Clean Componentized Empty State */
        <EmptyState
          icon={
            featuredTab === 'recent'
              ? Search
              : featuredTab === 'favorites'
              ? Star
              : featuredTab === 'portfolio'
              ? Briefcase
              : Flame
          }
          title={
            featuredTab === 'recent'
              ? 'Nenhuma pesquisa recente'
              : featuredTab === 'favorites'
              ? 'Nenhum favorito selecionado'
              : featuredTab === 'portfolio'
              ? 'Nenhum ativo na carteira'
              : 'Nenhum ativo disponível'
          }
          description={
            featuredTab === 'recent'
              ? 'Os ativos que você pesquisar na barra de busca acima aparecerão aqui automaticamente.'
              : featuredTab === 'favorites'
              ? 'Clique na estrelinha (⭐) de qualquer ativo no gráfico ou na tabela para adicioná-lo aos seus favoritos.'
              : featuredTab === 'portfolio'
              ? 'Compre ações pela boleta ao lado para acompanhar seus ativos em custódia aqui.'
              : 'Carregando destaques do pregão.'
          }
          className="py-10"
        />
      )}
    </div>
  );
};
