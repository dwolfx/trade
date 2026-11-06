import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  Bot,
  X,
} from 'lucide-react';
import { BotDecisionLog, DecisionType, DaytradeBot } from '../../types/daytrade';

interface DaytradeDecisionFeedProps {
  logs: BotDecisionLog[];
  bots?: DaytradeBot[];
  selectedBotId?: string | 'ALL';
  onSelectBot?: (botId: string | 'ALL') => void;
}

export const DaytradeDecisionFeed: React.FC<DaytradeDecisionFeedProps> = ({
  logs,
  bots = [],
  selectedBotId: externalSelectedBotId,
  onSelectBot: externalOnSelectBot,
}) => {
  const [internalSelectedBotId, setInternalSelectedBotId] = useState<string | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'REJECTED' | 'EXECUTED'>('ALL');

  const activeBotId = externalSelectedBotId !== undefined ? externalSelectedBotId : internalSelectedBotId;
  const handleSelectBot = (id: string | 'ALL') => {
    if (externalOnSelectBot) {
      externalOnSelectBot(id);
    } else {
      setInternalSelectedBotId(id);
    }
  };

  const filteredLogs = logs.filter(log => {
    // 1. Bot Filter
    if (activeBotId !== 'ALL' && log.botId !== activeBotId) return false;

    // 2. Type Filter
    if (filterType === 'ALL') return true;
    if (filterType === 'REJECTED') return log.type === 'REJECTED';
    if (filterType === 'EXECUTED') return log.type === 'ENTRY' || log.type === 'EXIT';
    return true;
  });

  const getLogTypeVisuals = (type: DecisionType) => {
    switch (type) {
      case 'REJECTED':
        return {
          icon: ShieldAlert,
          iconColor: 'text-amber-400',
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          badgeText: 'ENTRADA RECUSADA · PROTEÇÃO',
          badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'ENTRY':
        return {
          icon: Zap,
          iconColor: 'text-[#38BDF8]',
          iconBg: 'bg-sky-500/10 border-sky-500/20',
          badgeText: 'ORDEM EXECUTADA',
          badgeStyle: 'bg-sky-500/15 text-[#38BDF8] border-sky-500/30',
        };
      case 'EXIT':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          iconBg: 'bg-emerald-500/10 border-emerald-500/20',
          badgeText: 'POSIÇÃO ENCERRADA',
          badgeStyle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      default:
        return {
          icon: Clock,
          iconColor: 'text-[#94A3B8]',
          iconBg: 'bg-slate-500/10 border-slate-500/20',
          badgeText: 'MONITORAMENTO',
          badgeStyle: 'bg-slate-500/15 text-[#94A3B8] border-slate-500/30',
        };
    }
  };

  const activeBotObj = bots.find(b => b.id === activeBotId);

  return (
    <div className="w-full bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col gap-4">
      {/* 1. Header and Type Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
            <h3 className="font-bold text-white text-base">
              Terminal de Auditoria & Decisões da IA (Live Feed)
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Registro em tempo real de análises, filtros de abstenção e execuções autônomas
          </p>
        </div>

        {/* Action Type Toggle */}
        <div className="inline-flex rounded-xl bg-[#0B0F19] p-1 border border-[#1E293B] self-stretch sm:self-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              filterType === 'ALL'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>Todas ({logs.length})</span>
          </button>
          <button
            onClick={() => setFilterType('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              filterType === 'REJECTED'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm border border-amber-500/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <ShieldAlert size={13} className="text-amber-400" />
            <span>Filtros de Proteção</span>
          </button>
          <button
            onClick={() => setFilterType('EXECUTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              filterType === 'EXECUTED'
                ? 'bg-[#1E293B] text-[#38BDF8] shadow-sm border border-sky-500/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Zap size={13} className="text-sky-400" />
            <span>Execuções</span>
          </button>
        </div>
      </div>

      {/* 2. Bot Selector Pills Bar (Segmentação por Robô) */}
      {bots.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-mono text-[#64748B] shrink-0 mr-1 hidden sm:inline">
            Filtrar por Robô:
          </span>

          <button
            onClick={() => handleSelectBot('ALL')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeBotId === 'ALL'
                ? 'bg-[#1E293B] text-white border border-sky-500/30 shadow-sm'
                : 'bg-[#0B0F19] text-[#94A3B8] border border-[#1E293B] hover:text-white'
            }`}
          >
            <Bot size={13} />
            <span>Todos os Robôs ({logs.length})</span>
          </button>

          {bots.map(bot => {
            const countForBot = logs.filter(l => l.botId === bot.id).length;
            const isSelected = activeBotId === bot.id;

            return (
              <button
                key={bot.id}
                onClick={() => handleSelectBot(bot.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#161F33] text-[#38BDF8] border border-sky-500/40 shadow-sm'
                    : 'bg-[#0B0F19] text-[#94A3B8] border border-[#1E293B] hover:text-white'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    bot.status === 'in_position'
                      ? 'bg-emerald-400 animate-pulse'
                      : bot.status === 'paused'
                      ? 'bg-slate-500'
                      : 'bg-sky-400'
                  }`}
                />
                <span>{bot.name}</span>
                <span className="text-[10px] text-[#64748B]">({countForBot})</span>
              </button>
            );
          })}

          {activeBotId !== 'ALL' && (
            <button
              onClick={() => handleSelectBot('ALL')}
              className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 ml-auto shrink-0 cursor-pointer"
            >
              <X size={12} />
              <span>Limpar filtro ({activeBotObj?.name})</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Decision Stream List */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#64748B] font-mono">
            Nenhuma decisão encontrada para este filtro.
          </div>
        ) : (
          filteredLogs.map(log => {
            const visual = getLogTypeVisuals(log.type);
            const Icon = visual.icon;
            const timeString = new Date(log.timestamp).toLocaleTimeString('pt-BR');

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] hover:border-[#334155] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                {/* Left: Icon + Bot/Symbol + Reason */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${visual.iconBg}`}
                  >
                    <Icon size={16} className={visual.iconColor} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{log.botName}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#1E293B] text-[#94A3B8]">
                        {log.symbol} ({log.market})
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${visual.badgeStyle}`}
                      >
                        {visual.badgeText}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B] ml-auto sm:ml-0">
                        {timeString}
                      </span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">
                      {log.reason}
                    </p>
                  </div>
                </div>

                {/* Right: Confidence Score & Metrics */}
                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center font-mono text-[11px]">
                  {log.resultPnl !== undefined && (
                    <div className="text-right">
                      <span className="text-[9px] text-[#64748B] block">RESULTADO</span>
                      <span
                        className={`font-bold ${
                          log.resultPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.resultPnl >= 0 ? '+' : ''}R$ {log.resultPnl.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="text-[9px] text-[#64748B] block">CONFLUÊNCIA</span>
                    <span
                      className={`font-bold ${
                        log.confidenceScore >= 75
                          ? 'text-emerald-400'
                          : log.confidenceScore >= 50
                          ? 'text-amber-400'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {log.confidenceScore}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
