import React, { useState } from 'react';
import { X, SlidersHorizontal, ShieldCheck, Zap } from 'lucide-react';
import { DaytradeBot, BotStrategy } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';

interface EditBotModalProps {
  isOpen: boolean;
  bot: DaytradeBot | null;
  onClose: () => void;
  onSaveBot: (updatedBot: DaytradeBot) => void;
}

export const EditBotModal: React.FC<EditBotModalProps> = ({
  isOpen,
  bot,
  onClose,
  onSaveBot,
}) => {
  if (!isOpen || !bot) return null;

  const [name, setName] = useState<string>(bot.name);
  const [strategy, setStrategy] = useState<BotStrategy>(bot.strategy);
  const [allocatedCapital, setAllocatedCapital] = useState<number>(bot.allocatedCapital);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(bot.maxDailyLoss);
  const [targetDailyProfit, setTargetDailyProfit] = useState<number>(bot.targetDailyProfit);
  const [confluenceThreshold, setConfluenceThreshold] = useState<number>(bot.confluenceThreshold);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DaytradeBot = {
      ...bot,
      name: name.trim() || bot.name,
      strategy,
      strategyLabel: STRATEGY_DEFINITIONS[strategy].label,
      strategyDescription: STRATEGY_DEFINITIONS[strategy].description,
      allocatedCapital,
      maxDailyLoss,
      targetDailyProfit,
      confluenceThreshold,
      lastUpdated: Date.now(),
      lastLog: `Parâmetros e estratégia atualizados para ${STRATEGY_DEFINITIONS[strategy].label} (${confluenceThreshold}% confluência).`,
    };

    onSaveBot(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white border ${
                bot.market === 'B3'
                  ? 'bg-blue-500/20 text-[#60A5FA] border-blue-500/30'
                  : 'bg-purple-500/20 text-[#C084FC] border-purple-500/30'
              }`}
            >
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base leading-none">
                  Editar Parâmetros & Estratégia
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1E293B] text-[#94A3B8]">
                  {bot.symbol} ({bot.market})
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Ajuste a metodologia operacional e regras de proteção do robô
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Nome do Robô */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
              Nome do Robô
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F1523] border border-[#1E293B] rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Metodologia Operacional */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">
              Metodologia Operacional (Estratégia)
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
                      name="edit-strategy"
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

          {/* Capital Alocado */}
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
              Capital Alocado (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#64748B]">
                R$
              </span>
              <input
                type="number"
                value={allocatedCapital}
                onChange={e => setAllocatedCapital(Math.max(100, Number(e.target.value)))}
                className="w-full pl-10 pr-4 py-2 bg-[#0F1523] border border-[#1E293B] rounded-xl text-white font-mono font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Gestão de Risco e Confluência */}
          <div className="p-3.5 rounded-xl bg-[#0F1523] border border-[#1E293B] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Regras de Proteção de Capital</span>
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
                max="92"
                step="2"
                value={confluenceThreshold}
                onChange={e => setConfluenceThreshold(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-0.5">
                <span>Mais Operações (60%)</span>
                <span>Filtro Rigoroso Anti-Ruído (92%)</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1E4FD9] hover:to-[#2563EB] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={16} />
              <span>Salvar e Aplicar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
