import React, { useState, useEffect } from 'react';
import { NewsItem } from '../../types/news';
import { Flame, ChevronLeft, ChevronRight, Clock, Zap, ExternalLink } from 'lucide-react';

interface BreakingNewsTickerProps {
  news: NewsItem[];
  onReadNews: (item: NewsItem) => void;
  onOpenOrder: (symbol: string) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  news,
  onReadNews,
  onOpenOrder,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Take the top 8 newest breaking items for cycling
  const tickerItems = React.useMemo(() => {
    return news.slice(0, 8);
  }, [news]);

  useEffect(() => {
    if (tickerItems.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 5000); // Cycle every 5 seconds

    return () => clearInterval(interval);
  }, [tickerItems.length, isPaused]);

  if (tickerItems.length === 0) return null;

  const currentItem = tickerItems[currentIndex] || tickerItems[0];
  const primaryTicker = currentItem.relatedTickers[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? tickerItems.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onReadNews(currentItem)}
      className="group relative flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-950/40 via-[#0F1523] to-[#161F33] border border-red-500/30 hover:border-red-500/60 shadow-lg shadow-red-950/20 cursor-pointer transition-all duration-300"
    >
      {/* Left: Plantão Badge & Rotating Headline */}
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        {/* Animated Plantão Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-md">
          <Flame size={13} className="text-amber-300 animate-pulse" />
          <span>PLANTÃO B3</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5" />
        </div>

        {/* Source badge */}
        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#161F33] text-[#60A5FA] border border-blue-500/20 shrink-0">
          {currentItem.source}
        </span>

        {/* Headline with fade transition key */}
        <div key={currentItem.id} className="flex items-center gap-2 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#60A5FA] truncate transition-colors">
            {currentItem.title}
          </p>
        </div>
      </div>

      {/* Right Controls: Ticker Pill + Time + Prev/Next buttons */}
      <div className="flex items-center gap-2 shrink-0 text-xs">
        {/* Primary Ticker quick action */}
        {primaryTicker && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenOrder(primaryTicker);
            }}
            className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/20 text-[#60A5FA] hover:bg-blue-600 hover:text-white border border-blue-500/30 font-mono font-bold text-[11px] transition-all"
            title={`Abrir boleta de ${primaryTicker}`}
          >
            <Zap size={11} className="text-amber-400" />
            ${primaryTicker}
          </button>
        )}

        {/* Time Ago */}
        <span className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-[#64748B]">
          <Clock size={11} />
          {currentItem.publishedAt}
        </span>

        {/* Pagination Indicator (e.g. 1/8) */}
        <span className="text-[10px] font-mono text-[#94A3B8] px-1.5">
          {currentIndex + 1}/{tickerItems.length}
        </span>

        {/* Manual Arrow Buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
            title="Notícia anterior"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
            title="Próxima notícia"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <ExternalLink size={12} className="text-[#64748B] group-hover:text-[#60A5FA] transition-colors ml-1" />
      </div>
    </div>
  );
};
