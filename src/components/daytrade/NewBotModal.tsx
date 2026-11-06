import React, { useState } from 'react';
import { X, Zap, ShieldCheck, Bot } from 'lucide-react';
import { BotMarket, BotStrategy, DaytradeBot } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';

interface NewBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBot: (newBot: DaytradeBot) => void;
  demoBalance: number;
}

const B3_ASSET_OPTIONS = [
  { symbol: 'WINZ24', name: 'Mini-Índice Futuro B3' },
  { symbol: 'WDOF25', name: 'Mini-Dólar Futuro B3' },
  { symbol: 'PETR4', name: 'Petrobras PN' },
  { symbol: 'VALE3', name: 'Vale ON' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco PN' },
  { symbol: 'WEGE3', name: 'WEG ON' },
];

const CRYPTO_ASSET_OPTIONS = [
  { symbol: 'BTCBRL', name: 'Bitcoin Spot' },
  { symbol: 'ETHBRL', name: 'Ethereum Spot' },
  { symbol: 'SOLBRL', name: 'Solana Spot' },
  { symbol: 'BNBBRL', name: 'BNB Chain' },
];

export const NewBotModal: React.FC<NewBotModalProps> = ({
  isOpen,
  onClose,
  onCreateBot,
  demoBalance,
}) => {
  if (!isOpen) return null;

  const [market, setMarket] = useState<BotMarket>('B3');
  const [symbol, setSymbol] = useState<string>('WINZ24');
  const [botName, setBotName] = useState<string>('Maya Sniper WIN');
  const [strategy, setStrategy] = useState<BotStrategy>('confluence_ai');
  const [allocatedCapital, setAllocatedCapital] = useState<number>(3000);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(450);
  const [targetDailyProfit, setTargetDailyProfit] = useState<number>(800);
  const [confluenceThreshold, setConfluenceThreshold] = useState<number>(80);

  const assetList = market === 'B3' ? B3_ASSET_OPTIONS : CRYPTO_ASSET_OPTIONS;

  const handleMarketChange = (newMarket: BotMarket) => {
    setMarket(newMarket);
    if (newMarket === 'B3') {
      setSymbol('WINZ24');
      setBotName('Maya Sniper WIN');
    } else {
      setSymbol('BTCBRL');
      setBotName('Maya BTC Trend');
    }
  };

  const handleAssetSelect = (newSymbol: string) => {
    setSymbol(newSymbol);
    const assetObj = assetList.find(a => a.symbol === newSymbol);
    if (assetObj) {
      setBotName(`Maya ${assetObj.symbol.replace('BRL', '')} Bot`);
    }
  };

  const handleCapitalPreset = (amount: number) => {
    setAllocatedCapital(amount);
    setMaxDailyLoss(Math.round(amount * 0.15));
    setTargetDailyProfit(Math.round(amount * 0.25));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assetObj = assetList.find(a => a.symbol === symbol);

    const newBot: DaytradeBot = {
      id: `bot-${Date.now()}`,
      name: botName.trim() || `Maya ${symbol} Bot`,
      market,
      symbol,
      assetName: assetObj ? assetObj.name : symbol,
      strategy,
      strategyLabel: STRATEGY_DEFINITIONS[strategy].label,
      strategyDescription: STRATEGY_DEFINITIONS[strategy].description,
      allocatedCapital,
      status: 'running',
      currentPosition: null,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      tradesCount: 0,
      winningTrades: 0,
      winRate: 0,
      maxDailyLoss,
      targetDailyProfit,
      confluenceThreshold,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      lastLog: 'Robô inicializado e monitorando oportunidades com confluência.',
    };

    onCreateBot(newBot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#60A5FA] flex items-center justify-center border border-blue-500/20">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-none">
                Criar Novo Robô de Day Trade
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Configure a estratégia, limites de risco e capital alocado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Escolha do Mercado */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
              1. Mercado de Atuação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleMarketChange('B3')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  market === 'B3'
                    ? 'bg-blue-500/15 text-[#60A5FA] border-blue-500/40 shadow-sm'
                    : 'bg-[#0F1523] text-[#94A3B8] border-[#1E293B] hover:text-white'
                }`}
              >
                <span>🇧🇷 Bolsa B3 (Futuros & Ações)</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarketChange('CRYPTO')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  market === 'CRYPTO'
                    ? 'bg-purple-500/15 text-[#C084FC] border-purple-500/40 shadow-sm'
                    : 'bg-[#0F1523] text-[#94A3B8] border-[#1E293B] hover:text-white'
                }`}
              >
                <span>🪙 Criptoativos 24/7 Spot</span>
              </button>
            </div>
          </div>

          {/* 2. Seleção de Ativo */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
              2. Ativo Alvo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {assetList.map(a => (
                <button
                  key={a.symbol}
                  type="button"
                  onClick={() => handleAssetSelect(a.symbol)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    symbol === a.symbol
                      ? 'bg-[#161F33] text-white border-sky-500/40 shadow-sm'
                      : 'bg-[#0F1523] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-[#334155]'
                  }`}
                >
                  <div className="font-bold text-xs font-mono">{a.symbol}</div>
                  <div className="text-[10px] text-[#64748B] truncate mt-0.5">{a.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Metodologia / Estratégia */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
              3. Metodologia Operacional
            </label>
            <div className="space-y-2">
              {(Object.keys(STRATEGY_DEFINITIONS) as BotStrategy[]).map(key => {
                const strat = STRATEGY_DEFINITIONS[key];
                return (
                  <label
                    key={key}
                    onClick={() => setStrategy(key)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      strategy === key
                        ? 'bg-[#161F33] text-white border-blue-500/40 shadow-sm'
                        : 'bg-[#0F1523] text-[#94A3B8] border-[#1E293B] hover:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === key}
                      onChange={() => setStrategy(key)}
                      className="mt-1 accent-blue-500"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-white">{strat.label}</div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">{strat.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Capital Alocado & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                4. Capital Alocado
              </label>
              <span className="text-[11px] font-mono text-[#64748B]">
                Saldo Demo Disponível: R$ {demoBalance.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#64748B]">
                R$
              </span>
              <input
                type="number"
                value={allocatedCapital}
                onChange={e => setAllocatedCapital(Math.max(100, Number(e.target.value)))}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0F1523] border border-[#1E293B] rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {[1000, 2500, 5000, 10000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleCapitalPreset(val)}
                  className="px-2 py-1 bg-[#1E293B] hover:bg-slate-700 text-[#CBD5E1] rounded-lg text-[10px] font-mono transition-colors"
                >
                  R$ {val.toLocaleString('pt-BR')}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Gestão de Risco & Filtro de Confluência */}
          <div className="p-3.5 rounded-xl bg-[#0F1523] border border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Gestão de Risco & Regra de Abstenção</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-[#64748B] block mb-1 uppercase font-mono">
                  Stop Loss Diário (Kill Switch)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-rose-400">
                    -R$
                  </span>
                  <input
                    type="number"
                    value={maxDailyLoss}
                    onChange={e => setMaxDailyLoss(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 bg-[#0B0F19] border border-rose-500/30 rounded-lg text-rose-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#64748B] block mb-1 uppercase font-mono">
                  Meta de Lucro Diária
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400">
                    +R$
                  </span>
                  <input
                    type="number"
                    value={targetDailyProfit}
                    onChange={e => setTargetDailyProfit(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-1.5 bg-[#0B0F19] border border-emerald-500/30 rounded-lg text-emerald-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Slider de Confluência */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#94A3B8]">Confluência Mínima para Entrar:</span>
                <span className="font-mono font-bold text-[#38BDF8]">{confluenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                step="5"
                value={confluenceThreshold}
                onChange={e => setConfluenceThreshold(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-0.5">
                <span>Mais Operações (60%)</span>
                <span>Filtro Rigoroso Anti-Ruído (90%)</span>
              </div>
            </div>
          </div>

          {/* Nome do Robô */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
              Nome do Robô
            </label>
            <input
              type="text"
              value={botName}
              onChange={e => setBotName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F1523] border border-[#1E293B] rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1E4FD9] hover:to-[#2563EB] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={16} />
              <span>Criar e Iniciar Robô Autônomo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
