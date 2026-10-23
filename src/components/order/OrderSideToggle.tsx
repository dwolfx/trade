import React from 'react';
import { OrderSide } from '../../types/market';

interface OrderSideToggleProps {
  side: OrderSide;
  onChange: (side: OrderSide) => void;
}

export const OrderSideToggle: React.FC<OrderSideToggleProps> = ({ side, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2 bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B]">
      <button
        type="button"
        onClick={() => onChange('buy')}
        className={`py-2.5 rounded-lg text-xs font-black tracking-wider transition-all ${
          side === 'buy'
            ? 'bg-[#0284C7] text-white shadow-lg shadow-sky-600/30'
            : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        COMPRAR
      </button>
      <button
        type="button"
        onClick={() => onChange('sell')}
        className={`py-2.5 rounded-lg text-xs font-black tracking-wider transition-all ${
          side === 'sell'
            ? 'bg-[#F43F5E] text-white shadow-lg shadow-rose-600/30'
            : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        VENDER
      </button>
    </div>
  );
};
