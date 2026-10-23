import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  step?: number;
  onChange: (qty: number) => void;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({ quantity, step = 100, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#94A3B8] font-medium">Quantidade de Ações</label>
      <div className="h-12 bg-[#141C2E] border border-[#1E293B] rounded-xl p-1 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, quantity - step))}
          className="w-10 h-10 rounded-lg bg-[#0F1523] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors font-bold text-base"
        >
          <Minus size={16} />
        </button>

        <div className="flex items-baseline gap-1 font-mono">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => onChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 bg-transparent text-center font-bold text-white text-base focus:outline-none"
          />
          <span className="text-xs text-[#64748B]">ações</span>
        </div>

        <button
          type="button"
          onClick={() => onChange(quantity + step)}
          className="w-10 h-10 rounded-lg bg-[#0F1523] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors font-bold text-base"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
