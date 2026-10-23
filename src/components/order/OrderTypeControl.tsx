import React from 'react';
import { OrderType } from '../../types/market';

interface OrderTypeControlProps {
  orderType: OrderType;
  onChange: (type: OrderType) => void;
}

export const OrderTypeControl: React.FC<OrderTypeControlProps> = ({ orderType, onChange }) => {
  const options: { type: OrderType; label: string }[] = [
    { type: 'market', label: 'A Mercado' },
    { type: 'limit', label: 'Limite' },
    { type: 'stop', label: 'Stop' },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#94A3B8] font-medium">Tipo de Execução</label>
      <div className="grid grid-cols-3 gap-1 bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B]">
        {options.map(({ type, label }) => {
          const isSelected = orderType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#1E293B] text-white shadow-sm border border-blue-500/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
