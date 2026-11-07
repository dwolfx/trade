import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { BacktestEventLog } from '../../services/realBacktestEngine';

interface BacktestLiveTerminalProps {
  logs: BacktestEventLog[];
}

export const BacktestLiveTerminal: React.FC<BacktestLiveTerminalProps> = ({ logs }) => {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 shadow-xl space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <div className="flex items-center gap-2">
          <Terminal size={15} className="text-[#38BDF8]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Terminal de Decisões & Auditoria Barra a Barra
          </h4>
        </div>
        <span className="text-[10px] text-[#64748B] font-mono">
          {logs.length} eventos registrados
        </span>
      </div>

      <div ref={terminalContainerRef} className="backtest-terminal-scroll">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#64748B] text-xs">
            Aguardando primeiros gatilhos do replay histórico...
          </div>
        ) : (
          logs.map(log => (
            <div
              key={log.id}
              className={`p-2 rounded-lg border flex items-start gap-2 transition-all ${
                log.type === 'ENTRY'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                  : log.type === 'TAKE_PROFIT'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : log.type === 'BREAKEVEN'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : log.type === 'STOP_LOSS'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  : 'bg-[#161F33] border-[#1E293B] text-[#94A3B8]'
              }`}
            >
              <span className="text-[10px] text-[#64748B] shrink-0 pt-0.5">
                {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <div className="min-w-0">
                <strong className="block text-white font-bold">{log.title}</strong>
                <span className="text-[11px] leading-relaxed block text-[#CBD5E1]">
                  {log.description}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
