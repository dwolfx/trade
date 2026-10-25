import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { ActiveNav } from '../../types/market';
import { DividendFilterScope } from '../../types/dividend';
import { MOCK_DIVIDEND_CALENDAR } from '../../data/mockDividendData';
import { DividendsStatsHeader } from './DividendsStatsHeader';
import { DividendsFilterBar } from './DividendsFilterBar';
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
  const { portfolio, selectOrCreateAsset } = useMarket();

  // Selected month
  const availableMonths = useMemo(
    () => [
      { key: '2026-10', label: 'Outubro 2026' },
      { key: '2026-11', label: 'Novembro 2026' },
      { key: '2026-12', label: 'Dezembro 2026' },
    ],
    []
  );

  const [currentMonthKey, setCurrentMonthKey] = useState<string>('2026-11');
  const [scope, setScope] = useState<DividendFilterScope>('all');
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

  // Year and month numbers from currentMonthKey "YYYY-MM"
  const [yearNum, monthNum] = useMemo(() => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    return [y, m];
  }, [currentMonthKey]);

  // Current month label
  const currentMonthLabel = useMemo(() => {
    return availableMonths.find((m) => m.key === currentMonthKey)?.label || currentMonthKey;
  }, [availableMonths, currentMonthKey]);

  // All items for the selected month (unfiltered, used by stats header)
  const monthAllItems = useMemo(() => {
    return MOCK_DIVIDEND_CALENDAR.filter((item) => item.paymentDate.startsWith(currentMonthKey));
  }, [currentMonthKey]);

  // Filtered items based on scope and search
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const todayStr = '2026-10-25'; // simulated anchor date

    return monthAllItems.filter((item) => {
      // Scope filter
      if (scope === 'carteira' && !userPortfolioMap.has(item.symbol.toUpperCase())) {
        return false;
      }
      if (scope === 'fii' && item.category !== 'fii') {
        return false;
      }
      if (scope === 'acao' && item.category !== 'acao') {
        return false;
      }
      if (scope === 'datacom_aberta' && item.dateCom < todayStr) {
        return false;
      }

      // Search query
      if (query) {
        const inSymbol = item.symbol.toLowerCase().includes(query);
        const inName = item.name.toLowerCase().includes(query);
        if (!inSymbol && !inName) return false;
      }

      return true;
    });
  }, [monthAllItems, scope, searchQuery, userPortfolioMap]);

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
                Pinga-Pinga Mensal B3
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Previsão de proventos de Ações e FIIs da sua custódia e mapa de datas-com de todo o mercado brasileiro
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

      {/* Filter and Navigation Bar */}
      <DividendsFilterBar
        currentMonthKey={currentMonthKey}
        availableMonths={availableMonths}
        onSelectMonth={(key) => {
          setCurrentMonthKey(key);
          setSelectedDate(null);
        }}
        scope={scope}
        onSelectScope={setScope}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        userPortfolioCount={userPortfolioMap.size}
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
