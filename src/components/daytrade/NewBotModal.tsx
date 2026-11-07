import React, { useState } from 'react';
import { Zap, ShieldCheck, Bot } from 'lucide-react';
import { BotMarket, BotStrategy, DaytradeBot } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';
import { Modal } from '../common/Modal';

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

  const modalIcon = (
    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#60A5FA] flex items-center justify-center border border-blue-500/20">
      <Bot size={18} />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={modalIcon}
      title="Criar Novo Robô de Day Trade"
      subtitle="Configure a estratégia, limites de risco e capital alocado"
      maxWidth="lg"
      bodyClassName="p-4 sm:p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Escolha do Mercado */}
        <div>
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
            Mercado Operacional
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleMarketChange('B3')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                market === 'B3'
                  ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-sm'
                  : 'bg-[#0F1523] border-[#1E293B] text-[#94A3B8] hover:text-white'
              }`}
            >
              🇧🇷 B3 (Futuros & Ações)
            </button>
            <button
              type="button"
              onClick={() => handleMarketChange('CRYPTO')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                market === 'CRYPTO'
                  ? 'bg-purple-600/15 border-purple-500 text-purple-400 shadow-sm'
                  : 'bg-[#0F1523] border-[#1E293B] text-[#94A3B8] hover:text-white'
              }`}
            >
              ⚡ Criptoativos 24/7
            </button>
          </div>
        </div>

        {/* Escolha do Ativo */}
        <div>
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
            Ativo Subjacente
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {assetList.map(item => {
              const isSelected = symbol === item.symbol;
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleAssetSelect(item.symbol)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500/15 border-blue-500 text-white'
                      : 'bg-[#0F1523] border-[#1E293B] text-[#94A3B8] hover:border-[#334155]'
                  }`}
                >
                  <div className="font-mono font-bold text-xs">{item.symbol}</div>
                  <div className="text-[10px] text-[#64748B] truncate">{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Escolha da Estratégia */}
        <div>
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
            Metodologia & Estratégia
          </label>
          <div className="space-y-2">
            {(Object.keys(STRATEGY_DEFINITIONS) as BotStrategy[]).map(key => {
              const def = STRATEGY_DEFINITIONS[key];
              const isSelected = strategy === key;
              return (
                <div
                  key={key}
                  onClick={() => setStrategy(key)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-sm'
                      : 'bg-[#0F1523] border-[#1E293B] hover:border-[#334155]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-blue-400' : 'bg-[#64748B]'
                        }`}
                      />
                      {def.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      Min: {def.defaultThreshold}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-1">
                    {def.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capital e Gestão de Risco */}
        <div className="p-4 rounded-xl bg-[#0F1523] border border-[#1E293B] space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Gestão de Risco & Capital Alocado
            </span>
            <span className="text-[11px] font-mono text-[#94A3B8]">
              Saldo Disp: R$ {demoBalance.toLocaleString('pt-BR')}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#94A3B8]">Capital Alocado:</span>
              <span className="font-mono font-bold text-white">
                R$ {allocatedCapital.toLocaleString('pt-BR')}
              </span>
            </div>
            {/* Quick Capital Presets */}
            <div className="flex gap-1.5 mb-2">
              {[1000, 3000, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleCapitalPreset(amt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    allocatedCapital === amt
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[10px] text-rose-400 uppercase font-semibold block mb-1">
                Stop Loss Diário
              </span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-rose-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => setMaxDailyLoss(Math.max(50, Number(e.target.value)))}
                  className="w-full pl-8 pr-2 py-1.5 bg-[#0B0F19] border border-rose-500/30 rounded-lg text-rose-300 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block mb-1">
                Meta de Ganho Diária
              </span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  value={targetDailyProfit}
                  onChange={e => setTargetDailyProfit(Math.max(50, Number(e.target.value)))}
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
    </Modal>
  );
};
