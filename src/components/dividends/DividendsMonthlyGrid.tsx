import React from 'react';
import { DividendCalendarItem } from '../../types/dividend';
import { PortfolioPosition } from '../../types/market';
import { Sparkles } from 'lucide-react';

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
                className="min-h-[90px] sm:min-h-[110px] bg-[#0A0E1A]/40 p-2"
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
              className={`min-h-[90px] sm:min-h-[115px] p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-blue-950/40 ring-2 ring-[#2962FF] z-10'
                  : hasUserPortfolioEvent
                  ? 'bg-gradient-to-b from-blue-950/25 to-[#0F1523] hover:bg-[#161F33]/90'
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
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                    title={`Você recebe R$ ${userTotalDayAmount.toFixed(2)} hoje!`}
                  >
                    <Sparkles size={10} className="fill-amber-300" />
                    <span className="hidden sm:inline">R$ {userTotalDayAmount.toFixed(0)}</span>
                  </span>
                )}
              </div>

              {/* Day Events Badges */}
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[75px] scrollbar-none my-1">
                {dayEvents.slice(0, 3).map((item) => {
                  const isOwned = userPortfolioMap.has(item.symbol.toUpperCase());
                  return (
                    <div
                      key={item.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center justify-between gap-1 truncate transition-all ${
                        isOwned
                          ? 'bg-blue-600/30 text-sky-200 border border-blue-400/40 shadow-sm'
                          : item.category === 'fii'
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#161F33] text-[#94A3B8] border border-[#1E293B]'
                      }`}
                      title={`${item.symbol} (${item.type}) - R$ ${item.valuePerShare.toFixed(2)}`}
                    >
                      <span className="truncate flex items-center gap-0.5">
                        {isOwned && <span className="text-amber-400">★</span>}
                        {item.symbol}
                      </span>
                      <span className="text-[9px] shrink-0 opacity-80">
                        {item.valuePerShare < 1
                          ? `R$${item.valuePerShare.toFixed(2)}`
                          : `R$${item.valuePerShare.toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <span className="text-[9px] font-mono text-[#64748B] pl-1">
                    +{dayEvents.length - 3} outros
                  </span>
                )}
              </div>

              {/* Bottom indicators */}
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
    </div>
  );
};
