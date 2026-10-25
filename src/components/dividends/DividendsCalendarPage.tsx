import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { ActiveNav } from '../../types/market';
import { DividendOriginFilter, DividendCategoryFilter } from '../../types/dividend';
import { MOCK_DIVIDEND_CALENDAR } from '../../data/mockDividendData';
import { DividendsStatsHeader } from './DividendsStatsHeader';
import { DividendsFilterBar } from './DividendsFilterBar';
import { DividendsMonthBar } from './DividendsMonthBar';
import { DividendsMonthlyGrid } from './DividendsMonthlyGrid';
import { DividendsTimelineList } from './DividendsTimelineList';
import { DividendDayInspector } from './DividendDayInspector';
import { DividendSimulatorCard } from './DividendSimulatorCard';
import { OrderModal } from '../order/OrderModal';
import { CalendarDays, ArrowLeft, Sparkles } from 'lucide-react';

interface DividendsCalendarPageProps {
  onNavigate: (nav: ActiveNav) => void;
}

export const DividendsCalendarPage: React.FC<DividendsCalendarPageProps> = ({ onNavigate }) => {
  const { portfolio, favoriteSymbols, selectOrCreateAsset } = useMarket();

  // Selected month options
  const availableMonths = useMemo(
    () => [
      { key: '2026-10', label: 'Outubro 2026' },
      { key: '2026-11', label: 'Novembro 2026' },
      { key: '2026-12', label: 'Dezembro 2026' },
    ],
    []
  );

  const [currentMonthKey, setCurrentMonthKey] = useState<string>('2026-11');
  // Level 1: Scope filter (Minha Carteira vs Meus Favoritos vs Todo o Mercado)
  const [originFilter, setOriginFilter] = useState<DividendOriginFilter>('carteira');
  // Level 2: Category sub-filter (Todos vs FIIs vs Ações vs Internacionais vs Data-COM Aberta)
  const [categoryFilter, setCategoryFilter] = useState<DividendCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Order modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalSymbol, setOrderModalSymbol] = useState<string>('MXRF11');

  // Map user portfolio for instant lookup by upper symbol
  const userPortfolioMap = useMemo(() => {
    const map = new Map();
    portfolio.forEach((p) => {
      map.set(p.symbol.toUpperCase(), p);
    });
    return map;
  }, [portfolio]);

  // Set of uppercase favorite symbols
  const favoritesSet = useMemo(() => {
    return new Set((favoriteSymbols || []).map((s) => s.toUpperCase()));
  }, [favoriteSymbols]);

  // Year and month numbers from currentMonthKey "YYYY-MM"
  const [yearNum, monthNum] = useMemo(() => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    return [y, m];
  }, [currentMonthKey]);

  // Current month label
  const currentMonthLabel = useMemo(() => {
    return availableMonths.find((m) => m.key === currentMonthKey)?.label || currentMonthKey;
  }, [availableMonths, currentMonthKey]);

  // All items for the selected month (unfiltered)
  const monthAllItems = useMemo(() => {
    return MOCK_DIVIDEND_CALENDAR.filter((item) => item.paymentDate.startsWith(currentMonthKey));
  }, [currentMonthKey]);

  const todayStr = '2026-10-25'; // simulated anchor date

  // Compute sub-filter counts dynamically based on active originFilter (Carteira vs Favoritos vs Mercado)
  const counts = useMemo(() => {
    const carteiraItems = monthAllItems.filter((item) =>
      userPortfolioMap.has(item.symbol.toUpperCase())
    );
    const favoritosItems = monthAllItems.filter((item) =>
      favoritesSet.has(item.symbol.toUpperCase())
    );

    let pool = monthAllItems;
    if (originFilter === 'carteira') {
      pool = carteiraItems;
    } else if (originFilter === 'favoritos') {
      pool = favoritosItems;
    }

    return {
      carteiraTotal: carteiraItems.length,
      favoritosTotal: favoritosItems.length,
      mercadoTotal: monthAllItems.length,
      total: pool.length,
      fii: pool.filter((item) => item.category === 'fii').length,
      acao: pool.filter((item) => item.category === 'acao').length,
      internacional: pool.filter((item) => item.category === 'internacional').length,
      datacomAberta: pool.filter((item) => item.dateCom >= todayStr).length,
    };
  }, [monthAllItems, originFilter, userPortfolioMap, favoritesSet]);

  // Filtered items based on origin, category sub-filter, and search
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return monthAllItems.filter((item) => {
      // 1. Level 1 Origin Filter (Minha Carteira / Meus Favoritos / Todo o Mercado)
      if (originFilter === 'carteira' && !userPortfolioMap.has(item.symbol.toUpperCase())) {
        return false;
      }
      if (originFilter === 'favoritos' && !favoritesSet.has(item.symbol.toUpperCase())) {
        return false;
      }

      // 2. Level 2 Category Sub-filter
      if (categoryFilter === 'fii' && item.category !== 'fii') {
        return false;
      }
      if (categoryFilter === 'acao' && item.category !== 'acao') {
        return false;
      }
      if (categoryFilter === 'internacional' && item.category !== 'internacional') {
        return false;
      }
      if (categoryFilter === 'datacom_aberta' && item.dateCom < todayStr) {
        return false;
      }

      // 3. Search query
      if (query) {
        const inSymbol = item.symbol.toLowerCase().includes(query);
        const inName = item.name.toLowerCase().includes(query);
        if (!inSymbol && !inName) return false;
      }

      return true;
    });
  }, [monthAllItems, originFilter, categoryFilter, searchQuery, userPortfolioMap, favoritesSet]);

  // Handlers
  const handleOpenOrder = async (symbol: string) => {
    await selectOrCreateAsset(symbol);
    setOrderModalSymbol(symbol);
    setIsOrderModalOpen(true);
  };

  const handleSelectTicker = (symbol: string) => {
    selectOrCreateAsset(symbol);
    onNavigate('bolsa');
  };

  const handleSelectUpcoming = (symbol: string) => {
    const item = monthAllItems.find((m) => m.symbol.toUpperCase() === symbol.toUpperCase());
    if (item) {
      setSelectedDate(item.paymentDate);
    }
  };

  // Events for selected day inspector
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return monthAllItems.filter((item) => item.paymentDate === selectedDate);
  }, [monthAllItems, selectedDate]);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-400/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CalendarDays size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Calendário & Mapa de Dividendos
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Sparkles size={11} className="fill-emerald-300" />
                Pinga-Pinga B3 & Internacional
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Previsão de proventos de Ações e FIIs da sua custódia, favoritos e mapa de datas-com de todo o mercado
            </p>
          </div>
        </div>

        {/* Back to Home button */}
        <button
          onClick={() => onNavigate('bolsa')}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono font-medium text-[#94A3B8] hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>Voltar ao Home Broker</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <DividendsStatsHeader
        currentMonthName={currentMonthLabel}
        monthItems={monthAllItems}
        userPortfolioMap={userPortfolioMap}
        onSelectUpcoming={handleSelectUpcoming}
      />

      {/* Filter Bar with 3-Level Origin (Carteira, Favoritos, Todo o Mercado) + Category Sub-filters */}
      <DividendsFilterBar
        originFilter={originFilter}
        onSelectOrigin={setOriginFilter}
        categoryFilter={categoryFilter}
        onSelectCategory={setCategoryFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* Prominent Month Selector & View Mode Bar DIRECTLY ABOVE the Calendar */}
      <DividendsMonthBar
        currentMonthKey={currentMonthKey}
        availableMonths={availableMonths}
        onSelectMonth={(key) => {
          setCurrentMonthKey(key);
          setSelectedDate(null);
        }}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        filteredCount={filteredItems.length}
      />

      {/* Main View: Grid vs List */}
      {viewMode === 'grid' ? (
        <div className="flex flex-col gap-4">
          <DividendsMonthlyGrid
            year={yearNum}
            month={monthNum}
            monthItems={filteredItems}
            userPortfolioMap={userPortfolioMap}
            selectedDate={selectedDate}
            onSelectDate={(dateStr) => setSelectedDate(dateStr)}
          />

          {/* Selected Day Inspector */}
          {selectedDate && (
            <DividendDayInspector
              selectedDate={selectedDate}
              events={selectedDayEvents}
              userPortfolioMap={userPortfolioMap}
              onClose={() => setSelectedDate(null)}
              onOpenOrder={handleOpenOrder}
            />
          )}
        </div>
      ) : (
        <DividendsTimelineList
          items={filteredItems}
          userPortfolioMap={userPortfolioMap}
          onOpenOrder={handleOpenOrder}
          onSelectTicker={handleSelectTicker}
        />
      )}

      {/* Interactive Passive Income Simulator */}
      <DividendSimulatorCard
        availableItems={MOCK_DIVIDEND_CALENDAR}
        onOpenOrder={handleOpenOrder}
      />

      {/* Boleta Order Slide-over Drawer */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        symbol={orderModalSymbol}
      />
    </div>
  );
};
