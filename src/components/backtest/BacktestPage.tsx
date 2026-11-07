import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../common/PageHeader';
import { Sparkles, ChevronRight, X, AlertCircle } from 'lucide-react';
import { BotMarket, BotStrategy } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';
import {
  RealBacktestConfig,
  RealBacktestReport,
  BacktestPeriod,
  fetchHistoricalCandlesForBacktest,
  runRealHistoricalBacktest,
  findOptimalBacktestConfig,
} from '../../services/realBacktestEngine';
import { getLiveUsdRate, UsdRateInfo } from '../../services/currencyService';
import { CustomSelectOption } from '../common/CustomSelect';
import { ActiveNav } from '../../types/market';

import './BacktestPage.css';
import { BacktestKpiStrip } from './BacktestKpiStrip';
import { BacktestReplayControls } from './BacktestReplayControls';
import { BacktestCandleChart } from './BacktestCandleChart';
import { BacktestLiveTerminal } from './BacktestLiveTerminal';
import { BacktestEquityChart } from './BacktestEquityChart';
import { BacktestTradeTable } from './BacktestTradeTable';
import { BacktestConfigPanel } from './BacktestConfigPanel';
import { BacktestEmptyState } from './BacktestEmptyState';

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
  const [riskReward, setRiskReward] = useState<number>(1.5);
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

  useEffect(() => {
    let isMounted = true;
    getLiveUsdRate().then(info => {
      if (isMounted) setUsdRateInfo(info);
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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

  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<number | null>(null);

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

      const { candles, isReal, source } = await fetchHistoricalCandlesForBacktest(
        activeSymbol,
        market,
        timeframe,
        period,
        dateMode === 'CALENDAR' ? specificDate : undefined
      );

      const resultReport = runRealHistoricalBacktest(candles, config, isReal, source);
      setReport(resultReport);
      addAssetToHistory(activeSymbol, market);

      if (autoplay && resultReport.frames.length > 0) {
        setCurrentFrameIndex(0);
        setIsPlaying(true);
      } else {
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

      setConfluenceThreshold(result.bestConfig.confluenceThreshold);
      setRiskReward(result.bestConfig.riskRewardRatio);
      setUseBreakeven(result.bestConfig.useBreakeven);

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
  const isFinished = report ? currentFrameIndex >= report.frames.length - 1 : false;

  const visibleLogs = report && currentFrame
    ? report.eventLogs.filter(log => log.timestamp <= currentFrame.time)
    : [];

  const filteredTrades = report?.trades.filter(t => {
    if (filterType === 'WINS') return t.pnl > 0;
    if (filterType === 'LOSSES') return t.pnl <= 0;
    return true;
  }) || [];

  return (
    <div className="backtest-container">
      <PageHeader page="backtest" />

      {optimizationNotice && (
        <div className="backtest-notice-banner">
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

      <div className="backtest-grid">
        <div className="backtest-col-config">
          <BacktestConfigPanel
            market={market}
            handleMarketChange={handleMarketChange}
            usdRateInfo={usdRateInfo}
            symbol={symbol}
            setSymbol={setSymbol}
            customTicker={customTicker}
            setCustomTicker={setCustomTicker}
            activeSymbol={activeSymbol}
            recentAssets={recentAssets}
            setRecentAssetsB3={setRecentAssetsB3}
            setRecentAssetsCrypto={setRecentAssetsCrypto}
            presetTickers={PRESET_TICKERS}
            dateMode={dateMode}
            setDateMode={setDateMode}
            period={period}
            setPeriod={setPeriod}
            specificDate={specificDate}
            setSpecificDate={setSpecificDate}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            timeframeOptions={TIMEFRAME_OPTIONS}
            capital={capital}
            setCapital={setCapital}
            sizingType={sizingType}
            setSizingType={setSizingType}
            fixedTradeAmount={fixedTradeAmount}
            setFixedTradeAmount={setFixedTradeAmount}
            strategy={strategy}
            setStrategy={setStrategy}
            strategyOptions={STRATEGY_OPTIONS}
            confluenceThreshold={confluenceThreshold}
            setConfluenceThreshold={setConfluenceThreshold}
            riskReward={riskReward}
            setRiskReward={setRiskReward}
            useBreakeven={useBreakeven}
            setUseBreakeven={setUseBreakeven}
            filterToxicHours={filterToxicHours}
            setFilterToxicHours={setFilterToxicHours}
            enableDailyGoals={enableDailyGoals}
            setEnableDailyGoals={setEnableDailyGoals}
            enableComebackBreakeven={enableComebackBreakeven}
            setEnableComebackBreakeven={setEnableComebackBreakeven}
            dailyStopLoss={dailyStopLoss}
            setDailyStopLoss={setDailyStopLoss}
            openExplainer={openExplainer}
            setOpenExplainer={setOpenExplainer}
            isLoading={isLoading}
            isOptimizing={isOptimizing}
            handleRunBacktest={handleRunBacktest}
            handleAIOptimize={handleAIOptimize}
            currencyPrefix={currencyPrefix}
          />
        </div>

        <div className="backtest-col-dashboard space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!report && !isLoading && <BacktestEmptyState />}

          {report && (
            <>
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

              <BacktestReplayControls
                report={report}
                currentFrame={currentFrame}
                currentFrameIndex={currentFrameIndex}
                setCurrentFrameIndex={setCurrentFrameIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
                isFinished={isFinished}
                activeSymbol={activeSymbol}
                timeframe={timeframe}
                confluenceThreshold={confluenceThreshold}
                currencyPrefix={currencyPrefix}
              />

              <BacktestKpiStrip
                currentFrame={currentFrame}
                report={report}
                isFinished={isFinished}
                currencyPrefix={currencyPrefix}
              />

              <BacktestCandleChart
                report={report}
                currentFrame={currentFrame}
                currentFrameIndex={currentFrameIndex}
                isPlaying={isPlaying}
                currencyPrefix={currencyPrefix}
              />

              <BacktestLiveTerminal logs={visibleLogs} />

              <BacktestEquityChart
                report={report}
                currentFrame={currentFrame}
                currencyPrefix={currencyPrefix}
              />

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

              <BacktestTradeTable
                report={report}
                filterType={filterType}
                setFilterType={setFilterType}
                filteredTrades={filteredTrades}
                currencyPrefix={currencyPrefix}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
