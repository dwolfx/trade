import React, { useRef, useEffect, useState } from 'react';
import { CryptoAsset, CryptoCandle, CryptoQuoteCurrency, CryptoTimeframe } from '../../types/crypto';
import { fetchCryptoCandles } from '../../services/binanceService';
import { formatBRL } from '../../utils/formatters';
import { MiniCryptoSlotChart } from './MiniCryptoSlotChart';
import { LayoutGrid, ChevronDown, Check, ArrowRight, Loader2 } from 'lucide-react';

interface CryptoChartProps {
  asset: CryptoAsset;
  allAssets: CryptoAsset[];
  quoteCurrency: CryptoQuoteCurrency;
  onSelectAsset?: (asset: CryptoAsset) => void;
  onOpenOrder?: () => void;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({
  asset,
  allAssets,
  quoteCurrency,
  onSelectAsset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState<CryptoTimeframe>('1D');
  const [candles, setCandles] = useState<CryptoCandle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMultiChart, setIsMultiChart] = useState<boolean>(false);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    candle: CryptoCandle;
  } | null>(null);

  // 4 Multi-chart slots (base assets: BTC, ETH, SOL, BNB)
  const [multiSlots, setMultiSlots] = useState<[string, string, string, string]>([
    'BTC',
    'ETH',
    'SOL',
    'BNB',
  ]);
  const [openSlotPicker, setOpenSlotPicker] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState<string>('');

  const timeframes: { id: CryptoTimeframe; label: string; desc: string }[] = [
    { id: '1m', label: '1m', desc: '1 Minuto' },
    { id: '5m', label: '5m', desc: '5 Minutos' },
    { id: '15m', label: '15m', desc: '15 Minutos' },
    { id: '1h', label: '1h', desc: '1 Hora' },
    { id: '4h', label: '4h', desc: '4 Horas' },
    { id: '1D', label: '1D', desc: 'Diário (1 Dia)' },
    { id: '1S', label: '1S', desc: 'Semanal (1 Semana)' },
  ];

  const formatPrice = (val: number) => {
    if (quoteCurrency === 'BRL') {
      return formatBRL(val);
    }
    return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: val < 1 ? 4 : 2 })}`;
  };

  const getCryptoIcon = (base: string) => {
    switch (base) {
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'SOL': return '◎';
      case 'USDT': return '₮';
      case 'BNB': return '🔶';
      case 'ADA': return '₳';
      default: return '🪙';
    }
  };

  // Fetch real candles from Binance for active main chart
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadCandles() {
      const data = await fetchCryptoCandles(asset.symbol, timeframe, 60);
      if (isMounted) {
        setCandles(data);
        setIsLoading(false);
      }
    }

    loadCandles();
    const interval = setInterval(loadCandles, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [asset.symbol, timeframe]);

  // Render Canvas Candlesticks
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
    const rightAxisWidth = 75;
    const bottomAxisHeight = 26;
    const chartWidth = width - rightAxisWidth;
    const chartHeight = height - bottomAxisHeight;
    const volumeHeight = chartHeight * 0.18;
    const priceChartHeight = chartHeight - volumeHeight;

    // Background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    // Calculate Min/Max
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

    // Grid lines (horizontal price)
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

      ctx.fillText(formatPrice(price), chartWidth + 6, y + 3.5);
    }

    // Candles
    const count = candles.length;
    const candleWidth = Math.max(3, (chartWidth / count) * 0.70);
    const step = chartWidth / count;

    // Time Axis labels
    const dateInterval = Math.max(1, Math.floor(count / 6));
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';

    for (let i = 0; i < count; i += dateInterval) {
      const x = i * step + step / 2;
      const d = new Date(candles[i].time);
      const label = (timeframe === '1m' || timeframe === '5m' || timeframe === '15m' || timeframe === '1h' || timeframe === '4h')
        ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
        : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      ctx.fillText(label, x, height - 8);
    }

    // Draw Volume Bars
    candles.forEach((c, idx) => {
      const x = idx * step + step / 2;
      const isUp = c.close >= c.open;
      const vHeight = maxVolume > 0 ? (c.volume / maxVolume) * volumeHeight : 0;
      const vY = chartHeight - vHeight;

      ctx.fillStyle = isUp ? 'rgba(56, 189, 248, 0.20)' : 'rgba(244, 63, 94, 0.20)';
      ctx.fillRect(x - candleWidth / 2, vY, candleWidth, vHeight);
    });

    // Draw Candlesticks
    candles.forEach((c, idx) => {
      const x = idx * step + step / 2;
      const isUp = c.close >= c.open;

      const openY = priceChartHeight - ((c.open - minPrice) / effectiveRange) * priceChartHeight;
      const closeY = priceChartHeight - ((c.close - minPrice) / effectiveRange) * priceChartHeight;
      const highY = priceChartHeight - ((c.high - minPrice) / effectiveRange) * priceChartHeight;
      const lowY = priceChartHeight - ((c.low - minPrice) / effectiveRange) * priceChartHeight;

      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1.5, Math.abs(openY - closeY));

      const color = isUp ? '#38BDF8' : '#F43F5E';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.2;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    });

    // Current Price Line
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

    // Price Pill
    ctx.fillStyle = '#2962FF';
    ctx.beginPath();
    ctx.roundRect(chartWidth + 2, lastY - 10, rightAxisWidth - 4, 20, 4);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formatPrice(lastCandle.close), chartWidth + (rightAxisWidth / 2), lastY + 3.5);

    // Crosshair
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
  }, [candles, hoverInfo, timeframe, quoteCurrency, isMultiChart]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const chartWidth = rect.width - 75;

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

  const isPositive = asset.changePercent24h >= 0;

  const handleSetMultiSlot = (slotIdx: number, baseSymbol: string) => {
    setMultiSlots(prev => {
      const copy: [string, string, string, string] = [...prev];
      copy[slotIdx] = baseSymbol;
      return copy;
    });
  };

  const filteredSlotAssets = allAssets.filter(
    a =>
      a.baseAsset.toLowerCase().includes(slotSearchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(slotSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative">
      {/* Chart Top Header & Controls - Exactly matching Bolsa de Valores structure */}
      <div className="flex flex-col gap-3.5 border-b border-[#1E293B] pb-3.5">
        {/* Row 1: Identity on Left, Price & Variation on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Identity: Icon, Ticker, Company Name with EXACT Fixed Width/Height to prevent resizing jitter */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-[#F59E0B] font-bold text-xs flex items-center justify-center font-mono">
                  {getCryptoIcon(asset.baseAsset)}
                </div>
                <span className="text-lg sm:text-xl font-black text-white font-mono tracking-tight leading-none">
                  {asset.baseAsset}
                </span>
                <span className="text-xs text-[#64748B] font-mono hidden sm:inline">
                  /{quoteCurrency} · BINANCE
                </span>
              </div>

              {/* Exact Fixed Width & Height copied from Bolsa de Valores (prevents shrinking & expanding!) */}
              <span
                className="w-[200px] sm:w-[250px] lg:w-[290px] h-[28px] text-[11px] text-[#94A3B8] font-medium leading-[14px] block mt-1"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={asset.name}
              >
                {asset.name}
              </span>
            </div>

            {/* Price & Variation (Guaranteed Single Line, exactly like Bolsa de Valores) */}
            <div className="flex items-baseline gap-2 pl-3.5 border-l border-[#1E293B] shrink-0">
              <span className="text-xl sm:text-2xl font-black font-mono text-white whitespace-nowrap">
                {formatPrice(asset.price)}
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded whitespace-nowrap ${
                  isPositive ? 'bg-sky-500/10 text-[#38BDF8]' : 'bg-rose-500/10 text-[#F43F5E]'
                }`}
              >
                {isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 24/7 Status Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#34D399] bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
            <span>24/7 ONLINE</span>
          </div>
        </div>

        {/* Row 2: Timeframe Buttons on Left, Multi-Chart (2x2) Toggle on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Timeframe Buttons */}
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

          {/* Multi-Chart (2x2) Toggle */}
          <button
            onClick={() => setIsMultiChart(prev => !prev)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap w-full sm:w-auto transition-all ${
              isMultiChart
                ? 'bg-[#2962FF] text-white border-blue-400 shadow-sm'
                : 'bg-[#0B0F19] text-[#94A3B8] border-[#1E293B] hover:text-white hover:bg-[#161F33]'
            }`}
          >
            <LayoutGrid size={14} />
            <span>{isMultiChart ? '1 Gráfico' : 'Multi-Gráfico (2×2)'}</span>
          </button>
        </div>
      </div>

      {/* OHLCV Banner */}
      {!isMultiChart && (
        <div className="h-6 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-1">
          {hoverInfo ? (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[#60A5FA] font-bold">
                📅 {new Date(hoverInfo.candle.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>A: <strong className="text-white">{formatPrice(hoverInfo.candle.open)}</strong></span>
              <span>MÁX: <strong className="text-[#38BDF8]">{formatPrice(hoverInfo.candle.high)}</strong></span>
              <span>MÍN: <strong className="text-[#F43F5E]">{formatPrice(hoverInfo.candle.low)}</strong></span>
              <span>F: <strong className="text-white">{formatPrice(hoverInfo.candle.close)}</strong></span>
              <span>VOL: <strong className="text-white">{hoverInfo.candle.volume.toFixed(1)} {asset.baseAsset}</strong></span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 text-[#64748B]">
                <span>MÁX 24H: <strong className="text-white">{formatPrice(asset.high24h)}</strong></span>
                <span>MÍN 24H: <strong className="text-white">{formatPrice(asset.low24h)}</strong></span>
                <span>VOL 24H: <strong className="text-white">{asset.volume24h.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {asset.baseAsset}</strong></span>
              </div>

              {isLoading && (
                <span className="flex items-center gap-1 text-xs text-[#60A5FA]">
                  <Loader2 size={12} className="animate-spin" /> Atualizando Binance...
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Single Chart OR Multi-Chart 2x2 Grid */}
      {!isMultiChart ? (
        <div className="relative w-full h-[330px] rounded-xl overflow-hidden bg-[#0B0F19] border border-[#1E293B]">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverInfo(null)}
            className="w-full h-full cursor-crosshair block"
          />
        </div>
      ) : (
        /* Multi-Gráfico (2x2) Grid with Real Canvas Mini-Charts */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {multiSlots.map((baseSym, slotIdx) => {
            const slotAsset = allAssets.find(a => a.baseAsset === baseSym) || {
              symbol: `${baseSym}${quoteCurrency}`,
              baseAsset: baseSym,
              quoteAsset: quoteCurrency,
              name: baseSym,
              price: 1000,
              changePercent24h: 0,
              changeValue24h: 0,
              high24h: 1050,
              low24h: 950,
              volume24h: 500,
              quoteVolume24h: 500000,
              category: 'top',
            };

            const isSlotActive = slotAsset.baseAsset === asset.baseAsset;
            const isSlotPickerOpen = openSlotPicker === slotIdx;
            const isSlotUp = slotAsset.changePercent24h >= 0;

            return (
              <div
                key={`slot-${slotIdx}-${baseSym}`}
                onClick={() => onSelectAsset?.(slotAsset as CryptoAsset)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all relative cursor-pointer group ${
                  isSlotActive
                    ? 'bg-[#141C2E] border-[#2962FF] ring-2 ring-blue-500/20 shadow-lg'
                    : 'bg-[#0B0F19] border-[#1E293B] hover:border-[#334155] hover:bg-[#121A2B]'
                }`}
              >
                {/* Slot Top Bar */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setOpenSlotPicker(isSlotPickerOpen ? null : slotIdx);
                        setSlotSearchQuery('');
                      }}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] text-white font-mono font-bold text-sm transition-colors group"
                      title="Clique para trocar o criptoativo deste quadrante"
                    >
                      <span className="text-xs text-[#60A5FA]">#{slotIdx + 1}</span>
                      <span>{slotAsset.baseAsset}/{quoteCurrency}</span>
                      <ChevronDown size={14} className="text-[#94A3B8] group-hover:text-white" />
                    </button>

                    {/* Dropdown Selector */}
                    {isSlotPickerOpen && (
                      <div
                        className="absolute top-10 left-0 w-64 bg-[#0F1523] border border-[#1E293B] rounded-xl shadow-2xl p-2 z-50"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="text-[10px] uppercase font-bold text-[#64748B] px-2 py-1 border-b border-[#1E293B] flex items-center justify-between">
                          <span>Trocar Quadrante #{slotIdx + 1}</span>
                          <span className="text-[#60A5FA]">Binance</span>
                        </div>
                        <input
                          type="text"
                          value={slotSearchQuery}
                          onChange={e => setSlotSearchQuery(e.target.value)}
                          placeholder="Buscar moeda (ex: BTC, SOL)..."
                          autoFocus
                          className="w-full bg-[#141C2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white my-2 focus:outline-none focus:border-[#2962FF]"
                        />
                        <div className="max-h-44 overflow-y-auto divide-y divide-[#1E293B]/40">
                          {filteredSlotAssets.map(fa => (
                            <div
                              key={fa.symbol}
                              onClick={() => {
                                handleSetMultiSlot(slotIdx, fa.baseAsset);
                                setOpenSlotPicker(null);
                              }}
                              className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between hover:bg-[#161F33] ${
                                fa.baseAsset === slotAsset.baseAsset ? 'bg-blue-500/10 text-[#60A5FA]' : 'text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-mono">
                                <span className="font-bold">{fa.baseAsset}</span>
                                <span className="text-[10px] text-[#94A3B8] truncate max-w-[90px]">{fa.name}</span>
                              </div>
                              {fa.baseAsset === slotAsset.baseAsset && <Check size={14} className="text-[#2962FF]" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price & Change */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-white whitespace-nowrap">{formatPrice(slotAsset.price)}</span>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
                        isSlotUp ? 'text-[#38BDF8] bg-sky-500/10' : 'text-[#F43F5E] bg-rose-500/10'
                      }`}
                    >
                      {isSlotUp ? '+' : ''}{slotAsset.changePercent24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Mini Candlestick Canvas for this quadrant */}
                <MiniCryptoSlotChart
                  symbol={slotAsset.symbol}
                  price={slotAsset.price}
                  timeframe={timeframe}
                />

                {/* Slot Footer */}
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#1E293B]">
                  <span>Vol 24h {quoteCurrency === 'BRL' ? 'R$' : '$'} {(slotAsset.quoteVolume24h / 1e6).toFixed(1)}M</span>
                  <button
                    onClick={() => onSelectAsset?.(slotAsset as CryptoAsset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSlotActive
                        ? 'bg-[#2962FF] text-white shadow-sm'
                        : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    <span>{isSlotActive ? 'Ativo no Terminal' : 'Operar'}</span>
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
