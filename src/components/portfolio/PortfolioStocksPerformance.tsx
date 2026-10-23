import React, { useState, useMemo } from 'react';
import { PortfolioPosition, NonEquityAsset } from '../../types/market';
import { TrendingUp, TrendingDown, ExternalLink, Building2, TrendingUpDown, Landmark } from 'lucide-react';

interface PortfolioStocksPerformanceProps {
  positions: PortfolioPosition[];
  nonEquityAssets: NonEquityAsset[];
  onSelectAsset?: (symbol: string) => void;
  showBalance: boolean;
}

type PerformanceFilter = 'todos' | 'acoes' | 'fiis' | 'cdb';

export const PortfolioStocksPerformance: React.FC<PortfolioStocksPerformanceProps> = ({
  positions,
  nonEquityAssets,
  onSelectAsset,
  showBalance,
}) => {
  const [activeFilter, setActiveFilter] = useState<PerformanceFilter>('todos');

  // Unified items with specific metrics
  const allItems = useMemo(() => {
    const stockItems = positions
      .filter(p => !p.symbol.endsWith('11'))
      .map(p => ({
        id: p.symbol,
        symbol: p.symbol,
        name: p.name,
        type: 'acoes' as const,
        plPercent: p.plPercent,
        plValue: p.plValue,
        avgPrice: p.avgPrice,
        currentPrice: p.currentPrice,
        quantity: p.quantity,
        metricLabel: `PM R$ ${p.avgPrice.toFixed(2)} → Atual R$ ${p.currentPrice.toFixed(2)}`,
        extraBadge: p.plPercent >= 0 ? `+${p.plPercent.toFixed(2)}% de alta` : `${p.plPercent.toFixed(2)}% em correção`,
        badgeColor: 'text-[#60A5FA] bg-blue-500/10 border-blue-500/20',
      }));

    const fiiItems = positions
      .filter(p => p.symbol.endsWith('11'))
      .map(p => {
        const lastDiv = p.symbol === 'HGLG11' ? 1.10 : 0.11;
        const dyMonthly = (lastDiv / p.currentPrice) * 100;
        return {
          id: p.symbol,
          symbol: p.symbol,
          name: p.name,
          type: 'fiis' as const,
          plPercent: p.plPercent,
          plValue: p.plValue,
          avgPrice: p.avgPrice,
          currentPrice: p.currentPrice,
          quantity: p.quantity,
          metricLabel: `Rendimento: R$ ${lastDiv.toFixed(2)}/cota (${dyMonthly.toFixed(2)}% a.m.)`,
          extraBadge: `DY Est. ${(dyMonthly * 12).toFixed(1)}% a.a.`,
          badgeColor: 'text-[#C084FC] bg-purple-500/10 border-purple-500/20',
        };
      });

    const cdbItems = nonEquityAssets
      .filter(ne => ne.category === 'cdb')
      .map(ne => ({
        id: ne.id,
        symbol: ne.name.split(' ')[0],
        name: ne.name,
        type: 'cdb' as const,
        plPercent: ne.plPercent,
        plValue: ne.plValue,
        avgPrice: ne.investedAmount,
        currentPrice: ne.currentAmount,
        quantity: 1,
        metricLabel: `Taxa: ${ne.rateDescription} • ${ne.liquidity}`,
        extraBadge: ne.institution,
        badgeColor: 'text-[#38BDF8] bg-sky-500/10 border-sky-500/20',
      }));

    return [...stockItems, ...fiiItems, ...cdbItems];
  }, [positions, nonEquityAssets]);

  // Filtered items
  const filtered = useMemo(() => {
    if (activeFilter === 'todos') return allItems;
    return allItems.filter(i => i.type === activeFilter);
  }, [allItems, activeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => b.plPercent - a.plPercent);
  }, [filtered]);

  // Max reference range for the divergence bar (e.g. 50% or dynamic max)
  const maxScale = useMemo(() => {
    const highest = Math.max(...sorted.map(s => Math.abs(s.plPercent)), 20);
    return Math.ceil(highest / 10) * 10; // Round to nearest 10 (e.g., 60%)
  }, [sorted]);

  return (
    <div className="h-full p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col gap-4">
      {/* Header with Title and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              Desempenho Individual dos Ativos
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-[#38BDF8] border border-sky-500/20">
              {sorted.length} Ativos
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Retorno ponderado a partir do Preço Médio (PM = Ponto Zero Central)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-[#161F33] p-1 rounded-xl border border-[#1E293B] self-start sm:self-auto overflow-x-auto">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'acoes', label: 'Ações' },
            { key: 'fiis', label: 'FIIs' },
            { key: 'cdb', label: 'CDB & RF' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as PerformanceFilter)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-[#2962FF] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Bar List with Central Zero-Axis */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
        {sorted.map(item => {
          const isPositive = item.plPercent >= 0;
          // Calculate bar width (up to 50% of the total bar width starting from center)
          const barWidth = Math.min((Math.abs(item.plPercent) / maxScale) * 50, 50);

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'acoes' || item.type === 'fiis') {
                  onSelectAsset?.(item.symbol);
                }
              }}
              className={`p-3.5 rounded-xl bg-[#121929]/70 border border-[#1E293B]/60 hover:border-[#334155] transition-all group ${
                item.type === 'acoes' || item.type === 'fiis' ? 'cursor-pointer' : ''
              }`}
            >
              {/* Top row: Ticker, name, badges & P&L */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-white text-sm group-hover:text-[#60A5FA] transition-colors flex items-center gap-1">
                    {item.symbol}
                    {(item.type === 'acoes' || item.type === 'fiis') && (
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                    )}
                  </span>
                  <span className="text-[#94A3B8] text-[11px] truncate max-w-[130px] sm:max-w-xs font-sans">
                    {item.name}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${item.badgeColor}`}>
                    {item.extraBadge}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <div
                    className={`flex items-center gap-1 font-bold text-xs ${
                      isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
                    }`}
                  >
                    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{isPositive ? '+' : ''}{item.plPercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* DIVERGING BAR CHART WITH CENTRAL 0% (PM) AXIS */}
              <div className="relative py-1">
                {/* Bar Track */}
                <div className="w-full h-3 rounded-full bg-[#161F33] relative overflow-hidden flex items-center">
                  {/* Center Vertical Divider (0% line) */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#475569] z-20" />

                  {/* Profit Bar (Grows from 50% to the RIGHT) */}
                  {isPositive && (
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-sky-600 to-[#38BDF8] rounded-r-full transition-all duration-500"
                      style={{
                        left: '50%',
                        width: `${barWidth}%`,
                      }}
                    />
                  )}

                  {/* Loss Bar (Grows from 50% to the LEFT) */}
                  {!isPositive && (
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-l from-rose-500 to-[#F43F5E] rounded-l-full transition-all duration-500"
                      style={{
                        right: '50%',
                        width: `${barWidth}%`,
                      }}
                    />
                  )}
                </div>

                {/* Sub-scale ruler: -Scale | 0% PM | +Scale */}
                <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] mt-1 px-0.5 select-none">
                  <span className="text-[#F43F5E]/80">-{maxScale}%</span>
                  <span className="text-[#94A3B8] font-bold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#60A5FA]"></span> 0% (Preço Médio)
                  </span>
                  <span className="text-[#38BDF8]/80">+{maxScale}%</span>
                </div>
              </div>

              {/* Bottom Details */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] mt-1 pt-1.5 border-t border-[#1E293B]/40">
                <span className="flex items-center gap-1">
                  {item.type === 'acoes' && <TrendingUpDown size={11} className="text-[#60A5FA]" />}
                  {item.type === 'fiis' && <Building2 size={11} className="text-[#C084FC]" />}
                  {item.type === 'cdb' && <Landmark size={11} className="text-[#38BDF8]" />}
                  {item.metricLabel}
                </span>
                <span className={`font-bold ${isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}`}>
                  {showBalance ? (
                    `${isPositive ? '+' : ''}R$ ${item.plValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  ) : (
                    '••••••'
                  )}
                </span>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="py-12 text-center text-xs text-[#64748B]">
            Nenhum ativo nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
};
