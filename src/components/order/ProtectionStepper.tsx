import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface ProtectionStepperProps {
  label: string;
  icon: React.ReactNode;
  price: number;
  percent: number;
  stepPercent?: number;
  minPercent?: number;
  textColorClass: string;
  onChangePercent: (val: number) => void;
}

export const ProtectionStepper: React.FC<ProtectionStepperProps> = ({
  label,
  icon,
  price,
  percent,
  stepPercent = 1,
  minPercent = 0.5,
  textColorClass,
  onChangePercent,
}) => {
  const isLoss = percent < 0;
  const sign = percent > 0 ? '+' : '';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#94A3B8] flex items-center gap-1">
          {icon} {label}
        </span>
        <span className={`font-mono font-bold ${textColorClass}`}>
          R$ {price.toFixed(2)}
        </span>
      </div>
      <div className="h-11 bg-[#141C2E] border border-[#1E293B] rounded-xl p-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChangePercent(Math.max(minPercent, percent - stepPercent))}
          className="w-9 h-9 rounded-lg bg-[#0F1523] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="text-xs font-mono font-bold text-white">
          R$ {price.toFixed(2)} ({isLoss ? '' : sign}{percent.toFixed(1)}%)
        </span>
        <button
          type="button"
          onClick={() => onChangePercent(percent + stepPercent)}
          className="w-9 h-9 rounded-lg bg-[#0F1523] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
