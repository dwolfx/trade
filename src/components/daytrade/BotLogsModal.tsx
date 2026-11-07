import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DaytradeBot, BotDecisionLog, DecisionType } from '../../types/daytrade';
import { Modal } from '../common/Modal';

interface BotLogsModalProps {
  isOpen: boolean;
  bot: DaytradeBot | null;
  logs: BotDecisionLog[];
  onClose: () => void;
}

export const BotLogsModal: React.FC<BotLogsModalProps> = ({
  isOpen,
  bot,
  logs,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'REJECTED' | 'EXECUTED'>('ALL');

  if (!isOpen || !bot) return null;

  // Filter logs only for this bot
  const botLogs = logs.filter(l => l.botId === bot.id);
  const filteredLogs = botLogs.filter(log => {
    if (filterType === 'ALL') return true;
    if (filterType === 'REJECTED') return log.type === 'REJECTED';
    if (filterType === 'EXECUTED') return log.type === 'ENTRY' || log.type === 'EXIT';
    return true;
  });

  const getLogVisuals = (type: DecisionType) => {
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

  const modalIcon = (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white border ${
        bot.market === 'B3'
          ? 'bg-blue-500/20 text-[#60A5FA] border-blue-500/30'
          : 'bg-purple-500/20 text-[#C084FC] border-purple-500/30'
      }`}
    >
      <FileText size={18} />
    </div>
  );

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span>Histórico de Auditoria & Decisões</span>
      <span
        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
          bot.market === 'B3'
            ? 'bg-blue-500/15 text-[#60A5FA] border-blue-500/30'
            : 'bg-purple-500/15 text-[#C084FC] border-purple-500/30'
        }`}
      >
        {bot.name} ({bot.symbol})
      </span>
    </div>
  );

  const subHeader = (
    <>
      {/* Quick Bot KPI Bar */}
      <div className="bg-[#0F1523] px-4 py-3 border-b border-[#1E293B] flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono shrink-0">
        <div>
          <span className="text-[10px] text-[#64748B] block uppercase">P&L Hoje</span>
          <span
            className={`font-bold ${
              bot.dailyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {bot.dailyPnl >= 0 ? '+' : ''}R$ {bot.dailyPnl.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#64748B] block uppercase">Win Rate</span>
          <span className="text-white font-bold">{bot.winRate}%</span>
        </div>

        <div>
          <span className="text-[10px] text-[#64748B] block uppercase">Operações</span>
          <span className="text-white font-bold">{bot.tradesCount} trades</span>
        </div>

        <div>
          <span className="text-[10px] text-[#64748B] block uppercase">Capital</span>
          <span className="text-white font-bold">R$ {bot.allocatedCapital.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="p-3 sm:px-5 bg-[#0B0F19] border-b border-[#1E293B] flex items-center justify-between gap-2 shrink-0">
        <span className="text-xs font-mono text-[#64748B]">Decisões Registradas ({botLogs.length}):</span>
        <div className="inline-flex rounded-xl bg-[#0F1523] p-1 border border-[#1E293B]">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Todas ({botLogs.length})
          </button>
          <button
            onClick={() => setFilterType('REJECTED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              filterType === 'REJECTED'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <ShieldAlert size={12} className="text-amber-400" />
            <span>Rejeições</span>
          </button>
          <button
            onClick={() => setFilterType('EXECUTED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              filterType === 'EXECUTED'
                ? 'bg-[#1E293B] text-sky-400 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Zap size={12} className="text-sky-400" />
            <span>Execuções</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={modalIcon}
      title={modalTitle}
      subtitle={`${bot.strategyLabel} · Confluência Mínima: ${bot.confluenceThreshold}%`}
      maxWidth="2xl"
      subHeader={subHeader}
      bodyClassName="space-y-3 p-4 sm:p-5"
    >
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#64748B] font-mono">
          Nenhum log encontrado para o filtro selecionado.
        </div>
      ) : (
        filteredLogs.map(log => {
          const visual = getLogVisuals(log.type);
          const Icon = visual.icon;
          const timeString = new Date(log.timestamp).toLocaleTimeString('pt-BR');

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-[#0F1523] border border-[#1E293B] flex flex-col gap-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${visual.iconBg}`}
                  >
                    <Icon size={13} className={visual.iconColor} />
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${visual.badgeStyle}`}
                  >
                    {visual.badgeText}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#64748B]">{timeString}</span>
              </div>

              <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">
                {log.reason}
              </p>

              <div className="pt-1.5 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#64748B]">
                  Confluência IA: <strong className="text-white">{log.confidenceScore}%</strong>
                </span>
                {log.resultPnl !== undefined && (
                  <span
                    className={`font-bold ${
                      log.resultPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Resultado: {log.resultPnl >= 0 ? '+' : ''}R$ {log.resultPnl.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </Modal>
  );
};
