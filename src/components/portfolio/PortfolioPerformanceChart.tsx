import React, { useState } from 'react';
import { PORTFOLIO_HISTORY_BY_TIMEFRAME, PortfolioTimeframeRange } from '../../data/mockPortfolioData';
import { TrendingUp, Sparkles } from 'lucide-react';

interface PortfolioPerformanceChartProps {
  showBalance: boolean;
  totalPatrimony: number;
  totalPL: number;
}

export const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({
  showBalance,
  totalPatrimony,
  totalPL,
}) => {
  const [selectedRange, setSelectedRange] = useState<PortfolioTimeframeRange>('6M');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Dynamic data points matching selected timeframe
  const data = PORTFOLIO_HISTORY_BY_TIMEFRAME[selectedRange];

  const minVal = Math.min(...data.map(d => d.totalPatrimony)) * 0.97;
  const maxVal = Math.max(...data.map(d => d.totalPatrimony)) * 1.03;
  const range = maxVal - minVal || 1;

  const svgWidth = 720;
  const svgHeight = 250;
  const paddingX = selectedRange === '1A' || selectedRange === 'HOJE' ? 32 : 40;
  const paddingY = 35;

  // Generate SVG points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.totalPatrimony - minVal) / range) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  const activeIndex = hoveredIndex !== null ? hoveredIndex : points.length - 1;
  const activePoint = points[activeIndex];
  const displayedPatrimony = hoveredIndex !== null ? activePoint.totalPatrimony : totalPatrimony;
  const displayedPL = hoveredIndex !== null ? activePoint.plAccumulated : totalPL;
  const displayedDate = hoveredIndex !== null ? activePoint.date : `Último (${selectedRange})`;

  // Calculate slice width for vertical column hover
  const sliceWidth = (svgWidth - paddingX * 2) / (points.length - 1 || 1);

  const rangeButtons: { id: PortfolioTimeframeRange; label: string }[] = [
    { id: 'HOJE', label: 'Hoje' },
    { id: '1S', label: '1 Sem' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '6M', label: '6M' },
    { id: '1A', label: '1A' },
    { id: 'ALL', label: 'Tudo' },
  ];

  return (
    <div className="h-full p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between">
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              Evolução Patrimonial & Ganho/Perda (P&L)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-[#60A5FA] border border-blue-500/20 flex items-center gap-1">
              <Sparkles size={11} /> Alpha Positivo
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {selectedRange === '1A' ? 'Histórico completo dos últimos 12 meses' : 'Desempenho histórico consolidado e retorno acumulado'}
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center bg-[#161F33] p-1 rounded-xl border border-[#1E293B] overflow-x-auto scrollbar-none">
          {rangeButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setSelectedRange(btn.id);
                setHoveredIndex(null); // Reset hover to latest point
              }}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap ${
                selectedRange === btn.id
                  ? 'bg-[#2962FF] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot on Top of Chart */}
      <div className="py-4 flex flex-wrap items-baseline gap-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold block">
            {hoveredIndex !== null ? `Patrimônio em ${displayedDate}` : 'Patrimônio Total Consolidado'}
          </span>
          <div className="text-2xl font-black font-mono text-white mt-0.5">
            {showBalance
              ? `R$ ${displayedPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '••••••••••'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#38BDF8]" />
            <div>
              <span className="text-[10px] text-[#94A3B8] block">P&L ({displayedDate})</span>
              <span className={`text-xs font-bold font-mono ${displayedPL >= 0 ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}`}>
                {showBalance
                  ? `${displayedPL >= 0 ? '+' : ''}R$ ${displayedPL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '••••••'}
              </span>
            </div>
          </div>

          <div className="text-xs text-[#94A3B8] hidden md:block">
            <span>Benchmark: </span>
            <span className="text-[#38BDF8] font-mono font-bold">Ibov +6.4%</span>
            <span className="mx-1.5">•</span>
            <span className="text-[#60A5FA] font-mono font-bold">CDI +5.2%</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="w-full flex-1 min-h-[230px] relative select-none flex items-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2962FF" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#2962FF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#2962FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2962FF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0.2, 0.5, 0.8].map((ratio, idx) => {
            const y = paddingY + ratio * (svgHeight - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="#1E293B"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Active Vertical Crosshair Line (Guide Line) */}
          <line
            x1={activePoint.x}
            y1={paddingY}
            x2={activePoint.x}
            y2={svgHeight - paddingY}
            stroke="#3B82F6"
            strokeDasharray="3 3"
            strokeWidth="1.5"
            opacity="0.75"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#equityGradient)" />

          {/* Main stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Full-Column Hover/Click Catchers */}
          {points.map((p, idx) => {
            const colX = idx === 0 ? 0 : p.x - sliceWidth / 2;
            const colW = idx === 0 || idx === points.length - 1 ? sliceWidth * 1.2 : sliceWidth;

            return (
              <rect
                key={`col-${idx}`}
                x={colX}
                y={0}
                width={colW}
                height={svgHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onClick={() => setHoveredIndex(idx)}
              />
            );
          })}

          {/* Dots and Labels */}
          {points.map((p, idx) => {
            const isActive = activeIndex === idx;

            return (
              <g key={`point-${idx}`} className="cursor-pointer">
                {/* Visible dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 7 : (selectedRange === '1A' ? 3.5 : 4.5)}
                  className={`transition-all duration-150 ${
                    isActive
                      ? 'fill-[#38BDF8] stroke-white stroke-2'
                      : 'fill-[#0F1523] stroke-[#3B82F6] stroke-2'
                  }`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onClick={() => setHoveredIndex(idx)}
                />

                {/* Date Label on X Axis */}
                <text
                  x={p.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className={`font-mono transition-colors cursor-pointer ${
                    isActive
                      ? 'fill-[#60A5FA] font-bold'
                      : 'fill-[#64748B] hover:fill-[#94A3B8]'
                  } ${selectedRange === '1A' ? 'text-[9.5px]' : 'text-[11px]'}`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onClick={() => setHoveredIndex(idx)}
                >
                  {p.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-[#161F33] border border-blue-500/50 px-3 py-1.5 rounded-xl shadow-2xl text-left text-[11px] font-mono z-10 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`
            }}
          >
            <div className="text-white font-bold">{activePoint.date}</div>
            <div className="text-[#38BDF8]">
              +R$ {activePoint.plAccumulated.toLocaleString('pt-BR')}
            </div>
            <div className="text-[#94A3B8] text-[10px]">
              Patrimônio: R$ {activePoint.totalPatrimony.toLocaleString('pt-BR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
