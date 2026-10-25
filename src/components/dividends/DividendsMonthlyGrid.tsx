import React from 'react';
import { DividendCalendarItem } from '../../types/dividend';
import { PortfolioPosition } from '../../types/market';
import { Sparkles, Building2, TrendingUp } from 'lucide-react';

interface DividendsMonthlyGridProps {
  year: number;
  month: number; // 1-12
  monthItems: DividendCalendarItem[];
  userPortfolioMap: Map<string, PortfolioPosition>;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
}

export const DividendsMonthlyGrid: React.FC<DividendsMonthlyGridProps> = ({
  year,
  month,
  monthItems,
  userPortfolioMap,
  selectedDate,
  onSelectDate,
}) => {
  // Days of week header
  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  // Days in month
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 6 = Sat
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Map events by date (YYYY-MM-DD)
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, DividendCalendarItem[]>();
    monthItems.forEach((item) => {
      const list = map.get(item.paymentDate) || [];
      list.push(item);
      map.set(item.paymentDate, list);
    });
    return map;
  }, [monthItems]);

  // Today string for highlighting
  const todayStr = '2026-10-25'; // Simulated anchor date

  // Generate day slots
  const slots: Array<{ dayNumber: number | null; dateStr: string | null }> = [];

  // Padding before day 1
  for (let i = 0; i < firstDayOfWeek; i++) {
    slots.push({ dayNumber: null, dateStr: null });
  }

  // Actual days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    slots.push({ dayNumber: day, dateStr: `${year}-${mm}-${dd}` });
  }

  return (
    <div className="w-full bg-[#0F1523] rounded-2xl border border-[#1E293B] overflow-hidden shadow-xl">
      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-[#1E293B] bg-[#161F33]/80">
        {weekDays.map((wd, idx) => (
          <div
            key={wd}
            className={`py-2.5 text-center font-mono font-bold text-[11px] ${
              idx === 0 || idx === 6 ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#1E293B]/70">
        {slots.map((slot, index) => {
          if (!slot.dayNumber || !slot.dateStr) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[90px] sm:min-h-[115px] bg-[#0A0E1A]/40 p-2"
              />
            );
          }

          const dayEvents = eventsByDate.get(slot.dateStr) || [];
          const isSelected = selectedDate === slot.dateStr;
          const isToday = slot.dateStr === todayStr;

          // Check if any event on this day is in user portfolio
          const userEventsOnDay = dayEvents.filter((e) =>
            userPortfolioMap.has(e.symbol.toUpperCase())
          );
          const hasUserPortfolioEvent = userEventsOnDay.length > 0;

          // Total user amount for this day
          const userTotalDayAmount = userEventsOnDay.reduce((acc, item) => {
            const pos = userPortfolioMap.get(item.symbol.toUpperCase());
            const qty = pos ? pos.quantity : 0;
            return acc + qty * item.valuePerShare;
          }, 0);

          return (
            <div
              key={slot.dateStr}
              onClick={() => slot.dateStr && onSelectDate(slot.dateStr)}
              className={`min-h-[95px] sm:min-h-[120px] p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-blue-950/40 ring-2 ring-[#2962FF] z-10'
                  : hasUserPortfolioEvent
                  ? 'bg-gradient-to-b from-amber-950/15 via-[#0F1523] to-[#0F1523] hover:bg-[#161F33]/90'
                  : 'bg-[#0F1523] hover:bg-[#161F33]/60'
              }`}
            >
              {/* Day Number and Badges */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-mono text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isToday
                      ? 'bg-[#2962FF] text-white shadow-md shadow-blue-500/30'
                      : isSelected
                      ? 'bg-blue-500/20 text-[#60A5FA]'
                      : 'text-[#94A3B8] group-hover:text-white'
                  }`}
                >
                  {slot.dayNumber}
                </span>

                {/* Star icon if user portfolio pays today */}
                {hasUserPortfolioEvent && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse shadow-sm"
                    title={`Você recebe R$ ${userTotalDayAmount.toFixed(2)} hoje!`}
                  >
                    <Sparkles size={10} className="fill-amber-300" />
                    <span>R$ {userTotalDayAmount.toFixed(0)}</span>
                  </span>
                )}
              </div>

              {/* Day Events Badges (Differentiated between FII and Stock) */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-none my-1">
                {dayEvents.slice(0, 3).map((item) => {
                  const isOwned = userPortfolioMap.has(item.symbol.toUpperCase());
                  const isFii = item.category === 'fii';

                  return (
                    <div
                      key={item.id}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center justify-between gap-1 truncate transition-all ${
                        isOwned
                          ? isFii
                            ? 'bg-emerald-950/80 text-emerald-200 border border-amber-400/60 shadow-sm ring-1 ring-amber-400/30'
                            : 'bg-blue-950/80 text-sky-200 border border-amber-400/60 shadow-sm ring-1 ring-amber-400/30'
                          : isFii
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
                          : 'bg-sky-950/40 text-sky-300 border border-sky-500/40 hover:border-sky-400'
                      }`}
                      title={`${isFii ? 'FII' : 'AÇÃO'}: ${item.symbol} (${item.type}) - R$ ${item.valuePerShare.toFixed(2)} / cota`}
                    >
                      <span className="truncate flex items-center gap-1">
                        {isOwned && <span className="text-amber-400 font-black">★</span>}
                        {isFii ? (
                          <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-extrabold uppercase shrink-0">
                            FII
                          </span>
                        ) : (
                          <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300 font-extrabold uppercase shrink-0">
                            AÇÃO
                          </span>
                        )}
                        <span className="truncate">{item.symbol}</span>
                      </span>

                      <span className="text-[9px] shrink-0 font-mono opacity-90">
                        R${item.valuePerShare.toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <span className="text-[9px] font-mono text-[#64748B] pl-1 font-semibold">
                    +{dayEvents.length - 3} outros
                  </span>
                )}
              </div>

              {/* Bottom count indicator */}
              <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] pt-0.5">
                {dayEvents.length > 0 ? (
                  <span>{dayEvents.length} {dayEvents.length === 1 ? 'provento' : 'proventos'}</span>
                ) : (
                  <span />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Footer Legend */}
      <div className="p-3 bg-[#161F33]/60 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#94A3B8]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Building2 size={10} /> FII
            </span>
            <span className="text-[#94A3B8]">Fundos Imobiliários (Rendimento Isento)</span>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
              <TrendingUp size={10} /> AÇÃO
            </span>
            <span className="text-[#94A3B8]">Ações / Stocks (Dividendo & JCP)</span>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
              <Sparkles size={10} className="fill-amber-300" /> ★
            </span>
            <span className="text-[#94A3B8]">Ativo da Sua Carteira</span>
          </span>
        </div>

        <span className="text-[11px] text-[#64748B]">Clique em qualquer dia para inspecionar</span>
      </div>
    </div>
  );
};
