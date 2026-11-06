import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { BotMarket, BotStrategy, BacktestParams, BacktestResult } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS, runBacktestSimulation } from '../../services/daytradeEngine';
import { CustomSelect, CustomSelectOption } from '../common/CustomSelect';
import { CurrencyInput } from '../common/CurrencyInput';

interface StrategyLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStrategy?: (params: BacktestParams) => void;
}

const STRATEGY_LAB_OPTIONS: CustomSelectOption<BotStrategy>[] = (
  Object.keys(STRATEGY_DEFINITIONS) as BotStrategy[]
).map(key => ({
  value: key,
  label: STRATEGY_DEFINITIONS[key].label,
  description: STRATEGY_DEFINITIONS[key].description,
}));

const PERIOD_LAB_OPTIONS: CustomSelectOption<number>[] = [
  { value: 30, label: '30 Dias', badge: 'Recente', description: 'Último mês de operações' },
  { value: 60, label: '60 Dias', badge: 'Médio', description: 'Últimos 2 meses de validação' },
  { value: 90, label: '90 Dias', badge: 'Trimestre', description: 'Histórico trimestral completo' },
];

const LAB_ASSET_OPTIONS = [
  { symbol: 'WINZ24', name: 'Mini-Índice B3', market: 'B3' as BotMarket },
  { symbol: 'WDOF25', name: 'Mini-Dólar B3', market: 'B3' as BotMarket },
  { symbol: 'PETR4', name: 'Petrobras PN', market: 'B3' as BotMarket },
  { symbol: 'VALE3', name: 'Vale ON', market: 'B3' as BotMarket },
  { symbol: 'BTCBRL', name: 'Bitcoin Spot', market: 'CRYPTO' as BotMarket },
  { symbol: 'ETHBRL', name: 'Ethereum Spot', market: 'CRYPTO' as BotMarket },
];

export const StrategyLabModal: React.FC<StrategyLabModalProps> = ({
  isOpen,
  onClose,
  onApplyStrategy,
}) => {
  if (!isOpen) return null;

  const [symbol, setSymbol] = useState<string>('WINZ24');
  const [strategy, setStrategy] = useState<BotStrategy>('confluence_ai');
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [capital, setCapital] = useState<number>(5000);
  const [confluenceThreshold, setConfluenceThreshold] = useState<number>(85);
  const [useBreakeven, setUseBreakeven] = useState<boolean>(true);
  const [filterToxicHours, setFilterToxicHours] = useState<boolean>(true);
  const [filterLowAtr, setFilterLowAtr] = useState<boolean>(true);

  const selectedAsset = LAB_ASSET_OPTIONS.find(a => a.symbol === symbol) || LAB_ASSET_OPTIONS[0];

  // Current simulation result
  const [result, setResult] = useState<BacktestResult>(() =>
    runBacktestSimulation({
      symbol: 'WINZ24',
      market: 'B3',
      strategy: 'confluence_ai',
      periodDays: 30,
      capital: 5000,
      confluenceThreshold: 85,
      useBreakeven: true,
      filterToxicHours: true,
      filterLowAtr: true,
    })
  );

  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunBacktest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runBacktestSimulation({
        symbol,
        market: selectedAsset.market,
        strategy,
        periodDays,
        capital,
        confluenceThreshold,
        useBreakeven,
        filterToxicHours,
        filterLowAtr,
      });
      setResult(res);
      setIsSimulating(false);
    }, 350);
  };

  const handleApply = () => {
    if (onApplyStrategy) {
      onApplyStrategy({
        symbol,
        market: selectedAsset.market,
        strategy,
        periodDays,
        capital,
        confluenceThreshold,
        useBreakeven,
        filterToxicHours,
        filterLowAtr,
      });
    }
    onClose();
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2962FF] to-[#38BDF8] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base leading-none">
                  Laboratório Quant & Backtest de Estratégias
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  ALTA ASSERTIVIDADE
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Simulação estatística com regras de proteção de capital e eliminação de ruídos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: 2 Columns on Desktop */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Ativo Alvo */}
              <div>
                <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1.5 font-mono">
                  Ativo para Simulação
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {LAB_ASSET_OPTIONS.map(a => (
                    <button
                      key={a.symbol}
                      type="button"
                      onClick={() => setSymbol(a.symbol)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        symbol === a.symbol
                          ? 'bg-[#161F33] text-white border-sky-500/40 shadow-sm'
                          : 'bg-[#0F1523] text-[#94A3B8] border-[#1E293B] hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono">{a.symbol}</div>
                      <div className="text-[9px] text-[#64748B] truncate">{a.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metodologia */}
              <div>
                <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1.5 font-mono">
                  Estratégia Operacional
                </label>
                <CustomSelect
                  value={strategy}
                  onChange={setStrategy}
                  options={STRATEGY_LAB_OPTIONS}
                />
              </div>

              {/* Período & Capital */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#64748B] block mb-1 uppercase font-mono">
                    Período Histórico
                  </label>
                  <CustomSelect
                    value={periodDays}
                    onChange={setPeriodDays}
                    options={PERIOD_LAB_OPTIONS}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B] block mb-1 uppercase font-mono">
                    Capital Simulado
                  </label>
                  <CurrencyInput
                    value={capital}
                    onChange={setCapital}
                    min={100}
                    step={100}
                    quickPresets={[100, 500, 1000, 2500, 5000, 10000]}
                  />
                </div>
              </div>

              {/* Regras de Alta Assertividade */}
              <div className="p-3.5 rounded-xl bg-[#0F1523] border border-[#1E293B] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#38BDF8]">
                  <ShieldCheck size={14} />
                  <span>Filtros de Alta Assertividade (&gt; 85%)</span>
                </div>

                {/* Slider de Confluência */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-[#94A3B8]">Confluência Mínima:</span>
                    <span className="font-bold text-emerald-400">{confluenceThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="92"
                    step="2"
                    value={confluenceThreshold}
                    onChange={e => setConfluenceThreshold(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[9px] text-[#64748B] font-mono">
                    <span>Moderado (70%)</span>
                    <span>Ultra-Seletivo (92%)</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-1 text-xs text-[#CBD5E1]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useBreakeven}
                      onChange={e => setUseBreakeven(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span className="text-[11px]">Breakeven Relâmpago no 0.5x do Alvo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterToxicHours}
                      onChange={e => setFilterToxicHours(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span className="text-[11px]">Bloquear Abertura e Notícias de Alto Impacto</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterLowAtr}
                      onChange={e => setFilterLowAtr(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span className="text-[11px]">Filtro Anti-Consolidação (ATR Mínimo)</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunBacktest}
                disabled={isSimulating}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1E4FD9] hover:to-[#2563EB] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Activity size={15} />
                <span>{isSimulating ? 'Calculando Simulação...' : 'Rodar Backtest Histórico'}</span>
              </button>
            </div>

            {/* Right Results & Equity Curve (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
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
                onClick={handleApply}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Aplicar esta Estratégia em um Novo Robô</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
