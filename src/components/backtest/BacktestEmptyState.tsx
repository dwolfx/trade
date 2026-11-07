import React from 'react';
import { FlaskConical, Database, Play, Terminal } from 'lucide-react';

export const BacktestEmptyState: React.FC = () => {
  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-8 sm:p-12 text-center shadow-xl space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2962FF]/20 to-[#38BDF8]/20 border border-sky-500/30 flex items-center justify-center mx-auto text-[#38BDF8] shadow-inner">
        <FlaskConical size={32} />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Laboratório Quantitativo Pronto
        </h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          O painel está limpo aguardando seus parâmetros. Escolha o ativo e a estratégia ao lado e clique em{' '}
          <strong className="text-white">"Executar Replay Histórico Real"</strong> para assistir à simulação andando no gráfico!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
        <div className="p-3.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] mb-1">
            <Database size={14} />
            <span>Zero Lookahead</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-normal">
            Indicadores e confluências são calculados estritamente na barra corrente.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B]">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <Play size={14} />
            <span>Replay Visual</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-normal">
            Veja as velas andando, os stops se movendo para o breakeven e o robô operando.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B]">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Terminal size={14} />
            <span>Auditoria ao Vivo</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-normal">
            Entenda quanto tempo ficou parado aguardando e veja cada gatilho validado.
          </p>
        </div>
      </div>
    </div>
  );
};
