import React, { useRef, useEffect, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Timeframe } from '../types/market';
import { LayoutGrid, ChevronDown, Check, ArrowRight, Loader2, Zap } from 'lucide-react';
import { BrazilFlag } from './common/BrazilFlag';
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
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    candle: (typeof candles)[0];
  } | null>(null);

  const [openSlotPicker, setOpenSlotPicker] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState<string>('');

  const timeframes: { id: Timeframe; label: string; desc: string }[] = [
    { id: '1m', label: '1m', desc: '1 Minuto' },
    { id: '5m', label: '5m', desc: '5 Minutos' },
    { id: '15m', label: '15m', desc: '15 Minutos' },
    { id: '1h', label: '1h', desc: '1 Hora' },
    { id: '1D', label: '1D', desc: 'Diário (1 Dia)' },
    { id: '1S', label: '1S', desc: 'Semanal (1 Semana)' },
    { id: '1M', label: '1M', desc: 'Mensal (1 Mês)' },
    { id: '1A', label: '1A', desc: 'Anual (1 Ano)' },
  ];

  // Helper to format date based on timeframe
  const formatTimeLabel = (timestamp: number, tf: Timeframe): string => {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    if (tf === '1D' || tf === '1S' || tf === '1M' || tf === '1A') {
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    } else {
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    }
  };

  // Render Canvas Candlesticks with real price & date axes
  useEffect(() => {
    if (isMultiChart) return;
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;

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
    const bottomAxisHeight = 26;
    const chartWidth = width - rightAxisWidth;
    const chartHeight = height - bottomAxisHeight;
    const volumeHeight = chartHeight * 0.20;
    const priceChartHeight = chartHeight - volumeHeight;

    // Clear background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    // Calculate Price Min/Max
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const effectiveRange = maxPrice - minPrice;

    // Draw Grid Lines (Horizontal Price)
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

      ctx.fillText(`R$ ${price.toFixed(2)}`, chartWidth + 6, y + 3);
    }

    // Candle widths and spacing
    const count = candles.length;
    const candleWidth = Math.max(2, (chartWidth / count) * 0.70);
    const step = chartWidth / count;

    // Draw Time Axis Grid Lines & Date Labels (Vertical)
    const dateInterval = Math.max(1, Math.floor(count / 6));
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';

    for (let i = 0; i < count; i += dateInterval) {
      const x = i * step + step / 2;
      const label = formatTimeLabel(candles[i].time, timeframe);

      // Subtle vertical line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      // Time label on bottom axis
      ctx.fillText(label, x, height - 8);
    }

    // Draw Candles & Volume
    candles.forEach((c, i) => {
      const x = i * step + step / 2;
      const openY = priceChartHeight - ((c.open - minPrice) / effectiveRange) * priceChartHeight;
      const closeY = priceChartHeight - ((c.close - minPrice) / effectiveRange) * priceChartHeight;
      const highY = priceChartHeight - ((c.high - minPrice) / effectiveRange) * priceChartHeight;
      const lowY = priceChartHeight - ((c.low - minPrice) / effectiveRange) * priceChartHeight;

      const isBull = c.close >= c.open;
      const color = isBull ? THEME_COLORS.profit.DEFAULT : THEME_COLORS.loss.DEFAULT;

      // Volume bar
      const volBarH = (c.volume / (maxVolume || 1)) * volumeHeight;
      const volY = height - bottomAxisHeight - volBarH;
      ctx.fillStyle = isBull ? THEME_COLORS.profit.bg : THEME_COLORS.loss.bg;
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volBarH);

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

    // Draw Current Price Line & Badge
    const lastCandle = candles[candles.length - 1];
    const lastY = priceChartHeight - ((lastCandle.close - minPrice) / effectiveRange) * priceChartHeight;

    ctx.strokeStyle = '#2962FF';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(chartWidth, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price Pill on Right Axis
    ctx.fillStyle = '#2962FF';
    ctx.beginPath();
    ctx.roundRect(chartWidth + 2, lastY - 10, rightAxisWidth - 4, 20, 4);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${lastCandle.close.toFixed(2)}`, chartWidth + (rightAxisWidth / 2), lastY + 3.5);

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
  }, [candles, hoverInfo, isMultiChart, timeframe]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const chartWidth = rect.width - 65;

    if (x < 0 || x > chartWidth || y < 0 || y > rect.height - 26) {
      setHoverInfo(null);
      return;
    }

    const index = Math.min(
      candles.length - 1,
      Math.max(0, Math.floor((x / chartWidth) * candles.length))
    );

    setHoverInfo({
      x,
      y,
      candle: candles[index]
    });
  };

  const isPositive = activeAsset.changePercent >= 0;

  const filteredSlotAssets = assets.filter(
    a =>
      a.symbol.toLowerCase().includes(slotSearchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(slotSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col gap-3.5 border-b border-[#1E293B] pb-3.5">
        {/* Row 1: Ticker, Name, Price & Variation (Clean separation, no overlap) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Identity: Flag, Ticker, Company Name */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <BrazilFlag size="md" />
              <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight leading-none">
                {activeAsset.symbol}
              </span>
              <span className="text-xs text-[#64748B] font-mono hidden sm:inline">· B3</span>
            </div>
            <span
              className="text-xs text-[#94A3B8] font-medium truncate mt-1 max-w-[280px] sm:max-w-md block"
              title={activeAsset.name}
            >
              {activeAsset.name}
            </span>
          </div>

          {/* Price & Variation + Optional Mobile Trade Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]/40">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono text-white whitespace-nowrap">
                {formatBRL(activeAsset.price)}
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded whitespace-nowrap ${
                  isPositive
                    ? 'bg-sky-500/10 text-[#38BDF8]'
                    : 'bg-rose-500/10 text-[#F43F5E]'
                }`}
              >
                {formatPercent(activeAsset.changePercent)}
              </span>
            </div>

            {/* Mobile Trade Action Button */}
            {onOpenOrder && (
              <button
                onClick={() => onOpenOrder(activeAsset.symbol)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-[#2962FF] hover:bg-[#1D4ED8] text-white text-xs font-bold font-sans shadow-md shadow-blue-500/20 flex items-center gap-1 active:scale-95 transition-all"
              >
                <Zap size={13} className="fill-white" />
                <span>Operar</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Timeframe Buttons & Multi-Chart Toggle (Clean layout with zero clipping) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Timeframe Buttons: fits mobile width without horizontal scrollbar */}
          <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B] w-full sm:w-auto justify-between sm:justify-start">
            {timeframes.map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                title={tf.desc}
                className={`flex-1 sm:flex-none px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all text-center ${
                  timeframe === tf.id
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Multi-Chart Toggle */}
          <button
            onClick={() => setIsMultiChart(prev => !prev)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap w-full sm:w-auto transition-all ${
              isMultiChart
                ? 'bg-[#2962FF] text-white border-blue-400 shadow-sm'
                : 'bg-[#0B0F19] text-[#94A3B8] border-[#1E293B] hover:text-white hover:bg-[#161F33]'
            }`}
          >
            <LayoutGrid size={14} />
            <span>{isMultiChart ? 'Voltar para 1 Gráfico' : 'Multi-Gráfico (2×2)'}</span>
          </button>
        </div>
      </div>

      {/* OHLCV Banner on hover + Market Status (B3 Aberta vs Fechada) */}
      {!isMultiChart && (
        <div className="h-6 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-1">
          {hoverInfo ? (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[#60A5FA] font-bold">
                📅 {new Date(hoverInfo.candle.time).toLocaleDateString('pt-BR')}
                {(timeframe === '1m' || timeframe === '5m' || timeframe === '15m' || timeframe === '1h') && (
                  ` às ${new Date(hoverInfo.candle.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                )}
              </span>
              <span>A: <strong className="text-white">R$ {hoverInfo.candle.open.toFixed(2)}</strong></span>
              <span>MÁX: <strong className="text-[#38BDF8]">R$ {hoverInfo.candle.high.toFixed(2)}</strong></span>
              <span>MÍN: <strong className="text-[#F43F5E]">R$ {hoverInfo.candle.low.toFixed(2)}</strong></span>
              <span>F: <strong className="text-white">R$ {hoverInfo.candle.close.toFixed(2)}</strong></span>
              <span>VOL: <strong className="text-white">{(hoverInfo.candle.volume / 1000).toFixed(0)}k</strong></span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 text-[#64748B]">
                <span>MÁX DIA: <strong className="text-white">R$ {activeAsset.high.toFixed(2)}</strong></span>
                <span>MÍN DIA: <strong className="text-white">R$ {activeAsset.low.toFixed(2)}</strong></span>
                <span>VOL: <strong className="text-white">{activeAsset.volume}</strong></span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#161F33] text-[#60A5FA] font-bold">
                  {timeframes.find(t => t.id === timeframe)?.desc || timeframe}
                </span>
              </div>

              {/* Bug 4: B3 Market Open / Closed Real-time Indicator */}
              <div className="flex items-center gap-2">
                {isLoadingCandles ? (
                  <span className="flex items-center gap-1.5 text-xs text-[#60A5FA]">
                    <Loader2 size={12} className="animate-spin" /> Carregando candles...
                  </span>
                ) : marketStatus.isOpen ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#38BDF8] bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping"></span>
                    {marketStatus.badgeText}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#F43F5E] bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20" title={marketStatus.message}>
                    <span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
                    {marketStatus.badgeText}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Chart Canvas or Multi-Chart Grid (2x2) */}
      {!isMultiChart ? (
        <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-[#0B0F19] border border-[#1E293B]">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverInfo(null)}
            className="w-full h-full cursor-crosshair block"
          />
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
