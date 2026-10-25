import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { ActiveNav } from '../../types/market';
import { DividendOrigin, DividendCategoryFilter } from '../../types/dividend';
import { MOCK_DIVIDEND_CALENDAR } from '../../data/mockDividendData';
import { DividendsStatsHeader } from './DividendsStatsHeader';
import { DividendsFilterBar } from './DividendsFilterBar';
import { DividendsMonthBar } from './DividendsMonthBar';
import { DividendsMonthlyGrid } from './DividendsMonthlyGrid';
import { DividendsTimelineList } from './DividendsTimelineList';
import { DividendDayInspector } from './DividendDayInspector';
import { DividendSimulatorCard } from './DividendSimulatorCard';
import { OrderModal } from '../order/OrderModal';
import { PageHeader } from '../common/PageHeader';
import { CalendarDays } from 'lucide-react';

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
  // Level 1: Scope filter - MULTI-SELECTABLE ARRAY! (Carteira, Favoritos, Mercado can be combined!)
  const [selectedOrigins, setSelectedOrigins] = useState<DividendOrigin[]>(['carteira']);
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

  // Toggle origin handler (allows adding Carteira + Favoritos simultaneously)
  const handleToggleOrigin = (origin: DividendOrigin) => {
    setSelectedOrigins((prev) => {
      if (origin === 'mercado') {
        if (prev.includes('mercado')) {
          return ['carteira'];
        }
        return ['mercado'];
      }

      // If clicking carteira or favoritos:
      let next = prev.filter((o) => o !== 'mercado');
      if (next.includes(origin)) {
        next = next.filter((o) => o !== origin);
      } else {
        next = [...next, origin];
      }

      if (next.length === 0) {
        return ['mercado'];
      }
      return next;
    });
  };

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

  // Compute sub-filter counts dynamically based on active origins (Carteira, Favoritos, Mercado)
  const counts = useMemo(() => {
    const carteiraItems = monthAllItems.filter((item) =>
      userPortfolioMap.has(item.symbol.toUpperCase())
    );
    const favoritosItems = monthAllItems.filter((item) =>
      favoritesSet.has(item.symbol.toUpperCase())
    );

    let pool = monthAllItems;
    if (!selectedOrigins.includes('mercado')) {
      const activeIds = new Set<string>();
      if (selectedOrigins.includes('carteira')) {
        carteiraItems.forEach((i) => activeIds.add(i.id));
      }
      if (selectedOrigins.includes('favoritos')) {
        favoritosItems.forEach((i) => activeIds.add(i.id));
      }
      pool = monthAllItems.filter((i) => activeIds.has(i.id));
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
  }, [monthAllItems, selectedOrigins, userPortfolioMap, favoritesSet]);

  // Filtered items based on multi-selected origins, category sub-filter, and search
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return monthAllItems.filter((item) => {
      // 1. Level 1 Multi-origin Filter (Carteira + Favoritos combined!)
      const isCarteira = userPortfolioMap.has(item.symbol.toUpperCase());
      const isFavorito = favoritesSet.has(item.symbol.toUpperCase());

      if (!selectedOrigins.includes('mercado')) {
        const matchesCarteira = selectedOrigins.includes('carteira') && isCarteira;
        const matchesFavorito = selectedOrigins.includes('favoritos') && isFavorito;
        if (!matchesCarteira && !matchesFavorito) {
          return false;
        }
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
  }, [monthAllItems, selectedOrigins, categoryFilter, searchQuery, userPortfolioMap, favoritesSet]);

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
      <PageHeader
        icon={CalendarDays}
        title="Calendário & Mapa de Dividendos"
        badge={{
          text: 'Pinga-Pinga B3 & Internacional',
          variant: 'sky',
          pulse: true,
        }}
        subtitle="Previsão de proventos de Ações e FIIs da sua custódia, favoritos e mapa de datas-com de todo o mercado"
      />

      {/* Top Stats Cards */}
      <DividendsStatsHeader
        currentMonthName={currentMonthLabel}
        monthItems={monthAllItems}
        userPortfolioMap={userPortfolioMap}
        onSelectUpcoming={handleSelectUpcoming}
      />

      {/* Filter Bar with Multiple-select Origin (Carteira + Favoritos simultaneously) + Category Sub-filters */}
      <DividendsFilterBar
        selectedOrigins={selectedOrigins}
        onToggleOrigin={handleToggleOrigin}
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
