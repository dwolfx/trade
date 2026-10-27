import React from 'react';
import { NewsItem } from '../../types/news';
import { StockAsset } from '../../types/market';
import { InteractiveTickerText } from './InteractiveTickerText';
import { Radar, ExternalLink, TrendingUp, TrendingDown, ArrowUpRight, Zap, Sparkles } from 'lucide-react';
import { formatPercent, formatBRL } from '../../utils/formatters';

interface WatchlistNewsRadarProps {
  news: NewsItem[];
  portfolioSymbols: string[];
  favoriteSymbols: string[];
  assets: StockAsset[];
  onSelectTicker: (symbol: string) => void;
  onOpenOrder?: (symbol: string) => void;
  onReadNews?: (news: NewsItem) => void;
}

export const WatchlistNewsRadar: React.FC<WatchlistNewsRadarProps> = ({
  news,
  portfolioSymbols,
  favoriteSymbols,
  assets,
  onSelectTicker,
  onOpenOrder,
  onReadNews,
}) => {
  const handleOpenOrder = onOpenOrder || onSelectTicker;
  // Normalize symbols for robust matching
  const portfolioSet = new Set(portfolioSymbols.map((s) => s.toUpperCase()));
  const favoritesSet = new Set(favoriteSymbols.map((s) => s.toUpperCase()));

  // Filter news that mentions portfolio or favorite tokens
  const relevantNews = news.filter((item) =>
    item.relatedTickers.some(
      (ticker) => portfolioSet.has(ticker.toUpperCase()) || favoritesSet.has(ticker.toUpperCase())
    )
  );

  // If no specific news for watched assets, fallback to top breaking news
  const isFallback = relevantNews.length === 0;
  const displayItems = isFallback ? news.slice(0, 3) : relevantNews.slice(0, 4);

  const getAssetData = (symbol: string): StockAsset | undefined => {
    return assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#121B2F] via-[#0F172A] to-[#0B0F19] border border-blue-500/20 p-5 shadow-2xl shadow-blue-950/30">
      {/* Background Glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header of the Radar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 text-[#60A5FA] border border-blue-500/30 shadow-inner">
            <Radar size={20} className="animate-spin text-[#60A5FA]" style={{ animationDuration: '8s' }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-400 rounded-full ring-2 ring-[#0B0F19] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Radar da Minha Carteira & Favoritos
                <Sparkles size={16} className="text-amber-400" />
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-sky-500/20 text-[#38BDF8] border border-sky-500/30">
                Alta Prioridade
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {isFallback
                ? 'Sem comunicados urgentes para sua carteira hoje. Mostrando principais destaques do mercado:'
                : `Monitorando ${portfolioSet.size + favoritesSet.size} ativos da sua carteira e favoritos com impacto em tempo real:`}
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[11px] text-[#CBD5E1]">
            {relevantNews.length} {relevantNews.length === 1 ? 'notícia direta' : 'notícias diretas'}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {displayItems.map((item) => {
          // Identify primary watched ticker
          const watchedTicker = item.relatedTickers.find(
            (t) => portfolioSet.has(t.toUpperCase()) || favoritesSet.has(t.toUpperCase())
          ) || item.relatedTickers[0];

          const isPortfolio = watchedTicker && portfolioSet.has(watchedTicker.toUpperCase());
          const isFavorite = watchedTicker && favoritesSet.has(watchedTicker.toUpperCase());
          const asset = watchedTicker ? getAssetData(watchedTicker) : undefined;

          return (
            <div
              key={item.id}
              onClick={() => onReadNews?.(item)}
              className="group relative flex flex-col justify-between p-4 rounded-xl bg-[#0D1424]/90 border border-[#1E293B] hover:border-blue-500/50 hover:bg-[#111B30] transition-all duration-200 shadow-md cursor-pointer overflow-hidden"
            >
              <div>
                {/* Photo Banner on Radar Card (if available) */}
                {item.imageUrl && (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden mb-3 bg-slate-900 border border-[#1E293B]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-transparent to-black/30" />

                    {/* Badge over photo */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                      {isPortfolio && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-blue-600/90 text-white backdrop-blur-md shadow-sm border border-blue-400/40">
                          💼 Na Carteira
                        </span>
                      )}
                      {isFavorite && !isPortfolio && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-amber-500/90 text-black backdrop-blur-md font-extrabold shadow-sm">
                          ⭐ Favorito
                        </span>
                      )}
                      {isFallback && !isPortfolio && !isFavorite && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-purple-600/90 text-white backdrop-blur-md">
                          🔥 Destaque B3
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-slate-300 backdrop-blur-md">
                      {item.source}
                    </span>
                  </div>
                )}

                {/* Badges Bar (when no image) */}
                {!item.imageUrl && (
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isPortfolio && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                          💼 Na Carteira
                        </span>
                      )}
                      {isFavorite && !isPortfolio && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⭐ Favorito
                        </span>
                      )}
                      {isFallback && !isPortfolio && !isFavorite && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          🔥 Destaque B3
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#94A3B8] bg-[#161F33] border border-[#1E293B]">
                        {item.source}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-[#64748B] whitespace-nowrap">
                      {item.publishedAt}
                    </span>
                  </div>
                )}

                {/* Ticker & Quote Strip (if asset available) */}
                {watchedTicker && (
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1E293B]/70">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenOrder(watchedTicker);
                      }}
                      className="flex items-center gap-1.5 group/btn hover:opacity-90"
                      title={`Abrir boleta rápida para ${watchedTicker}`}
                    >
                      <span className="font-mono font-bold text-xs text-[#60A5FA] bg-[#16223A] px-2 py-0.5 rounded border border-blue-500/30 group-hover/btn:border-blue-400 transition-colors">
                        ${watchedTicker}
                      </span>
                      {asset && (
                        <span className="text-xs font-mono font-semibold text-white">
                          {formatBRL(asset.price)}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {item.imageUrl && (
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {item.publishedAt}
                        </span>
                      )}
                      {asset && (
                        <span
                          className={`text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                            asset.changePercent >= 0 ? 'text-[#38BDF8]' : 'text-[#EF4444]'
                          }`}
                        >
                          {asset.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {formatPercent(asset.changePercent)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Headline */}
                <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#60A5FA] transition-colors line-clamp-2 leading-snug mb-1.5">
                  <InteractiveTickerText text={item.title} onSelectTicker={handleOpenOrder} />
                </h3>

                {/* Snippet */}
                <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed mb-3">
                  <InteractiveTickerText text={item.summary} onSelectTicker={handleOpenOrder} />
                </p>
              </div>

              {/* Action Buttons (Last Row - Stop propagation on container) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between pt-2 border-t border-[#1E293B]/60 mt-auto"
              >
                <button
                  type="button"
                  onClick={() => onReadNews?.(item)}
                  className="text-[11px] font-medium text-[#94A3B8] hover:text-white flex items-center gap-1 transition-colors"
                >
                  Ver Resumo (TL;DR)
                  <ExternalLink size={11} />
                </button>

                {watchedTicker && (
                  <button
                    type="button"
                    onClick={() => handleOpenOrder(watchedTicker)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 text-[#60A5FA] hover:bg-blue-600 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-all shadow-sm"
                  >
                    <Zap size={11} className="text-amber-400" />
                    Operar {watchedTicker}
                    <ArrowUpRight size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-4 rounded-xl bg-[#0D1424]/90 border border-[#1E293B] animate-pulse h-44 flex flex-col justify-between"
            >
              <div>
                <div className="h-4 bg-[#16223A] rounded w-1/3 mb-3" />
                <div className="h-4 bg-[#16223A] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#16223A] rounded w-full mb-1" />
                <div className="h-3 bg-[#16223A] rounded w-2/3" />
              </div>
              <div className="h-4 bg-[#16223A] rounded w-1/4" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
