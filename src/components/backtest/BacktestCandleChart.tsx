import React from 'react';
import { BacktestFrame, RealBacktestReport } from '../../services/realBacktestEngine';

interface BacktestCandleChartProps {
  report: RealBacktestReport;
  currentFrame: BacktestFrame | null;
  currentFrameIndex: number;
  isPlaying: boolean;
  currencyPrefix?: string;
}

export const BacktestCandleChart: React.FC<BacktestCandleChartProps> = ({
  report,
  currentFrame,
  currentFrameIndex,
  isPlaying,
  currencyPrefix = 'R$',
}) => {
  const maxCandlesToShow = 45;
  const startIndex = Math.max(0, currentFrameIndex - maxCandlesToShow + 1);
  const sliceCandles = report.candles.slice(startIndex, currentFrameIndex + 1);

  const highs = sliceCandles.map(c => c.high);
  const lows = sliceCandles.map(c => c.low);
  const minPrice = lows.length > 0 ? Math.min(...lows) * 0.997 : 1;
  const maxPrice = highs.length > 0 ? Math.max(...highs) * 1.003 : 1;
  const priceRange = maxPrice - minPrice || 1;

  const width = 600;
  const height = 180;
  const candleWidth = Math.max(4, Math.floor(width / maxCandlesToShow) - 3);

  const getY = (val: number) => height - ((val - minPrice) / priceRange) * height;

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Gráfico de Candles em Replay Barra a Barra</span>
            {isPlaying && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-[#38BDF8] border border-sky-500/30 animate-pulse">
                REPLAY ATIVO
              </span>
            )}
          </h4>
          <span className="text-[10px] text-[#64748B]">
            Velas históricas sendo formadas em tempo real conforme avanço
          </span>
        </div>
        {currentFrame?.candle && (
          <div className="text-right font-mono text-xs">
            <span className="text-[#94A3B8]">Preço Atual: </span>
            <strong className="text-white">
              {currencyPrefix} {currentFrame.candle.close.toFixed(2)}
            </strong>
          </div>
        )}
      </div>

      <div className="h-52 w-full pt-2">
        {sliceCandles.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
            Aguardando início dos candles...
          </div>
        ) : (
          <svg className="w-full h-full overflow-hidden" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Linhas de Grade de Fundo */}
            <line x1="0" y1="45" x2={width} y2="45" stroke="#1E293B" strokeDasharray="3,3" strokeWidth="0.8" />
            <line x1="0" y1="90" x2={width} y2="90" stroke="#1E293B" strokeDasharray="3,3" strokeWidth="0.8" />
            <line x1="0" y1="135" x2={width} y2="135" stroke="#1E293B" strokeDasharray="3,3" strokeWidth="0.8" />

            {/* Linhas de Posição em Aberto: Alvo, Entrada e Stop */}
            {currentFrame?.position && (() => {
              const pos = currentFrame.position;
              const entryY = getY(pos.entryPrice);
              const tpY = getY(pos.takeProfit);
              const slY = getY(pos.stopLoss);

              return (
                <g>
                  {tpY >= 0 && tpY <= height && (
                    <g>
                      <line x1="0" y1={tpY} x2={width} y2={tpY} stroke="#10B981" strokeDasharray="4,4" strokeWidth="1.2" />
                      <text x="8" y={tpY - 4} fill="#10B981" fontSize="9" fontFamily="monospace">
                        ALVO: {pos.takeProfit.toFixed(2)}
                      </text>
                    </g>
                  )}
                  {entryY >= 0 && entryY <= height && (
                    <g>
                      <line x1="0" y1={entryY} x2={width} y2={entryY} stroke="#38BDF8" strokeDasharray="5,3" strokeWidth="1.2" />
                      <text x="8" y={entryY - 4} fill="#38BDF8" fontSize="9" fontFamily="monospace">
                        ENTRADA: {pos.entryPrice.toFixed(2)}
                      </text>
                    </g>
                  )}
                  {slY >= 0 && slY <= height && (
                    <g>
                      <line x1="0" y1={slY} x2={width} y2={slY} stroke="#EF4444" strokeDasharray="4,4" strokeWidth="1.2" />
                      <text x="8" y={slY - 4} fill="#EF4444" fontSize="9" fontFamily="monospace">
                        STOP: {pos.stopLoss.toFixed(2)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}

            {/* Renderização das Velas */}
            {sliceCandles.map((c, idx) => {
              const x = idx * (width / maxCandlesToShow) + 5;
              const isGreen = c.close >= c.open;
              const color = isGreen ? '#10B981' : '#F43F5E';

              const highY = getY(c.high);
              const lowY = getY(c.low);
              const openY = getY(c.open);
              const closeY = getY(c.close);

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));

              return (
                <g key={c.time}>
                  <line
                    x1={x + candleWidth / 2}
                    y1={highY}
                    x2={x + candleWidth / 2}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1"
                  />
                  <rect
                    x={x}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="0.5"
                  />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
