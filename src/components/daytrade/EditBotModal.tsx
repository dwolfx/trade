import React, { useState } from 'react';
import { SlidersHorizontal, ShieldCheck, Zap } from 'lucide-react';
import { DaytradeBot, BotStrategy } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';
import { Modal } from '../common/Modal';

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

  const modalIcon = (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white border ${
        bot.market === 'B3'
          ? 'bg-blue-500/20 text-[#60A5FA] border-blue-500/30'
          : 'bg-purple-500/20 text-[#C084FC] border-purple-500/30'
      }`}
    >
      <SlidersHorizontal size={18} />
    </div>
  );

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span>Editar Parâmetros & Estratégia</span>
      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1E293B] text-[#94A3B8]">
        {bot.symbol} ({bot.market})
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={modalIcon}
      title={modalTitle}
      subtitle="Ajuste a metodologia operacional e regras de proteção do robô"
      maxWidth="lg"
      bodyClassName="p-4 sm:p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
            Estratégia Quantitativa
          </label>
          <div className="space-y-2">
            {(Object.keys(STRATEGY_DEFINITIONS) as BotStrategy[]).map(key => {
              const def = STRATEGY_DEFINITIONS[key];
              const isSelected = strategy === key;
              return (
                <div
                  key={key}
                  onClick={() => setStrategy(key)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
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
                  <p className="text-[11px] text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                    {def.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gestão de Risco e Parâmetros */}
        <div className="p-4 rounded-xl bg-[#0F1523] border border-[#1E293B] space-y-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Regras de Proteção de Capital</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block mb-1">
                Capital Margem
              </span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#64748B] font-mono">
                  R$
                </span>
                <input
                  type="number"
                  value={allocatedCapital}
                  onChange={e => setAllocatedCapital(Math.max(100, Number(e.target.value)))}
                  className="w-full pl-8 pr-2 py-1.5 bg-[#0B0F19] border border-[#1E293B] rounded-lg text-white font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-rose-400 uppercase font-semibold block mb-1">
                Stop Diário
              </span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-rose-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => setMaxDailyLoss(Math.max(20, Number(e.target.value)))}
                  className="w-full pl-8 pr-2 py-1.5 bg-[#0B0F19] border border-rose-500/30 rounded-lg text-rose-300 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block mb-1">
                Meta Diária
              </span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  value={targetDailyProfit}
                  onChange={e => setTargetDailyProfit(Math.max(20, Number(e.target.value)))}
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
    </Modal>
  );
};
