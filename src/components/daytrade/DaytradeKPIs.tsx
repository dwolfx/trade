import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Bot, ShieldCheck } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { DaytradeMetrics } from '../../types/daytrade';

interface DaytradeKPIsProps {
  metrics: DaytradeMetrics;
  showBalance: boolean;
  mode?: 'DEMO' | 'LIVE';
}

export const DaytradeKPIs: React.FC<DaytradeKPIsProps> = ({
  metrics,
  showBalance,
  mode = 'DEMO',
}) => {
  const isPositive = metrics.totalDailyPnl >= 0;

  const formatCurrency = (val: number) => {
    if (!showBalance) return '••••••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Daily PnL */}
      <MetricCard
        label="Resultado do Dia (P&L Robôs)"
        icon={isPositive ? TrendingUp : TrendingDown}
        iconBg={isPositive ? 'bg-sky-500/10' : 'bg-rose-500/10'}
        iconColor={isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}
        value={
          <span className={isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'}>
            {showBalance
              ? `${isPositive ? '+' : ''}${formatCurrency(metrics.totalDailyPnl)}`
              : '••••••••••'}
          </span>
        }
        subValue={
          <span
            className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
              isPositive ? 'bg-sky-500/15 text-[#38BDF8]' : 'bg-rose-500/15 text-[#F43F5E]'
            }`}
          >
            {isPositive ? '+' : ''}
            {metrics.totalDailyPnlPercent.toFixed(2)}% do capital
          </span>
        }
        footerLeft="Atualizado a cada tick"
        badge={{
          text: mode === 'DEMO' ? 'Robôs em Simulador' : 'Execução Real DMA2',
          variant: mode === 'DEMO' ? 'amber' : 'sky',
        }}
      />

      {/* 2. Active Bots & Status */}
      <MetricCard
        label="Robôs em Execução"
        icon={Bot}
        iconBg="bg-blue-500/10"
        iconColor="text-[#60A5FA]"
        value={
          <span>
            {metrics.activeBotsCount}{' '}
            <span className="text-sm font-normal text-[#64748B]">/ {metrics.totalBotsCount} ativos</span>
          </span>
        }
        subValue={
          <span className="text-xs font-mono text-[#38BDF8] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            {metrics.inPositionCount} em posição agora
          </span>
        }
        footerLeft="Alocação multimercado B3 & Cripto"
        badge={{
          text: '24/7 Conectado',
          variant: 'sky',
        }}
      />

      {/* 3. Win Rate / Assertividade */}
      <MetricCard
        label="Assertividade Média (Win Rate)"
        icon={ShieldCheck}
        iconBg="bg-emerald-500/10"
        iconColor="text-[#10B981]"
        value={
          <span className="text-emerald-400 font-mono">
            {metrics.averageWinRate.toFixed(1)}%
          </span>
        }
        subValue={
          <span className="text-xs font-mono text-[#94A3B8]">
            {metrics.totalTradesToday} trades executados hoje
          </span>
        }
        footerLeft="Filtro anti-ruído ativo"
        badge={{
          text: 'Alta Confluência',
          variant: 'blue',
        }}
      />

      {/* 4. Capital Alocado */}
      <MetricCard
        label="Capital Total sob Gestão"
        icon={DollarSign}
        iconBg="bg-purple-500/10"
        iconColor="text-[#C084FC]"
        value={formatCurrency(metrics.totalAllocated)}
        subValue={
          <span className="text-xs font-mono text-[#94A3B8]">
            Limite de risco diário protegido
          </span>
        }
        footerLeft="Kill Switch configurado"
        badge={{
          text: 'Proteção de Capital',
          variant: 'sky',
        }}
      />
    </div>
  );
};
