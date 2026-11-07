import React from 'react';
import {
  Power,
  XCircle,
  Trash2,
  Zap,
  Activity,
  ArrowRight,
  SlidersHorizontal,
  FileText,
  Coins,
} from 'lucide-react';
import { DaytradeBot } from '../../types/daytrade';

interface DaytradeBotCardProps {
  bot: DaytradeBot;
  showBalance: boolean;
  onToggleStatus: (botId: string) => void;
  onClosePosition: (botId: string) => void;
  onDeleteBot: (botId: string) => void;
  onSelectBotAudit?: (botId: string) => void;
  onEditBot?: (bot: DaytradeBot) => void;
  onViewLogs?: (bot: DaytradeBot) => void;
}

export const DaytradeBotCard: React.FC<DaytradeBotCardProps> = ({
  bot,
  showBalance,
  onToggleStatus,
  onClosePosition,
  onDeleteBot,
  onSelectBotAudit,
  onEditBot,
  onViewLogs,
}) => {
  const isPositiveDaily = bot.dailyPnl >= 0;
  const isRunning =
    bot.status !== 'paused' && bot.status !== 'stopped_loss' && bot.status !== 'stopped_gain';
  const pos = bot.currentPosition;
  const isB3 = bot.market === 'B3';

  const formatCurrency = (val: number) => {
    if (!showBalance) return '••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = () => {
    switch (bot.status) {
      case 'in_position':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
          label: `EM POSIÇÃO: ${pos?.side === 'BUY' ? 'COMPRADO' : 'VENDIDO'}`,
        };
      case 'waiting_filter':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'FILTRO ANTI-RUÍDO ATIVO',
        };
      case 'stopped_loss':
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          label: 'KILL SWITCH (STOP DIÁRIO)',
        };
      case 'stopped_gain':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'META DE LUCRO BATIDA',
        };
      case 'paused':
        return {
          bg: 'bg-slate-500/15 text-[#94A3B8] border-slate-500/30',
          dot: 'bg-slate-500',
          label: 'PAUSADO',
        };
      case 'running':
      default:
        return {
          bg: 'bg-sky-500/15 text-[#38BDF8] border-sky-500/30',
          dot: 'bg-[#38BDF8] animate-pulse',
          label: 'MONITORANDO MERCADO',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between h-[410px] min-h-[410px] relative overflow-hidden group shadow-lg ${
        isB3
          ? 'bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] border-blue-500/25 hover:border-blue-500/50 shadow-blue-950/20'
          : 'bg-gradient-to-b from-[#170E28] to-[#0D0817] border-purple-500/30 hover:border-purple-500/60 shadow-purple-950/20'
      } ${
        bot.status === 'in_position'
          ? '!border-emerald-500/40 shadow-emerald-500/10'
          : bot.status === 'stopped_loss'
          ? '!border-rose-500/40'
          : ''
      }`}
    >
      {/* Top Ambient Highlight Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isB3
            ? 'bg-gradient-to-r from-blue-600 via-sky-400 to-transparent'
            : 'bg-gradient-to-r from-purple-600 via-fuchsia-400 to-transparent'
        }`}
      />

      {/* 1. Header Section: Title, Tags & Quick Actions */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                isB3
                  ? 'bg-blue-500/15 text-[#60A5FA] border-blue-500/30'
                  : 'bg-purple-500/20 text-[#C084FC] border-purple-500/30'
              }`}
            >
              {isB3 ? <Zap size={18} /> : <Coins size={18} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-base truncate">
                  {bot.name}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                    isB3
                      ? 'bg-blue-500/20 text-[#60A5FA] border-blue-500/40'
                      : 'bg-purple-500/20 text-[#C084FC] border-purple-500/40'
                  }`}
                >
                  {bot.market} · {bot.symbol}
                </span>
              </div>
              <div className="text-[11px] text-[#94A3B8] font-medium truncate mt-0.5">
                {bot.strategyLabel}
              </div>
            </div>
          </div>

          {/* Right Header Buttons: Edit & Power Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onEditBot && (
              <button
                onClick={() => onEditBot(bot)}
                title="Editar Parâmetros & Estratégia"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-[#1E293B]/70 hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#334155]/60 cursor-pointer"
              >
                <SlidersHorizontal size={14} />
              </button>
            )}

            <button
              onClick={() => onToggleStatus(bot.id)}
              title={isRunning ? 'Pausar Robô' : 'Ativar Robô'}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                isRunning
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 shadow-md shadow-emerald-500/10'
                  : 'bg-[#1E293B] text-[#64748B] border-[#334155] hover:text-white hover:bg-slate-800'
              }`}
            >
              <Power size={15} />
            </button>
          </div>
        </div>

        {/* Live Status Pill & Confluence threshold */}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] ${statusBadge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.label}</span>
          </div>

          <div className="text-[11px] font-mono text-[#64748B]">
            Filtro: <span className="text-[#CBD5E1] font-semibold">{bot.confluenceThreshold}% convicção</span>
          </div>
        </div>

        {/* 2. Middle Section: Fixed Height Slot (148px) - Rock Solid Size */}
        <div className="mt-3.5 h-[148px] min-h-[148px] max-h-[148px] flex flex-col justify-between">
          {pos ? (
            /* In-Position Live Dashboard (Exact 148px) */
            <div className="h-full p-3 rounded-xl bg-[#090D16]/90 border border-[#1E293B] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block">Entrada</span>
                  <span className="font-mono font-bold text-white text-xs sm:text-sm">
                    {pos.entryPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block">Atual</span>
                  <span className="font-mono font-bold text-white text-xs sm:text-sm">
                    {pos.currentPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] block">P&L Aberto</span>
                  <span
                    className={`font-mono font-extrabold text-xs sm:text-sm ${
                      pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {showBalance ? `${pos.pnl >= 0 ? '+' : ''}${formatCurrency(pos.pnl)}` : '••••••'}
                  </span>
                </div>
              </div>

              {/* Target & Stop Range Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-rose-400">Stop: {pos.stopLoss.toLocaleString('pt-BR')}</span>
                  <span className="text-emerald-400">Alvo: {pos.takeProfit.toLocaleString('pt-BR')}</span>
                </div>
                <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden flex">
                  <div
                    className={`tc-progress-fill h-full transition-all duration-300 ${
                      pos.pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{
                      '--fill-pct': `${Math.min(100, Math.max(10, 50 + pos.pnlPercent * 2))}%`,
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onClosePosition(bot.id)}
                className="w-full py-1.5 px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle size={13} />
                <span>Zerar Posição a Mercado</span>
              </button>
            </div>
          ) : (
            /* Idle / Waiting Filter Live Radar Slot (Exact 148px) */
            <div className="h-full p-3 rounded-xl bg-[#090D16]/80 border border-[#1E293B] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#94A3B8] flex items-center gap-1.5">
                  <Activity size={13} className={isB3 ? 'text-[#38BDF8]' : 'text-[#C084FC]'} />
                  <span>Radar de Confluência</span>
                </span>
                <span className={`font-bold ${isB3 ? 'text-[#38BDF8]' : 'text-[#C084FC]'}`}>
                  {bot.status === 'paused' ? 'Pausado' : 'Varrendo Book'}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Score Atual: ~68%</span>
                  <span>Meta: {bot.confluenceThreshold}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className={`tc-progress-fill h-full transition-all duration-500 ${
                      isB3
                        ? 'bg-gradient-to-r from-blue-500 to-sky-400'
                        : 'bg-gradient-to-r from-purple-500 to-fuchsia-400'
                    }`}
                    style={{ '--fill-pct': `${bot.status === 'paused' ? 0 : 68}%` } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1E293B]/60">
                <span className="text-[10px] text-[#64748B] truncate font-mono">
                  {bot.status === 'paused' ? 'Operações suspensas' : 'Aguardando gatilho de confluência'}
                </span>
                {onViewLogs ? (
                  <button
                    onClick={() => onViewLogs(bot)}
                    className="text-[11px] font-mono text-[#60A5FA] hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Ver Logs</span>
                    <ArrowRight size={11} />
                  </button>
                ) : onSelectBotAudit ? (
                  <button
                    onClick={() => onSelectBotAudit(bot.id)}
                    className="text-[11px] font-mono text-[#60A5FA] hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Auditoria</span>
                    <ArrowRight size={11} />
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* 3. Thought Snippet Slot: Fixed Height (42px) */}
        <div className="mt-2.5 h-[42px] min-h-[42px] max-h-[42px] text-xs text-[#94A3B8] bg-[#090D16]/60 p-2 rounded-xl border border-white/5 flex items-start gap-2 overflow-hidden">
          <span className="text-sky-400 text-xs leading-none shrink-0 mt-0.5">💡</span>
          <span className="leading-tight text-[11px] font-sans italic line-clamp-2">
            {bot.lastLog || 'Aguardando próximo ciclo de avaliação quantitativa.'}
          </span>
        </div>
      </div>

      {/* 4. Footer Metrics & Actions */}
      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#64748B] block">CAPITAL</span>
            <span className="font-semibold text-white">{formatCurrency(bot.allocatedCapital)}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block">P&L HOJE</span>
            <span
              className={`font-extrabold ${
                isPositiveDaily ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositiveDaily ? '+' : ''}
              {formatCurrency(bot.dailyPnl)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] block">WIN RATE</span>
            <span className="font-semibold text-[#CBD5E1]">{bot.winRate}%</span>
          </div>
        </div>

        {/* Actions: View Logs + Delete */}
        <div className="flex items-center gap-1">
          {onViewLogs && (
            <button
              onClick={() => onViewLogs(bot)}
              title="Ver Histórico Completo de Logs deste Robô"
              className="text-[#94A3B8] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <FileText size={15} />
            </button>
          )}

          <button
            onClick={() => onDeleteBot(bot.id)}
            title="Excluir Robô"
            className="text-[#64748B] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
