import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useMarket } from '../../context/MarketContext';
import { INITIAL_NEWS } from '../../data/mockNews';
import { NewsCategory, NewsItem, NewsSource, NewsTimeRange } from '../../types/news';
import { WatchlistNewsRadar } from './WatchlistNewsRadar';
import { BreakingNewsTicker } from './BreakingNewsTicker';
import { NewsItemCard } from './NewsItemCard';
import { NewsReaderModal } from './NewsReaderModal';
import { OrderModal } from '../order/OrderModal';
import { ActiveNav } from '../../types/market';
import { Search, Filter, RefreshCw, Loader2, ChevronDown, CheckCheck, Clock } from 'lucide-react';
import { fetchLiveNews, getCachedLiveNews } from '../../services/newsService';
import { PageHeader } from '../common/PageHeader';
import { SearchBar } from '../common/SearchBar';
import { EmptyState } from '../common/EmptyState';

interface NewsPageProps {
  onNavigate: (nav: ActiveNav) => void;
}

const PAGE_SIZE = 6;
const isTestEnv = Boolean((import.meta as unknown as { env?: { MODE?: string } })?.env?.MODE === 'test');

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate }) => {
  const { portfolio, favoriteSymbols, assets, selectOrCreateAsset } = useMarket();

  // Instant real news from cache, or fallback to INITIAL_NEWS ONLY in test runner
  const cachedNews = !isTestEnv ? getCachedLiveNews() : null;
  const hasCached = Array.isArray(cachedNews) && cachedNews.length > 0;

  const [newsList, setNewsList] = useState<NewsItem[]>(() => {
    if (hasCached) return cachedNews!;
    if (isTestEnv) return INITIAL_NEWS;
    return [];
  });
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(() => {
    if (hasCached || isTestEnv) return false;
    return true;
  });
  const [isLive, setIsLive] = useState(hasCached);
  const [totalLive, setTotalLive] = useState(hasCached ? cachedNews!.length : 0);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('todas');
  const [selectedTimeRange, setSelectedTimeRange] = useState<NewsTimeRange>('todas');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingNews, setReadingNews] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incomingNews, setIncomingNews] = useState<NewsItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalSymbol, setOrderModalSymbol] = useState<string>('PETR4');

  // Load real live news on mount & auto-poll every 60s
  useEffect(() => {
    let isMounted = true;

    const checkFeed = async (isInitial = false) => {
      try {
        const result = await fetchLiveNews();
        if (!isMounted) return;

        setIsLive(result.isLive);
        setTotalLive(result.totalLive);

        if (result.news.length > 0) {
          if (isInitial) {
            setNewsList(result.news);
            setIncomingNews([]);
          } else {
            setNewsList((currentList) => {
              const currentIds = new Set(currentList.map((n) => n.id));
              const newItems = result.news.filter((n) => !currentIds.has(n.id));
              if (newItems.length > 0) {
                setIncomingNews((prev) => {
                  const prevIds = new Set(prev.map((n) => n.id));
                  const fresh = newItems.filter((n) => !prevIds.has(n.id));
                  return [...fresh, ...prev];
                });
              }
              return currentList;
            });
          }
        }
      } catch (err) {
        console.error('[NewsPage] Error polling live news:', err);
      } finally {
        if (isMounted && isInitial) {
          setIsInitialLoading(false);
        }
      }
    };

    checkFeed(true);

    const interval = setInterval(() => {
      checkFeed(false);
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
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

  const handleApplyIncomingNews = () => {
    if (incomingNews.length === 0) return;
    setNewsList((prev) => {
      const prevIds = new Set(prev.map((n) => n.id));
      const toAdd = incomingNews.filter((n) => !prevIds.has(n.id));
      return [...toAdd, ...prev];
    });
    setIncomingNews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const now = Date.now();

    return newsList.filter((item) => {
      // Time Range filter
      if (selectedTimeRange !== 'todas') {
        const ageMs = now - item.timestamp;
        if (selectedTimeRange === 'aovivo') {
          // Ao vivo: últimas 2 horas ou marcada como breaking
          if (ageMs > 2 * 60 * 60 * 1000 && !item.isBreaking) {
            return false;
          }
        } else if (selectedTimeRange === 'hoje') {
          // Hoje: últimas 24 horas
          if (ageMs > 24 * 60 * 60 * 1000) {
            return false;
          }
        } else if (selectedTimeRange === 'semana') {
          // Essa semana: últimos 7 dias
          if (ageMs > 7 * 24 * 60 * 60 * 1000) {
            return false;
          }
        } else if (selectedTimeRange === '15dias') {
          // Últimos 15 dias
          if (ageMs > 15 * 24 * 60 * 60 * 1000) {
            return false;
          }
        } else if (selectedTimeRange === 'mes') {
          // Esse mês: últimos 30 dias
          if (ageMs > 30 * 24 * 60 * 60 * 1000) {
            return false;
          }
        }
      }

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
  }, [newsList, selectedCategory, selectedTimeRange, selectedSource, searchQuery, portfolioSymbols, favoriteSymbols]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, selectedTimeRange, selectedSource, searchQuery]);

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

  const timeRangeFilters: { id: NewsTimeRange; label: string; isLivePill?: boolean }[] = [
    { id: 'todas', label: 'Todo o Período' },
    { id: 'aovivo', label: 'Ao Vivo', isLivePill: true },
    { id: 'hoje', label: 'Hoje' },
    { id: 'semana', label: 'Essa Semana' },
    { id: '15dias', label: 'Últimos 15 Dias' },
    { id: 'mes', label: 'Esse Mês' },
  ];

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
      {/* Standardized Page Header */}
      {/* Centralized Page Header */}
      <PageHeader
        page="noticias"
        badge={
          isLive
            ? { text: `AO VIVO (${totalLive})`, variant: 'sky', pulse: true }
            : { text: 'CACHE LOCAL', variant: 'blue' }
        }
        rightActions={
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white transition-all shadow-sm"
            title="Atualizar feed"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#60A5FA]' : ''} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Feed'}</span>
          </button>
        }
      />

      {/* Floating incoming news notification badge */}
      {incomingNews.length > 0 && (
        <div className="sticky top-4 z-30 flex justify-center animate-in fade-in slide-in-from-top-4 duration-300">
          <button
            onClick={handleApplyIncomingNews}
            className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 text-white font-mono text-xs font-bold shadow-xl shadow-blue-500/30 border border-sky-300/40 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>
              ⚡ {incomingNews.length} {incomingNews.length === 1 ? 'nova matéria recebida' : 'novas matérias recebidas'} · Atualizar agora
            </span>
            <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      )}

      {/* Breaking News Ticker (Plantão B3 / Bloomberg style) */}
      <BreakingNewsTicker
        news={newsList}
        onReadNews={(item) => setReadingNews(item)}
        onOpenOrder={handleOpenOrder}
      />

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
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por notícia, empresa ou ticker (ex: PETR4, CVM, Copom)..."
            className="w-full sm:max-w-md font-sans"
          />

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

        {/* Row 3: Time Range Filter Bar (Ao Vivo, Hoje, Essa Semana, 15 Dias, Esse Mês) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#1E293B]/60 no-scrollbar">
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#64748B] uppercase font-bold shrink-0 mr-1">
            <Clock size={12} className="text-[#38BDF8]" />
            <span>Período:</span>
          </div>

          {timeRangeFilters.map((timeRange) => {
            const isActive = selectedTimeRange === timeRange.id;
            return (
              <button
                key={timeRange.id}
                type="button"
                onClick={() => setSelectedTimeRange(timeRange.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all shrink-0 border ${
                  isActive
                    ? timeRange.isLivePill
                      ? 'bg-sky-500/20 text-[#38BDF8] border-sky-400/50 shadow-md shadow-sky-500/20 ring-1 ring-sky-400/30'
                      : 'bg-[#1E293B] text-white border-blue-400/50 shadow-sm'
                    : 'bg-[#121A2B] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-slate-600'
                }`}
              >
                {timeRange.isLivePill && (
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                )}
                <span>{timeRange.label}</span>
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
          {(selectedCategory !== 'todas' || selectedTimeRange !== 'todas' || selectedSource !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSelectedTimeRange('todas');
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
      {isInitialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="p-4 bg-[#0F1523] border border-[#1E293B] rounded-2xl animate-pulse flex flex-col justify-between h-[420px]"
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
      ) : visibleNews.length > 0 ? (
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
                  <CheckCheck size={14} className="text-sky-400" />
                  <span>Você chegou ao fim: todas as {filteredNews.length} notícias foram carregadas.</span>
                </div>
              )
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="Nenhuma notícia encontrada"
          description="Tente buscar com outros termos ou altere os filtros de categoria e fonte."
          action={{
            label: "Ver todas as notícias",
            onClick: () => {
              setSelectedCategory('todas');
              setSelectedSource('all');
              setSearchQuery('');
            },
          }}
        />
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
