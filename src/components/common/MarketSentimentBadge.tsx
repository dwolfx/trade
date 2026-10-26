import React from 'react';
import { Flame } from 'lucide-react';

export interface MarketSentimentBadgeProps {
  value: number; // 0 to 100
  classification: string;
  label?: string; // default: "Sentimento"
  colorClass?: string;
  title?: string;
}

export const MarketSentimentBadge: React.FC<MarketSentimentBadgeProps> = ({
  value,
  classification,
  label = 'Sentimento:',
  colorClass = 'text-[#F59E0B]',
  title,
}) => {
  return (
    <div
      className="flex items-center gap-2 bg-[#0F1523] border border-[#1E293B] px-3 py-1.5 rounded-xl text-xs shadow-sm hover:border-[#334155] transition-all cursor-help"
      title={title || `${label} ${value}/100 (${classification})`}
    >
      <Flame size={14} className={colorClass} />
      <span className="text-[#94A3B8] font-medium hidden sm:inline">{label}</span>
      <strong className="text-white font-mono">{value}/100</strong>
      <span className={`text-[11px] font-bold ${colorClass}`}>
        ({classification})
      </span>
    </div>
  );
};
