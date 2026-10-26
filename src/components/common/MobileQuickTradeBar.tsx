import React from 'react';
import { Zap } from 'lucide-react';

export interface MobileQuickTradeBarProps {
  symbol: string;
  priceFormatted: string;
  changePercent: number;
  changePercentFormatted: string;
  icon?: React.ReactNode;
  onOpenOrder: () => void;
}

export const MobileQuickTradeBar: React.FC<MobileQuickTradeBarProps> = ({
  symbol,
  priceFormatted,
  changePercent,
  changePercentFormatted,
  icon,
  onOpenOrder,
}) => {
  const isPositive = changePercent >= 0;

  return (
    <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30 p-2 sm:p-2.5 rounded-2xl bg-[#0F1523]/95 border border-[#1E293B] backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5 min-w-0 pl-1">
        <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-[#60A5FA] flex items-center justify-center font-bold font-mono text-xs shrink-0">
          {icon || '⚡'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-black font-mono text-white flex items-center gap-1.5 truncate">
            {symbol}
            <span
              className={`text-[10px] font-bold ${
                isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
              }`}
            >
              {changePercentFormatted}
            </span>
          </span>
          <span className="text-[11px] font-bold font-mono text-[#94A3B8]">
            {priceFormatted}
          </span>
        </div>
      </div>

      <button
        onClick={onOpenOrder}
        className="px-4 py-2 rounded-xl bg-[#2962FF] hover:bg-[#1D4ED8] text-white font-bold text-xs font-sans shadow-lg shadow-blue-500/25 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
      >
        <Zap size={13} className="fill-white" />
        <span>Operar</span>
      </button>
    </div>
  );
};
