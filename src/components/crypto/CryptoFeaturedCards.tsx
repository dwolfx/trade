import React, { useState } from 'react';
import { CryptoAsset, CryptoQuoteCurrency } from '../../types/crypto';
import { formatBRL } from '../../utils/formatters';
import { AssetCard } from '../common/AssetCard';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export type CryptoFeaturedTab = 'top' | 'most_traded' | 'gainers' | 'favorites';

interface CryptoFeaturedCardsProps {
  assets: CryptoAsset[];
  activeAsset: CryptoAsset;
  onSelectAsset: (asset: CryptoAsset) => void;
  quoteCurrency: CryptoQuoteCurrency;
}

export const CryptoFeaturedCards: React.FC<CryptoFeaturedCardsProps> = ({
  assets,
  activeAsset,
  onSelectAsset,
  quoteCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<CryptoFeaturedTab>('top');
  const [startIndex, setStartIndex] = useState<number>(0);
  const [favoriteCryptos, setFavoriteCryptos] = useLocalStorage<string[]>(
    'tradecraft_crypto_favorites',
    ['BTC', 'ETH', 'SOL', 'USDT']
  );

  const VISIBLE_COUNT = 4;

  const toggleFavorite = (baseAsset: string) => {
    setFavoriteCryptos(prev =>
      prev.includes(baseAsset)
        ? prev.filter(s => s !== baseAsset)
        : [...prev, baseAsset]
    );
  };

  const handleTabChange = (tabId: CryptoFeaturedTab) => {
    setActiveTab(tabId);
    setStartIndex(0);
  };

  const formatPrice = (price: number) => {
    if (quoteCurrency === 'BRL') {
      return formatBRL(price);
    }
    return `$ ${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCryptoIcon = (base: string) => {
    switch (base) {
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'SOL': return '◎';
      case 'USDT': return '₮';
      case 'BNB': return '🔶';
      case 'ADA': return '₳';
      default: return '🪙';
    }
  };

  // Filter assets by selected tab
  const getTabAssets = (): CryptoAsset[] => {
    switch (activeTab) {
      case 'gainers':
        return [...assets].sort((a, b) => b.changePercent24h - a.changePercent24h);
      case 'most_traded':
        return [...assets].sort((a, b) => b.quoteVolume24h - a.quoteVolume24h);
      case 'favorites':
        return assets.filter(a => favoriteCryptos.includes(a.baseAsset));
      case 'top':
      default: {
        const topSymbols = ['BTC', 'ETH', 'SOL', 'USDT', 'BNB', 'ADA', 'XRP', 'AVAX'];
        const topList = topSymbols
          .map(sym => assets.find(a => a.baseAsset === sym))
          .filter((a): a is CryptoAsset => !!a);
        return topList.length > 0 ? topList : assets.slice(0, 8);
      }
    }
  };

  const allAssets = getTabAssets();
  const totalCount = allAssets.length;
  const maxStartIndex = Math.max(0, totalCount - VISIBLE_COUNT);
  const effectiveStartIndex = Math.min(startIndex, maxStartIndex);

  const displayedAssets = allAssets.slice(
    effectiveStartIndex,
    effectiveStartIndex + VISIBLE_COUNT
  );

  const handlePrev = () => {
    setStartIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex(prev => Math.min(maxStartIndex, prev + 1));
  };

  const tabs: { id: CryptoFeaturedTab; label: string; icon: string }[] = [
    { id: 'top', label: 'Principais Moedas', icon: '💎' },
    { id: 'most_traded', label: 'Mais negociadas', icon: '🔥' },
    { id: 'gainers', label: 'Maiores altas', icon: '📈' },
    { id: 'favorites', label: 'Favoritos', icon: '⭐' },
  ];

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Header and Filter Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            Principais Criptoativos em Destaque
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#161F33] text-[#94A3B8] font-normal">
              Binance Spot
            </span>
          </h2>

          {/* Carousel Position Indicator */}
          {totalCount > VISIBLE_COUNT && (
            <span
              data-testid="crypto-carousel-indicator"
              className="text-xs font-mono font-medium text-[#64748B] bg-[#0F1523] px-2.5 py-0.5 rounded-lg border border-[#1E293B]"
            >
              {effectiveStartIndex + 1}-{Math.min(effectiveStartIndex + VISIBLE_COUNT, totalCount)} de {totalCount}
            </span>
          )}
        </div>

        {/* 4 Tabs Segmented Control */}
        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-[#0F1523] border border-[#1E293B] p-1 rounded-xl w-max sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
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

      {/* Cards Grid Carousel OR Empty State */}
      {displayedAssets.length > 0 ? (
        <div className="relative w-full group/carousel">
          {/* Carousel Side Left Arrow */}
          {totalCount > VISIBLE_COUNT && (
            <button
              type="button"
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
              const isFav = favoriteCryptos.includes(asset.baseAsset);

              return (
                <AssetCard
                  key={asset.symbol}
                  symbol={asset.baseAsset}
                  name={asset.name}
                  priceFormatted={formatPrice(asset.price)}
                  changePercent={asset.changePercent24h}
                  changePercentFormatted={`${asset.changePercent24h >= 0 ? '+' : ''}${asset.changePercent24h.toFixed(2)}%`}
                  volumeFormatted={`Vol ${(asset.quoteVolume24h / 1e6).toFixed(1)}M`}
                  icon={
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                        asset.baseAsset === 'BTC'
                          ? 'bg-amber-500/20 text-[#F59E0B] border border-amber-500/30'
                          : asset.baseAsset === 'ETH'
                          ? 'bg-indigo-500/20 text-[#818CF8] border border-indigo-500/30'
                          : asset.baseAsset === 'SOL'
                          ? 'bg-sky-500/20 text-[#38BDF8] border border-sky-500/30'
                          : 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                      }`}
                    >
                      {getCryptoIcon(asset.baseAsset)}
                    </div>
                  }
                  badgeSubtitle={`/${quoteCurrency}`}
                  isActive={isActive}
                  isFavorite={isFav}
                  onToggleFavorite={() => toggleFavorite(asset.baseAsset)}
                  onClick={() => onSelectAsset(asset)}
                  actionLabel={isActive ? 'No Gráfico' : 'Operar'}
                />
              );
            })}
          </div>

          {/* Carousel Side Right Arrow */}
          {totalCount > VISIBLE_COUNT && (
            <button
              type="button"
              onClick={handleNext}
              disabled={effectiveStartIndex >= maxStartIndex}
              aria-label="Próximo card"
              title="Ver próximo"
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
        <EmptyState
          icon={Star}
          title="Nenhum favorito selecionado"
          description="Clique na estrela dos cards para fixar suas criptomoedas favoritas aqui."
        />
      )}
    </div>
  );
};
