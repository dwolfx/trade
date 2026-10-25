import React from 'react';
import { DividendCalendarItem } from '../../types/dividend';
import { PortfolioPosition } from '../../types/market';
import { Calendar, Zap, Building2, TrendingUp, Sparkles, CheckCircle2, Clock, Globe } from 'lucide-react';

interface DividendsTimelineListProps {
  items: DividendCalendarItem[];
  userPortfolioMap: Map<string, PortfolioPosition>;
  onOpenOrder: (symbol: string) => void;
  onSelectTicker: (symbol: string) => void;
}

export const DividendsTimelineList: React.FC<DividendsTimelineListProps> = ({
  items,
  userPortfolioMap,
  onOpenOrder,
  onSelectTicker,
}) => {
  // Sort items by payment date ascending
  const sortedItems = React.useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );
  }, [items]);

  if (sortedItems.length === 0) {
    return (
      <div className="w-full py-12 px-4 rounded-2xl bg-[#0F1523] border border-[#1E293B] text-center flex flex-col items-center justify-center gap-3">
        <Calendar size={36} className="text-[#64748B]" />
        <h3 className="text-base font-bold text-white">Nenhum provento encontrado</h3>
        <p className="text-xs text-[#94A3B8] max-w-md">
          Não encontramos nenhum dividendo ou rendimento para o filtro selecionado neste mês. Tente alternar para "Todo o Mercado" ou limpar a busca.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sortedItems.map((item) => {
        const isOwned = userPortfolioMap.has(item.symbol.toUpperCase());
        const userPosition = userPortfolioMap.get(item.symbol.toUpperCase());
        const userQty = userPosition ? userPosition.quantity : 0;
        const userTotal = userQty * item.valuePerShare;
        const isFii = item.category === 'fii';
        const isGlobal = item.category === 'internacional';
        const currencyPrefix = item.currency === 'USD' ? 'US$' : 'R$';

        return (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              isOwned
                ? 'bg-gradient-to-r from-amber-950/20 via-[#0F1523] to-[#161F33] border-amber-500/50 shadow-lg shadow-amber-950/15'
                : isFii
                ? 'bg-[#0F1523] hover:bg-[#18112C] border-purple-500/30 hover:border-purple-500/60'
                : isGlobal
                ? 'bg-[#0F1523] hover:bg-[#17162C] border-indigo-500/30 hover:border-indigo-500/60'
                : 'bg-[#0F1523] hover:bg-[#131A2D] border-blue-500/25 hover:border-blue-500/50'
            }`}
          >
            {/* Left: Date Badge + Info */}
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Payment Date Box */}
              <div
                className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                  isFii
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                    : isGlobal
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                    : 'bg-blue-950/40 border-blue-500/40 text-sky-300'
                }`}
              >
                <span className="text-[10px] font-mono uppercase font-bold opacity-80">
                  {new Date(item.paymentDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                </span>
                <span className="text-lg font-mono font-black leading-none">
                  {item.paymentDate.split('-')[2]}
                </span>
              </div>

              {/* Ticker & Description */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onSelectTicker(item.symbol)}
                    className="text-base font-mono font-bold text-white hover:text-[#60A5FA] flex items-center gap-1.5 transition-colors"
                  >
                    <span>${item.symbol}</span>
                  </button>

                  {/* Distinct Category Tag */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider ${
                      isFii
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                        : isGlobal
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                    }`}
                  >
                    {isFii ? (
                      <Building2 size={12} />
                    ) : isGlobal ? (
                      <Globe size={12} />
                    ) : (
                      <TrendingUp size={12} />
                    )}
                    {isFii ? 'FII · Imobiliário' : isGlobal ? 'Global · US$' : 'Ação · B3'}
                  </span>

                  {/* Type */}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161F33] text-[#94A3B8] border border-[#1E293B]">
                    {item.type}
                  </span>

                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      item.status === 'pago'
                        ? 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                        : item.status === 'confirmado'
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.status === 'pago' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                    {item.status === 'pago' ? 'Pago' : item.status === 'confirmado' ? 'Confirmado' : 'Previsto'}
                  </span>

                  {/* Star Owned Badge */}
                  {isOwned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm animate-pulse">
                      <Sparkles size={11} className="fill-amber-300" />
                      ★ Em Carteira ({userQty} cotas)
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#94A3B8] mt-1 font-medium line-clamp-1">{item.name}</p>

                {/* Dates line */}
                <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[#64748B]">
                  <span>
                    Data-COM:{' '}
                    <strong className="text-slate-300">{item.dateComDisplay}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Pagamento:{' '}
                    <strong className="text-slate-300">{item.paymentDateDisplay}</strong>
                  </span>
                  {item.yieldPercent && (
                    <>
                      <span>·</span>
                      <span className="text-sky-400 font-bold">DY: {item.yieldPercent.toFixed(2)}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Amounts & Quick Trade Button */}
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#1E293B]">
              {/* Amounts Display */}
              <div className="text-left md:text-right">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                  Valor por cota
                </span>
                <span className="text-sm font-mono font-black text-white">
                  {currencyPrefix} {item.valuePerShare.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')}
                </span>

                {isOwned ? (
                  <span className="text-xs font-mono font-bold text-amber-300 block mt-0.5">
                    Você recebe: {currencyPrefix} {userTotal.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#94A3B8] block mt-0.5">
                    100 cotas = {currencyPrefix} {(item.valuePerShare * 100).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Order Boleta Button */}
              <button
                type="button"
                onClick={() => onOpenOrder(item.symbol)}
                className={`px-3.5 py-2 rounded-xl text-white font-mono font-bold text-xs shadow-md flex items-center gap-1.5 active:scale-95 transition-all shrink-0 ${
                  isFii
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                    : isGlobal
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                    : 'bg-[#2962FF] hover:bg-[#1D4ED8] shadow-blue-500/20'
                }`}
                title={`Abrir boleta de negociação para ${item.symbol}`}
              >
                <Zap size={13} className="fill-white text-white" />
                <span>Operar</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
