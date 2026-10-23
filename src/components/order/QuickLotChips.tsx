import React from 'react';

interface QuickLotChipsProps {
  onAddLot: (lot: number) => void;
  onMax: () => void;
}

export const QuickLotChips: React.FC<QuickLotChipsProps> = ({ onAddLot, onMax }) => {
  return (
    <div className="grid grid-cols-4 gap-1.5 mt-1">
      <button
        type="button"
        onClick={() => onAddLot(100)}
        className="py-1.5 bg-[#0B0F19] hover:bg-[#1E293B] border border-[#1E293B] rounded-lg text-xs font-mono font-bold text-[#94A3B8] hover:text-white transition-colors"
      >
        +100
      </button>
      <button
        type="button"
        onClick={() => onAddLot(200)}
        className="py-1.5 bg-[#0B0F19] hover:bg-[#1E293B] border border-[#1E293B] rounded-lg text-xs font-mono font-bold text-[#94A3B8] hover:text-white transition-colors"
      >
        +200
      </button>
      <button
        type="button"
        onClick={() => onAddLot(500)}
        className="py-1.5 bg-[#0B0F19] hover:bg-[#1E293B] border border-[#1E293B] rounded-lg text-xs font-mono font-bold text-[#94A3B8] hover:text-white transition-colors"
      >
        +500
      </button>
      <button
        type="button"
        onClick={onMax}
        className="py-1.5 bg-[#161F33] hover:bg-[#2962FF] hover:text-white border border-[#1E293B] rounded-lg text-xs font-mono font-bold text-[#60A5FA] transition-colors"
      >
        Máx
      </button>
    </div>
  );
};
