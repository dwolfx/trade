import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Candle, Timeframe, StockAsset, PortfolioPosition } from '../../types/market';
import { fetchBrapiQuote } from '../../services/brapiService';
import { fetchYahooCandles } from '../../services/yahooFinanceService';
import { generateInitialCandles } from '../../utils/candleGenerator';
import { formatBRL } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Target, Info, Sparkles, BarChart2, ShieldCheck, Loader2 } from 'lucide-react';

interface AssetInspectionChartProps {
  asset: StockAsset;
  userPosition?: PortfolioPosition;
  showBalance: boolean;
}

type InspectionTimeframe = '1D' | '5D' | '1M' | '6M' | '1A';

export const AssetInspectionChart: React.FC<AssetInspectionChartProps> = ({
  asset,
  userPosition,
  showBalance,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState<InspectionTimeframe>('5D');
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateInitialCandles(asset.price, timeframe as Timeframe, 35)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    candle: Candle;
  } | null>(null);

  // Timeframe buttons options
  const timeframes: { id: InspectionTimeframe; label: string; desc: string }[] = [
    { id: '1D', label: '1D', desc: 'Intraday (1 Dia)' },
    { id: '5D', label: '5D', desc: '5 Dias úteis' },
    { id: '1M', label: '1M', desc: '1 Mês' },
    { id: '6M', label: '6M', desc: '6 Meses' },
    { id: '1A', label: '1A', desc: '1 Ano' },
  ];

  // Fetch or generate candles whenever asset or timeframe changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        // 1. Try Brapi quotes
        const tfParam = timeframe === '1D' ? '1d' : timeframe === '5D' ? '5d' : '3mo';
        const brapiData = await fetchBrapiQuote(asset.symbol, tfParam, timeframe === '1D' ? '15m' : '1d');

        if (
          brapiData?.historicalDataPrice &&
          brapiData.historicalDataPrice.length > 2 &&
          isMounted
        ) {
          const mapped: Candle[] = brapiData.historicalDataPrice.map(bar => ({
            time: bar.date * 1000,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            volume: bar.volume,
          }));
          setCandles(mapped.slice(-40));
          setIsLoading(false);
          return;
        }

        // 2. Fallback to Yahoo candles
        const yahooData = await fetchYahooCandles(asset.symbol, (timeframe === '5D' ? '15m' : '1D') as Timeframe);
        if (yahooData && yahooData.length > 2 && isMounted) {
          setCandles(yahooData.slice(-40));
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Using simulated fallback candles for asset inspection:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // 3. Fallback to generated realistic candles anchored on current asset price
      if (isMounted) {
        setCandles(generateInitialCandles(asset.price, (timeframe === '1D' ? '15m' : '1D') as Timeframe, 35));
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [asset.symbol, asset.price, timeframe]);

  // Compute trend metrics across current candles
  const trendAnalysis = useMemo(() => {
    if (!candles || candles.length < 2) {
      return {
        direction: 'neutral' as const,
        changePercent: asset.changePercent,
        changeValue: (asset.price * asset.changePercent) / 100,
        lowestPrice: asset.low || asset.price * 0.98,
        highestPrice: asset.high || asset.price * 1.02,
        avgVolume: 250000,
        narrative: 'Dados de cotação consolidando.',
      };
    }

    const firstCandle = candles[0];
    const lastCandle = candles[candles.length - 1];
    const startPrice = firstCandle.open;
    const endPrice = lastCandle.close;

    const changeValue = endPrice - startPrice;
    const changePercent = ((endPrice - startPrice) / startPrice) * 100;

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const highestPrice = Math.max(...highs);
    const lowestPrice = Math.min(...lows);

    const totalVol = candles.reduce((acc, c) => acc + c.volume, 0);
    const avgVolume = totalVol / candles.length;

    // Moving average of last 10 candles
    const recentCandles = candles.slice(-10);
    const ma10 = recentCandles.reduce((acc, c) => acc + c.close, 0) / recentCandles.length;
    const isAboveMA = endPrice >= ma10;

    let direction: 'up' | 'down' | 'neutral' = 'neutral';
    let narrative = '';

    if (changePercent > 1.2) {
      direction = 'up';
      narrative = `O ativo vem operando em clara vertente compradora neste período (+${changePercent.toFixed(2)}%), renovando topos acima do suporte de ${formatBRL(lowestPrice)} e negociando ${isAboveMA ? 'acima' : 'próximo'} da média móvel recente. A pressão compradora predomina com consistência.`;
    } else if (changePercent < -1.2) {
      direction = 'down';
      narrative = `O ativo recuou ${Math.abs(changePercent).toFixed(2)}% neste período após tocar a máxima em ${formatBRL(highestPrice)}. Encontra-se em momento de realização e busca suporte próximo de ${formatBRL(lowestPrice)}, onde compradores podem defender a cotação.`;
    } else {
      direction = 'neutral';
      narrative = `O ativo está em faixa de consolidação lateral (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%), oscilando entre o suporte de ${formatBRL(lowestPrice)} e a resistência de ${formatBRL(highestPrice)}. Não há rompimento evidente de tendência no momento.`;
    }

    return {
      direction,
      changePercent,
      changeValue,
      highestPrice,
      lowestPrice,
      avgVolume,
      narrative,
    };
  }, [candles, asset.price, asset.changePercent, asset.high, asset.low]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Dark sleek background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    const rightAxisWidth = 60;
    const bottomAxisHeight = 22;
    const chartWidth = width - rightAxisWidth;
    const chartHeight = height - bottomAxisHeight;

    // Calculate min/max price (include user's PM if nearby to keep it visible!)
    let minPrice = Math.min(...candles.map(c => c.low));
    let maxPrice = Math.max(...candles.map(c => c.high));

    if (userPosition && userPosition.avgPrice > 0) {
      // Include PM in range if within 25% of price
      if (userPosition.avgPrice >= minPrice * 0.75 && userPosition.avgPrice <= maxPrice * 1.25) {
        minPrice = Math.min(minPrice, userPosition.avgPrice);
        maxPrice = Math.max(maxPrice, userPosition.avgPrice);
      }
    }

    const padding = (maxPrice - minPrice) * 0.1 || 1;
    minPrice -= padding;
    maxPrice += padding;
    const priceRange = maxPrice - minPrice;

    // Grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      const priceLevel = maxPrice - (priceRange / gridLines) * i;
      ctx.fillStyle = '#64748B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceLevel.toFixed(2), chartWidth + 6, y + 3.5);
    }
    ctx.setLineDash([]);

    // Candle Dimensions
    const candleWidth = Math.max(3, (chartWidth / candles.length) * 0.72);
    const candleSpacing = chartWidth / candles.length;

    // Draw Candlesticks (Sky Blue #38BDF8 for up, Rose #F43F5E for down)
    candles.forEach((c, index) => {
      const x = index * candleSpacing + candleSpacing / 2;
      const isUp = c.close >= c.open;

      const yOpen = chartHeight - ((c.open - minPrice) / priceRange) * chartHeight;
      const yClose = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
      const yHigh = chartHeight - ((c.high - minPrice) / priceRange) * chartHeight;
      const yLow = chartHeight - ((c.low - minPrice) / priceRange) * chartHeight;

      const color = isUp ? '#38BDF8' : '#F43F5E';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // Draw User's Average Purchase Price Line (Seu Preço Médio - PM)
    if (userPosition && userPosition.avgPrice > 0) {
      const pmY = chartHeight - ((userPosition.avgPrice - minPrice) / priceRange) * chartHeight;

      if (pmY >= 0 && pmY <= chartHeight) {
        ctx.strokeStyle = '#F59E0B'; // Amber / Gold for personal PM
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, pmY);
        ctx.lineTo(chartWidth, pmY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on right axis
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(chartWidth + 2, pmY - 8, rightAxisWidth - 4, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PM ' + userPosition.avgPrice.toFixed(2), chartWidth + rightAxisWidth / 2, pmY + 3.5);
      }
    }

    // Draw Current Price Highlight Line
    const lastCandle = candles[candles.length - 1];
    const lastY = chartHeight - ((lastCandle.close - minPrice) / priceRange) * chartHeight;

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(chartWidth, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#2962FF';
    ctx.fillRect(chartWidth + 2, lastY - 8, rightAxisWidth - 4, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lastCandle.close.toFixed(2), chartWidth + rightAxisWidth / 2, lastY + 3.5);

    // Crosshair on hover
    if (hoverInfo) {
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

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
  }, [candles, hoverInfo, userPosition]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const chartWidth = rect.width - 60;

    if (x < 0 || x > chartWidth || y < 0 || y > rect.height - 22) {
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
      candle: candles[index],
    });
  };

  const isUpTrend = trendAnalysis.direction === 'up';
  const isDownTrend = trendAnalysis.direction === 'down';

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Bar: Timeframe Selector + Live OHLC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F19] p-3 rounded-2xl border border-[#1E293B]">
        {/* Timeframe Chips */}
        <div className="flex items-center gap-1.5 bg-[#141C2E] p-1 rounded-xl border border-[#1E293B] shrink-0">
          {timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                timeframe === tf.id
                  ? 'bg-[#2962FF] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Dynamic Status / OHLC Bar */}
        <div className="flex items-center gap-3 text-xs font-mono text-[#94A3B8] overflow-x-auto whitespace-nowrap">
          {isLoading && (
            <span className="flex items-center gap-1 text-[11px] text-[#60A5FA]">
              <Loader2 size={12} className="animate-spin" /> Atualizando...
            </span>
          )}
          {hoverInfo ? (
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">
                {new Date(hoverInfo.candle.time).toLocaleDateString('pt-BR')}
              </span>
              <span>A: <strong className="text-white">{hoverInfo.candle.open.toFixed(2)}</strong></span>
              <span>MÁX: <strong className="text-[#38BDF8]">{hoverInfo.candle.high.toFixed(2)}</strong></span>
              <span>MÍN: <strong className="text-[#F43F5E]">{hoverInfo.candle.low.toFixed(2)}</strong></span>
              <span>F: <strong className="text-white">{hoverInfo.candle.close.toFixed(2)}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#60A5FA]">
                <BarChart2 size={13} />
                {timeframe}
              </span>
              <span>Mín: <strong className="text-[#F43F5E]">{formatBRL(trendAnalysis.lowestPrice)}</strong></span>
              <span>Máx: <strong className="text-[#38BDF8]">{formatBRL(trendAnalysis.highestPrice)}</strong></span>
              <span>Var: <strong className={trendAnalysis.changePercent >= 0 ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}>
                {trendAnalysis.changePercent >= 0 ? '+' : ''}{trendAnalysis.changePercent.toFixed(2)}%
              </strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Chart Area */}
      <div className="relative w-full h-[240px] sm:h-[260px] rounded-2xl overflow-hidden bg-[#0B0F19] border border-[#1E293B]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Floating Indicator of PM if in portfolio */}
        {userPosition && userPosition.avgPrice > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#0F1523]/90 border border-amber-500/30 text-[11px] font-mono flex items-center gap-1.5 shadow-md">
            <Target size={12} className="text-[#F59E0B]" />
            <span className="text-[#94A3B8]">Seu Preço Médio:</span>
            <strong className="text-[#F59E0B]">
              {showBalance ? formatBRL(userPosition.avgPrice) : '••••'}
            </strong>
          </div>
        )}
      </div>

      {/* Box: "O Que Está Acontecendo?" (Vertente & Inteligência Consciente) */}
      <div className="p-4 rounded-2xl bg-[#0B0F19] border border-[#1E293B] space-y-3">
        {/* Header da Vertente */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#60A5FA]" />
              O Que Está Acontecendo?
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${
                isUpTrend
                  ? 'bg-sky-500/15 text-[#38BDF8] border-sky-500/30'
                  : isDownTrend
                  ? 'bg-rose-500/15 text-[#F43F5E] border-rose-500/30'
                  : 'bg-blue-500/15 text-[#60A5FA] border-blue-500/30'
              }`}
            >
              {isUpTrend ? <TrendingUp size={11} /> : isDownTrend ? <TrendingDown size={11} /> : null}
              {isUpTrend ? 'Vertente: Alta' : isDownTrend ? 'Vertente: Correção' : 'Vertente: Lateral'}
            </span>
          </div>

          <span className="text-[11px] font-mono font-semibold text-[#94A3B8]">
            Variação em {timeframe}:{' '}
            <strong className={trendAnalysis.changePercent >= 0 ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}>
              {trendAnalysis.changePercent >= 0 ? '+' : ''}{trendAnalysis.changePercent.toFixed(2)}%
            </strong>
          </span>
        </div>

        {/* Texto Explicativo em Linguagem Natural */}
        <p className="text-xs text-[#CBD5E1] leading-relaxed">
          {trendAnalysis.narrative}
        </p>

        {/* Diagnóstico da Custódia & Simulação Consciente */}
        {userPosition && userPosition.quantity > 0 ? (
          <div className="pt-2.5 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[#64748B] text-[10px] block font-mono uppercase">Em Custódia</span>
                <span className="font-mono font-bold text-white">
                  {userPosition.quantity} ações
                </span>
              </div>
              <div className="h-6 w-px bg-[#1E293B]" />
              <div>
                <span className="text-[#64748B] text-[10px] block font-mono uppercase">Preço Médio</span>
                <span className="font-mono font-bold text-amber-400">
                  {showBalance ? formatBRL(userPosition.avgPrice) : '••••'}
                </span>
              </div>
              <div className="h-6 w-px bg-[#1E293B]" />
              <div>
                <span className="text-[#64748B] text-[10px] block font-mono uppercase">Retorno Atual</span>
                <span className={`font-mono font-bold ${userPosition.plValue >= 0 ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}`}>
                  {showBalance ? (
                    <>
                      {userPosition.plValue >= 0 ? '+' : ''}
                      {formatBRL(userPosition.plValue)} ({userPosition.plPercent.toFixed(2)}%)
                    </>
                  ) : (
                    '••••'
                  )}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#60A5FA] bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto font-sans">
              <ShieldCheck size={13} className="shrink-0" />
              <span>
                {userPosition.plValue >= 0
                  ? `Operando ${(asset.price / userPosition.avgPrice - 1) * 100 > 0 ? ((asset.price / userPosition.avgPrice - 1) * 100).toFixed(1) + '% acima' : 'no'} do seu PM`
                  : `Operando ${Math.abs((asset.price / userPosition.avgPrice - 1) * 100).toFixed(1)}% abaixo do seu PM`}
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-2.5 border-t border-[#1E293B] flex items-center gap-2 text-xs text-[#94A3B8]">
            <Info size={14} className="text-[#60A5FA] shrink-0" />
            <span>
              Você ainda não possui cotas de <strong>{asset.symbol}</strong> na sua carteira. O lote padrão é de 100 ações.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
