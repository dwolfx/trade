import React from 'react';
import { formatBRL } from '../../utils/formatters';

interface OrderSummaryCardProps {
  netTotal: number;
  fees: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ netTotal, fees }) => {
  return (
    <div className="p-3.5 bg-[#0B0F19] rounded-xl border border-[#1E293B] flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span>Total estimado (+ taxas B3):</span>
        <span className="text-[10px] text-[#64748B]">Emol: {formatBRL(fees)}</span>
      </div>
      <div className="text-xl font-black font-mono tracking-tight text-white">
        {formatBRL(netTotal)}
      </div>
    </div>
  );
};
