import React from 'react';
import { DividendCalendarItem } from '../../types/dividend';
import { PortfolioPosition } from '../../types/market';
import { X, Calendar, Zap, Building2, TrendingUp, Sparkles } from 'lucide-react';

interface DividendDayInspectorProps {
  selectedDate: string; // "YYYY-MM-DD"
  events: DividendCalendarItem[];
  userPortfolioMap: Map<string, PortfolioPosition>;
  onClose: () => void;
  onOpenOrder: (symbol: string) => void;
}

export const DividendDayInspector: React.FC<DividendDayInspectorProps> = ({
  selectedDate,
  events,
  userPortfolioMap,
  onClose,
  onOpenOrder,
}) => {
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalUserDay = events.reduce((acc, item) => {
    const pos = userPortfolioMap.get(item.symbol.toUpperCase());
    const qty = pos ? pos.quantity : 0;
    return acc + qty * item.valuePerShare;
  }, 0);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1523] border border-blue-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-[#60A5FA] flex items-center justify-center">
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white capitalize">{formattedDate}</h4>
            <p className="text-xs text-[#94A3B8]">
              {events.length} {events.length === 1 ? 'provento previsto para esta data' : 'proventos previstos para esta data'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalUserDay > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles size={12} className="fill-amber-300" />
              Você recebe R$ {totalUserDay.toFixed(2)}
            </span>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Events List for this Day */}
      {events.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#64748B]">
          Nenhum provento cadastrado para este dia.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {events.map((item) => {
            const isOwned = userPortfolioMap.has(item.symbol.toUpperCase());
            const pos = userPortfolioMap.get(item.symbol.toUpperCase());
            const qty = pos ? pos.quantity : 0;
            const amount = qty * item.valuePerShare;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                  isOwned
                    ? 'bg-blue-950/25 border-blue-500/40'
                    : 'bg-[#161F33]/60 border-[#1E293B]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-mono font-bold text-white">
                        ${item.symbol}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.category === 'fii'
                            ? 'bg-sky-500/15 text-sky-300'
                            : 'bg-sky-500/15 text-sky-300'
                        }`}
                      >
                        {item.category === 'fii' ? <Building2 size={10} /> : <TrendingUp size={10} />}
                        {item.category === 'fii' ? 'FII' : 'Ação'}
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">({item.type})</span>
                    </div>

                    <span className="text-sm font-mono font-bold text-white">
                      R$ {item.valuePerShare.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8] font-medium line-clamp-1">{item.name}</p>
                  {item.description && (
                    <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>

                {/* Footer of Card */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] text-xs font-mono">
                  {isOwned ? (
                    <div className="text-sky-400 font-bold">
                      {qty} cotas = R$ {amount.toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-[#94A3B8] text-[11px]">
                      100 cotas = R$ {(item.valuePerShare * 100).toFixed(2)}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenOrder(item.symbol)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#2962FF] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <Zap size={11} className="fill-white" />
                    <span>Operar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
