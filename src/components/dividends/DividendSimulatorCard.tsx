import React, { useState } from 'react';
import { Calculator, Zap } from 'lucide-react';
import { DividendCalendarItem } from '../../types/dividend';

interface DividendSimulatorCardProps {
  availableItems: DividendCalendarItem[];
  onOpenOrder: (symbol: string) => void;
}

export const DividendSimulatorCard: React.FC<DividendSimulatorCardProps> = ({
  availableItems,
  onOpenOrder,
}) => {
  // Deduplicate symbols
  const uniqueItems = React.useMemo(() => {
    const map = new Map<string, DividendCalendarItem>();
    availableItems.forEach((item) => {
      if (!map.has(item.symbol)) {
        map.set(item.symbol, item);
      }
    });
    return Array.from(map.values());
  }, [availableItems]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>('MXRF11');
  const [sharesCount, setSharesCount] = useState<number>(100);

  const currentItem = uniqueItems.find((i) => i.symbol === selectedSymbol) || uniqueItems[0];

  if (!currentItem) return null;

  const monthlyIncome = currentItem.valuePerShare * sharesCount;
  const annualIncome = currentItem.category === 'fii' ? monthlyIncome * 12 : monthlyIncome * 4; // FIIs pay 12x, stocks ~4x

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0F1523] via-[#161F33] to-[#0F1523] border border-[#1E293B] shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Simulador de Pinga-Pinga (Renda Passiva)
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300">
                Interativo
              </span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Descubra quanto você receberá por mês ou ano escolhendo qualquer FII ou Ação
            </p>
          </div>
        </div>

        {/* Quick select dropdown */}
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-[#0F1523] border border-[#1E293B] text-xs font-mono font-bold text-white focus:outline-none focus:border-[#2962FF]"
        >
          {uniqueItems.map((item) => (
            <option key={item.symbol} value={item.symbol}>
              {item.symbol} - {item.name.slice(0, 24)} ({item.category === 'fii' ? 'FII' : 'Ação'})
            </option>
          ))}
        </select>
      </div>

      {/* Inputs & Computation Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left: Quantity adjustment */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <label className="text-xs font-mono text-[#94A3B8] flex items-center justify-between">
            <span>Quantidade de cotas / ações:</span>
            <strong className="text-white font-bold">{sharesCount} cotas</strong>
          </label>

          <input
            type="range"
            min="10"
            max="2000"
            step="10"
            value={sharesCount}
            onChange={(e) => setSharesCount(Number(e.target.value))}
            className="w-full accent-[#2962FF] cursor-pointer"
          />

          {/* Quick preset chips */}
          <div className="flex items-center gap-2">
            {[50, 100, 300, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSharesCount(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  sharesCount === preset
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'bg-[#161F33] text-[#94A3B8] hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Calculations */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3 bg-[#0F1523]/80 p-3 rounded-xl border border-[#1E293B]">
          <div>
            <span className="text-[10px] font-mono text-[#64748B] block uppercase">
              {currentItem.category === 'fii' ? 'Renda Mensal' : 'Por Pagamento'}
            </span>
            <span className="text-lg font-mono font-black text-sky-400">
              R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#94A3B8] block">
              (R$ {currentItem.valuePerShare.toFixed(2)}/cota)
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#64748B] block uppercase">
              Renda Anual Proj.
            </span>
            <span className="text-lg font-mono font-black text-white">
              R$ {annualIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-300 block">
              Próx. pgto: {currentItem.paymentDateDisplay}
            </span>
          </div>
        </div>

        {/* Right: Buy action */}
        <div className="lg:col-span-3 flex flex-col justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenOrder(currentItem.symbol)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 text-white font-mono font-black text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Zap size={14} className="fill-white" />
            <span>Operar {currentItem.symbol}</span>
          </button>
          <span className="text-[10px] font-mono text-center text-[#64748B]">
            Data-COM: {currentItem.dateComDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};
