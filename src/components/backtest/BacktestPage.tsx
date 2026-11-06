import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../common/PageHeader';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Database,
  FlaskConical,
  Terminal,
  HelpCircle,
  History,
  X,
  Calendar,
} from 'lucide-react';
import { BotMarket, BotStrategy } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';
import {
  RealBacktestConfig,
  RealBacktestReport,
  BacktestPeriod,
  BACKTEST_PERIOD_CONFIG,
  fetchHistoricalCandlesForBacktest,
  runRealHistoricalBacktest,
  findOptimalBacktestConfig,
} from '../../services/realBacktestEngine';
import { getLiveUsdRate, UsdRateInfo } from '../../services/currencyService';
import { CustomSelect, CustomSelectOption } from '../common/CustomSelect';
import { CurrencyInput } from '../common/CurrencyInput';
import { ActiveNav } from '../../types/market';

interface BacktestPageProps {
  onNavigate?: (nav: ActiveNav) => void;
}

const TIMEFRAME_OPTIONS: CustomSelectOption<'1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D'>[] = [
  { value: '1m', label: '1 Minuto', badge: 'Ultra-Scalp', description: 'Reações instantâneas e alta frequência' },
  { value: '3m', label: '3 Minutos', badge: 'Scalp Tático', description: 'Entrada antecipada com menos ruído' },
  { value: '5m', label: '5 Minutos', badge: 'Scalp Rápido', description: 'Ponto de equilíbrio ideal para momentum' },
  { value: '15m', label: '15 Minutos', badge: 'Daytrade Padrão', description: 'Confluência institucional clássica' },
  { value: '30m', label: '30 Minutos', badge: 'Daytrade Estruturado', description: 'Operações limpas com menos ruído' },
  { value: '1h', label: '60 Minutos', badge: '1 Hora', description: 'Tendência intradiária e swing trading' },
  { value: '1D', label: '1 Dia', badge: 'Diário', description: 'Visão macro e tendência primária' },
];

const STRATEGY_OPTIONS: CustomSelectOption<BotStrategy>[] = Object.entries(STRATEGY_DEFINITIONS).map(
  ([key, def]) => ({
    value: key as BotStrategy,
    label: def.label,
    description: def.description,
  })
);

const PRESET_TICKERS: Record<BotMarket, { symbol: string; label: string }[]> = {
  B3: [
    { symbol: 'PETR4', label: 'Petrobras PN' },
    { symbol: 'VALE3', label: 'Vale ON' },
    { symbol: 'ITUB4', label: 'Itaú Unibanco' },
    { symbol: 'WIN', label: 'Mini-Índice B3' },
    { symbol: 'BBDC4', label: 'Bradesco PN' },
    { symbol: 'WEGE3', label: 'WEG ON' },
  ],
  CRYPTO: [
    { symbol: 'BTCBRL', label: 'Bitcoin (BRL)' },
    { symbol: 'ETHBRL', label: 'Ethereum (BRL)' },
    { symbol: 'SOLBRL', label: 'Solana (BRL)' },
    { symbol: 'BNBBRL', label: 'BNB (BRL)' },
    { symbol: 'DOGEBRL', label: 'Dogecoin (BRL)' },
    { symbol: 'LINKBRL', label: 'Chainlink (BRL)' },
  ],
};

export const BacktestPage: React.FC<BacktestPageProps> = ({ onNavigate }) => {
  const [market, setMarket] = useState<BotMarket>('CRYPTO');
  const [symbol, setSymbol] = useState<string>('BTCBRL');
  const [customTicker, setCustomTicker] = useState<string>('');
  const [strategy, setStrategy] = useState<BotStrategy>('confluence_ai');
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D'>('5m');
  const [period, setPeriod] = useState<BacktestPeriod>('30d');
  const [dateMode, setDateMode] = useState<'PRESET' | 'CALENDAR'>('PRESET');
  const [specificDate, setSpecificDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [capital, setCapital] = useState<number>(1000);
  const [sizingType, setSizingType] = useState<'FIXED_VALUE' | 'PERCENT'>('FIXED_VALUE');
  const [fixedTradeAmount, setFixedTradeAmount] = useState<number>(200);
  const [confluenceThreshold, setConfluenceThreshold] = useState<number>(80);
  const [riskReward, setRiskReward] = useState<number>(2.0);
  const [useBreakeven, setUseBreakeven] = useState<boolean>(true);
  const [filterToxicHours, setFilterToxicHours] = useState<boolean>(true);
  const [enableDailyGoals, setEnableDailyGoals] = useState<boolean>(true);
  const [enableComebackBreakeven, setEnableComebackBreakeven] = useState<boolean>(true);
  const [dailyStopLoss, setDailyStopLoss] = useState<number>(2.0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationNotice, setOptimizationNotice] = useState<string | null>(null);
  const [report, setReport] = useState<RealBacktestReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'WINS' | 'LOSSES'>('ALL');
  const [openExplainer, setOpenExplainer] = useState<'confluence' | 'riskReward' | null>(null);
  const [usdRateInfo, setUsdRateInfo] = useState<UsdRateInfo | null>(null);

  // Load live USD rate with safety locks on mount
  useEffect(() => {
    let isMounted = true;
    getLiveUsdRate().then(info => {
      if (isMounted) setUsdRateInfo(info);
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Recent/tested assets history persisted per market
  const [recentAssetsB3, setRecentAssetsB3] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradecraft_recent_backtest_B3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentAssetsCrypto, setRecentAssetsCrypto] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradecraft_recent_backtest_CRYPTO');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recentAssets = market === 'B3' ? recentAssetsB3 : recentAssetsCrypto;

  const addAssetToHistory = (ticker: string, mkt: BotMarket) => {
    const clean = ticker.trim().toUpperCase();
    if (!clean) return;

    if (mkt === 'B3') {
      const updated = [clean, ...recentAssetsB3.filter(a => a !== clean)].slice(0, 7);
      setRecentAssetsB3(updated);
      try {
        localStorage.setItem('tradecraft_recent_backtest_B3', JSON.stringify(updated));
      } catch {}
    } else {
      const updated = [clean, ...recentAssetsCrypto.filter(a => a !== clean)].slice(0, 7);
      setRecentAssetsCrypto(updated);
      try {
        localStorage.setItem('tradecraft_recent_backtest_CRYPTO', JSON.stringify(updated));
      } catch {}
    }
  };

  const currencyPrefix = 'R$';

  // Dynamic Replay state
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x
  const timerRef = useRef<number | null>(null);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle market switch
  const handleMarketChange = (newMarket: BotMarket) => {
    setMarket(newMarket);
    const defaultSymbol = newMarket === 'B3' ? 'PETR4' : 'BTCBRL';
    setSymbol(defaultSymbol);
    setCustomTicker('');
  };

  const activeSymbol = customTicker.trim() ? customTicker.trim().toUpperCase() : symbol;

  const handleRunBacktest = async (autoplay: boolean = true) => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const config: RealBacktestConfig = {
        symbol: activeSymbol,
        market,
        strategy,
        timeframe,
        period,
        initialCapital: capital,
        positionSizingType: sizingType,
        positionSizeValue: fixedTradeAmount,
        confluenceThreshold,
        riskRewardRatio: riskReward,
        stopLossAtrMultiplier: 1.5,
        useBreakeven,
        filterToxicHours,
        slippagePercent: 0.02,
        enableDailyGoals,
        enableComebackBreakeven,
        dailyStopLossPercent: dailyStopLoss,
      };

      // 1. Fetch real historical candles
      const { candles, isReal, source } = await fetchHistoricalCandlesForBacktest(
        activeSymbol,
        market,
        timeframe,
        period,
        dateMode === 'CALENDAR' ? specificDate : undefined
      );

      // 2. Execute bar-by-bar walk-forward simulation
      const resultReport = runRealHistoricalBacktest(candles, config, isReal, source);
      setReport(resultReport);
      addAssetToHistory(activeSymbol, market);

      if (autoplay && resultReport.frames.length > 0) {
        // Start replay from frame 0 and play
        setCurrentFrameIndex(0);
        setIsPlaying(true);
      } else {
        // Jump straight to the end
        setCurrentFrameIndex(Math.max(0, resultReport.frames.length - 1));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar dados históricos de mercado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationNotice(null);
    setErrorMsg(null);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const { candles, isReal, source } = await fetchHistoricalCandlesForBacktest(
        activeSymbol,
        market,
        timeframe,
        period,
        dateMode === 'CALENDAR' ? specificDate : undefined
      );

      const baseConfig: RealBacktestConfig = {
        symbol: activeSymbol,
        market,
        strategy,
        timeframe,
        period,
        initialCapital: capital,
        positionSizingType: sizingType,
        positionSizeValue: fixedTradeAmount,
        confluenceThreshold,
        riskRewardRatio: riskReward,
        stopLossAtrMultiplier: 1.2,
        useBreakeven,
        filterToxicHours,
        slippagePercent: 0.02,
        enableDailyGoals,
        enableComebackBreakeven,
        dailyStopLossPercent: dailyStopLoss,
      };

      const result = findOptimalBacktestConfig(candles, baseConfig, isReal, source);

      // Calibrate input parameters on screen
      setConfluenceThreshold(result.bestConfig.confluenceThreshold);
      setRiskReward(result.bestConfig.riskRewardRatio);
      setUseBreakeven(result.bestConfig.useBreakeven);

      // Apply the winning backtest report immediately
      setReport(result.optimizedReport);
      setCurrentFrameIndex(Math.max(0, result.optimizedReport.frames.length - 1));
      addAssetToHistory(activeSymbol, market);

      const gainFormatted = result.netProfitGain >= 0
        ? `+R$ ${result.netProfitGain.toFixed(2)}`
        : `R$ ${result.netProfitGain.toFixed(2)}`;

      setOptimizationNotice(
        `✨ IA Calibrada com Sucesso (${result.totalCombosTested} simulações): Confluência ${result.bestConfig.confluenceThreshold}% · Risco:Retorno 1:${result.bestConfig.riskRewardRatio.toFixed(1)} · Breakeven: ${result.bestConfig.useBreakeven ? 'Ativo' : 'Desativado'}. Melhoria no Lucro: ${gainFormatted}!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao rodar calibração de IA.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying || !report || report.frames.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(20, Math.floor(250 / playbackSpeed));

    timerRef.current = window.setInterval(() => {
      setCurrentFrameIndex(prev => {
        if (prev >= report.frames.length - 1) {
          setIsPlaying(false);
          return report.frames.length - 1;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, report, playbackSpeed]);

  const currentFrame = report?.frames[currentFrameIndex] || null;
  const isFinished = report && currentFrameIndex >= report.frames.length - 1;

  // Visible logs up to current candle time
  const visibleLogs = report && currentFrame
    ? report.eventLogs.filter(log => log.timestamp <= currentFrame.time)
    : [];

  // Auto-scroll internal terminal container ONLY (without scrolling the page!)
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [visibleLogs.length]);

  const filteredTrades = report?.trades.filter(t => {
    if (filterType === 'WINS') return t.pnl > 0;
    if (filterType === 'LOSSES') return t.pnl <= 0;
    return true;
  }) || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader page="backtest" />

      {/* Optimization Notice Banner */}
      {optimizationNotice && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-200 text-xs shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span className="font-medium">{optimizationNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setOptimizationNotice(null)}
            className="text-amber-400 hover:text-white p-1 rounded-lg hover:bg-amber-500/20 cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#38BDF8]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Parâmetros do Replay Quant
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAIOptimize}
                  disabled={isLoading || isOptimizing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-300 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  title="Calibra os pesos e parâmetros com algoritmo walk-forward para este ativo"
                >
                  <Sparkles size={12} className={isOptimizing ? 'animate-spin text-amber-400' : 'text-amber-400'} />
                  <span>{isOptimizing ? 'Calibrando...' : 'Otimizar com IA'}</span>
                </button>
              </div>
            </div>

            {/* 1. Market Selection */}
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-2">
                Mercado de Atuação
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMarketChange('B3')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    market === 'B3'
                      ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-[#60A5FA] border-blue-500/50 shadow-sm'
                      : 'bg-[#161F33] text-[#64748B] border-[#1E293B] hover:text-white'
                  }`}
                >
                  <TrendingUp size={14} />
                  Bolsa B3 (Ações & Mini)
                </button>
                <button
                  type="button"
                  onClick={() => handleMarketChange('CRYPTO')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    market === 'CRYPTO'
                      ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-[#C084FC] border-purple-500/50 shadow-sm'
                      : 'bg-[#161F33] text-[#64748B] border-[#1E293B] hover:text-white'
                  }`}
                >
                  <Activity size={14} />
                  Criptoativos 24/7 (Binance)
                </button>
              </div>

              {/* Dynamic Live USD / BRL Rate Badge with Safety Locks (Travas) */}
              {market === 'CRYPTO' && (
                <div className="mt-2.5 flex items-center justify-between text-[11px] bg-[#161F33]/80 border border-[#1E293B] rounded-xl px-3 py-2 text-[#94A3B8]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-emerald-300">Dólar do Dia:</span>
                    <span className="text-white font-mono font-bold">
                      {usdRateInfo ? usdRateInfo.formattedRate : 'R$ 5,52'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>{usdRateInfo ? usdRateInfo.sourceLabel : 'Trava Ativa ao Vivo'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Asset Selection & Custom Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8]">
                    {recentAssets.length > 0 ? 'Histórico & Ativos Testados' : 'Ativos Mais Negociados'}
                  </label>
                  {recentAssets.length > 0 && (
                    <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
                      <History size={10} />
                      Recentes
                    </span>
                  )}
                </div>
                {recentAssets.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (market === 'B3') {
                        setRecentAssetsB3([]);
                        localStorage.removeItem('tradecraft_recent_backtest_B3');
                      } else {
                        setRecentAssetsCrypto([]);
                        localStorage.removeItem('tradecraft_recent_backtest_CRYPTO');
                      }
                    }}
                    className="text-[10px] text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-pointer"
                  >
                    Restaurar Padrões
                  </button>
                ) : (
                  <span className="text-[10px] text-[#64748B]">
                    Mais movimentados da {market === 'B3' ? 'B3' : 'Binance'}
                  </span>
                )}
              </div>

              {/* Quick Preset / History Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[
                  ...recentAssets,
                  ...PRESET_TICKERS[market].map(p => p.symbol).filter(s => !recentAssets.includes(s)),
                ]
                  .slice(0, 8)
                  .map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => {
                        setSymbol(sym);
                        setCustomTicker('');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activeSymbol === sym
                          ? market === 'B3'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-purple-500 text-white shadow-md'
                          : 'bg-[#161F33] text-[#94A3B8] hover:text-white border border-[#1E293B]'
                      }`}
                    >
                      {recentAssets.includes(sym) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      )}
                      <span>{sym}</span>
                    </button>
                  ))}
              </div>

              {/* Freeform input for ANY ticker */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    market === 'B3'
                      ? 'Ou pesquise outro ativo B3 (Ex: WEGE3, BBAS3, RENT3)...'
                      : 'Ou pesquise qualquer crypto em R$ (Ex: SOL, SOLBRL, BTC, DOGEBRL)...'
                  }
                  value={customTicker}
                  onChange={e => setCustomTicker(e.target.value)}
                  className="w-full bg-[#161F33] border border-[#1E293B] focus:border-[#38BDF8] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-[#64748B] outline-none transition-colors"
                />
                {customTicker && (
                  <span className="absolute right-3 top-2 text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                    Personalizado
                  </span>
                )}
              </div>
            </div>

            {/* 3. Period / Specific Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">
                  Janela de Tempo (Período)
                </label>
                <div className="flex items-center gap-1 bg-[#161F33] p-0.5 rounded-lg border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setDateMode('PRESET')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      dateMode === 'PRESET'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    Períodos Rápidos
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateMode('CALENDAR')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      dateMode === 'CALENDAR'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    <Calendar size={11} />
                    <span>Dia Específico</span>
                  </button>
                </div>
              </div>

              {dateMode === 'PRESET' ? (
                <div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                    {(Object.keys(BACKTEST_PERIOD_CONFIG) as BacktestPeriod[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPeriod(p)}
                        className={`py-1.5 px-0.5 rounded-lg text-[10px] font-mono font-bold transition-all border text-center cursor-pointer ${
                          period === p
                            ? 'bg-sky-500/20 text-[#38BDF8] border-sky-500/50 shadow-sm'
                            : 'bg-[#161F33] text-[#64748B] border-[#1E293B] hover:text-white'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono block mt-1">
                    {BACKTEST_PERIOD_CONFIG[period].description}
                  </span>
                </div>
              ) : (
                <div className="space-y-2 bg-[#161F33]/80 border border-[#1E293B] rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#38BDF8] shrink-0" />
                    <input
                      type="date"
                      value={specificDate}
                      onChange={e => setSpecificDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#0F1523] border border-[#1E293B] focus:border-[#38BDF8] rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-[#64748B]">Atalhos:</span>
                    {[
                      { label: 'Ontem', daysAgo: 1 },
                      { label: 'Anteontem', daysAgo: 2 },
                      { label: '3 dias atrás', daysAgo: 3 },
                    ].map(s => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() - s.daysAgo);
                          setSpecificDate(d.toISOString().split('T')[0]);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B]/70 hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] block">
                    Simula as 24h exatas do dia {specificDate} com dados reais da {market === 'CRYPTO' ? 'Binance' : 'B3'}.
                  </span>
                </div>
              )}
            </div>

            {/* 4. Timeframe & Capital */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Tempo Gráfico
                </label>
                <CustomSelect
                  value={timeframe}
                  onChange={setTimeframe}
                  options={TIMEFRAME_OPTIONS}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Capital Inicial
                </label>
                <CurrencyInput
                  value={capital}
                  onChange={setCapital}
                  prefix={currencyPrefix}
                  min={100}
                  step={100}
                  quickPresets={[100, 500, 1000, 2500, 5000, 10000]}
                />
              </div>
            </div>

            {/* 5. Position Sizing: Valor Fixo em R$ por Trade vs % do Capital */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">
                  Alocação por Operação (Trade Sizing)
                </label>
                <div className="flex items-center gap-1 bg-[#161F33] p-0.5 rounded-lg border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setSizingType('FIXED_VALUE')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      sizingType === 'FIXED_VALUE'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    Valor Fixo (R$)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizingType('PERCENT')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      sizingType === 'PERCENT'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    % do Capital (20%)
                  </button>
                </div>
              </div>

              {sizingType === 'FIXED_VALUE' ? (
                <div>
                  <CurrencyInput
                    value={fixedTradeAmount}
                    onChange={setFixedTradeAmount}
                    prefix={currencyPrefix}
                    min={50}
                    step={50}
                    quickPresets={[50, 100, 200, 500, 1000]}
                  />
                  <span className="text-[10px] text-[#64748B] block mt-1">
                    Cada ordem executará exatamente {currencyPrefix} {fixedTradeAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {activeSymbol}, com risco calculado e seguro.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#161F33]/70 border border-[#1E293B] text-xs text-[#94A3B8]">
                  <span>Aloca 20% do capital disponível ({currencyPrefix} {(capital * 0.20).toFixed(2)}) por trade.</span>
                </div>
              )}
            </div>

            {/* 4. Strategy Selection */}
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Estratégia Quantitativa
              </label>
              <CustomSelect
                value={strategy}
                onChange={setStrategy}
                options={STRATEGY_OPTIONS}
              />
              <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
                {STRATEGY_DEFINITIONS[strategy].description}
              </p>
            </div>

            {/* 5. Smart Controls: Confluence & Risk:Reward */}
            <div className="space-y-4 pt-2 border-t border-[#1E293B]/60">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#94A3B8]">
                      Confluência Mínima IA
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenExplainer(openExplainer === 'confluence' ? null : 'confluence')}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                        openExplainer === 'confluence'
                          ? 'bg-[#38BDF8] text-black font-black'
                          : 'bg-[#161F33] text-[#38BDF8] border border-sky-500/30 hover:bg-sky-500/20'
                      }`}
                      title="Clique para entender o que é Confluência Mínima"
                    >
                      ?
                    </button>
                  </div>
                  <span className="font-mono font-bold text-[#38BDF8]">
                    {confluenceThreshold}%
                  </span>
                </div>

                {/* Explainer Box */}
                {openExplainer === 'confluence' && (
                  <div className="mb-2 p-3 rounded-xl bg-[#161F33] border border-[#38BDF8]/40 text-xs text-[#CBD5E1] space-y-1.5 shadow-xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[#38BDF8] font-bold">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle size={14} />
                        O que é Confluência Mínima?
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenExplainer(null)}
                        className="text-[#64748B] hover:text-white cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      É uma <strong>nota quantitativa (0 a 100%)</strong> calculada em tempo real pela IA. Ela valida quantos fatores técnicos confirmam a entrada ao mesmo tempo: <em>alinhamento de Médias Móveis (EMA 9/21), agressão do volume institucional, RSI e posição acima/abaixo da VWAP</em>.
                    </p>
                    <div className="text-[10px] text-[#94A3B8] pt-1.5 border-t border-[#1E293B] space-y-1">
                      <p>• <strong>80% a 90%:</strong> Alta exigência. Rejeita ruídos e falsos rompimentos, gerando menos trades, mas com alta assertividade.</p>
                      <p>• <strong>65% a 75%:</strong> Mais flexível. Aceita entradas com menor confirmação para operar mais vezes ao longo do dia.</p>
                    </div>
                  </div>
                )}

                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={confluenceThreshold}
                  onChange={e => setConfluenceThreshold(Number(e.target.value))}
                  className="w-full accent-[#38BDF8] bg-[#161F33] rounded-lg h-1.5 cursor-pointer"
                />
                <span className="text-[10px] text-[#64748B] block mt-1">
                  Rejeita entradas com ruído e pontuação inferior a {confluenceThreshold}%.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#94A3B8]">
                      Relação Risco : Retorno
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenExplainer(openExplainer === 'riskReward' ? null : 'riskReward')}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                        openExplainer === 'riskReward'
                          ? 'bg-emerald-400 text-black font-black'
                          : 'bg-[#161F33] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                      title="Clique para entender o que é Relação Risco : Retorno"
                    >
                      ?
                    </button>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">
                    1 : {riskReward.toFixed(1)}
                  </span>
                </div>

                {/* Explainer Box */}
                {openExplainer === 'riskReward' && (
                  <div className="mb-2 p-3 rounded-xl bg-[#161F33] border border-emerald-500/40 text-xs text-[#CBD5E1] space-y-1.5 shadow-xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle size={14} />
                        O que é Relação Risco : Retorno?
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenExplainer(null)}
                        className="text-[#64748B] hover:text-white cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      É a proporção matemática entre o <strong>tamanho do seu Stop Loss</strong> (o que você aceita arriscar se der errado) e o <strong>tamanho do seu Take Profit</strong> (o lucro que você busca na operação).
                    </p>
                    <div className="text-[10px] text-[#94A3B8] pt-1.5 border-t border-[#1E293B] space-y-1">
                      <p>• <strong>Em 1:2.0:</strong> Para cada {currencyPrefix} 1,00 arriscado, você busca ganhar {currencyPrefix} 2,00.</p>
                      <p>• <strong>Poder da Matemática:</strong> Com 1:2 ou superior, mesmo se você acertar apenas 40% das operações, você termina com lucro líquido positivo, porque suas vitórias compensam com folga as perdas!</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {[1.5, 2.0, 2.5, 3.0].map(rr => (
                    <button
                      key={rr}
                      type="button"
                      onClick={() => setRiskReward(rr)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                        riskReward === rr
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-[#161F33] text-[#64748B] border-[#1E293B] hover:text-white'
                      }`}
                    >
                      1:{rr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B] cursor-pointer hover:bg-[#161F33] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">
                      Proteger em Breakeven (0 a 0)
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      Move stop para o preço de entrada ao atingir 50% do alvo
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useBreakeven}
                    onChange={e => setUseBreakeven(e.target.checked)}
                    className="w-4 h-4 accent-[#38BDF8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B] cursor-pointer hover:bg-[#161F33] transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">
                      Filtro de Horários Tóxicos
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      Ignora candles de abertura com violinadas e ruídos de leilão
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filterToxicHours}
                    onChange={e => setFilterToxicHours(e.target.checked)}
                    className="w-4 h-4 accent-[#38BDF8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B] cursor-pointer hover:bg-[#161F33] transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white">
                        Escada de Metas (+2% ➔ 0x0; +5% ➔ +3%)
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        IA QUANT
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B]">
                      Trava de recuo que nunca deixa o lucro conquistado virar prejuízo
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableDailyGoals}
                    onChange={e => setEnableDailyGoals(e.target.checked)}
                    className="w-4 h-4 accent-[#38BDF8] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B] cursor-pointer hover:bg-[#161F33] transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white">
                        Trava de Alívio (Comeback Breakeven no 0x0)
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        PROTEÇÃO
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B]">
                      Se esteve no prejuízo e empatar no zero a zero, encerra com o capital 100% salvo
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableComebackBreakeven}
                    onChange={e => setEnableComebackBreakeven(e.target.checked)}
                    className="w-4 h-4 accent-[#38BDF8] rounded cursor-pointer"
                  />
                </label>

                <div className="p-2.5 rounded-xl bg-[#161F33]/60 border border-[#1E293B] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-xs font-medium text-white">
                      Stop Loss Diário (Limite de Perda)
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      -{dailyStopLoss.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1.5, 2.0, 3.0, 5.0].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDailyStopLoss(val)}
                        className={`py-1 rounded-lg text-[11px] font-mono font-bold transition-all border cursor-pointer ${
                          dailyStopLoss === val
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-[#161F33] text-[#64748B] border-[#1E293B] hover:text-white'
                        }`}
                      >
                        -{val.toFixed(1)}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Run Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleRunBacktest(true)}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#38BDF8] hover:from-[#1E4FD9] hover:to-[#0284C7] text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="animate-spin" size={16} />
                    <span>Baixando Candles & Inicializando Replay...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} fill="white" />
                    <span>Executar Replay Histórico Real (Com Animação)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRunBacktest(false)}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-[#161F33] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2 border border-[#1E293B]"
              >
                <FastForward size={14} />
                <span>Calcular Instantaneamente (Pular para o Final)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Replay & Analytics Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* INITIAL CLEAN EMPTY STATE */}
          {!report && !isLoading && (
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

              {/* 3 Value Props */}
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
          )}

          {/* SIMULATION ACTIVE OR FINISHED */}
          {report && (
            <>
              {/* Transparency Badge */}
              <div className="p-3.5 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[#94A3B8]">
                    Fonte dos Dados:{' '}
                    <strong className="text-white">{report.dataSource}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#64748B] font-mono text-[11px]">
                  <span>{report.totalCandles} Candles Reais</span>
                  <span>Zero Lookahead</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    Walk-Forward
                  </span>
                </div>
              </div>

              {/* REPLAY CONTROLLER & SCRUBBER */}
              <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Play / Pause / Skip Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isFinished) {
                          setCurrentFrameIndex(0);
                          setIsPlaying(true);
                        } else {
                          setIsPlaying(!isPlaying);
                        }
                      }}
                      className="w-10 h-10 rounded-xl bg-[#2962FF] hover:bg-[#1E4FD9] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
                      title={isPlaying ? 'Pausar Replay' : isFinished ? 'Reiniciar Replay' : 'Iniciar Replay'}
                    >
                      {isPlaying ? (
                        <Pause size={18} fill="white" />
                      ) : isFinished ? (
                        <RotateCcw size={18} />
                      ) : (
                        <Play size={18} fill="white" className="ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentFrameIndex(report.frames.length - 1);
                        setIsPlaying(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] text-xs font-bold text-[#94A3B8] hover:text-white border border-[#1E293B] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Pular para o final"
                    >
                      <FastForward size={14} />
                      <span className="hidden sm:inline">Pular pro Final</span>
                    </button>

                    {/* Speed selector */}
                    <div className="flex items-center gap-1 bg-[#161F33] p-1 rounded-xl border border-[#1E293B] text-xs font-mono">
                      {[1, 2, 5, 10].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPlaybackSpeed(s)}
                          className={`px-2 py-1 rounded-lg font-bold transition-all ${
                            playbackSpeed === s
                              ? 'bg-[#38BDF8] text-black shadow-sm'
                              : 'text-[#64748B] hover:text-white'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrubber Info */}
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <Clock size={12} className="text-[#38BDF8]" />
                      <span>
                        {currentFrame
                          ? new Date(currentFrame.time).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      Barra {currentFrameIndex + 1} de {report.frames.length} ({Math.round(((currentFrameIndex + 1) / report.frames.length) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Progress Range Slider */}
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, report.frames.length - 1)}
                  value={currentFrameIndex}
                  onChange={e => {
                    setCurrentFrameIndex(Number(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full accent-[#38BDF8] bg-[#161F33] rounded-lg h-2 cursor-pointer"
                />

                {/* Live State Telemetry Card */}
                {currentFrame && (
                  <div
                    className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
                      currentFrame.status === 'IN_POSITION'
                        ? currentFrame.position?.side === 'SELL'
                          ? 'bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-purple-950/40 border-purple-500/30'
                          : 'bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 border-emerald-500/30'
                        : 'bg-[#161F33]/70 border-[#1E293B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          currentFrame.status === 'IN_POSITION'
                            ? currentFrame.position?.side === 'SELL'
                              ? 'bg-purple-400 animate-pulse'
                              : 'bg-emerald-400 animate-pulse'
                            : 'bg-amber-400'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>
                            {currentFrame.status === 'IN_POSITION'
                              ? currentFrame.position?.side === 'SELL'
                                ? `VENDIDO (SHORT) EM ${activeSymbol}`
                                : `COMPRADO EM ${activeSymbol}`
                              : 'AGUARDANDO CONFLUÊNCIA'}
                          </span>
                          {currentFrame.position?.breakevenMoved && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-[#38BDF8] border border-blue-500/30">
                              BREAKEVEN ATIVADO
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#94A3B8]">
                          {currentFrame.status === 'IN_POSITION'
                            ? `Em operação há ${currentFrame.position?.barsHeld} candles (${((currentFrame.position?.barsHeld || 0) * (timeframe === '1m' ? 1 : timeframe === '3m' ? 3 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '30m' ? 30 : 60))} min) · Entrada: ${currencyPrefix} ${currentFrame.position?.entryPrice.toFixed(2)}`
                            : `Sem operar há ${currentFrame.idleBarsCount} candles (${currentFrame.idleBarsCount * (timeframe === '1m' ? 1 : timeframe === '3m' ? 3 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '30m' ? 30 : 60)} min) · Confluência: ${currentFrame.confluenceScore}% (Mínimo: ${confluenceThreshold}%)`}
                        </span>
                      </div>
                    </div>

                    {/* Floating PnL if in position */}
                    {currentFrame.position && (
                      <div className="text-right">
                        <span className="text-[10px] text-[#94A3B8] block">PnL Flutuante:</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            currentFrame.position.floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {currentFrame.position.floatingPnl >= 0 ? '+' : ''}
                          {currencyPrefix}{' '}
                          {currentFrame.position.floatingPnl.toFixed(2)} (
                          {currentFrame.position.floatingPnlPercent >= 0 ? '+' : ''}
                          {currentFrame.position.floatingPnlPercent.toFixed(2)}%)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KPI Metrics Matrix (Compact 6-column Strip ABOVE the Chart) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {/* 1. Resultado Líquido */}
                <div className="p-2.5 rounded-xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-0.5">
                    <span className="truncate">Resultado Líquido</span>
                    <DollarSign size={13} className="text-[#38BDF8] shrink-0" />
                  </div>
                  <div
                    className={`text-base sm:text-lg font-bold font-mono tracking-tight ${
                      (currentFrame?.currentPnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(currentFrame?.currentPnl || 0) >= 0 ? '+' : ''}
                    {currencyPrefix}{' '}
                    {(currentFrame?.currentPnl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold truncate ${
                      (currentFrame?.currentPnlPercent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(currentFrame?.currentPnlPercent || 0) >= 0 ? '+' : ''}
                    {(currentFrame?.currentPnlPercent || 0).toFixed(2)}%
                  </span>
                </div>

                {/* 2. Taxa de Acerto (Win Rate) */}
                <div className="p-2.5 rounded-xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-0.5">
                    <span className="truncate">Taxa de Acerto</span>
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-white">
                    {currentFrame && currentFrame.closedTradesCount > 0
                      ? `${Math.round((currentFrame.winningTradesCount / currentFrame.closedTradesCount) * 100)}%`
                      : isFinished ? `${report.winRate}%` : '0%'}
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono truncate">
                    {currentFrame?.winningTradesCount || 0}W / {currentFrame?.losingTradesCount || 0}L
                  </span>
                </div>

                {/* 3. Fator de Lucro */}
                <div className="p-2.5 rounded-xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-0.5">
                    <span className="truncate">Profit Factor</span>
                    <Sparkles size={13} className="text-amber-400 shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-amber-300">
                    {report.profitFactor}x
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono truncate">
                    Ganhos/perdas
                  </span>
                </div>

                {/* 4. Drawdown Máximo */}
                <div className="p-2.5 rounded-xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-0.5">
                    <span className="truncate">Max Drawdown</span>
                    <TrendingDown size={13} className="text-rose-400 shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-rose-400">
                    -{report.maxDrawdownPercent}%
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono truncate">
                    Rebaixamento
                  </span>
                </div>

                {/* 5. Total de Operações */}
                <div className="p-2.5 rounded-xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-0.5">
                    <span className="truncate">Total Trades</span>
                    <Clock size={13} className="text-[#60A5FA] shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-white">
                    {currentFrame?.closedTradesCount || 0} / {report.totalTrades}
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono truncate">
                    {report.breakevenTrades} no 0x0
                  </span>
                </div>

                {/* 6. Índice de Sharpe */}
                <div className="p-2.5 rounded-xl bg-[#0F1523] border border-[#1E293B] flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-0.5">
                    <span className="truncate">Sharpe Ratio</span>
                    <ShieldCheck size={13} className="text-[#38BDF8] shrink-0" />
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-[#38BDF8]">
                    {report.sharpeRatio}
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono truncate">
                    Risco vs retorno
                  </span>
                </div>
              </div>

              {/* LIVE CANDLE CHART REPLAY CANVAS */}
              <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <span>Gráfico de Candles em Replay Barra a Barra</span>
                      {isPlaying && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-[#38BDF8] border border-sky-500/30 animate-pulse">
                          REPLAY ATIVO
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-[#64748B]">
                      Velas históricas sendo formadas em tempo real conforme avanço
                    </span>
                  </div>
                  {currentFrame?.candle && (
                    <div className="text-right font-mono text-xs">
                      <span className="text-[#94A3B8]">Preço Atual: </span>
                      <strong className="text-white">
                        {currencyPrefix}{' '}
                        {currentFrame.candle.close.toFixed(2)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* SVG Visual Candlesticks */}
                <div className="h-52 w-full pt-2">
                  {(() => {
                    const maxCandlesToShow = 45;
                    const startIndex = Math.max(0, currentFrameIndex - maxCandlesToShow + 1);
                    const sliceCandles = report.candles.slice(startIndex, currentFrameIndex + 1);

                    if (sliceCandles.length === 0) {
                      return (
                        <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
                          Aguardando início dos candles...
                        </div>
                      );
                    }

                    const highs = sliceCandles.map(c => c.high);
                    const lows = sliceCandles.map(c => c.low);
                    const minPrice = Math.min(...lows) * 0.997;
                    const maxPrice = Math.max(...highs) * 1.003;
                    const priceRange = maxPrice - minPrice || 1;

                    const width = 600;
                    const height = 180;
                    const candleWidth = Math.max(4, Math.floor(width / maxCandlesToShow) - 3);

                    return (
                      <svg className="w-full h-full overflow-hidden" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                        {/* Background Grid Lines */}
                        <line x1="0" y1="45" x2={width} y2="45" stroke="#1E293B" strokeDasharray="3,3" strokeWidth="0.8" />
                        <line x1="0" y1="90" x2={width} y2="90" stroke="#1E293B" strokeDasharray="3,3" strokeWidth="0.8" />
                        <line x1="0" y1="135" x2={width} y2="135" stroke="#1E293B" strokeDasharray="3,3" strokeWidth="0.8" />

                        {/* In-Position Overlays: Entry, Take Profit, Stop Loss */}
                        {currentFrame?.position && (() => {
                          const pos = currentFrame.position;
                          const getY = (val: number) => height - ((val - minPrice) / priceRange) * height;

                          const entryY = getY(pos.entryPrice);
                          const tpY = getY(pos.takeProfit);
                          const slY = getY(pos.stopLoss);

                          return (
                            <>
                              {/* Take Profit Line (Green) */}
                              {tpY >= 0 && tpY <= height && (
                                <g>
                                  <line x1="0" y1={tpY} x2={width} y2={tpY} stroke="#10B981" strokeDasharray="4,4" strokeWidth="1.2" />
                                  <text x="8" y={tpY - 4} fill="#10B981" fontSize="9" fontFamily="monospace">
                                    ALVO: {pos.takeProfit.toFixed(2)}
                                  </text>
                                </g>
                              )}
                              {/* Entry Price Line (Cyan) */}
                              {entryY >= 0 && entryY <= height && (
                                <g>
                                  <line x1="0" y1={entryY} x2={width} y2={entryY} stroke="#38BDF8" strokeDasharray="5,3" strokeWidth="1.2" />
                                  <text x="8" y={entryY - 4} fill="#38BDF8" fontSize="9" fontFamily="monospace">
                                    ENTRADA: {pos.entryPrice.toFixed(2)}
                                  </text>
                                </g>
                              )}
                              {/* Stop Loss Line (Red) */}
                              {slY >= 0 && slY <= height && (
                                <g>
                                  <line x1="0" y1={slY} x2={width} y2={slY} stroke="#EF4444" strokeDasharray="4,4" strokeWidth="1.2" />
                                  <text x="8" y={slY - 4} fill="#EF4444" fontSize="9" fontFamily="monospace">
                                    STOP: {pos.stopLoss.toFixed(2)}
                                  </text>
                                </g>
                              )}
                            </>
                          );
                        })()}

                        {/* Render Candles */}
                        {sliceCandles.map((c, idx) => {
                          const x = idx * (width / maxCandlesToShow) + 5;
                          const isGreen = c.close >= c.open;
                          const color = isGreen ? '#10B981' : '#F43F5E';

                          const getY = (val: number) => height - ((val - minPrice) / priceRange) * height;

                          const highY = getY(c.high);
                          const lowY = getY(c.low);
                          const openY = getY(c.open);
                          const closeY = getY(c.close);

                          const bodyTop = Math.min(openY, closeY);
                          const bodyHeight = Math.max(2, Math.abs(openY - closeY));

                          return (
                            <g key={c.time} className="transition-opacity">
                              {/* Wick */}
                              <line
                                x1={x + candleWidth / 2}
                                y1={highY}
                                x2={x + candleWidth / 2}
                                y2={lowY}
                                stroke={color}
                                strokeWidth="1"
                              />
                              {/* Body */}
                              <rect
                                x={x}
                                y={bodyTop}
                                width={candleWidth}
                                height={bodyHeight}
                                fill={color}
                                rx="0.5"
                              />
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* LIVE DECISION TERMINAL AUDIT FEED */}
              <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-4 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={15} className="text-[#38BDF8]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Terminal de Decisões & Auditoria Barra a Barra
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono">
                    {visibleLogs.length} eventos registrados
                  </span>
                </div>

                <div ref={terminalContainerRef} className="h-36 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                  {visibleLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[#64748B] text-xs">
                      Aguardando primeiros gatilhos do replay histórico...
                    </div>
                  ) : (
                    visibleLogs.map(log => (
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

              {/* Equity Curve Chart */}
              <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Curva de Capital Real (Equity Curve)
                    </h4>
                    <span className="text-[10px] text-[#64748B]">
                      Evolução a partir de {currencyPrefix}{' '}
                      {report.initialCapital.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white">
                      {currencyPrefix}{' '}
                      {(currentFrame?.equity || report.finalCapital).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-mono">
                      Patrimônio Atual
                    </span>
                  </div>
                </div>

                {/* SVG Line Graphic */}
                <div className="h-36 w-full pt-2">
                  {report.equityCurve.length > 1 ? (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <line
                        x1="0"
                        y1="100"
                        x2="500"
                        y2="100"
                        stroke="#1E293B"
                        strokeDasharray="4,4"
                        strokeWidth="1"
                      />

                      {(() => {
                        const values = report.equityCurve.map(p => p.equity);
                        const min = Math.min(...values) * 0.98;
                        const max = Math.max(...values) * 1.02;
                        const range = max - min || 1;

                        const points = report.equityCurve.map((p, idx) => {
                          const x = (idx / (report.equityCurve.length - 1)) * 500;
                          const y = 110 - ((p.equity - min) / range) * 100;
                          return `${x},${y}`;
                        });

                        const linePath = `M ${points.join(' L ')}`;
                        const areaPath = `${linePath} L 500,120 L 0,120 Z`;

                        return (
                          <>
                            <path d={areaPath} fill="url(#equityGradient)" />
                            <path
                              d={linePath}
                              fill="none"
                              stroke={report.netProfit >= 0 ? '#38BDF8' : '#F43F5E'}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </>
                        );
                      })()}
                    </svg>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
                      Aguardando conclusões de trades para traçar curva...
                    </div>
                  )}
                </div>
              </div>

              {/* CTA: Create Autonomous Bot */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-[#1E293B]/60 to-sky-900/40 border border-[#38BDF8]/30 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#38BDF8]" />
                    <span className="text-sm font-bold text-white">
                      Gostou deste setup validado?
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Você pode rodar esse algoritmo autonomamente na tela de Daytrade agora mesmo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate?.('daytrade')}
                  className="px-4 py-2 rounded-xl bg-[#2962FF] hover:bg-[#1E4FD9] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Ir para Daytrade Cockpit</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Detailed Trades Log */}
              <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Registro de Operações Concluídas
                    </h4>
                    <span className="text-[10px] text-[#64748B]">
                      Todas as {report.trades.length} execuções simuladas barra a barra
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterType('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        filterType === 'ALL'
                          ? 'bg-[#1E293B] text-white font-bold'
                          : 'text-[#64748B] hover:text-white'
                      }`}
                    >
                      Todos ({report.trades.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('WINS')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        filterType === 'WINS'
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'text-[#64748B] hover:text-white'
                      }`}
                    >
                      Ganhos ({report.winningTrades})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('LOSSES')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        filterType === 'LOSSES'
                          ? 'bg-rose-500/20 text-rose-400 font-bold'
                          : 'text-[#64748B] hover:text-white'
                      }`}
                    >
                      Perdas ({report.losingTrades})
                    </button>
                  </div>
                </div>

                {/* Trades Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-[#64748B] font-mono text-[11px]">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Entrada</th>
                        <th className="py-2 px-3">Saída</th>
                        <th className="py-2 px-3">Preço Ent.</th>
                        <th className="py-2 px-3">Preço Saída</th>
                        <th className="py-2 px-3">Motivo</th>
                        <th className="py-2 px-3 text-right">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/40 font-mono">
                      {filteredTrades.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-[#64748B]">
                            Nenhum trade encontrado com os filtros selecionados.
                          </td>
                        </tr>
                      ) : (
                        filteredTrades.map(trade => (
                          <tr key={trade.id} className="hover:bg-[#161F33]/40 transition-colors">
                            <td className="py-2.5 px-3 text-[#64748B]">{trade.tradeNumber}</td>
                            <td className="py-2.5 px-3">
                              {trade.side === 'BUY' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  COMPRA
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  SHORT
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-white">
                              {new Date(trade.entryTime).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-[#94A3B8]">
                              {new Date(trade.exitTime).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-white">{trade.entryPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-white">{trade.exitPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3">
                              {trade.exitReason === 'TAKE_PROFIT' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  TAKE PROFIT
                                </span>
                              ) : trade.exitReason === 'BREAKEVEN' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  BREAKEVEN
                                </span>
                              ) : trade.exitReason === 'STOP_LOSS' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  STOP LOSS
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                  FIM PERÍODO
                                </span>
                              )}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-bold ${
                                trade.pnl > 0
                                  ? 'text-emerald-400'
                                  : trade.pnl < 0
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {trade.pnl > 0 ? '+' : ''}
                              {currencyPrefix}{' '}
                              {trade.pnl.toFixed(2)} ({trade.pnlPercent >= 0 ? '+' : ''}
                              {trade.pnlPercent.toFixed(2)}%)
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
