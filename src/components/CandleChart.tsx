import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { Timeframe, ChartRange, Candle } from '../types/market';
import { ChevronDown, Check, ArrowRight, Loader2, ChevronLeft, RotateCcw } from 'lucide-react';
import { BrazilFlag } from './common/BrazilFlag';
import { ChartHeader } from './chart/ChartHeader';
import { formatBRL, formatPercent } from '../utils/formatters';
import { MiniSlotCandleChart } from './chart/MiniSlotCandleChart';
import { THEME_COLORS } from '../styles/theme';

interface CandleChartProps {
  onOpenOrder?: (symbol: string) => void;
}

export const CandleChart: React.FC<CandleChartProps> = ({ onOpenOrder }) => {
  const {
    activeAsset,
    timeframe,
    setTimeframe,
    candles,
    isMultiChart,
    setIsMultiChart,
    assets,
    setActiveAsset,
    multiChartSymbols,
    setMultiChartSlot,
    selectOrCreateAsset,
    marketStatus,
    isLoadingCandles
  } = useMarket();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Range de visualização (Visão de tempo independente da periodicidade do candle)
  const [selectedRange, setSelectedRange] = useState<ChartRange>('1D');
  
  // Interactive Pan & Zoom
  const [panOffset, setPanOffset] = useState<number>(0);
  const [zoomCount, setZoomCount] = useState<number>(45);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPanRef = useRef(0);

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    candle: Candle;
  } | null>(null);

  const [openSlotPicker, setOpenSlotPicker] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState<string>('');

  const timeframes: { id: Timeframe; label: string; desc: string }[] = [
    { id: '1m', label: '1m', desc: '1 Minuto por vela' },
    { id: '5m', label: '5m', desc: '5 Minutos por vela' },
    { id: '15m', label: '15m', desc: '15 Minutos por vela' },
    { id: '1h', label: '1h', desc: '1 Hora por vela' },
    { id: '1D', label: '1D', desc: 'Diário (1 Dia por vela)' },
    { id: '1S', label: '1S', desc: 'Semanal (1 Semana por vela)' },
    { id: '1M', label: '1M', desc: 'Mensal (1 Mês por vela)' },
    { id: '1A', label: '1A', desc: 'Anual (1 Ano por vela)' },
  ];

  const ranges: { id: ChartRange; label: string; desc: string }[] = [
    { id: '1D', label: '1D', desc: 'Pregão de Hoje (Intraday)' },
    { id: '5D', label: '5D', desc: 'Últimos 5 Dias de Negociação' },
    { id: '1M', label: '1M', desc: '1 Mês' },
    { id: '6M', label: '6M', desc: '6 Meses' },
    { id: '1A', label: '1A', desc: '1 Ano' },
    { id: 'TUDO', label: 'Tudo', desc: 'Todo Histórico Disponível' },
  ];

  // Group candles by trading day for session navigation (1D mode)
  const sessionDays = useMemo(() => {
    const map = new Map<string, Candle[]>();
    candles.forEach(c => {
      const d = new Date(c.time);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries()).map(([key, dayCandles]) => ({
      key,
      date: new Date(dayCandles[0].time),
      candles: dayCandles
    }));
  }, [candles]);

  // Selected session day index in 1D mode (defaults to latest available day)
  const [selectedSessionIdx, setSelectedSessionIdx] = useState<number>(() => {
    return Math.max(0, sessionDays.length - 1);
  });

  // When candles update or symbol changes, snap to latest session
  useEffect(() => {
    if (sessionDays.length > 0) {
      setSelectedSessionIdx(sessionDays.length - 1);
      setPanOffset(0);
    }
  }, [sessionDays.length, activeAsset.symbol]);

  // If user clicks a daily/macro timeframe (1D, 1S, 1M, 1A), automatically adjust range to fit if in 1D
  const handleSelectTimeframe = (tf: Timeframe) => {
    setTimeframe(tf);
    setPanOffset(0);
  };

  // Compute active dataset to render based on selectedRange and panOffset
  const displayCandles = useMemo(() => {
    if (!candles.length) return [];

    let pool: Candle[] = [];

    const isIntraday = timeframe === '1m' || timeframe === '5m' || timeframe === '15m' || timeframe === '1h';

    if (selectedRange === '1D' && isIntraday && sessionDays.length > 0) {
      const safeIdx = Math.max(0, Math.min(sessionDays.length - 1, selectedSessionIdx));
      const sessionCandles = sessionDays[safeIdx]?.candles;
      pool = (sessionCandles && sessionCandles.length >= 2) ? sessionCandles : (candles.length > 60 ? candles.slice(-60) : candles);
    } else if (selectedRange === '1D') {
      // For daily/macro timeframes in 1D range, show the daily history series
      pool = candles.length > 60 ? candles.slice(-60) : candles;
    } else if (selectedRange === '5D' && sessionDays.length > 0) {
      // Last 5 trading days
      const last5Sessions = sessionDays.slice(-5);
      pool = last5Sessions.flatMap(s => s.candles);
    } else if (selectedRange === '1M') {
      const oneMonthAgo = Date.now() - 31 * 24 * 3600 * 1000;
      pool = candles.filter(c => c.time >= oneMonthAgo);
      if (pool.length < 20) pool = candles.slice(-40);
    } else if (selectedRange === '6M') {
      const sixMonthsAgo = Date.now() - 180 * 24 * 3600 * 1000;
      pool = candles.filter(c => c.time >= sixMonthsAgo);
      if (pool.length < 30) pool = candles.slice(-80);
    } else if (selectedRange === '1A') {
      const oneYearAgo = Date.now() - 365 * 24 * 3600 * 1000;
      pool = candles.filter(c => c.time >= oneYearAgo);
      if (pool.length < 40) pool = candles.slice(-120);
    } else {
      pool = candles;
    }

    if (pool.length === 0) pool = candles;

    // Apply panOffset (scrolling backwards into history)
    const effectiveCount = Math.min(pool.length, zoomCount);
    const maxOffset = Math.max(0, pool.length - effectiveCount);
    const currentOffset = Math.min(panOffset, maxOffset);

    const endIndex = pool.length - currentOffset;
    const startIndex = Math.max(0, endIndex - effectiveCount);

    return pool.slice(startIndex, endIndex);
  }, [candles, selectedRange, sessionDays, selectedSessionIdx, panOffset, zoomCount]);

  // Current session label for 1D mode
  const currentSessionDateLabel = useMemo(() => {
    if (!sessionDays.length) return '';
    const safeIdx = Math.max(0, Math.min(sessionDays.length - 1, selectedSessionIdx));
    const d = sessionDays[safeIdx]?.date;
    if (!d) return '';
    const isToday = safeIdx === sessionDays.length - 1;
    const formattedDate = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    return isToday ? `Hoje (${formattedDate})` : formattedDate;
  }, [sessionDays, selectedSessionIdx]);

  // Helper to format crosshair date
  const formatHoverDate = (timestamp: number) => {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('pt-BR');
    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateStr} às ${timeStr}`;
  };

  // Render Canvas
  useEffect(() => {
    if (isMultiChart) return;
    const canvas = canvasRef.current;
    if (!canvas || !displayCandles.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const rightAxisWidth = 65;
    const bottomAxisHeight = 28;
    const chartWidth = width - rightAxisWidth;
    const chartHeight = height - bottomAxisHeight;
    const volumeHeight = chartHeight * 0.20;
    const priceChartHeight = chartHeight - volumeHeight;

    // Background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    // Min / Max Price & Volume
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    displayCandles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const effectiveRange = maxPrice - minPrice;

    // Horizontal Price Grid Lines
    ctx.strokeStyle = '#161F33';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const price = minPrice + (effectiveRange / gridSteps) * i;
      const y = priceChartHeight - ((price - minPrice) / effectiveRange) * priceChartHeight;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillText(`R$ ${price.toFixed(2)}`, chartWidth + 6, y + 3.5);
    }

    const count = displayCandles.length;
    const step = chartWidth / count;
    const candleWidth = Math.min(28, Math.max(2, step * 0.70));

    // Detect Day Boundaries & Draw Vertical Session Separators
    const daySeparators: { index: number; x: number; dateLabel: string }[] = [];
    for (let i = 1; i < count; i++) {
      const prevDate = new Date(displayCandles[i - 1].time);
      const currDate = new Date(displayCandles[i].time);
      if (prevDate.toDateString() !== currDate.toDateString()) {
        const x = i * step;
        const day = currDate.getDate().toString().padStart(2, '0');
        const month = (currDate.getMonth() + 1).toString().padStart(2, '0');
        daySeparators.push({
          index: i,
          x,
          dateLabel: `${day}/${month}`
        });
      }
    }

    // Draw Day Delimiters (Vertical dashed line + date marker)
    daySeparators.forEach(sep => {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sep.x, 0);
      ctx.lineTo(sep.x, chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Day separator badge on bottom axis
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.roundRect(sep.x - 22, chartHeight + 4, 44, 18, 4);
      ctx.fill();

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sep.dateLabel, sep.x, chartHeight + 16);
    });

    // Draw Chronological Time Labels on Bottom Axis
    ctx.textAlign = 'center';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748B';

    // If all visible candles belong to one single day (1D mode)
    const isSingleDay = daySeparators.length === 0;
    const isMacroTimeframe = timeframe === '1D' || timeframe === '1S' || timeframe === '1M' || timeframe === '1A' || selectedRange === '1M' || selectedRange === '6M' || selectedRange === '1A';

    if (isSingleDay && !isMacroTimeframe) {
      // Pick 5-6 evenly spaced timestamps across the day
      const interval = Math.max(1, Math.floor(count / 6));
      for (let i = 0; i < count; i += interval) {
        const x = i * step + step / 2;
        const d = new Date(displayCandles[i].time);
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        const timeLabel = `${hours}:${mins}`;

        ctx.strokeStyle = '#161F33';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.stroke();

        ctx.fillText(timeLabel, x, chartHeight + 17);
      }
    } else if (isMacroTimeframe) {
      // Show dates in ascending order
      const interval = Math.max(1, Math.floor(count / 6));
      for (let i = 0; i < count; i += interval) {
        const x = i * step + step / 2;
        const d = new Date(displayCandles[i].time);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const label = `${day}/${month}`;

        ctx.strokeStyle = '#161F33';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.stroke();

        ctx.fillText(label, x, chartHeight + 17);
      }
    } else {
      // Multi-day intraday: label hours avoiding collision with daySeparators
      const interval = Math.max(2, Math.floor(count / 7));
      for (let i = 0; i < count; i += interval) {
        const x = i * step + step / 2;
        // Skip if too close to any day separator (< 30px)
        const isNearSeparator = daySeparators.some(sep => Math.abs(sep.x - x) < 30);
        if (isNearSeparator) continue;

        const d = new Date(displayCandles[i].time);
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        const timeLabel = `${hours}:${mins}`;

        ctx.fillText(timeLabel, x, chartHeight + 17);
      }
    }

    // Draw Volume Bars
    displayCandles.forEach((c, i) => {
      const x = i * step + step / 2;
      const isBull = c.close >= c.open;
      const volBarH = (c.volume / (maxVolume || 1)) * volumeHeight;
      const volY = height - bottomAxisHeight - volBarH;
      ctx.fillStyle = isBull ? THEME_COLORS.profit.bg : THEME_COLORS.loss.bg;
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volBarH);
    });

    // Draw Candlesticks (Wick & Body)
    displayCandles.forEach((c, i) => {
      const x = i * step + step / 2;
      const openY = priceChartHeight - ((c.open - minPrice) / effectiveRange) * priceChartHeight;
      const closeY = priceChartHeight - ((c.close - minPrice) / effectiveRange) * priceChartHeight;
      const highY = priceChartHeight - ((c.high - minPrice) / effectiveRange) * priceChartHeight;
      const lowY = priceChartHeight - ((c.low - minPrice) / effectiveRange) * priceChartHeight;

      const isBull = c.close >= c.open;
      const color = isBull ? THEME_COLORS.profit.DEFAULT : THEME_COLORS.loss.DEFAULT;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    });

    // Current Price Line & Badge (for latest candle in display)
    const latestCandle = displayCandles[displayCandles.length - 1];
    const latestY = priceChartHeight - ((latestCandle.close - minPrice) / effectiveRange) * priceChartHeight;

    ctx.strokeStyle = '#2962FF';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, latestY);
    ctx.lineTo(chartWidth, latestY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price Pill on Right Axis
    ctx.fillStyle = '#2962FF';
    ctx.beginPath();
    ctx.roundRect(chartWidth + 2, latestY - 10, rightAxisWidth - 4, 20, 4);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${latestCandle.close.toFixed(2)}`, chartWidth + (rightAxisWidth / 2), latestY + 3.5);

    // Crosshair if hovering
    if (hoverInfo) {
      ctx.strokeStyle = '#64748B';
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(hoverInfo.x, 0);
      ctx.lineTo(hoverInfo.x, chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hoverInfo.y);
      ctx.lineTo(chartWidth, hoverInfo.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [displayCandles, hoverInfo, isMultiChart, timeframe, selectedRange]);

  // Mouse drag & hover handlers for pan & zoom
    // Global mouseup listener to avoid stuck drag state
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPanRef.current = panOffset;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !displayCandles.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const chartWidth = rect.width - 65;

    // Pan if dragging
    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      const step = chartWidth / displayCandles.length;
      const candleDelta = Math.round(deltaX / Math.max(4, step));
      setPanOffset(Math.max(0, dragStartPanRef.current + candleDelta));
      setHoverInfo(null);
      return;
    }

    if (x < 0 || x > chartWidth || y < 0 || y > rect.height - 28) {
      setHoverInfo(null);
      return;
    }

    const index = Math.min(
      displayCandles.length - 1,
      Math.max(0, Math.floor((x / chartWidth) * displayCandles.length))
    );

    setHoverInfo({
      x,
      y,
      candle: displayCandles[index]
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? -5 : 5;
    setZoomCount(prev => Math.max(15, Math.min(180, prev + zoomDelta)));
  };

    // Dynamic return calculation based on selectedRange (independent of candle timeframe, zoom or pan)
  const { periodChangePercent, isPeriodPositive, periodBadgeLabel } = useMemo(() => {
    if (selectedRange === '1D') {
      const isPastSession = sessionDays.length > 1 && selectedSessionIdx < sessionDays.length - 1;
      if (isPastSession && sessionDays[selectedSessionIdx]?.candles.length >= 2) {
        const pastCandles = sessionDays[selectedSessionIdx].candles;
        const start = pastCandles[0].open;
        const end = pastCandles[pastCandles.length - 1].close;
        const pct = start > 0 ? ((end - start) / start) * 100 : 0;
        return {
          periodChangePercent: pct,
          isPeriodPositive: pct >= 0,
          periodBadgeLabel: currentSessionDateLabel
        };
      }

      return {
        periodChangePercent: activeAsset.changePercent,
        isPeriodPositive: activeAsset.changePercent >= 0,
        periodBadgeLabel: '1D'
      };
    }

    if (!candles.length) {
      return {
        periodChangePercent: activeAsset.changePercent,
        isPeriodPositive: activeAsset.changePercent >= 0,
        periodBadgeLabel: selectedRange
      };
    }

    if (selectedRange === '5D') {
      let startPrice = candles[0].open;
      if (sessionDays.length >= 5) {
        startPrice = sessionDays[sessionDays.length - 5].candles[0].open;
      } else if (sessionDays.length > 0) {
        startPrice = sessionDays[0].candles[0].open;
      }
      const currentPrice = activeAsset.price;
      const pct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : activeAsset.changePercent;
      return {
        periodChangePercent: pct,
        isPeriodPositive: pct >= 0,
        periodBadgeLabel: '5D'
      };
    }

    if (selectedRange === '1M') {
      const oneMonthAgo = Date.now() - 31 * 24 * 3600 * 1000;
      const matching = candles.find(c => c.time >= oneMonthAgo) || candles[0];
      const startPrice = matching.open;
      const currentPrice = activeAsset.price;
      const pct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : activeAsset.changePercent;
      return {
        periodChangePercent: pct,
        isPeriodPositive: pct >= 0,
        periodBadgeLabel: '1M'
      };
    }

    if (selectedRange === '6M') {
      const sixMonthsAgo = Date.now() - 180 * 24 * 3600 * 1000;
      const matching = candles.find(c => c.time >= sixMonthsAgo) || candles[0];
      const startPrice = matching.open;
      const currentPrice = activeAsset.price;
      const pct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : activeAsset.changePercent;
      return {
        periodChangePercent: pct,
        isPeriodPositive: pct >= 0,
        periodBadgeLabel: '6M'
      };
    }

    if (selectedRange === '1A') {
      const oneYearAgo = Date.now() - 365 * 24 * 3600 * 1000;
      const matching = candles.find(c => c.time >= oneYearAgo) || candles[0];
      const startPrice = matching.open;
      const currentPrice = activeAsset.price;
      const pct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : activeAsset.changePercent;
      return {
        periodChangePercent: pct,
        isPeriodPositive: pct >= 0,
        periodBadgeLabel: '1A'
      };
    }

    // TUDO
    const startPrice = candles[0].open;
    const currentPrice = activeAsset.price;
    const pct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : activeAsset.changePercent;
    return {
      periodChangePercent: pct,
      isPeriodPositive: pct >= 0,
      periodBadgeLabel: 'Tudo'
    };
  }, [selectedRange, sessionDays, selectedSessionIdx, candles, activeAsset.price, activeAsset.changePercent, currentSessionDateLabel]);

  


  const filteredSlotAssets = assets.filter(
    a =>
      a.symbol.toLowerCase().includes(slotSearchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(slotSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm relative">
      {/* Chart Top Header & Controls */}
      <ChartHeader
        icon={<BrazilFlag size="md" />}
        symbol={activeAsset.symbol}
        exchangeLabel="· B3"
        name={activeAsset.name}
        priceFormatted={formatBRL(activeAsset.price)}
        changePercentFormatted={formatPercent(periodChangePercent)}
        isPositive={isPeriodPositive}
        periodBadge={periodBadgeLabel}
        onOpenOrder={onOpenOrder ? () => onOpenOrder(activeAsset.symbol) : undefined}
        timeframes={timeframes}
        activeTimeframe={timeframe}
        onSelectTimeframe={handleSelectTimeframe}
        statusBadge={
          isLoadingCandles ? (
            <span className="flex items-center gap-1.5 text-xs text-[#60A5FA]">
              <Loader2 size={12} className="animate-spin" /> Carregando...
            </span>
          ) : marketStatus.isOpen ? (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#38BDF8] bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping"></span>
              {marketStatus.badgeText}
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold text-[#F43F5E] bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20"
              title={marketStatus.message}
            >
              <span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
              {marketStatus.badgeText}
            </span>
          )
        }
        isMultiChart={isMultiChart}
        onToggleMultiChart={() => setIsMultiChart(prev => !prev)}
      />

      {/* OHLCV Banner on hover */}
      {!isMultiChart && (
        <div className="h-6 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-1">
          {hoverInfo ? (
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span className="text-[#60A5FA] font-bold">
                📅 {formatHoverDate(hoverInfo.candle.time)}
              </span>
              <span>A: <strong className="text-white">R$ {hoverInfo.candle.open.toFixed(2)}</strong></span>
              <span>MÁX: <strong className="text-[#38BDF8]">R$ {hoverInfo.candle.high.toFixed(2)}</strong></span>
              <span>MÍN: <strong className="text-[#F43F5E]">R$ {hoverInfo.candle.low.toFixed(2)}</strong></span>
              <span>F: <strong className="text-white">R$ {hoverInfo.candle.close.toFixed(2)}</strong></span>
              <span>VOL: <strong className="text-white">{(hoverInfo.candle.volume / 1000).toFixed(0)}k</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-[#64748B]">
              <span>MÁX DIA: <strong className="text-white">R$ {activeAsset.high.toFixed(2)}</strong></span>
              <span>MÍN DIA: <strong className="text-white">R$ {activeAsset.low.toFixed(2)}</strong></span>
              <span>VOL: <strong className="text-white">{activeAsset.volume}</strong></span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#161F33] text-[#60A5FA] font-bold">
                {timeframes.find(t => t.id === timeframe)?.desc || timeframe}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Chart Canvas or Multi-Chart Grid (2x2) */}
      {!isMultiChart ? (
        <div className="flex flex-col gap-2.5">
          {/* Canvas Wrapper */}
          <div className="relative w-full h-[330px] rounded-xl overflow-hidden bg-[#0B0F19] border border-[#1E293B]">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                isDraggingRef.current = false;
                setHoverInfo(null);
              }}
              onWheel={handleWheel}
              className="w-full h-full cursor-crosshair block select-none"
            />

            {displayCandles.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-[#64748B]">
                {isLoadingCandles ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-[#2962FF]" />
                    <span className="text-xs font-mono text-[#94A3B8]">Carregando candles oficiais da B3...</span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-[#94A3B8]">Sem dados históricos oficiais para {activeAsset.symbol} neste período.</span>
                )}
              </div>
            )}

            {/* Floating 'Voltar para o presente' pill when panned back */}
            {panOffset > 0 && (
              <button
                onClick={() => setPanOffset(0)}
                className="absolute top-3 right-20 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2962FF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-lg transition-all animate-bounce"
                title="Voltar para os candles em tempo real"
              >
                <RotateCcw size={12} />
                <span>Voltar ao tempo real</span>
              </button>
            )}
          </div>

          {/* Bottom Bar: Visão de Tempo (Range) + Navegação entre Sessões de Pregão */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 text-xs">
            {/* Range Selector (Visão de Tempo) */}
            <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] px-2 hidden md:inline">
                Período:
              </span>
              {ranges.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRange(r.id);
                    setPanOffset(0);
                  }}
                  title={r.desc}
                  className={`px-2.5 py-1 rounded-lg font-bold font-mono transition-all ${
                    selectedRange === r.id
                      ? 'bg-[#2962FF] text-white shadow-sm'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Session Day Navigation (Disponível no modo 1D / Pregão do Dia) */}
            {selectedRange === '1D' && sessionDays.length > 1 && (
              <div className="flex items-center gap-2 bg-[#0B0F19] px-2 py-1 rounded-xl border border-[#1E293B]">
                <button
                  disabled={selectedSessionIdx <= 0}
                  onClick={() => {
                    setSelectedSessionIdx(prev => Math.max(0, prev - 1));
                    setPanOffset(0);
                  }}
                  className="p-1 rounded-lg hover:bg-[#161F33] text-[#94A3B8] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Ver pregão anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="font-mono font-bold text-white text-xs px-1">
                  {currentSessionDateLabel}
                </span>

                <button
                  disabled={selectedSessionIdx >= sessionDays.length - 1}
                  onClick={() => {
                    setSelectedSessionIdx(prev => Math.min(sessionDays.length - 1, prev + 1));
                    setPanOffset(0);
                  }}
                  className="p-1 rounded-lg hover:bg-[#161F33] text-[#94A3B8] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Ver próximo pregão"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Multi-Gráfico 2x2 Mode with Individual Slot Pickers */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {multiChartSymbols.map((sym, slotIdx) => {
            const slotAsset = assets.find(a => a.symbol === sym) || {
              symbol: sym,
              name: sym,
              price: 30.00,
              changePercent: 0.0,
              changeValue: 0.0,
              volume: 'R$ 100M',
              high: 31.00,
              low: 29.50,
              open: 30.00,
              previousClose: 30.00,
              exchange: 'B3',
              category: 'acoes'
            };
            const isSlotActive = slotAsset.symbol === activeAsset.symbol;
            const isSlotPickerOpen = openSlotPicker === slotIdx;
            const isSlotUp = slotAsset.changePercent >= 0;

            return (
              <div
                key={`slot-${slotIdx}-${sym}`}
                onClick={() => setActiveAsset(slotAsset as any)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all relative cursor-pointer group ${
                  isSlotActive
                    ? 'bg-[#141C2E] border-[#2962FF] ring-2 ring-blue-500/20 shadow-lg'
                    : 'bg-[#0B0F19] border-[#1E293B] hover:border-[#334155] hover:bg-[#121A2B]'
                }`}
              >
                {/* Slot Top Bar: Ticker Selector Dropdown + Price */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSlotPicker(isSlotPickerOpen ? null : slotIdx);
                        setSlotSearchQuery('');
                      }}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] text-white font-mono font-bold text-sm transition-colors group"
                      title="Clique para trocar o ativo deste quadrante"
                    >
                      <span className="text-xs text-[#60A5FA]">#{slotIdx + 1}</span>
                      <span>{slotAsset.symbol}</span>
                      <ChevronDown size={14} className="text-[#94A3B8] group-hover:text-white" />
                    </button>

                    {isSlotPickerOpen && (
                      <div
                        className="absolute top-10 left-0 w-64 bg-[#0F1523] border border-[#1E293B] rounded-xl shadow-2xl p-2 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-[10px] uppercase font-bold text-[#64748B] px-2 py-1 border-b border-[#1E293B] flex items-center justify-between">
                          <span>Trocar Quadrante #{slotIdx + 1}</span>
                          <span className="text-[#60A5FA]">B3</span>
                        </div>
                        <input
                          type="text"
                          value={slotSearchQuery}
                          onChange={e => setSlotSearchQuery(e.target.value)}
                          placeholder="Digitar ticker (ex: ABEV3, B3SA3)..."
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter' && slotSearchQuery.trim()) {
                              const typed = slotSearchQuery.trim().toUpperCase();
                              selectOrCreateAsset(typed);
                              setMultiChartSlot(slotIdx, typed);
                              setOpenSlotPicker(null);
                            }
                          }}
                          className="w-full bg-[#141C2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white my-2 focus:outline-none focus:border-[#2962FF]"
                        />
                        <div className="max-h-44 overflow-y-auto divide-y divide-[#1E293B]/40">
                          {filteredSlotAssets.map(fa => (
                            <div
                              key={fa.symbol}
                              onClick={() => {
                                setMultiChartSlot(slotIdx, fa.symbol);
                                setOpenSlotPicker(null);
                              }}
                              className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between hover:bg-[#161F33] ${
                                fa.symbol === slotAsset.symbol ? 'bg-blue-500/10 text-[#60A5FA]' : 'text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-mono">
                                <span className="font-bold">{fa.symbol}</span>
                                <span className="text-[10px] text-[#94A3B8] truncate max-w-[90px]">{fa.name}</span>
                              </div>
                              {fa.symbol === slotAsset.symbol && <Check size={14} className="text-[#2962FF]" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price & Change */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white whitespace-nowrap">{formatBRL(slotAsset.price)}</span>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
                        isSlotUp ? 'text-[#38BDF8] bg-sky-500/10' : 'text-[#F43F5E] bg-rose-500/10'
                      }`}
                    >
                      {formatPercent(slotAsset.changePercent)}
                    </span>
                  </div>
                </div>

                {/* Real Mini Candlestick Chart for this slot */}
                <MiniSlotCandleChart
                  symbol={slotAsset.symbol}
                  price={slotAsset.price}
                  timeframe={timeframe}
                />

                {/* Slot Footer: Focus & Operate button */}
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#1E293B]">
                  <span>Vol {slotAsset.volume}</span>
                  <button
                    onClick={() => setActiveAsset(slotAsset as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSlotActive
                        ? 'bg-[#2962FF] text-white shadow-sm'
                        : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    <span>{isSlotActive ? 'Ativo no Terminal' : 'Operar no Terminal'}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
