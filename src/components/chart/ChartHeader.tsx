import React, { ReactNode } from 'react';
import { LayoutGrid, Zap } from 'lucide-react';

export interface TimeframeOption<T extends string = string> {
  id: T;
  label: string;
  desc?: string;
}

export interface ChartHeaderProps<T extends string = string> {
  // Left: Identity
  icon?: ReactNode;
  symbol: string;
  exchangeLabel?: string;
  name: string;

  // Price & Variation
  priceFormatted: string;
  changePercentFormatted: string;
  isPositive: boolean;

  // Optional mobile action
  onOpenOrder?: () => void;

  // Right Top: Timeframe Selector
  timeframes: TimeframeOption<T>[];
  activeTimeframe: T;
  onSelectTimeframe: (tf: T) => void;

  // Right Bottom: Live/Status Badge + Multi-Chart (1 ou 2x2)
  statusBadge?: ReactNode;
  isMultiChart: boolean;
  onToggleMultiChart: () => void;
}

export const ChartHeader = <T extends string = string>({
  icon,
  symbol,
  exchangeLabel,
  name,
  priceFormatted,
  changePercentFormatted,
  isPositive,
  onOpenOrder,
  timeframes,
  activeTimeframe,
  onSelectTimeframe,
  statusBadge,
  isMultiChart,
  onToggleMultiChart,
}: ChartHeaderProps<T>): React.ReactElement => {
  return (
    <div className="flex flex-col gap-3.5 border-b border-[#1E293B] pb-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Lado Esquerdo: Bandeira/Ícone + Nome da Ação · Bolsa, Nome completo (max 2 linhas), Divisor vertical, Valor do ativo */}
        <div className="flex items-center gap-3.5 flex-wrap sm:flex-nowrap min-w-0">
          {/* Identity: Flag/Icon, Ticker · Bolsa, Nome completo com no máx 2 linhas */}
          <div className="flex flex-col min-w-0 max-w-[200px] sm:max-w-[220px]">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight leading-none">
                {symbol}
              </span>
              {exchangeLabel && (
                <span className="text-xs text-[#64748B] font-mono hidden sm:inline">
                  {exchangeLabel}
                </span>
              )}
            </div>
            <span
              className="text-xs text-[#94A3B8] font-medium line-clamp-2 mt-1 leading-snug"
              title={name}
            >
              {name}
            </span>
          </div>

          {/* Divisor vertical */}
          <div className="h-9 w-px bg-[#1E293B] shrink-0 hidden sm:block" />

          {/* Valor do ativo (Preço + Variação) */}
          <div className="flex items-baseline gap-2 shrink-0 font-mono">
            <span className="text-xl sm:text-2xl font-black text-white whitespace-nowrap">
              {priceFormatted}
            </span>
            <span
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded whitespace-nowrap ${
                isPositive
                  ? 'bg-sky-500/10 text-[#38BDF8]'
                  : 'bg-rose-500/10 text-[#F43F5E]'
              }`}
            >
              {changePercentFormatted}
            </span>
          </div>

          {/* Mobile Trade Action Button */}
          {onOpenOrder && (
            <button
              onClick={onOpenOrder}
              className="lg:hidden ml-auto px-3 py-1.5 rounded-xl bg-[#2962FF] hover:bg-[#1D4ED8] text-white text-xs font-bold font-sans shadow-md shadow-blue-500/20 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Zap size={13} className="fill-white" />
              <span>Operar</span>
            </button>
          )}
        </div>

        {/* Lado Direito: Seletor do gráfico e na linha de baixo o aviso de live/fechado e seleção de gráfico (1 ou 2x2) */}
        <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
          {/* Seletor do gráfico */}
          <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B]">
            {timeframes.map(tf => (
              <button
                key={tf.id}
                onClick={() => onSelectTimeframe(tf.id)}
                title={tf.desc}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all text-center ${
                  activeTimeframe === tf.id
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Linha de baixo: aviso de live/fechado e seleção de gráfico (1 ou 2x2) */}
          <div className="flex items-center gap-2.5">
            {/* Aviso de live / fechado */}
            {statusBadge}

            {/* Seleção de gráfico (1 ou 2x2) */}
            <button
              onClick={onToggleMultiChart}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                isMultiChart
                  ? 'bg-[#2962FF] text-white border-blue-400 shadow-sm'
                  : 'bg-[#0B0F19] text-[#94A3B8] border-[#1E293B] hover:text-white hover:bg-[#161F33]'
              }`}
            >
              <LayoutGrid size={14} />
              <span>{isMultiChart ? '1 Gráfico' : 'Multi-Gráfico (2×2)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
