import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { BacktestFrame, RealBacktestReport } from '../../services/realBacktestEngine';

interface BacktestReplayControlsProps {
  report: RealBacktestReport;
  currentFrame: BacktestFrame | null;
  currentFrameIndex: number;
  setCurrentFrameIndex: (idx: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  isFinished: boolean;
  activeSymbol: string;
  timeframe: string;
  confluenceThreshold: number;
  currencyPrefix?: string;
}

export const BacktestReplayControls: React.FC<BacktestReplayControlsProps> = ({
  report,
  currentFrame,
  currentFrameIndex,
  setCurrentFrameIndex,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  isFinished,
  activeSymbol,
  timeframe,
  confluenceThreshold,
  currencyPrefix = 'R$',
}) => {
  const tfMinutes =
    timeframe === '1m' ? 1 :
    timeframe === '3m' ? 3 :
    timeframe === '5m' ? 5 :
    timeframe === '15m' ? 15 :
    timeframe === '30m' ? 30 : 60;

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Play / Pause / Skip Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isFinished) {
                setCurrentFrameIndex(0);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className="w-10 h-10 rounded-xl bg-[#2962FF] hover:bg-[#1E4FD9] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
            title={isPlaying ? 'Pausar Replay' : isFinished ? 'Reiniciar Replay' : 'Iniciar Replay'}
          >
            {isPlaying ? (
              <Pause size={18} fill="white" />
            ) : isFinished ? (
              <RotateCcw size={18} />
            ) : (
              <Play size={18} fill="white" className="ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentFrameIndex(report.frames.length - 1);
              setIsPlaying(false);
            }}
            className="px-3 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] text-xs font-bold text-[#94A3B8] hover:text-white border border-[#1E293B] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Pular para o final"
          >
            <FastForward size={14} />
            <span className="hidden sm:inline">Pular pro Final</span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-[#161F33] p-1 rounded-xl border border-[#1E293B] text-xs font-mono">
            {[1, 2, 5, 10].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  playbackSpeed === s
                    ? 'bg-[#38BDF8] text-black shadow-sm'
                    : 'text-[#64748B] hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Scrubber Info */}
        <div className="text-right">
          <div className="text-xs font-mono font-bold text-white flex items-center gap-2 justify-end">
            <Clock size={12} className="text-[#38BDF8]" />
            <span>
              {currentFrame
                ? new Date(currentFrame.time).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
          </div>
          <span className="text-[10px] text-[#64748B] font-mono">
            Barra {currentFrameIndex + 1} de {report.frames.length} (
            {Math.round(((currentFrameIndex + 1) / report.frames.length) * 100)}%)
          </span>
        </div>
      </div>

      {/* Progress Range Slider */}
      <input
        type="range"
        min="0"
        max={Math.max(0, report.frames.length - 1)}
        value={currentFrameIndex}
        onChange={e => {
          setCurrentFrameIndex(Number(e.target.value));
          setIsPlaying(false);
        }}
        className="backtest-slider"
      />

      {/* Live State Telemetry Card */}
      {currentFrame && (
        <div
          className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
            currentFrame.status === 'IN_POSITION'
              ? currentFrame.position?.side === 'SELL'
                ? 'bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-purple-950/40 border-purple-500/30'
                : 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 border-emerald-500/30'
              : 'bg-[#161F33]/70 border-[#1E293B]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentFrame.status === 'IN_POSITION'
                  ? currentFrame.position?.side === 'SELL'
                    ? 'bg-purple-400 animate-pulse'
                    : 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>
                  {currentFrame.status === 'IN_POSITION'
                    ? currentFrame.position?.side === 'SELL'
                      ? `VENDIDO (SHORT) EM ${activeSymbol}`
                      : `COMPRADO EM ${activeSymbol}`
                    : 'AGUARDANDO CONFLUÊNCIA'}
                </span>
                {currentFrame.position?.breakevenMoved && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-[#38BDF8] border border-blue-500/30">
                    BREAKEVEN ATIVADO
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                {currentFrame.status === 'IN_POSITION'
                  ? `Em operação há ${currentFrame.position?.barsHeld} candles (${(currentFrame.position?.barsHeld || 0) * tfMinutes} min) · Entrada: ${currencyPrefix} ${currentFrame.position?.entryPrice.toFixed(2)}`
                  : `Sem operar há ${currentFrame.idleBarsCount} candles (${currentFrame.idleBarsCount * tfMinutes} min) · Confluência: ${currentFrame.confluenceScore}% (Mínimo: ${confluenceThreshold}%)`}
              </span>
            </div>
          </div>

          {currentFrame.position && (
            <div className="text-right">
              <span className="text-[10px] text-[#94A3B8] block">PnL Flutuante:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  currentFrame.position.floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentFrame.position.floatingPnl >= 0 ? '+' : ''}
                {currencyPrefix} {currentFrame.position.floatingPnl.toFixed(2)} (
                {currentFrame.position.floatingPnlPercent >= 0 ? '+' : ''}
                {currentFrame.position.floatingPnlPercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
