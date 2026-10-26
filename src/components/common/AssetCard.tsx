import React from 'react';
import { Star, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export interface AssetCardProps {
  symbol: string;
  name: string;
  priceFormatted: string;
  changePercent: number;
  changePercentFormatted: string;
  volumeFormatted: string;
  icon?: React.ReactNode;
  badgeSubtitle?: string;
  isActive?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  actionLabel?: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  symbol,
  name,
  priceFormatted,
  changePercent,
  changePercentFormatted,
  volumeFormatted,
  icon,
  badgeSubtitle,
  isActive = false,
  isFavorite,
  onToggleFavorite,
  onClick,
  actionLabel,
}) => {
  const isPositive = changePercent >= 0;

  return (
    <div
      onClick={onClick}
      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
        isActive
          ? 'bg-[#141C2E] border-[#2962FF] ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
          : 'bg-[#0F1523] border-[#1E293B] hover:border-[#334155] hover:bg-[#121A2B]'
      }`}
    >
      {/* Header: Icon/Symbol/Name + Favorite / Active pulse */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-1">
          {icon && <div className="shrink-0">{icon}</div>}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white font-mono group-hover:text-[#60A5FA] transition-colors truncate">
                {symbol}
              </span>
              {badgeSubtitle && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161F33] text-[#94A3B8] font-mono shrink-0">
                  {badgeSubtitle}
                </span>
              )}
              {isActive && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#38BDF8] animate-pulse shrink-0"></span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs text-[#94A3B8] block truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[150px]">
              {name}
            </span>
          </div>
        </div>

        {/* Favorite Star Button (if provided) */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              isFavorite
                ? 'text-[#F59E0B] bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#1E293B]'
            }`}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Star size={15} fill={isFavorite ? '#F59E0B' : 'none'} />
          </button>
        )}
      </div>

      {/* Price & Change Pill */}
      <div className="my-2 sm:my-3 flex flex-col xs:flex-row xs:items-baseline justify-between gap-1">
        <span className="text-base sm:text-2xl font-bold font-mono tracking-tight text-white whitespace-nowrap truncate">
          {priceFormatted}
        </span>
        <span
          className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg self-start xs:self-auto shrink-0 ${
            isPositive
              ? 'bg-sky-500/10 text-[#38BDF8] border border-sky-500/20'
              : 'bg-rose-500/10 text-[#F43F5E] border border-rose-500/20'
          }`}
        >
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {changePercentFormatted}
        </span>
      </div>

      {/* Footer: Volume & Action Button */}
      <div className="pt-2 border-t border-[#1E293B]/70 flex items-center justify-between text-[10px] sm:text-[11px] gap-1">
        <span className="text-[#64748B] truncate max-w-[70px] sm:max-w-[140px]">
          {volumeFormatted}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-semibold flex items-center gap-1 transition-all text-[10px] sm:text-xs shrink-0 ${
            isActive
              ? 'bg-[#2962FF] text-white shadow-sm'
              : 'bg-[#161F33] text-[#94A3B8] group-hover:text-white group-hover:bg-[#1E293B]'
          }`}
        >
          <span>{actionLabel || (isActive ? 'No Gráfico' : 'Ver')}</span>
          <ArrowUpRight size={11} />
        </button>
      </div>
    </div>
  );
};
