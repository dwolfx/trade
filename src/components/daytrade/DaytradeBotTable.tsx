import React from 'react';
import {
  Power,
  Trash2,
  Zap,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import { DaytradeBot } from '../../types/daytrade';

interface DaytradeBotTableProps {
  bots: DaytradeBot[];
  showBalance: boolean;
  onToggleStatus: (botId: string) => void;
  onClosePosition: (botId: string) => void;
  onDeleteBot: (botId: string) => void;
  onSelectBotAudit?: (botId: string) => void;
  onEditBot?: (bot: DaytradeBot) => void;
  onViewLogs?: (bot: DaytradeBot) => void;
}

export const DaytradeBotTable: React.FC<DaytradeBotTableProps> = ({
  bots,
  showBalance,
  onToggleStatus,
  onClosePosition,
  onDeleteBot,
  onSelectBotAudit,
  onEditBot,
  onViewLogs,
}) => {
  const formatCurrency = (val: number) => {
    if (!showBalance) return '••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full bg-[#0F1523] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B0F19] text-[#64748B] font-mono uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
            <tr>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Robô / Ativo</th>
              <th className="py-3 px-4">Estratégia</th>
              <th className="py-3 px-4 text-right">Capital</th>
              <th className="py-3 px-4 text-right">P&L Dia</th>
              <th className="py-3 px-4">Posição Aberta</th>
              <th className="py-3 px-4 text-center">Win Rate</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {bots.map(bot => {
              const isRunning =
                bot.status !== 'paused' &&
                bot.status !== 'stopped_loss' &&
                bot.status !== 'stopped_gain';
              const pos = bot.currentPosition;
              const isPositiveDaily = bot.dailyPnl >= 0;

              return (
                <tr
                  key={bot.id}
                  className={`hover:bg-[#161F33]/50 transition-colors ${
                    pos ? 'bg-emerald-500/[0.02]' : ''
                  }`}
                >
                  {/* 1. Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          pos
                            ? 'bg-emerald-400 animate-pulse'
                            : isRunning
                            ? 'bg-[#38BDF8] animate-pulse'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-mono text-[11px] font-bold text-white">
                        {pos
                          ? `EM POSIÇÃO (${pos.side})`
                          : bot.status === 'paused'
                          ? 'PAUSADO'
                          : bot.status === 'waiting_filter'
                          ? 'FILTRANDO'
                          : 'MONITORANDO'}
                      </span>
                    </div>
                  </td>

                  {/* 2. Robô / Ativo */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          bot.market === 'B3'
                            ? 'bg-blue-500/15 text-[#60A5FA]'
                            : 'bg-purple-500/15 text-[#C084FC]'
                        }`}
                      >
                        <Zap size={14} />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{bot.name}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1E293B] text-[#94A3B8]">
                            {bot.symbol}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#64748B]">{bot.market}</div>
                      </div>
                    </div>
                  </td>

                  {/* 3. Estratégia */}
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-[#CBD5E1]">
                    {bot.strategyLabel}
                  </td>

                  {/* 4. Capital */}
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-white font-semibold">
                    {formatCurrency(bot.allocatedCapital)}
                  </td>

                  {/* 5. PnL Dia */}
                  <td className="py-3 px-4 whitespace-nowrap text-right font-mono">
                    <span
                      className={`font-bold ${
                        isPositiveDaily ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositiveDaily ? '+' : ''}
                      {formatCurrency(bot.dailyPnl)}
                    </span>
                  </td>

                  {/* 6. Posição Aberta */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                    {pos ? (
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[#64748B] text-[9px] block">ENTRADA / ATUAL</span>
                          <span className="text-white font-semibold">
                            {pos.entryPrice} → {pos.currentPrice}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] text-[9px] block">P&L ABERTO</span>
                          <span
                            className={`font-bold ${
                              pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {pos.pnl >= 0 ? '+' : ''}
                            {formatCurrency(pos.pnl)}
                          </span>
                        </div>
                        <button
                          onClick={() => onClosePosition(bot.id)}
                          className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-[10px] border border-rose-500/30 transition-all cursor-pointer"
                        >
                          Zerar
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#64748B] italic">Sem posição aberta</span>
                    )}
                  </td>

                  {/* 7. Win Rate */}
                  <td className="py-3 px-4 whitespace-nowrap text-center font-mono">
                    <span className="font-bold text-white">{bot.winRate}%</span>
                    <span className="text-[10px] text-[#64748B] block">
                      {bot.tradesCount} trades
                    </span>
                  </td>

                  {/* 8. Ações */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Editar Parâmetros */}
                      {onEditBot && (
                        <button
                          onClick={() => onEditBot(bot)}
                          title="Editar estratégia e parâmetros"
                          className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-[#CBD5E1] text-[10px] font-mono transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal size={13} />
                        </button>
                      )}

                      {/* Ver Logs do Robô */}
                      {onViewLogs ? (
                        <button
                          onClick={() => onViewLogs(bot)}
                          title="Ver histórico de logs deste robô"
                          className="px-2 py-1 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-[#CBD5E1] text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FileText size={11} />
                          <span>Logs</span>
                        </button>
                      ) : onSelectBotAudit ? (
                        <button
                          onClick={() => onSelectBotAudit(bot.id)}
                          title="Ver auditoria deste robô"
                          className="px-2 py-1 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-[#CBD5E1] text-[10px] font-mono transition-colors cursor-pointer"
                        >
                          Logs
                        </button>
                      ) : null}

                      {/* Power */}
                      <button
                        onClick={() => onToggleStatus(bot.id)}
                        title={isRunning ? 'Pausar Robô' : 'Ativar Robô'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                          isRunning
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-[#1E293B] text-[#64748B] border-[#334155]'
                        }`}
                      >
                        <Power size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteBot(bot.id)}
                        title="Excluir"
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
