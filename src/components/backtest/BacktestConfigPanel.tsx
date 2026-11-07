import React from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  Activity,
  ShieldCheck,
  History,
  Calendar,
  RotateCcw,
  Play,
  FastForward,
  HelpCircle,
  X,
} from 'lucide-react';
import { BotMarket, BotStrategy } from '../../types/daytrade';
import { STRATEGY_DEFINITIONS } from '../../services/daytradeEngine';
import {
  BacktestPeriod,
  BACKTEST_PERIOD_CONFIG,
} from '../../services/realBacktestEngine';
import { UsdRateInfo } from '../../services/currencyService';
import { CustomSelect, CustomSelectOption } from '../common/CustomSelect';
import { CurrencyInput } from '../common/CurrencyInput';

interface BacktestConfigPanelProps {
  market: BotMarket;
  handleMarketChange: (mkt: BotMarket) => void;
  usdRateInfo: UsdRateInfo | null;
  symbol: string;
  setSymbol: (s: string) => void;
  customTicker: string;
  setCustomTicker: (s: string) => void;
  activeSymbol: string;
  recentAssets: string[];
  setRecentAssetsB3: (assets: string[]) => void;
  setRecentAssetsCrypto: (assets: string[]) => void;
  presetTickers: Record<BotMarket, { symbol: string; label: string }[]>;
  dateMode: 'PRESET' | 'CALENDAR';
  setDateMode: (mode: 'PRESET' | 'CALENDAR') => void;
  period: BacktestPeriod;
  setPeriod: (p: BacktestPeriod) => void;
  specificDate: string;
  setSpecificDate: (d: string) => void;
  timeframe: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D';
  setTimeframe: (tf: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D') => void;
  timeframeOptions: CustomSelectOption<'1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1D'>[];
  capital: number;
  setCapital: (c: number) => void;
  sizingType: 'FIXED_VALUE' | 'PERCENT';
  setSizingType: (type: 'FIXED_VALUE' | 'PERCENT') => void;
  fixedTradeAmount: number;
  setFixedTradeAmount: (val: number) => void;
  strategy: BotStrategy;
  setStrategy: (s: BotStrategy) => void;
  strategyOptions: CustomSelectOption<BotStrategy>[];
  confluenceThreshold: number;
  setConfluenceThreshold: (val: number) => void;
  riskReward: number;
  setRiskReward: (val: number) => void;
  useBreakeven: boolean;
  setUseBreakeven: (val: boolean) => void;
  filterToxicHours: boolean;
  setFilterToxicHours: (val: boolean) => void;
  enableDailyGoals: boolean;
  setEnableDailyGoals: (val: boolean) => void;
  enableComebackBreakeven: boolean;
  setEnableComebackBreakeven: (val: boolean) => void;
  dailyStopLoss: number;
  setDailyStopLoss: (val: number) => void;
  openExplainer: 'confluence' | 'riskReward' | null;
  setOpenExplainer: (exp: 'confluence' | 'riskReward' | null) => void;
  isLoading: boolean;
  isOptimizing: boolean;
  handleRunBacktest: (autoplay?: boolean) => void;
  handleAIOptimize: () => void;
  currencyPrefix?: string;
}

export const BacktestConfigPanel: React.FC<BacktestConfigPanelProps> = ({
  market,
  handleMarketChange,
  usdRateInfo,
  setSymbol,
  customTicker,
  setCustomTicker,
  activeSymbol,
  recentAssets,
  setRecentAssetsB3,
  setRecentAssetsCrypto,
  presetTickers,
  dateMode,
  setDateMode,
  period,
  setPeriod,
  specificDate,
  setSpecificDate,
  timeframe,
  setTimeframe,
  timeframeOptions,
  capital,
  setCapital,
  sizingType,
  setSizingType,
  fixedTradeAmount,
  setFixedTradeAmount,
  strategy,
  setStrategy,
  strategyOptions,
  confluenceThreshold,
  setConfluenceThreshold,
  riskReward,
  setRiskReward,
  useBreakeven,
  setUseBreakeven,
  filterToxicHours,
  setFilterToxicHours,
  enableDailyGoals,
  setEnableDailyGoals,
  enableComebackBreakeven,
  setEnableComebackBreakeven,
  dailyStopLoss,
  setDailyStopLoss,
  openExplainer,
  setOpenExplainer,
  isLoading,
  isOptimizing,
  handleRunBacktest,
  handleAIOptimize,
  currencyPrefix = 'R$',
}) => {
  return (
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
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
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
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
              market === 'CRYPTO'
                ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-[#C084FC] border-purple-500/50 shadow-sm'
                : 'bg-[#161F33] text-[#64748B] border-[#1E293B] hover:text-white'
            }`}
          >
            <Activity size={14} />
            Criptoativos 24/7 (Binance)
          </button>
        </div>

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

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {[
            ...recentAssets,
            ...presetTickers[market].map(p => p.symbol).filter(s => !recentAssets.includes(s)),
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
            options={timeframeOptions}
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

      {/* 6. Strategy Selection */}
      <div>
        <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
          Estratégia Quantitativa
        </label>
        <CustomSelect
          value={strategy}
          onChange={setStrategy}
          options={strategyOptions}
        />
        <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
          {STRATEGY_DEFINITIONS[strategy].description}
        </p>
      </div>

      {/* 7. Smart Controls: Confluence & Risk:Reward */}
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
                <p>• <strong>Em 1:1.5 ou 1:2.0:</strong> Para cada {currencyPrefix} 1,00 arriscado, você busca ganhar {currencyPrefix} 1,50 a {currencyPrefix} 2,00.</p>
                <p>• <strong>Poder da Matemática:</strong> Com gestão assimétrica, mesmo acertando 40% a 50% das operações, você termina com lucro líquido consistente no bolso!</p>
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
                Move stop para o preço de entrada ao atingir 55% do alvo
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
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#38BDF8] hover:from-[#1E4FD9] hover:to-[#0284C7] text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
          className="w-full py-2 px-3 rounded-xl bg-[#161F33] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2 border border-[#1E293B] cursor-pointer"
        >
          <FastForward size={14} />
          <span>Calcular Instantaneamente (Pular para o Final)</span>
        </button>
      </div>
    </div>
  );
};
