import React from 'react';
import { DollarSign, CheckCircle2, Sparkles, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { BacktestFrame, RealBacktestReport } from '../../services/realBacktestEngine';

interface BacktestKpiStripProps {
  currentFrame: BacktestFrame | null;
  report: RealBacktestReport;
  isFinished: boolean;
  currencyPrefix?: string;
}

export const BacktestKpiStrip: React.FC<BacktestKpiStripProps> = ({
  currentFrame,
  report,
  isFinished,
  currencyPrefix = 'R$',
}) => {
  const currentPnl = currentFrame?.currentPnl || 0;
  const currentPnlPercent = currentFrame?.currentPnlPercent || 0;
  const isPnlPositive = currentPnl >= 0;

  const winRateText =
    currentFrame && currentFrame.closedTradesCount > 0
      ? `${Math.round((currentFrame.winningTradesCount / currentFrame.closedTradesCount) * 100)}%`
      : isFinished
      ? `${report.winRate}%`
      : '0%';

  return (
    <div className="backtest-kpi-grid">
      {/* 1. Resultado Líquido */}
      <div className="backtest-kpi-card">
        <div className="backtest-kpi-label-row">
          <span className="truncate">Resultado Líquido</span>
          <DollarSign size={13} className="text-[#38BDF8] shrink-0" />
        </div>
        <div
          className={`backtest-kpi-value ${
            isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isPnlPositive ? '+' : ''}
          {currencyPrefix} {currentPnl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <span
          className={`backtest-kpi-sub ${
            currentPnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {currentPnlPercent >= 0 ? '+' : ''}
          {currentPnlPercent.toFixed(2)}%
        </span>
      </div>

      {/* 2. Taxa de Acerto (Win Rate) */}
      <div className="backtest-kpi-card">
        <div className="backtest-kpi-label-row">
          <span className="truncate">Taxa de Acerto</span>
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
        </div>
        <div className="backtest-kpi-value text-white">
          {winRateText}
        </div>
        <span className="backtest-kpi-sub text-[#64748B]">
          {currentFrame?.winningTradesCount || 0}W / {currentFrame?.losingTradesCount || 0}L
        </span>
      </div>

      {/* 3. Fator de Lucro */}
      <div className="backtest-kpi-card">
        <div className="backtest-kpi-label-row">
          <span className="truncate">Profit Factor</span>
          <Sparkles size={13} className="text-amber-400 shrink-0" />
        </div>
        <div className="backtest-kpi-value text-amber-300">
          {report.profitFactor}x
        </div>
        <span className="backtest-kpi-sub text-[#64748B]">
          Ganhos/perdas
        </span>
      </div>

      {/* 4. Drawdown Máximo */}
      <div className="backtest-kpi-card">
        <div className="backtest-kpi-label-row">
          <span className="truncate">Max Drawdown</span>
          <TrendingDown size={13} className="text-rose-400 shrink-0" />
        </div>
        <div className="backtest-kpi-value text-rose-400">
          -{report.maxDrawdownPercent}%
        </div>
        <span className="backtest-kpi-sub text-[#64748B]">
          Rebaixamento
        </span>
      </div>

      {/* 5. Total de Operações */}
      <div className="backtest-kpi-card">
        <div className="backtest-kpi-label-row">
          <span className="truncate">Total Trades</span>
          <Clock size={13} className="text-[#60A5FA] shrink-0" />
        </div>
        <div className="backtest-kpi-value text-white">
          {currentFrame?.closedTradesCount || 0} / {report.totalTrades}
        </div>
        <span className="backtest-kpi-sub text-[#64748B]">
          {report.breakevenTrades} no 0x0
        </span>
      </div>

      {/* 6. Índice de Sharpe */}
      <div className="backtest-kpi-card">
        <div className="backtest-kpi-label-row">
          <span className="truncate">Sharpe Ratio</span>
          <ShieldCheck size={13} className="text-[#38BDF8] shrink-0" />
        </div>
        <div className="backtest-kpi-value text-[#38BDF8]">
          {report.sharpeRatio}
        </div>
        <span className="backtest-kpi-sub text-[#64748B]">
          Risco vs retorno
        </span>
      </div>
    </div>
  );
};
