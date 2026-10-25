import React, { useRef, useEffect, useState } from 'react';
import { CryptoAsset, CryptoCandle, CryptoQuoteCurrency, CryptoTimeframe } from '../../types/crypto';
import { fetchCryptoCandles } from '../../services/binanceService';
import { formatBRL } from '../../utils/formatters';
import { Loader2 } from 'lucide-react';

interface CryptoChartProps {
  asset: CryptoAsset;
  quoteCurrency: CryptoQuoteCurrency;
  onOpenOrder?: () => void;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({
  asset,
  quoteCurrency,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState<CryptoTimeframe>('1D');
  const [candles, setCandles] = useState<CryptoCandle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    candle: CryptoCandle;
  } | null>(null);

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

  // Fetch real candles from Binance
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
    const interval = setInterval(loadCandles, 10000); // 10s auto-refresh for live crypto market

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [asset.symbol, timeframe]);

  // Render Canvas Candlesticks
  useEffect(() => {
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
  }, [candles, hoverInfo, timeframe, quoteCurrency]);

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

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E293B] pb-3.5">
        {/* Asset Title & Live Quote */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-mono tracking-tight leading-none">
                {asset.baseAsset}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#161F33] text-[#94A3B8] font-mono">
                /{quoteCurrency}
              </span>
            </div>
            <span className="text-xs text-[#94A3B8] font-medium mt-1 truncate max-w-[200px]">
              {asset.name} · Binance 24/7
            </span>
          </div>

          <div className="flex items-baseline gap-2 pl-3.5 border-l border-[#1E293B] shrink-0">
            <span className="text-xl font-black font-mono text-white whitespace-nowrap">
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

        {/* Timeframe Buttons & Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B] shrink-0">
            {timeframes.map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                title={tf.desc}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  timeframe === tf.id
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#34D399] bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
            <span>24/7 ONLINE</span>
          </div>
        </div>
      </div>

      {/* OHLCV Banner */}
      <div className="h-6 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-1">
        {hoverInfo ? (
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[#60A5FA] font-bold">
              📅 {new Date(hoverInfo.candle.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(hoverInfo.candle.time).toLocaleDateString('pt-BR')}
            </span>
            <span>A: <strong className="text-white">{formatPrice(hoverInfo.candle.open)}</strong></span>
            <span>MÁX: <strong className="text-[#38BDF8]">{formatPrice(hoverInfo.candle.high)}</strong></span>
            <span>MÍN: <strong className="text-[#F43F5E]">{formatPrice(hoverInfo.candle.low)}</strong></span>
            <span>F: <strong className="text-white">{formatPrice(hoverInfo.candle.close)}</strong></span>
            <span>VOL: <strong className="text-white">{hoverInfo.candle.volume.toFixed(2)} {asset.baseAsset}</strong></span>
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

      {/* Canvas */}
      <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-[#0B0F19] border border-[#1E293B]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
};
