import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useMarket } from '../../context/MarketContext';
import { INITIAL_NEWS } from '../../data/mockNews';
import { NewsCategory, NewsItem, NewsSource } from '../../types/news';
import { WatchlistNewsRadar } from './WatchlistNewsRadar';
import { NewsItemCard } from './NewsItemCard';
import { NewsReaderModal } from './NewsReaderModal';
import { OrderModal } from '../order/OrderModal';
import { ActiveNav } from '../../types/market';
import { Search, Filter, Newspaper, RefreshCw, X, Loader2, ChevronDown, CheckCheck, Radio } from 'lucide-react';
import { fetchLiveNews } from '../../services/newsService';

interface NewsPageProps {
  onNavigate: (nav: ActiveNav) => void;
}

const PAGE_SIZE = 6;

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate }) => {
  const { portfolio, favoriteSymbols, assets, selectOrCreateAsset } = useMarket();

  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_NEWS);
  const [isLive, setIsLive] = useState(false);
  const [totalLive, setTotalLive] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('todas');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingNews, setReadingNews] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalSymbol, setOrderModalSymbol] = useState<string>('PETR4');

  // Load real live news on mount
  useEffect(() => {
    let isMounted = true;
    fetchLiveNews().then((result) => {
      if (isMounted) {
        if (result.news.length > 0) {
          setNewsList(result.news);
        }
        setIsLive(result.isLive);
        setTotalLive(result.totalLive);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Lazy loading / Pagination states
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Extract symbols from portfolio and favorites
  const portfolioSymbols = useMemo(() => portfolio.map((p) => p.symbol), [portfolio]);

  const handleSelectTicker = (symbol: string) => {
    selectOrCreateAsset(symbol);
    onNavigate('bolsa');
  };

  const handleOpenOrder = async (symbol: string) => {
    await selectOrCreateAsset(symbol);
    setOrderModalSymbol(symbol);
    setIsOrderModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveNews();
      if (result.news.length > 0) {
        setNewsList(result.news);
      }
      setIsLive(result.isLive);
      setTotalLive(result.totalLive);
      setVisibleCount(PAGE_SIZE);
    } catch {
      // Fallback stays in place
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter news according to active filters
  const filteredNews = useMemo(() => {
    const portfolioSet = new Set(portfolioSymbols.map((s) => s.toUpperCase()));
    const favoritesSet = new Set(favoriteSymbols.map((s) => s.toUpperCase()));
    const query = searchQuery.trim().toLowerCase();

    return newsList.filter((item) => {
      // Category filter
      if (selectedCategory === 'carteira') {
        const matchesWatched = item.relatedTickers.some(
          (t) => portfolioSet.has(t.toUpperCase()) || favoritesSet.has(t.toUpperCase())
        );
        if (!matchesWatched) return false;
      } else if (selectedCategory !== 'todas' && item.category !== selectedCategory) {
        return false;
      }

      // Source filter
      if (selectedSource !== 'all' && item.source !== selectedSource) {
        return false;
      }

      // Search query filter (search in title, summary, source, or tickers)
      if (query) {
        const inTitle = item.title.toLowerCase().includes(query);
        const inSummary = item.summary.toLowerCase().includes(query);
        const inSource = item.source.toLowerCase().includes(query);
        const inTickers = item.relatedTickers.some((t) => t.toLowerCase().includes(query));

        if (!inTitle && !inSummary && !inSource && !inTickers) {
          return false;
        }
      }

      return true;
    });
  }, [newsList, selectedCategory, selectedSource, searchQuery, portfolioSymbols, favoriteSymbols]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, selectedSource, searchQuery]);

  // Progressive load more
  const loadMore = useCallback(() => {
    if (visibleCount >= filteredNews.length || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredNews.length));
      setIsLoadingMore(false);
    }, 400);
  }, [visibleCount, filteredNews.length, isLoadingMore]);

  // Auto lazy load when scrolling near bottom
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [loadMore]);

  const visibleNews = useMemo(
    () => filteredNews.slice(0, visibleCount),
    [filteredNews, visibleCount]
  );

  const hasMore = visibleCount < filteredNews.length;
  const remainingCount = filteredNews.length - visibleCount;
  const progressPercent = filteredNews.length > 0
    ? Math.min(100, Math.round((visibleNews.length / filteredNews.length) * 100))
    : 100;

  const categories: { id: NewsCategory; label: string }[] = [
    { id: 'todas', label: 'Todas as Notícias' },
    { id: 'carteira', label: 'Minha Carteira & Favoritos' },
    { id: 'cvm', label: 'Fatos Relevantes (CVM)' },
    { id: 'acoes', label: 'Mercado B3' },
    { id: 'macro', label: 'Macro & Commodities' },
    { id: 'cripto', label: 'Cripto 24/7' },
  ];

  const sources: NewsSource[] = [
    'CVM / B3',
    'Brazil Journal',
    'Valor PRO',
    'InfoMoney',
    'Reuters',
    'CryptoPanic',
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-sky-400/20 border border-blue-500/30 flex items-center justify-center text-[#60A5FA] shadow-lg shadow-blue-500/10">
            <Newspaper size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Terminal de Notícias & Fatos Relevantes
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
              </h1>
              {isLive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-[#38BDF8] border border-sky-500/30 shadow-sm animate-in fade-in">
                  <Radio size={12} className="animate-pulse" />
                  AO VIVO ({totalLive} matérias conectadas)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-500/15 text-slate-400 border border-slate-500/30">
                  Modo Cache Local
                </span>
              )}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Agregador institucional de baixa latência conectado a InfoMoney, G1 Economia, Brazil Journal e CoinDesk ({newsList.length} notícias disponíveis)
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] hover:border-slate-600 text-xs font-mono font-medium text-[#94A3B8] hover:text-white transition-all shadow-sm"
          title="Atualizar feed"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#60A5FA]' : ''} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Feed'}</span>
        </button>
      </div>

      {/* TOP RADAR: Watchlist & Portfolio Highlighted News */}
      <WatchlistNewsRadar
        news={newsList}
        portfolioSymbols={portfolioSymbols}
        favoriteSymbols={favoriteSymbols}
        assets={assets}
        onSelectTicker={handleSelectTicker}
        onOpenOrder={handleOpenOrder}
        onReadNews={(item) => setReadingNews(item)}
      />

      {/* Filter and Search Navigation Bar */}
      <div className="flex flex-col gap-3.5 bg-[#0F1523] p-4 rounded-2xl border border-[#1E293B]">
        {/* Row 1: Search & Source dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por notícia, empresa ou ticker (ex: PETR4, CVM, Copom)..."
              className="w-full bg-[#0B0F19] border border-[#1E293B] focus:border-[#2962FF] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#64748B] outline-none transition-colors font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Source Dropdown Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter size={14} className="text-[#64748B]" />
            <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline">Fonte:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-[#0B0F19] border border-[#1E293B] focus:border-[#2962FF] text-xs text-white rounded-xl px-3 py-2 outline-none font-mono cursor-pointer"
            >
              <option value="all">Todas as Fontes</option>
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2962FF] text-white shadow-lg shadow-blue-600/25 font-semibold'
                    : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-[#1E293B]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Results Count & Progress Bar */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between text-xs text-[#64748B] font-mono">
          <span>
            Exibindo <strong className="text-white">{visibleNews.length}</strong> de <strong className="text-white">{filteredNews.length}</strong> notícias ({progressPercent}%)
          </span>
          {selectedCategory !== 'todas' && (
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSelectedSource('all');
                setSearchQuery('');
              }}
              className="text-[#60A5FA] hover:underline"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        {/* Minimal Progress Line */}
        <div className="w-full bg-[#161F33] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-[#60A5FA] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* News Feed Stream - Multi-column Cards Grid */}
      {visibleNews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleNews.map((item) => (
              <NewsItemCard
                key={item.id}
                item={item}
                portfolioSymbols={portfolioSymbols}
                favoriteSymbols={favoriteSymbols}
                onOpenOrder={handleOpenOrder}
                onReadNews={(news) => setReadingNews(news)}
              />
            ))}
          </div>

          {/* Skeleton Loaders during lazy load */}
          {isLoadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="p-4 bg-[#0F1523] border border-[#1E293B] rounded-2xl animate-pulse flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-[#161F33] rounded-xl mb-3" />
                    <div className="h-4 bg-[#161F33] rounded w-3/4 mb-2" />
                    <div className="h-4 bg-[#161F33] rounded w-1/2 mb-3" />
                    <div className="h-3 bg-[#161F33] rounded w-full mb-1.5" />
                    <div className="h-3 bg-[#161F33] rounded w-5/6" />
                  </div>
                  <div className="pt-3 border-t border-[#1E293B] mt-4 flex justify-between">
                    <div className="h-6 w-16 bg-[#161F33] rounded" />
                    <div className="h-6 w-20 bg-[#161F33] rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sentinel & Load More trigger */}
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            {hasMore ? (
              <>
                <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] hover:border-blue-500/40 text-xs font-semibold text-white transition-all shadow-md hover:shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-[#60A5FA]" />
                      <span>Carregando mais notícias...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={15} className="text-[#60A5FA]" />
                      <span>Carregar mais notícias ({remainingCount} restantes)</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              filteredNews.length > PAGE_SIZE && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] py-2 px-4 rounded-xl bg-[#0F1523] border border-[#1E293B]">
                  <CheckCheck size={14} className="text-emerald-400" />
                  <span>Você chegou ao fim: todas as {filteredNews.length} notícias foram carregadas.</span>
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <div className="py-16 text-center bg-[#0F1523] border border-[#1E293B] rounded-2xl flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#161F33] flex items-center justify-center text-[#64748B]">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-white">Nenhuma notícia encontrada</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm">
            Tente buscar com outros termos ou altere os filtros de categoria e fonte.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todas');
              setSelectedSource('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-[#2962FF] text-white text-xs font-semibold shadow-md"
          >
            Ver todas as notícias
          </button>
        </div>
      )}

      {/* Reader Modal */}
      <NewsReaderModal
        item={readingNews}
        onClose={() => setReadingNews(null)}
        onOpenOrder={handleOpenOrder}
      />

      {/* Slide-over Drawer da Boleta Rápida B3 */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        symbol={orderModalSymbol}
      />
    </div>
  );
};
