import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { computeSquarifiedTreemap, TreemapItem, TreemapRect } from '../../utils/treemap';
import {
  B3_HEATMAP_DATA,
  CRYPTO_HEATMAP_DATA,
} from '../../data/heatmapData';
import { PageHeader } from '../common/PageHeader';

export interface HeatmapItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  marketCap: number; // in billions
  price: number;
  changePercent: number;
  volume: string;
  isB3: boolean;
}

export interface MarketHeatmapProps {
  onSelectAsset?: (symbol: string) => void;
  onOpenOrder?: (symbol: string) => void;
  onNavigate?: (nav: any) => void;
}

export type HeatmapRange = '1D' | '5D' | '1M' | '1A';
export type SizingMetric = 'marketCap' | 'volume';

/**
 * Retorna as cores de fundo e borda com base no percentual de variação
 * Paleta sofisticada Finviz / TradingView para tema Dark
 */
export function getHeatmapTileStyle(changePercent: number): {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
} {
  if (changePercent >= 5) {
    return {
      bg: 'bg-[#059669]',
      border: 'border-[#10B981]/50',
      text: 'text-white',
      badgeBg: 'bg-emerald-950/60 text-emerald-200 border-emerald-400/40',
    };
  }
  if (changePercent >= 2) {
    return {
      bg: 'bg-[#15803D]',
      border: 'border-[#22C55E]/40',
      text: 'text-white',
      badgeBg: 'bg-emerald-950/50 text-emerald-200 border-emerald-500/30',
    };
  }
  if (changePercent >= 0.5) {
    return {
      bg: 'bg-[#166534]',
      border: 'border-[#16A34A]/30',
      text: 'text-white',
      badgeBg: 'bg-emerald-950/40 text-emerald-200 border-emerald-600/30',
    };
  }
  if (changePercent > 0.05) {
    return {
      bg: 'bg-[#064E3B]',
      border: 'border-[#059669]/25',
      text: 'text-emerald-100',
      badgeBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-700/30',
    };
  }
  if (changePercent >= -0.05) {
    return {
      bg: 'bg-[#1E293B]',
      border: 'border-[#334155]',
      text: 'text-slate-200',
      badgeBg: 'bg-slate-800 text-slate-300 border-slate-600/30',
    };
  }
  if (changePercent >= -0.5) {
    return {
      bg: 'bg-[#4C0519]',
      border: 'border-[#881337]/30',
      text: 'text-rose-100',
      badgeBg: 'bg-rose-950/40 text-rose-300 border-rose-700/30',
    };
  }
  if (changePercent >= -2) {
    return {
      bg: 'bg-[#881337]',
      border: 'border-[#9F1239]/35',
      text: 'text-white',
      badgeBg: 'bg-rose-950/50 text-rose-200 border-rose-600/30',
    };
  }
  if (changePercent >= -5) {
    return {
      bg: 'bg-[#9F1239]',
      border: 'border-[#E11D48]/40',
      text: 'text-white',
      badgeBg: 'bg-rose-950/60 text-rose-200 border-rose-500/40',
    };
  }
  // <= -5%
  return {
    bg: 'bg-[#BE123C]',
    border: 'border-[#F43F5E]/50',
    text: 'text-white',
    badgeBg: 'bg-rose-950/70 text-rose-100 border-rose-400/50',
  };
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  onSelectAsset,
  onOpenOrder,
}) => {
  const { assets, selectOrCreateAsset } = useMarket();

  // Mode and filter states
  const [marketMode, setMarketMode] = useState<'b3' | 'crypto'>('b3');
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [selectedRange, setSelectedRange] = useState<HeatmapRange>('1D');
  const [sizingMetric, setSizingMetric] = useState<SizingMetric>('marketCap');

  // Tooltip & container states
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 650,
  });
  const [hoveredTile, setHoveredTile] = useState<{
    item: HeatmapItem;
    x: number;
    y: number;
  } | null>(null);

  // ResizeObserver for responsive fluid canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          // Dynamic responsive height: between 540px and 760px depending on screen height
          const computedHeight = Math.max(540, Math.min(780, window.innerHeight - 300));
          setDimensions({
            width: rect.width,
            height: computedHeight,
          });
        }
      }
    };

    updateSize();

    let resizeObserver: { observe: (el: Element) => void; disconnect: () => void } | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const RO = (window as unknown as { ResizeObserver: new (cb: () => void) => { observe: (el: Element) => void; disconnect: () => void } }).ResizeObserver;
      resizeObserver = new RO(() => {
        updateSize();
      });
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Multipliers for timeframes
  const timeframeMultiplier = useMemo(() => {
    switch (selectedRange) {
      case '1D':
        return 1;
      case '5D':
        return 2.1;
      case '1M':
        return 3.6;
      case '1A':
        return 5.2;
      default:
        return 1;
    }
  }, [selectedRange]);

  // Enriched raw dataset (cross-referenced with MarketContext live prices)
  const rawDataset: HeatmapItem[] = useMemo(() => {
    if (marketMode === 'b3') {
      return B3_HEATMAP_DATA.map(meta => {
        const live = assets.find(a => a.symbol === meta.symbol);
        const livePrice = live ? live.price : meta.defaultPrice;
        let change = live ? live.changePercent : meta.defaultChangePercent;

        if (selectedRange !== '1D') {
          // Apply realistic period factor based on historical default variation
          change = parseFloat((meta.defaultChangePercent * (timeframeMultiplier * 0.4 + 0.6)).toFixed(2));
        }

        const vol = live ? live.volume : `${(meta.marketCapBRL * 0.08).toFixed(1)}M`;

        return {
          id: meta.symbol,
          symbol: meta.symbol,
          name: meta.name,
          sector: meta.sector,
          marketCap: meta.marketCapBRL,
          price: livePrice,
          changePercent: change,
          volume: vol,
          isB3: true,
        };
      });
    } else {
      // Crypto Mode
      return CRYPTO_HEATMAP_DATA.map(meta => {
        let change = meta.defaultChangePercent;
        if (selectedRange !== '1D') {
          change = parseFloat((meta.defaultChangePercent * (timeframeMultiplier * 0.5 + 0.5)).toFixed(2));
        }
        return {
          id: meta.symbol,
          symbol: meta.symbol,
          name: meta.name,
          sector: meta.sector,
          marketCap: meta.marketCapUSD,
          price: meta.defaultPriceUSD,
          changePercent: change,
          volume: `$ ${(meta.marketCapUSD * 0.05).toFixed(1)}B`,
          isB3: false,
        };
      });
    }
  }, [marketMode, assets, selectedRange, timeframeMultiplier]);

  // Available sectors for filter dropdown
  const availableSectors = useMemo(() => {
    const sectors = Array.from(new Set(rawDataset.map(d => d.sector)));
    return ['todos', ...sectors];
  }, [rawDataset]);

  // Filtered dataset
  const dataset = useMemo(() => {
    if (selectedSector === 'todos') return rawDataset;
    return rawDataset.filter(d => d.sector === selectedSector);
  }, [rawDataset, selectedSector]);

  // Market Summary Statistics
  const stats = useMemo(() => {
    const totalCap = dataset.reduce((acc, cur) => acc + cur.marketCap, 0);
    const advancing = dataset.filter(d => d.changePercent > 0).length;
    const declining = dataset.filter(d => d.changePercent < 0).length;
    const neutral = dataset.filter(d => d.changePercent === 0).length;

    const sortedByChange = [...dataset].sort((a, b) => b.changePercent - a.changePercent);
    const topGainer = sortedByChange[0];
    const topLoser = sortedByChange[sortedByChange.length - 1];

    return {
      totalCap,
      advancing,
      declining,
      neutral,
      totalCount: dataset.length,
      advancingRatio: Math.round((advancing / (dataset.length || 1)) * 100),
      topGainer,
      topLoser,
    };
  }, [dataset]);

  // Hierarchical Treemap Layout computation
  const treemapLayout = useMemo(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0 || !dataset.length) return [];

    // If a specific sector is filtered, lay it out directly across 100% of the canvas
    if (selectedSector !== 'todos') {
      const items: TreemapItem<HeatmapItem>[] = dataset.map(item => ({
        id: item.id,
        value: sizingMetric === 'marketCap' ? item.marketCap : parseFloat(item.volume) || 10,
        data: item,
      }));
      return computeSquarifiedTreemap(items, width, height, 2);
    }

    // Hierarchical Finviz Clustering: First lay out sectors, then inside each sector lay out its assets
    const sectorsMap = new Map<string, HeatmapItem[]>();
    for (const item of dataset) {
      if (!sectorsMap.has(item.sector)) {
        sectorsMap.set(item.sector, []);
      }
      sectorsMap.get(item.sector)!.push(item);
    }

    // Sector boxes
    const sectorTreemapItems: TreemapItem<{ sector: string; items: HeatmapItem[] }>[] = Array.from(
      sectorsMap.entries()
    ).map(([sector, items]) => {
      const totalWeight = items.reduce(
        (sum, it) =>
          sum + (sizingMetric === 'marketCap' ? it.marketCap : parseFloat(it.volume) || 10),
        0
      );
      return {
        id: sector,
        value: totalWeight,
        data: { sector, items },
      };
    });

    const sectorRects = computeSquarifiedTreemap(sectorTreemapItems, width, height, 3);
    const finalRects: TreemapRect<HeatmapItem>[] = [];

    // For each sector box, compute inner squarified treemap
    for (const sRect of sectorRects) {
      const { items } = sRect.data;
      const headerHeight = sRect.height > 60 && sRect.width > 70 ? 22 : 0;
      const innerWidth = sRect.width;
      const innerHeight = Math.max(0, sRect.height - headerHeight);

      if (innerWidth <= 0 || innerHeight <= 0) continue;

      const innerItems: TreemapItem<HeatmapItem>[] = items.map(item => ({
        id: item.id,
        value: sizingMetric === 'marketCap' ? item.marketCap : parseFloat(item.volume) || 10,
        data: item,
      }));

      const innerRects = computeSquarifiedTreemap(innerItems, innerWidth, innerHeight, 1.5);

      for (const ir of innerRects) {
        finalRects.push({
          id: ir.id,
          x: sRect.x + ir.x,
          y: sRect.y + headerHeight + ir.y,
          width: ir.width,
          height: ir.height,
          data: ir.data,
        });
      }
    }

    return finalRects;
  }, [dimensions, dataset, selectedSector, sizingMetric]);

  // Sector container boxes for displaying sector labels (when in 'todos' mode)
  const sectorHeaders = useMemo(() => {
    if (selectedSector !== 'todos') return [];
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0 || !dataset.length) return [];

    const sectorsMap = new Map<string, HeatmapItem[]>();
    for (const item of dataset) {
      if (!sectorsMap.has(item.sector)) {
        sectorsMap.set(item.sector, []);
      }
      sectorsMap.get(item.sector)!.push(item);
    }

    const sectorTreemapItems: TreemapItem<{ sector: string; items: HeatmapItem[] }>[] = Array.from(
      sectorsMap.entries()
    ).map(([sector, items]) => {
      const totalWeight = items.reduce(
        (sum, it) =>
          sum + (sizingMetric === 'marketCap' ? it.marketCap : parseFloat(it.volume) || 10),
        0
      );
      return {
        id: sector,
        value: totalWeight,
        data: { sector, items },
      };
    });

    const sectorRects = computeSquarifiedTreemap(sectorTreemapItems, width, height, 3);
    return sectorRects.map(sRect => {
      const { sector, items } = sRect.data;
      const avgChange =
        items.reduce((acc, cur) => acc + cur.changePercent, 0) / (items.length || 1);
      return {
        id: sector,
        sector,
        x: sRect.x,
        y: sRect.y,
        width: sRect.width,
        height: sRect.height,
        avgChange,
        itemCount: items.length,
      };
    });
  }, [dimensions, dataset, selectedSector, sizingMetric]);

  const handleTileClick = (item: HeatmapItem) => {
    selectOrCreateAsset(item.symbol);
    if (onSelectAsset) {
      onSelectAsset(item.symbol);
    }
  };

  const handleOperarClick = (e: React.MouseEvent, item: HeatmapItem) => {
    e.stopPropagation();
    selectOrCreateAsset(item.symbol);
    if (onOpenOrder) {
      onOpenOrder(item.symbol);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in duration-300 select-none">
      {/* Centralized Page Header with Design System */}
      <PageHeader
        page="heatmap"
        rightActions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Market Mode Switcher (B3 vs Crypto) */}
            <div className="inline-flex rounded-xl bg-[#0F1523] p-1 border border-[#1E293B] shadow-inner">
              <button
                onClick={() => {
                  setMarketMode('b3');
                  setSelectedSector('todos');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  marketMode === 'b3'
                    ? 'bg-[#2962FF] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>Bolsa B3 (Ações)</span>
              </button>
              <button
                onClick={() => {
                  setMarketMode('crypto');
                  setSelectedSector('todos');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  marketMode === 'crypto'
                    ? 'bg-[#2962FF] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>Cripto 24/7</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Control Bar: Timeframe, Sector Filter, Sizing, and Stats */}
      <div className="w-full bg-[#0F1523] border border-[#1E293B] rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-lg">
        {/* Left: Timeframe range buttons & Sector Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider mr-1 hidden sm:block">
            Período:
          </div>
          <div className="inline-flex rounded-xl bg-[#0B0F19] p-1 border border-[#1E293B]">
            {(['1D', '5D', '1M', '1A'] as HeatmapRange[]).map(range => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedRange === range
                    ? 'bg-[#1E293B] text-[#38BDF8] shadow-sm border border-sky-500/20'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-[#1E293B] mx-1 hidden sm:block" />

          {/* Sector Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="bg-[#0B0F19] border border-[#1E293B] hover:border-slate-600 text-xs font-semibold text-white px-3 py-1.5 rounded-xl appearance-none pr-8 cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Setores ({rawDataset.length})</option>
              {availableSectors
                .filter(s => s !== 'todos')
                .map(sec => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
          </div>

          {/* Sizing Metric Toggle */}
          <div className="inline-flex rounded-xl bg-[#0B0F19] p-1 border border-[#1E293B]">
            <button
              onClick={() => setSizingMetric('marketCap')}
              title="Área proporcional ao Valor de Mercado (Market Cap)"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                sizingMetric === 'marketCap'
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSizingMetric('volume')}
              title="Área proporcional ao Volume de Negociação"
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                sizingMetric === 'volume'
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>
        </div>

        {/* Right: Real-time Stats & Color Scale Legend */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-between lg:justify-end">
          {/* Breadth: Advancing vs Declining */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <TrendingUp size={13} />
              <span>{stats.advancing} em Alta</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400 font-bold bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <TrendingDown size={13} />
              <span>{stats.declining} em Baixa</span>
            </div>
          </div>

          {/* Finviz Color Scale Legend */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#94A3B8]">
            <span>-5%</span>
            <div className="flex items-center h-3 rounded overflow-hidden border border-[#1E293B]">
              <span className="w-4 h-full bg-[#BE123C]" title="Queda severa (-5% ou mais)" />
              <span className="w-4 h-full bg-[#9F1239]" title="-2% a -5%" />
              <span className="w-4 h-full bg-[#881337]" title="-0.5% a -2%" />
              <span className="w-4 h-full bg-[#1E293B]" title="Neutro (0%)" />
              <span className="w-4 h-full bg-[#166534]" title="+0.5% a +2%" />
              <span className="w-4 h-full bg-[#15803D]" title="+2% a +5%" />
              <span className="w-4 h-full bg-[#059669]" title="Alta forte (+5% ou mais)" />
            </div>
            <span>+5%</span>
          </div>
        </div>
      </div>

      {/* Main Treemap Canvas Container */}
      <div
        ref={containerRef}
        className="w-full relative bg-[#090D16] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl transition-all"
        style={{ height: `${dimensions.height}px` }}
      >
        {/* Sector Labels Overlay (when viewing all sectors) */}
        {selectedSector === 'todos' &&
          sectorHeaders.map(s => (
            <div
              key={`sh-${s.id}`}
              className="absolute pointer-events-none z-10 flex items-center justify-between px-2 pt-1 overflow-hidden"
              style={{
                left: `${s.x}px`,
                top: `${s.y}px`,
                width: `${s.width}px`,
                height: `${s.height}px`,
                border: '1.5px solid rgba(51, 65, 85, 0.4)',
                borderRadius: '6px',
              }}
            >
              {s.width > 70 && s.height > 50 && (
                <div className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]/90 bg-[#0B0F19]/80 backdrop-blur-xs px-2 py-0.5 rounded border border-white/5 shadow-xs">
                  <span className="truncate pr-1">{s.sector}</span>
                  <span
                    className={`font-mono text-[9px] ${
                      s.avgChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {s.avgChange >= 0 ? '+' : ''}
                    {s.avgChange.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ))}

        {/* Heatmap Tiles */}
        {treemapLayout.map(rect => {
          const item = rect.data;
          const style = getHeatmapTileStyle(item.changePercent);
          const isHovered = hoveredTile?.item.id === item.id;

          const isLarge = rect.width >= 90 && rect.height >= 70;
          const isMedium = rect.width >= 55 && rect.height >= 45;
          const isCompact = !isMedium;

          return (
            <div
              key={rect.id}
              onClick={() => handleTileClick(item)}
              onMouseEnter={e => {
                const b = containerRef.current?.getBoundingClientRect();
                setHoveredTile({
                  item,
                  x: e.clientX - (b?.left || 0),
                  y: e.clientY - (b?.top || 0),
                });
              }}
              onMouseMove={e => {
                const b = containerRef.current?.getBoundingClientRect();
                setHoveredTile({
                  item,
                  x: e.clientX - (b?.left || 0),
                  y: e.clientY - (b?.top || 0),
                });
              }}
              onMouseLeave={() => setHoveredTile(null)}
              className={`absolute cursor-pointer transition-all duration-150 flex flex-col items-center justify-center text-center p-1 overflow-hidden select-none group border ${
                style.bg
              } ${style.border} ${
                isHovered
                  ? 'z-30 ring-2 ring-white scale-[1.01] shadow-2xl'
                  : 'hover:brightness-110'
              }`}
              style={{
                left: `${rect.x}px`,
                top: `${rect.y}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                borderRadius: '4px',
              }}
            >
              {/* Large Tile View */}
              {isLarge && (
                <div className="flex flex-col items-center justify-center gap-0.5 max-w-full">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white drop-shadow-md">
                    {item.symbol}
                  </span>
                  <span
                    className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded border leading-tight ${style.badgeBg} shadow-inner`}
                  >
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-[11px] font-mono text-white/90 font-medium">
                    {item.isB3 ? 'R$' : '$'}{' '}
                    {item.price >= 1000
                      ? item.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
                      : item.price.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-white/70 truncate max-w-[90%] font-medium">
                    {item.name}
                  </span>
                </div>
              )}

              {/* Medium Tile View */}
              {!isLarge && isMedium && (
                <div className="flex flex-col items-center justify-center gap-0.5 max-w-full">
                  <span className="font-bold text-xs sm:text-sm tracking-tight leading-none text-white drop-shadow-sm">
                    {item.symbol}
                  </span>
                  <span className="font-mono font-extrabold text-[11px] leading-tight text-white drop-shadow-xs">
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(1)}%
                  </span>
                  {rect.height >= 55 && (
                    <span className="text-[10px] font-mono text-white/80 leading-none">
                      {item.isB3 ? 'R$' : '$'} {item.price.toFixed(1)}
                    </span>
                  )}
                </div>
              )}

              {/* Compact / Tiny Tile View */}
              {isCompact && (
                <div className="flex flex-col items-center justify-center leading-none max-w-full">
                  <span className="font-bold text-[10px] text-white leading-none truncate">
                    {item.symbol}
                  </span>
                  {rect.height >= 26 && rect.width >= 35 && (
                    <span className="text-[9px] font-mono font-semibold text-white/90 leading-tight">
                      {item.changePercent >= 0 ? '+' : ''}
                      {item.changePercent.toFixed(0)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Rich Floating Interactive Tooltip */}
        {hoveredTile && (
          <div
            className="absolute z-40 pointer-events-none transition-transform duration-75"
            style={{
              left: `${Math.min(dimensions.width - 240, Math.max(10, hoveredTile.x + 16))}px`,
              top: `${Math.min(dimensions.height - 180, Math.max(10, hoveredTile.y + 16))}px`,
            }}
          >
            <div className="w-[230px] bg-[#0B0F19]/95 backdrop-blur-md border border-[#334155] rounded-xl p-3 shadow-2xl text-left pointer-events-auto animate-in fade-in duration-150">
              {/* Header: Ticker, Name & Sector */}
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#1E293B]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-base leading-none">
                      {hoveredTile.item.symbol}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-[#60A5FA] border border-blue-500/30">
                      {hoveredTile.item.isB3 ? 'B3' : 'CRYPTO'}
                    </span>
                  </div>
                  <div className="text-xs text-[#94A3B8] font-medium mt-0.5 truncate max-w-[150px]">
                    {hoveredTile.item.name}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#64748B] text-right">
                  {hoveredTile.item.sector}
                </div>
              </div>

              {/* Price & Variation */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#64748B] uppercase">Preço Atual</div>
                  <div className="text-base font-extrabold font-mono text-white">
                    {hoveredTile.item.isB3 ? 'R$' : '$'}{' '}
                    {hoveredTile.item.price >= 1000
                      ? hoveredTile.item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                      : hoveredTile.item.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#64748B] uppercase">Variação {selectedRange}</div>
                  <div
                    className={`text-sm font-extrabold font-mono flex items-center justify-end gap-0.5 ${
                      hoveredTile.item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {hoveredTile.item.changePercent >= 0 ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    <span>
                      {hoveredTile.item.changePercent >= 0 ? '+' : ''}
                      {hoveredTile.item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Extra Stats: Cap & Volume */}
              <div className="pt-2 border-t border-[#1E293B] grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-[#64748B] block text-[9px]">MARKET CAP</span>
                  <span className="text-[#CBD5E1] font-semibold">
                    {hoveredTile.item.isB3 ? 'R$' : '$'} {hoveredTile.item.marketCap}B
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#64748B] block text-[9px]">VOLUME</span>
                  <span className="text-[#CBD5E1] font-semibold">
                    {hoveredTile.item.volume}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center gap-1.5">
                <button
                  onClick={() => handleTileClick(hoveredTile.item)}
                  className="flex-1 py-1.5 px-2 bg-[#1E293B] hover:bg-[#2962FF] text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BarChart3 size={12} />
                  <span>Ver Gráfico</span>
                </button>
                <button
                  onClick={e => handleOperarClick(e, hoveredTile.item)}
                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                >
                  <Zap size={12} />
                  <span>Operar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Instructions */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] px-1 py-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
          <span>
            {marketMode === 'b3'
              ? 'Mapa de Calor B3 sincronizado com cotações e livro de ofertas'
              : 'Mapa Cripto 24/7 com liquidez global'}
          </span>
        </div>
        <div className="font-mono text-[11px]">
          Algoritmo Squarified Treemap · Clique em qualquer ativo para ver gráfico ou abrir boleta
        </div>
      </div>
    </div>
  );
};
