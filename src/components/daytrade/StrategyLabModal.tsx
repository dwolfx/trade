import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BotStrategy, BacktestParams, BacktestResult } from '../../types/daytrade';
import { runBacktestSimulation } from '../../services/daytradeEngine';
import { Modal } from '../common/Modal';
import { StrategyLabControls, LAB_ASSET_OPTIONS } from './StrategyLabControls';
import { StrategyLabResults } from './StrategyLabResults';

interface StrategyLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStrategy?: (params: BacktestParams) => void;
}

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
  const [isSimulating, setIsSimulating] = useState(false);

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

  const modalIcon = (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2962FF] to-[#38BDF8] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
      <Sparkles size={18} />
    </div>
  );

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span>Laboratório Quant & Backtest de Estratégias</span>
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        ALTA ASSERTIVIDADE
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={modalIcon}
      title={modalTitle}
      subtitle="Simulação estatística com regras de proteção de capital e eliminação de ruídos"
      maxWidth="3xl"
      bodyClassName="p-4 sm:p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls (5 cols) */}
        <div className="lg:col-span-5">
          <StrategyLabControls
            symbol={symbol}
            onSymbolChange={setSymbol}
            strategy={strategy}
            onStrategyChange={setStrategy}
            periodDays={periodDays}
            onPeriodDaysChange={setPeriodDays}
            capital={capital}
            onCapitalChange={setCapital}
            confluenceThreshold={confluenceThreshold}
            onConfluenceThresholdChange={setConfluenceThreshold}
            useBreakeven={useBreakeven}
            onUseBreakevenChange={setUseBreakeven}
            filterToxicHours={filterToxicHours}
            onFilterToxicHoursChange={setFilterToxicHours}
            filterLowAtr={filterLowAtr}
            onFilterLowAtrChange={setFilterLowAtr}
            isSimulating={isSimulating}
            onRunSimulation={handleRunBacktest}
          />
        </div>

        {/* Right Results (7 cols) */}
        <div className="lg:col-span-7">
          <StrategyLabResults
            result={result}
            capital={capital}
            onApply={handleApply}
          />
        </div>
      </div>
    </Modal>
  );
};
