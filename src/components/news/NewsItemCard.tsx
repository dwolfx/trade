import React, { useState } from 'react';
import { NewsItem, NewsSource } from '../../types/news';
import { InteractiveTickerText } from './InteractiveTickerText';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Clock, Share2, Check, Zap, Sparkles } from 'lucide-react';

interface NewsItemCardProps {
  item: NewsItem;
  portfolioSymbols: string[];
  favoriteSymbols: string[];
  onOpenOrder: (symbol: string) => void;
  onReadNews: (item: NewsItem) => void;
}

const SOURCE_COLORS: Record<NewsSource, { bg: string; text: string; border: string }> = {
  'CVM / B3': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Brazil Journal': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  'InfoMoney': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  'Valor PRO': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Reuters': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  'CryptoPanic': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};

export const NewsItemCard: React.FC<NewsItemCardProps> = ({
  item,
  portfolioSymbols,
  favoriteSymbols,
  onOpenOrder,
  onReadNews,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const sourceStyle = SOURCE_COLORS[item.source] || SOURCE_COLORS['InfoMoney'];

  const portfolioSet = React.useMemo(
    () => new Set(portfolioSymbols.map((s) => s.toUpperCase())),
    [portfolioSymbols]
  );
  const favoritesSet = React.useMemo(
    () => new Set(favoriteSymbols.map((s) => s.toUpperCase())),
    [favoriteSymbols]
  );

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${item.title} - TradeCraft News`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      onClick={() => onReadNews(item)}
      className="group p-4 bg-[#0F1523] border border-[#1E293B] hover:border-blue-500/40 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative shadow-sm hover:shadow-xl hover:shadow-black/20 overflow-hidden"
    >
      <div>
        {/* Card Photo Banner with Lazy Loading & Skeleton */}
        {item.imageUrl ? (
          <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-[#1E293B]">
            {/* Shimmer Placeholder while image is loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#141C2E] animate-pulse flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            <img
              src={item.imageUrl}
              alt={item.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1523] via-[#0F1523]/30 to-black/40 pointer-events-none" />

            {/* Badges on Top-Left of Image */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
              <span
                className={`px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider text-[10px] backdrop-blur-md border ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}
              >
                {item.source}
              </span>

              {item.sentiment === 'bullish' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold backdrop-blur-md">
                  <TrendingUp size={11} /> Otimista
                </span>
              )}
              {item.sentiment === 'bearish' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-400 border border-rose-500/30 text-[10px] font-semibold backdrop-blur-md">
                  <TrendingDown size={11} /> Baixista
                </span>
              )}
              {item.sentiment === 'neutral' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700 text-[10px] font-medium backdrop-blur-md">
                  <Minus size={11} /> Neutro
                </span>
              )}

              {item.isBreaking && (
                <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-md">
                  URGENTE
                </span>
              )}
            </div>

            {/* Time on Top-Right of Image */}
            <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-mono text-slate-200 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md z-10">
              <Clock size={11} />
              {item.publishedAt}
            </span>
          </div>
        ) : (
          /* Header when without image */
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-md font-semibold uppercase tracking-wider text-[10px] border ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}
              >
                {item.source}
              </span>

              {item.sentiment === 'bullish' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  <TrendingUp size={11} /> Otimista
                </span>
              )}
              {item.sentiment === 'bearish' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                  <TrendingDown size={11} /> Baixista
                </span>
              )}
              {item.sentiment === 'neutral' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-300 border border-slate-500/20 text-[10px] font-medium">
                  <Minus size={11} /> Fato Neutro
                </span>
              )}

              {item.isBreaking && (
                <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  URGENTE
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B]">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {item.publishedAt}
              </span>
            </div>
          </div>
        )}

        {/* Title with Interactive Clickable Tickers */}
        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#60A5FA] transition-colors leading-snug mb-2 line-clamp-2">
          <InteractiveTickerText text={item.title} onSelectTicker={onOpenOrder} />
        </h3>

        {/* Snippet */}
        <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3 mb-3">
          <InteractiveTickerText text={item.summary} onSelectTicker={onOpenOrder} />
        </p>

        {/* Quick AI Resumo Badge */}
        {item.aiSummary && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#60A5FA] bg-blue-600/10 border border-blue-500/20 px-2.5 py-1 rounded-lg w-fit mb-3">
            <Sparkles size={11} className="text-amber-400 shrink-0" />
            <span className="font-medium truncate max-w-[240px] sm:max-w-xs">
              Resumo executivo pronto (TL;DR)
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Ticker tags & Actions (Stops propagation to card modal) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-2 pt-3 border-t border-[#1E293B]/70 mt-auto"
      >
        {/* Tickers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.relatedTickers.map((ticker) => {
            const isPortfolio = portfolioSet.has(ticker.toUpperCase());
            const isFavorite = favoritesSet.has(ticker.toUpperCase());

            return (
              <button
                key={ticker}
                type="button"
                onClick={() => onOpenOrder(ticker)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  isPortfolio
                    ? 'bg-blue-600/20 text-[#60A5FA] border border-blue-500/40 hover:bg-blue-600 hover:text-white'
                    : isFavorite
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    : 'bg-[#161F33] text-[#CBD5E1] border border-[#1E293B] hover:border-slate-500'
                }`}
                title={`Abrir boleta de ${ticker}`}
              >
                <Zap size={11} className={isPortfolio ? 'text-blue-400' : 'text-slate-400'} />
                {ticker}
                {isPortfolio && <span className="text-[9px] px-1 bg-blue-500/30 rounded font-sans">Carteira</span>}
              </button>
            );
          })}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-[#64748B]">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:text-white hover:bg-[#1E293B] transition-colors"
            title="Copiar manchete"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </button>
          <button
            type="button"
            onClick={() => onReadNews(item)}
            className="flex items-center gap-1 text-xs font-medium text-[#60A5FA] hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-600/10 transition-colors"
          >
            Ler resumo
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </article>
  );
};
