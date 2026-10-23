import React, { useRef, useEffect, useState } from 'react';
import { Candle, Timeframe } from '../../types/market';
import { fetchBrapiQuote } from '../../services/brapiService';
import { fetchYahooCandles } from '../../services/yahooFinanceService';
import { generateInitialCandles } from '../../utils/candleGenerator';
import { THEME_COLORS } from '../../styles/theme';

interface MiniSlotCandleChartProps {
  symbol: string;
  price: number;
  timeframe: Timeframe;
}

export const MiniSlotCandleChart: React.FC<MiniSlotCandleChartProps> = ({
  symbol,
  price,
  timeframe,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[]>(() => generateInitialCandles(price, timeframe, 28));
  const currentSymbolRef = useRef(symbol);

  useEffect(() => {
    currentSymbolRef.current = symbol;
  }, [symbol]);

  // Load candles for this slot
  useEffect(() => {
    let isMounted = true;
    const targetSymbol = symbol;

    async function loadSlotCandles() {
      // 1. If 1D, try Brapi daily bars
      if (timeframe === '1D') {
        const brapiData = await fetchBrapiQuote(targetSymbol, '3mo', '1d');

        if (
          brapiData?.historicalDataPrice &&
          brapiData.historicalDataPrice.length > 0 &&
          isMounted &&
          currentSymbolRef.current === targetSymbol
        ) {
          const mapped: Candle[] = brapiData.historicalDataPrice.map(bar => ({
            time: bar.date * 1000,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            volume: bar.volume,
          }));
          if (mapped.length >= 2) {
            setCandles(mapped.slice(-30));
            return;
          }
        }
      }

      // 2. Intraday or fallback from Yahoo Finance (proxied via Vite with 0 CORS)
      const yahooData = await fetchYahooCandles(targetSymbol, timeframe);
      if (
        yahooData &&
        yahooData.length >= 2 &&
        isMounted &&
        currentSymbolRef.current === targetSymbol
      ) {
        setCandles(yahooData.slice(-30));
        return;
      }

      // 3. Fallback to generated realistic candles
      if (isMounted && currentSymbolRef.current === targetSymbol) {
        setCandles(generateInitialCandles(price, timeframe, 28));
      }
    }

    loadSlotCandles();
    return () => {
      isMounted = false;
    };
  }, [symbol, price, timeframe]);

  // Render Canvas
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

    // Clear
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    let min = Infinity;
    let max = -Infinity;
    candles.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    const range = max - min || 1;
    const padMin = min - range * 0.08;
    const padMax = max + range * 0.08;
    const effectiveRange = padMax - padMin;

    // Subtle grid lines
    ctx.strokeStyle = '#161F33';
    ctx.lineWidth = 0.8;
    const gridLines = 3;
    for (let i = 1; i < gridLines; i++) {
      const y = (height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const count = candles.length;
    const step = width / count;
    const candleWidth = Math.max(2.5, step * 0.65);

    candles.forEach((c, i) => {
      const x = i * step + step / 2;
      const openY = height - ((c.open - padMin) / effectiveRange) * height;
      const closeY = height - ((c.close - padMin) / effectiveRange) * height;
      const highY = height - ((c.high - padMin) / effectiveRange) * height;
      const lowY = height - ((c.low - padMin) / effectiveRange) * height;

      const isBull = c.close >= c.open;
      const color = isBull ? THEME_COLORS.profit.DEFAULT : THEME_COLORS.loss.DEFAULT;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const top = Math.min(openY, closeY);
      const h = Math.max(1.5, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, top, candleWidth, h);
    });

    // Last price line
    const last = candles[candles.length - 1];
    const lastY = height - ((last.close - padMin) / effectiveRange) * height;
    ctx.strokeStyle = '#2962FF';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(width, lastY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [candles]);

  return (
    <div className="w-full h-32 rounded-lg overflow-hidden bg-[#0B0F19] border border-[#1E293B]/60 my-2 relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
