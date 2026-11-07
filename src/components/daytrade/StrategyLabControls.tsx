import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { BotMarket, BotStrategy } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';
import { CustomSelect, CustomSelectOption } from '../common/CustomSelect';
import { CurrencyInput } from '../common/CurrencyInput';

export interface LabAssetOption {
  symbol: string;
  name: string;
  market: BotMarket;
}

export const LAB_ASSET_OPTIONS: LabAssetOption[] = [
  { symbol: 'WINZ24', name: 'Mini-Índice B3', market: 'B3' },
  { symbol: 'WDOF25', name: 'Mini-Dólar B3', market: 'B3' },
  { symbol: 'PETR4', name: 'Petrobras PN', market: 'B3' },
  { symbol: 'VALE3', name: 'Vale ON', market: 'B3' },
  { symbol: 'BTCBRL', name: 'Bitcoin Spot', market: 'CRYPTO' },
  { symbol: 'ETHBRL', name: 'Ethereum Spot', market: 'CRYPTO' },
];

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

interface StrategyLabControlsProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  strategy: BotStrategy;
  onStrategyChange: (strategy: BotStrategy) => void;
  periodDays: number;
  onPeriodDaysChange: (days: number) => void;
  capital: number;
  onCapitalChange: (capital: number) => void;
  confluenceThreshold: number;
  onConfluenceThresholdChange: (threshold: number) => void;
  useBreakeven: boolean;
  onUseBreakevenChange: (val: boolean) => void;
  filterToxicHours: boolean;
  onFilterToxicHoursChange: (val: boolean) => void;
  filterLowAtr: boolean;
  onFilterLowAtrChange: (val: boolean) => void;
  isSimulating: boolean;
  onRunSimulation: () => void;
}

export const StrategyLabControls: React.FC<StrategyLabControlsProps> = ({
  symbol,
  onSymbolChange,
  strategy,
  onStrategyChange,
  periodDays,
  onPeriodDaysChange,
  capital,
  onCapitalChange,
  confluenceThreshold,
  onConfluenceThresholdChange,
  useBreakeven,
  onUseBreakevenChange,
  filterToxicHours,
  onFilterToxicHoursChange,
  filterLowAtr,
  onFilterLowAtrChange,
  isSimulating,
  onRunSimulation,
}) => {
  return (
    <div className="space-y-4">
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
              onClick={() => onSymbolChange(a.symbol)}
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
          onChange={onStrategyChange}
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
            onChange={onPeriodDaysChange}
            options={PERIOD_LAB_OPTIONS}
          />
        </div>
        <div>
          <label className="text-[10px] text-[#64748B] block mb-1 uppercase font-mono">
            Capital Simulado
          </label>
          <CurrencyInput
            value={capital}
            onChange={onCapitalChange}
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
            onChange={e => onConfluenceThresholdChange(Number(e.target.value))}
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
              onChange={e => onUseBreakevenChange(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="text-[11px]">Breakeven Relâmpago no 0.5x do Alvo</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterToxicHours}
              onChange={e => onFilterToxicHoursChange(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="text-[11px]">Bloquear Abertura e Notícias de Alto Impacto</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterLowAtr}
              onChange={e => onFilterLowAtrChange(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="text-[11px]">Filtro Anti-Consolidação (ATR Mínimo)</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={onRunSimulation}
        disabled={isSimulating}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1E4FD9] hover:to-[#2563EB] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        <Activity size={15} />
        <span>{isSimulating ? 'Calculando Simulação...' : 'Rodar Backtest Histórico'}</span>
      </button>
    </div>
  );
};
