import React, { useRef, useEffect, useState } from 'react';
import { CryptoCandle, CryptoTimeframe } from '../../types/crypto';
import { fetchCryptoCandles } from '../../services/binanceService';

interface MiniCryptoSlotChartProps {
  symbol: string;
  price: number;
  timeframe: CryptoTimeframe;
}

export const MiniCryptoSlotChart: React.FC<MiniCryptoSlotChartProps> = ({
  symbol,
  timeframe,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<CryptoCandle[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadSlotCandles() {
      const data = await fetchCryptoCandles(symbol, timeframe, 30);
      if (isMounted && data && data.length > 0) {
        setCandles(data);
      }
    }

    loadSlotCandles();
    return () => {
      isMounted = false;
    };
  }, [symbol, timeframe]);

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
    const padding = range * 0.08;
    const effectiveMin = min - padding;
    const effectiveRange = range + padding * 2;

    // Draw subtle grid lines
    ctx.strokeStyle = '#141C2E';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Candles
    const count = candles.length;
    const candleWidth = Math.max(2, (width / count) * 0.65);
    const step = width / count;

    candles.forEach((c, idx) => {
      const x = idx * step + step / 2;
      const isUp = c.close >= c.open;

      const openY = height - ((c.open - effectiveMin) / effectiveRange) * height;
      const closeY = height - ((c.close - effectiveMin) / effectiveRange) * height;
      const highY = height - ((c.high - effectiveMin) / effectiveRange) * height;
      const lowY = height - ((c.low - effectiveMin) / effectiveRange) * height;

      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1, Math.abs(openY - closeY));

      const color = isUp ? '#38BDF8' : '#F43F5E';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    });
  }, [candles]);

  return (
    <div className="relative w-full h-[120px] rounded-lg overflow-hidden bg-[#0B0F19] my-2">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
