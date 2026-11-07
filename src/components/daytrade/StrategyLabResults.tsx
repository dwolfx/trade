import React from 'react';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { BacktestResult } from '../../types/daytrade';

interface StrategyLabResultsProps {
  result: BacktestResult;
  capital: number;
  onApply: () => void;
}

export const StrategyLabResults: React.FC<StrategyLabResultsProps> = ({
  result,
  capital,
  onApply,
}) => {
  // Helper for SVG Equity Curve calculation
  const curvePoints = result.equityCurve;
  const minEquity = Math.min(...curvePoints.map(p => p.equity));
  const maxEquity = Math.max(...curvePoints.map(p => p.equity));
  const rangeEquity = Math.max(1, maxEquity - minEquity);

  const svgWidth = 500;
  const svgHeight = 130;
  const svgPoints = curvePoints
    .map((pt, idx) => {
      const x = (idx / (curvePoints.length - 1)) * svgWidth;
      const y = svgHeight - ((pt.equity - minEquity) / rangeEquity) * (svgHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-4">
      {/* Top Result KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="p-3 rounded-xl bg-[#0F1523] border border-[#1E293B]">
          <span className="text-[10px] text-[#64748B] uppercase font-mono block">Win Rate</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400">
            {result.winRate}%
          </span>
          <span className="text-[9px] text-[#94A3B8] block mt-0.5 font-mono">
            {result.winningTrades}V / {result.losingTrades}D
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F1523] border border-[#1E293B]">
          <span className="text-[10px] text-[#64748B] uppercase font-mono block">Lucro Líquido</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400">
            +R$ {result.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[9px] text-emerald-400/80 block mt-0.5 font-mono">
            +{result.netProfitPercent}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F1523] border border-[#1E293B]">
          <span className="text-[10px] text-[#64748B] uppercase font-mono block">Fator Lucro</span>
          <span className="text-xl font-extrabold font-mono text-white">
            {result.profitFactor}
          </span>
          <span className="text-[9px] text-[#94A3B8] block mt-0.5 font-mono">
            Sharpe: {result.sharpeRatio}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F1523] border border-[#1E293B]">
          <span className="text-[10px] text-[#64748B] uppercase font-mono block">Max Drawdown</span>
          <span className="text-xl font-extrabold font-mono text-sky-400">
            -{result.maxDrawdownPercent}%
          </span>
          <span className="text-[9px] text-[#94A3B8] block mt-0.5 font-mono">
            Risco Controlado
          </span>
        </div>
      </div>

      {/* Equity Curve Visual Chart */}
      <div className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B]">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-[#94A3B8] flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Curva de Capital Simulada (Equity Curve)</span>
          </span>
          <span className="text-emerald-400 font-bold">
            R$ {(capital + result.netProfit).toLocaleString('pt-BR')}
          </span>
        </div>

        {/* SVG Line Chart */}
        <div className="w-full h-[140px] relative flex items-center justify-center">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill under curve */}
            <polygon
              points={`0,${svgHeight} ${svgPoints} ${svgWidth},${svgHeight}`}
              fill="url(#equityGrad)"
            />

            {/* The Green Ascending Line */}
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={svgPoints}
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono mt-1 pt-1 border-t border-[#1E293B]">
          <span>Início: R$ {capital.toLocaleString('pt-BR')}</span>
          <span>{result.totalTrades} operações executadas</span>
          <span>Final: R$ {(capital + result.netProfit).toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {/* Summary Thought Box */}
      <div className="p-3.5 rounded-xl bg-[#161F33] border border-blue-500/20 text-xs text-[#CBD5E1] flex items-start gap-2.5">
        <span className="text-base leading-none">💡</span>
        <p className="leading-relaxed font-sans">{result.summaryMessage}</p>
      </div>

      {/* Action Button: Apply to new Bot */}
      <button
        type="button"
        onClick={onApply}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles size={16} />
        <span>Aplicar esta Estratégia em um Novo Robô</span>
        <ArrowRight size={15} />
      </button>
    </div>
  );
};
