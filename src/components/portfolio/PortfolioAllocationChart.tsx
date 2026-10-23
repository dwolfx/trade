import React, { useState } from 'react';
import { Layers } from 'lucide-react';

export interface AllocationCategoryItem {
  key: string;
  label: string;
  value: number;
  color: string;
  icon?: string;
  description: string;
}

interface PortfolioAllocationChartProps {
  categories: AllocationCategoryItem[];
  totalPatrimony: number;
  showBalance: boolean;
  onSelectCategory?: (key: string) => void;
  selectedCategory?: string;
}

export const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({
  categories,
  totalPatrimony,
  showBalance,
  onSelectCategory,
  selectedCategory,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const radius = 75;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  // Calculate angles and offsets for SVG Donut
  let accumulatedPercent = 0;
  const slices = categories.map(cat => {
    const percent = totalPatrimony > 0 ? (cat.value / totalPatrimony) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      ...cat,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory =
    categories.find(c => c.key === (hoveredKey || selectedCategory)) || categories[0];

  return (
    <div className="h-full p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              Alocação Patrimonial por Classe
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-[#818CF8] border border-indigo-500/20">
              5 Classes
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            FIIs, Ações, CDB, Poupança e Margem Day Trade
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#161F33] text-[#818CF8] flex items-center justify-center">
          <Layers size={16} />
        </div>
      </div>

      {/* Donut and Legend Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4">
        {/* Left: SVG Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#161F33"
                strokeWidth={strokeWidth}
              />
              {/* Slices */}
              {slices.map(slice => {
                const isHovered = hoveredKey === slice.key;
                const isSelected = selectedCategory === slice.key;
                return (
                  <circle
                    key={slice.key}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered || isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredKey(slice.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => onSelectCategory?.(slice.key)}
                    opacity={hoveredKey && !isHovered ? 0.45 : 1}
                  />
                );
              })}
            </svg>

            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none px-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                {activeCategory?.label}
              </span>
              <span className="text-xl font-black font-mono text-white mt-0.5">
                {activeCategory && totalPatrimony > 0
                  ? `${((activeCategory.value / totalPatrimony) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
              <span className="text-[11px] font-mono text-[#94A3B8]">
                {showBalance && activeCategory
                  ? `R$ ${activeCategory.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                  : '••••••'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Legend & Breakdowns */}
        <div className="md:col-span-7 flex flex-col gap-2.5">
          {categories.map(cat => {
            const percent = totalPatrimony > 0 ? (cat.value / totalPatrimony) * 100 : 0;
            const isHovered = hoveredKey === cat.key;
            const isSelected = selectedCategory === cat.key;

            return (
              <div
                key={cat.key}
                onMouseEnter={() => setHoveredKey(cat.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => onSelectCategory?.(cat.key)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isHovered || isSelected
                    ? 'bg-[#161F33] border-[#3B82F6]'
                    : 'bg-[#121929]/60 border-[#1E293B]/70 hover:border-[#334155]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{cat.label}</span>
                      <span className="text-[10px] text-[#64748B] font-normal hidden sm:inline">
                        • {cat.description}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {showBalance
                        ? `R$ ${cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '••••••••••'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black font-mono text-white block">
                    {percent.toFixed(1)}%
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-[#161F33] overflow-hidden mt-1 ml-auto">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percent}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
