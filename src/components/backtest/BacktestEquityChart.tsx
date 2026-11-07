import React from 'react';
import { RealBacktestReport, BacktestFrame } from '../../services/realBacktestEngine';

interface BacktestEquityChartProps {
  report: RealBacktestReport;
  currentFrame: BacktestFrame | null;
  currencyPrefix?: string;
}

export const BacktestEquityChart: React.FC<BacktestEquityChartProps> = ({
  report,
  currentFrame,
  currencyPrefix = 'R$',
}) => {
  const currentEquity = currentFrame?.equity || report.finalCapital;

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Curva de Capital Real (Equity Curve)
          </h4>
          <span className="text-[10px] text-[#64748B]">
            Evolução a partir de {currencyPrefix} {report.initialCapital.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-white">
            {currencyPrefix} {currentEquity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="block text-[10px] text-emerald-400 font-mono">
            Patrimônio Atual
          </span>
        </div>
      </div>

      <div className="h-36 w-full pt-2">
        {report.equityCurve.length > 1 ? (
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line
              x1="0"
              y1="100"
              x2="500"
              y2="100"
              stroke="#1E293B"
              strokeDasharray="4,4"
              strokeWidth="1"
            />

            {(() => {
              const values = report.equityCurve.map(p => p.equity);
              const min = Math.min(...values) * 0.98;
              const max = Math.max(...values) * 1.02;
              const range = max - min || 1;

              const points = report.equityCurve.map((p, idx) => {
                const x = (idx / (report.equityCurve.length - 1)) * 500;
                const y = 110 - ((p.equity - min) / range) * 100;
                return `${x},${y}`;
              });

              const linePath = `M ${points.join(' L ')}`;
              const areaPath = `${linePath} L 500,120 L 0,120 Z`;

              return (
                <g>
                  <path d={areaPath} fill="url(#equityGradient)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke={report.netProfit >= 0 ? '#38BDF8' : '#F43F5E'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>
              );
            })()}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
            Aguardando conclusões de trades para traçar curva...
          </div>
        )}
      </div>
    </div>
  );
};
