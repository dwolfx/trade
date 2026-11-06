import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PlusCircle,
  PauseCircle,
  PlayCircle,
  Bot,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { DaytradeKPIs } from './DaytradeKPIs';
import { DaytradeBotCard } from './DaytradeBotCard';
import { DaytradeBotTable } from './DaytradeBotTable';
import { DaytradeDecisionFeed } from './DaytradeDecisionFeed';
import { NewBotModal } from './NewBotModal';
import { EditBotModal } from './EditBotModal';
import { BotLogsModal } from './BotLogsModal';
import { StrategyLabModal } from './StrategyLabModal';
import { useMarket } from '../../context/MarketContext';
import {
  DaytradeBot,
  BotDecisionLog,
  DaytradeMetrics,
  BacktestParams,
} from '../../types/daytrade';
import {
  INITIAL_BOTS,
  INITIAL_DECISION_LOGS,
  simulateBotTick,
} from '../../services/daytradeEngine';

export const DaytradeCockpit: React.FC = () => {
  const { demoBalance, showBalance, mode } = useMarket();

  // Local storage loaded or initialized
  const [bots, setBots] = useState<DaytradeBot[]>(() => {
    try {
      const saved = localStorage.getItem('tradecraft_daytrade_bots');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_BOTS;
  });

  const [decisionLogs, setDecisionLogs] = useState<BotDecisionLog[]>(() => {
    try {
      const saved = localStorage.getItem('tradecraft_daytrade_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_DECISION_LOGS;
  });

  const [marketFilter, setMarketFilter] = useState<'ALL' | 'B3' | 'CRYPTO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RUNNING' | 'IN_POSITION' | 'PAUSED'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [selectedAuditBotId, setSelectedAuditBotId] = useState<string | 'ALL'>('ALL');

  // Modals state
  const [isNewBotModalOpen, setIsNewBotModalOpen] = useState(false);
  const [isStrategyLabModalOpen, setIsStrategyLabModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<DaytradeBot | null>(null);
  const [viewLogsBot, setViewLogsBot] = useState<DaytradeBot | null>(null);

  const feedRef = useRef<HTMLDivElement>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tradecraft_daytrade_bots', JSON.stringify(bots));
    } catch (e) {}
  }, [bots]);

  useEffect(() => {
    try {
      localStorage.setItem('tradecraft_daytrade_logs', JSON.stringify(decisionLogs));
    } catch (e) {}
  }, [decisionLogs]);

  // Real-time autonomous engine simulation loop (runs every 4.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setBots(prevBots => {
        const { updatedBots, newLogs } = simulateBotTick(prevBots, decisionLogs);
        if (newLogs.length > 0) {
          setDecisionLogs(prevLogs => [...newLogs, ...prevLogs].slice(0, 60));
        }
        return updatedBots;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [decisionLogs]);

  // Handlers for bot interactions
  const handleToggleBotStatus = (botId: string) => {
    setBots(prev =>
      prev.map(bot => {
        if (bot.id !== botId) return bot;
        const willBePaused = bot.status !== 'paused';
        return {
          ...bot,
          status: willBePaused ? 'paused' : 'running',
          lastLog: willBePaused ? 'Robô pausado pelo usuário.' : 'Robô reativado e monitorando mercado.',
        };
      })
    );
  };

  const handleClosePosition = (botId: string) => {
    setBots(prev =>
      prev.map(bot => {
        if (bot.id !== botId || !bot.currentPosition) return bot;
        const pnl = bot.currentPosition.pnl;
        const newDailyPnl = parseFloat((bot.dailyPnl + pnl).toFixed(2));
        const newTrades = bot.tradesCount + 1;
        const newWins = pnl > 0 ? bot.winningTrades + 1 : bot.winningTrades;

        // Log manual exit
        setDecisionLogs(logs => [
          {
            id: `log-manual-${Date.now()}`,
            botId: bot.id,
            botName: bot.name,
            symbol: bot.symbol,
            market: bot.market,
            timestamp: Date.now(),
            type: 'EXIT',
            action: 'POSIÇÃO ZERADA MANUALMENTE',
            reason: `Ordem a mercado executada pelo operador. P&L realizado: R$ ${pnl.toFixed(2)}.`,
            confidenceScore: 100,
            resultPnl: pnl,
          },
          ...logs,
        ]);

        return {
          ...bot,
          status: 'running',
          currentPosition: null,
          dailyPnl: newDailyPnl,
          tradesCount: newTrades,
          winningTrades: newWins,
          winRate: Math.round((newWins / newTrades) * 100),
          lastLog: `Posição zerada manualmente a mercado (${pnl >= 0 ? '+' : ''}R$ ${pnl.toFixed(2)}).`,
        };
      })
    );
  };

  const handleDeleteBot = (botId: string) => {
    setBots(prev => prev.filter(b => b.id !== botId));
    if (selectedAuditBotId === botId) {
      setSelectedAuditBotId('ALL');
    }
  };

  const handleCreateBot = (newBot: DaytradeBot) => {
    setBots(prev => [newBot, ...prev]);
    setDecisionLogs(logs => [
      {
        id: `log-created-${Date.now()}`,
        botId: newBot.id,
        botName: newBot.name,
        symbol: newBot.symbol,
        market: newBot.market,
        timestamp: Date.now(),
        type: 'MONITORING',
        action: 'ROBÔ CRIADO & ATIVADO',
        reason: `Inicializado com ${newBot.strategyLabel} e capital de R$ ${newBot.allocatedCapital.toLocaleString('pt-BR')}. Limiar de confluência em ${newBot.confluenceThreshold}%.`,
        confidenceScore: 100,
      },
      ...logs,
    ]);
  };

  const handleSaveEditedBot = (updatedBot: DaytradeBot) => {
    setBots(prev => prev.map(b => (b.id === updatedBot.id ? updatedBot : b)));
    setDecisionLogs(logs => [
      {
        id: `log-edit-${Date.now()}`,
        botId: updatedBot.id,
        botName: updatedBot.name,
        symbol: updatedBot.symbol,
        market: updatedBot.market,
        timestamp: Date.now(),
        type: 'MONITORING',
        action: 'ESTRATÉGIA ATUALIZADA',
        reason: `Estratégia e parâmetros reconfigurados para ${updatedBot.strategyLabel} (Confluência ${updatedBot.confluenceThreshold}%). Capital: R$ ${updatedBot.allocatedCapital.toLocaleString('pt-BR')}.`,
        confidenceScore: 100,
      },
      ...logs,
    ]);
  };

  const handlePauseAll = () => {
    setBots(prev =>
      prev.map(b => ({
        ...b,
        status: 'paused',
        lastLog: 'Pausado pelo comando global do Cockpit.',
      }))
    );
  };

  const handleResumeAll = () => {
    setBots(prev =>
      prev.map(b => ({
        ...b,
        status: b.currentPosition ? 'in_position' : 'running',
        lastLog: 'Reativado pelo comando global do Cockpit.',
      }))
    );
  };

  const handleSelectBotAudit = (botId: string) => {
    setSelectedAuditBotId(botId);
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplyStrategyFromLab = (_params: BacktestParams) => {
    // Open creation modal with parameters
    setIsNewBotModalOpen(true);
  };

  // Filtered Bots
  const filteredBots = useMemo(() => {
    return bots.filter(bot => {
      // Market filter
      if (marketFilter !== 'ALL' && bot.market !== marketFilter) return false;

      // Status filter
      if (statusFilter === 'RUNNING') {
        return bot.status === 'running' || bot.status === 'in_position' || bot.status === 'waiting_filter';
      }
      if (statusFilter === 'IN_POSITION') {
        return bot.status === 'in_position';
      }
      if (statusFilter === 'PAUSED') {
        return bot.status === 'paused' || bot.status === 'stopped_loss' || bot.status === 'stopped_gain';
      }

      return true;
    });
  }, [bots, marketFilter, statusFilter]);

  // Aggregate Metrics for KPIs
  const metrics = useMemo<DaytradeMetrics>(() => {
    const totalAllocated = bots.reduce((sum, b) => sum + b.allocatedCapital, 0);
    const totalDailyPnl = bots.reduce((sum, b) => {
      const openPnl = b.currentPosition ? b.currentPosition.pnl : 0;
      return sum + b.dailyPnl + openPnl;
    }, 0);
    const totalDailyPnlPercent = totalAllocated > 0 ? (totalDailyPnl / totalAllocated) * 100 : 0;
    const activeBotsCount = bots.filter(
      b => b.status === 'running' || b.status === 'in_position' || b.status === 'waiting_filter'
    ).length;
    const inPositionCount = bots.filter(b => b.status === 'in_position').length;
    const totalWins = bots.reduce((sum, b) => sum + b.winningTrades, 0);
    const totalTradesToday = bots.reduce((sum, b) => sum + b.tradesCount, 0);
    const averageWinRate = totalTradesToday > 0 ? Math.round((totalWins / totalTradesToday) * 100) : 0;

    return {
      totalAllocated,
      totalDailyPnl,
      totalDailyPnlPercent,
      activeBotsCount,
      totalBotsCount: bots.length,
      inPositionCount,
      averageWinRate,
      totalTradesToday,
    };
  }, [bots]);

  const allArePaused = bots.length > 0 && bots.every(b => b.status === 'paused' || b.status === 'stopped_loss');

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Centralized Page Header */}
      <PageHeader
        page="daytrade"
        rightActions={
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Strategy Lab & Backtest Button */}
            <button
              onClick={() => setIsStrategyLabModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F1523] border border-sky-500/30 hover:border-sky-500/60 text-[#38BDF8] text-xs font-bold transition-all shadow-sm hover:shadow-sky-500/10 cursor-pointer"
              title="Abrir Laboratório Quant & Backtesting de Estratégias"
            >
              <Sparkles size={14} className="text-[#38BDF8]" />
              <span>Laboratório Backtest</span>
            </button>

            {/* Quick Create Bot Button */}
            <button
              onClick={() => setIsNewBotModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1E4FD9] hover:to-[#2563EB] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Novo Robô IA</span>
            </button>

            {/* Global Pause / Panic Switch */}
            <button
              onClick={allArePaused ? handleResumeAll : handlePauseAll}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                allArePaused
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              }`}
              title={allArePaused ? 'Retomar todos os robôs' : 'Pausar imediatamente todos os robôs'}
            >
              {allArePaused ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
              <span>{allArePaused ? 'Retomar Todos' : 'Pausar Todos'}</span>
            </button>
          </div>
        }
      />

      {/* Top KPIs Bar */}
      <DaytradeKPIs
        metrics={metrics}
        showBalance={showBalance}
        mode={mode}
      />

      {/* Toolbar: Market Filters, Status Filters, and View Switcher */}
      <div className="w-full bg-[#0F1523] border border-[#1E293B] rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-md">
        {/* Left: Market Filter Tabs (Horizontal Scrollable on Mobile) */}
        <div className="inline-flex rounded-xl bg-[#0B0F19] p-1 border border-[#1E293B] self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setMarketFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              marketFilter === 'ALL'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Todos os Mercados ({bots.length})
          </button>
          <button
            onClick={() => setMarketFilter('B3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              marketFilter === 'B3'
                ? 'bg-[#161F33] text-[#60A5FA] border border-blue-500/30 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>🇧🇷 B3 ({bots.filter(b => b.market === 'B3').length})</span>
          </button>
          <button
            onClick={() => setMarketFilter('CRYPTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              marketFilter === 'CRYPTO'
                ? 'bg-[#161F33] text-[#C084FC] border border-purple-500/30 shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <span>🪙 Cripto ({bots.filter(b => b.market === 'CRYPTO').length})</span>
          </button>
        </div>

        {/* Right: Status Filter & View Switcher (Cards vs Table) */}
        <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
          <div className="inline-flex rounded-xl bg-[#0B0F19] p-1 border border-[#1E293B] overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'RUNNING', label: 'Ativos' },
              { id: 'IN_POSITION', label: 'Em Posição' },
              { id: 'PAUSED', label: 'Pausados' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  statusFilter === s.id
                    ? 'bg-[#1E293B] text-[#38BDF8] shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* View Switcher: Grid vs Table */}
          <div className="inline-flex rounded-xl bg-[#0B0F19] p-1 border border-[#1E293B]">
            <button
              onClick={() => setViewMode('CARDS')}
              title="Visualização em Cards"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-[#1E293B] text-[#38BDF8] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              title="Visualização em Tabela Compacta (Cockpit Matrix)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-[#1E293B] text-[#38BDF8] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Robots Display: Fixed Grid or Table */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Bot size={17} className="text-[#38BDF8]" />
            <h3 className="font-bold text-white text-base">
              Robôs Quant em Execução ({filteredBots.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-[#64748B]">
            Operando com Saldo Simulado (DEMO B3 & Binance)
          </span>
        </div>

        {filteredBots.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0F1523] border border-[#1E293B] text-center flex flex-col items-center justify-center gap-3">
            <Bot size={36} className="text-[#64748B]" />
            <div className="text-sm font-bold text-white">Nenhum robô encontrado para o filtro</div>
            <p className="text-xs text-[#94A3B8] max-w-sm">
              Crie um novo robô para automatizar operações em B3 ou Criptoativos com regras de confluência inteligente.
            </p>
            <button
              onClick={() => setIsNewBotModalOpen(true)}
              className="mt-2 py-2 px-4 rounded-xl bg-[#2962FF] hover:bg-[#1E4FD9] text-white text-xs font-bold transition-all cursor-pointer"
            >
              + Criar Meu Primeiro Robô
            </button>
          </div>
        ) : viewMode === 'CARDS' ? (
          /* Cards Grid with Fixed Height */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {filteredBots.map(bot => (
              <DaytradeBotCard
                key={bot.id}
                bot={bot}
                showBalance={showBalance}
                onToggleStatus={handleToggleBotStatus}
                onClosePosition={handleClosePosition}
                onDeleteBot={handleDeleteBot}
                onSelectBotAudit={handleSelectBotAudit}
                onEditBot={setEditingBot}
                onViewLogs={setViewLogsBot}
              />
            ))}
          </div>
        ) : (
          /* Cockpit Matrix Table View */
          <DaytradeBotTable
            bots={filteredBots}
            showBalance={showBalance}
            onToggleStatus={handleToggleBotStatus}
            onClosePosition={handleClosePosition}
            onDeleteBot={handleDeleteBot}
            onSelectBotAudit={handleSelectBotAudit}
            onEditBot={setEditingBot}
            onViewLogs={setViewLogsBot}
          />
        )}
      </div>

      {/* Decision Feed / Terminal Stream da IA (with Bot segmenting) */}
      <div ref={feedRef} id="decision-feed-terminal">
        <DaytradeDecisionFeed
          logs={decisionLogs}
          bots={bots}
          selectedBotId={selectedAuditBotId}
          onSelectBot={setSelectedAuditBotId}
        />
      </div>

      {/* Modal: Criar Novo Robô */}
      <NewBotModal
        isOpen={isNewBotModalOpen}
        onClose={() => setIsNewBotModalOpen(false)}
        onCreateBot={handleCreateBot}
        demoBalance={demoBalance}
      />

      {/* Modal: Laboratório Quant & Backtest */}
      <StrategyLabModal
        isOpen={isStrategyLabModalOpen}
        onClose={() => setIsStrategyLabModalOpen(false)}
        onApplyStrategy={handleApplyStrategyFromLab}
      />

      {/* Modal: Editar Parâmetros & Estratégia do Robô */}
      <EditBotModal
        isOpen={!!editingBot}
        bot={editingBot}
        onClose={() => setEditingBot(null)}
        onSaveBot={handleSaveEditedBot}
      />

      {/* Modal: Histórico de Logs & Auditoria Específica do Robô */}
      <BotLogsModal
        isOpen={!!viewLogsBot}
        bot={viewLogsBot}
        logs={decisionLogs}
        onClose={() => setViewLogsBot(null)}
      />
    </div>
  );
};
