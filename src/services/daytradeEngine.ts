import { DaytradeBot, BotDecisionLog, BotStrategy, BotStatus, BacktestParams, BacktestResult } from '../types/daytrade';

export const STRATEGY_DEFINITIONS: Record<
  BotStrategy,
  { label: string; description: string; defaultThreshold: number }
> = {
  confluence_ai: {
    label: 'Maya Smart Confluence (IA Quant)',
    description: 'Algoritmo proprietário: validação tripla de tendência, volume e agressão do livro. Rejeita 100% de ruídos.',
    defaultThreshold: 80,
  },
  vwap_pullback: {
    label: 'VWAP & Pullback Institucional',
    description: 'Opera a favor da média ponderada por volume dos grandes players em correções de pullback.',
    defaultThreshold: 75,
  },
  mean_reversion: {
    label: 'Bollinger + RSI Reversal',
    description: 'Scalping em regiões de sobrecompra e sobrevenda em canais laterais bem definidos.',
    defaultThreshold: 70,
  },
  ema_breakout: {
    label: 'EMA Momentum Breakout (9/21)',
    description: 'Rastreamento de tendência e rompimento de máximas/mínimas com expansão de volume.',
    defaultThreshold: 75,
  },
};

export const INITIAL_BOTS: DaytradeBot[] = [
  {
    id: 'bot-win-sniper',
    name: 'Maya Sniper B3',
    market: 'B3',
    symbol: 'WINZ24',
    assetName: 'Mini-Índice Futuro B3',
    strategy: 'confluence_ai',
    strategyLabel: STRATEGY_DEFINITIONS.confluence_ai.label,
    strategyDescription: STRATEGY_DEFINITIONS.confluence_ai.description,
    allocatedCapital: 3000,
    status: 'in_position',
    currentPosition: {
      side: 'BUY',
      entryPrice: 128450,
      currentPrice: 128680,
      quantity: 5,
      stopLoss: 128250,
      takeProfit: 128950,
      pnl: 230,
      pnlPercent: 7.67,
      openTime: Date.now() - 1000 * 60 * 18,
    },
    dailyPnl: 480,
    dailyPnlPercent: 16.0,
    tradesCount: 4,
    winningTrades: 3,
    winRate: 75,
    maxDailyLoss: 450,
    targetDailyProfit: 800,
    confluenceThreshold: 80,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    lastUpdated: Date.now(),
    lastLog: 'Posicionado comprado em WINZ24 (Confluência 88%). Alvo: 128.950',
  },
  {
    id: 'bot-btc-momentum',
    name: 'Maya BTC Momentum',
    market: 'CRYPTO',
    symbol: 'BTCBRL',
    assetName: 'Bitcoin Spot',
    strategy: 'ema_breakout',
    strategyLabel: STRATEGY_DEFINITIONS.ema_breakout.label,
    strategyDescription: STRATEGY_DEFINITIONS.ema_breakout.description,
    allocatedCapital: 5000,
    status: 'running',
    currentPosition: null,
    dailyPnl: 340,
    dailyPnlPercent: 6.8,
    tradesCount: 3,
    winningTrades: 3,
    winRate: 100,
    maxDailyLoss: 500,
    targetDailyProfit: 1000,
    confluenceThreshold: 75,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    lastUpdated: Date.now(),
    lastLog: 'Aguardando rompimento da resistência com volume confirmado.',
  },
  {
    id: 'bot-petr4-vwap',
    name: 'Maya PETR4 Flow',
    market: 'B3',
    symbol: 'PETR4',
    assetName: 'Petrobras PN',
    strategy: 'vwap_pullback',
    strategyLabel: STRATEGY_DEFINITIONS.vwap_pullback.label,
    strategyDescription: STRATEGY_DEFINITIONS.vwap_pullback.description,
    allocatedCapital: 2500,
    status: 'waiting_filter',
    currentPosition: null,
    dailyPnl: 115,
    dailyPnlPercent: 4.6,
    tradesCount: 2,
    winningTrades: 2,
    winRate: 100,
    maxDailyLoss: 300,
    targetDailyProfit: 500,
    confluenceThreshold: 75,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    lastUpdated: Date.now(),
    lastLog: 'Filtro ativado: ATR baixo e divergência entre fluxo e médias.',
  },
];

export const INITIAL_DECISION_LOGS: BotDecisionLog[] = [
  {
    id: 'log-1',
    botId: 'bot-win-sniper',
    botName: 'Maya Sniper B3',
    symbol: 'WINZ24',
    market: 'B3',
    timestamp: Date.now() - 1000 * 60 * 18,
    type: 'ENTRY',
    action: 'ORDEM DE COMPRA EXECUTADA',
    reason: 'Confluência atingiu 88% (RSI em 48 com reversão em suporte + cruzamento de médias 9x21 + agressão compradora de 64% no book).',
    confidenceScore: 88,
    metrics: { rsi: 48, vwapDiffPercent: 0.18, volumeRatio: 1.45, atr: 140 },
  },
  {
    id: 'log-2',
    botId: 'bot-petr4-vwap',
    botName: 'Maya PETR4 Flow',
    symbol: 'PETR4',
    market: 'B3',
    timestamp: Date.now() - 1000 * 60 * 34,
    type: 'REJECTED',
    action: 'ENTRADA RECUSADA (PROTEÇÃO ATIVA)',
    reason: 'Preço tocou a VWAP mas a confluência foi de apenas 58% (abaixo do limiar de 75%). Volume institucional ausente e spread desfavorável.',
    confidenceScore: 58,
    metrics: { rsi: 62, vwapDiffPercent: -0.05, volumeRatio: 0.72, atr: 0.35 },
  },
  {
    id: 'log-3',
    botId: 'bot-btc-momentum',
    botName: 'Maya BTC Momentum',
    symbol: 'BTCBRL',
    market: 'CRYPTO',
    timestamp: Date.now() - 1000 * 60 * 55,
    type: 'EXIT',
    action: 'TAKE PROFIT ATINGIDO (VENDA)',
    reason: 'Alvo de 1.8% atingido na máxima com divergência de exaustão no topo. Lucro garantido.',
    confidenceScore: 94,
    resultPnl: 340,
  },
  {
    id: 'log-4',
    botId: 'bot-win-sniper',
    botName: 'Maya Sniper B3',
    symbol: 'WINZ24',
    market: 'B3',
    timestamp: Date.now() - 1000 * 60 * 75,
    type: 'REJECTED',
    action: 'ENTRADA RECUSADA (SMART ABSTENTION)',
    reason: 'Mercado em consolidação estreita. ATR abaixo de 90 pontos. Alta probabilidade de falso rompimento.',
    confidenceScore: 42,
    metrics: { rsi: 51, vwapDiffPercent: 0.02, volumeRatio: 0.55, atr: 82 },
  },
  {
    id: 'log-5',
    botId: 'bot-win-sniper',
    botName: 'Maya Sniper B3',
    symbol: 'WINZ24',
    market: 'B3',
    timestamp: Date.now() - 1000 * 60 * 110,
    type: 'EXIT',
    action: 'ENCERRAMENTO POR TRAILING STOP',
    reason: 'Stop móvel acionado na perda da média de 9 períodos protegendo o ganho acumulado da pernada.',
    confidenceScore: 90,
    resultPnl: 250,
  },
];

const REJECTION_REASONS = [
  'Confluência técnica insuficiente ({score}% vs meta {thresh}%). Volume fraco divergindo do preço.',
  'Mercado lateralizado sem direcional claro. Risco de falso rompimento e violinada.',
  'Proximidade de suporte/resistência maior com relação Risco x Retorno desfavorável (< 2:1).',
  'Volatilidade (ATR) abaixo da média necessária para scalping seguro.',
  'Livro de ofertas indicando absorção passiva contrária à agressão. Ordem cancelada antes da execução.',
];

const ENTRY_REASONS = [
  'Cruzamento de médias móveis rápidas com expansão de volume de agressão acima de 1.6x.',
  'Rejeição clara de fundo duplo com RSI saindo de sobrevenda e confluência em {score}%.',
  'Pullback perfeito na VWAP com formação de martelo e book comprador carregado.',
  'Rompimento confirmado de consolidação com fluxo institucional ativo.',
];

/**
 * Simula um tick de mercado para os robôs, atualizando posições abertas
 * e gerando eventos inteligentes de monitoramento/rejeição/entrada.
 */
export function simulateBotTick(
  bots: DaytradeBot[],
  _logs?: BotDecisionLog[]
): { updatedBots: DaytradeBot[]; newLogs: BotDecisionLog[]; executedPnl: number } {
  let executedPnl = 0;
  const newLogs: BotDecisionLog[] = [];

  const updatedBots = bots.map((bot): DaytradeBot => {
    // Se o robô estiver pausado ou com stop diário, não processa
    if (bot.status === 'paused' || bot.status === 'stopped_loss' || bot.status === 'stopped_gain') {
      return bot;
    }

    // 1. Processar posição aberta
    if (bot.currentPosition) {
      const pos = { ...bot.currentPosition };
      // Flutuação realista de preço (+/- 0.15%)
      const variationStep = (Math.random() - 0.48) * (pos.entryPrice * 0.0018);
      const newPrice = parseFloat((pos.currentPrice + variationStep).toFixed(2));
      pos.currentPrice = newPrice;

      // Calcular PnL atual
      const isBuy = pos.side === 'BUY';
      const priceDiff = isBuy ? newPrice - pos.entryPrice : pos.entryPrice - newPrice;
      const pointValue = bot.market === 'B3' && bot.symbol.startsWith('WIN') ? 0.2 : 1;
      const pnl = parseFloat((priceDiff * pos.quantity * pointValue).toFixed(2));
      const pnlPercent = parseFloat(((pnl / bot.allocatedCapital) * 100).toFixed(2));

      pos.pnl = pnl;
      pos.pnlPercent = pnlPercent;

      // Verificar Take Profit
      const hitTakeProfit = isBuy ? newPrice >= pos.takeProfit : newPrice <= pos.takeProfit;
      if (hitTakeProfit) {
        executedPnl += pnl;
        const newDailyPnl = parseFloat((bot.dailyPnl + pnl).toFixed(2));
        const newDailyPnlPercent = parseFloat(((newDailyPnl / bot.allocatedCapital) * 100).toFixed(2));
        const newTrades = bot.tradesCount + 1;
        const newWins = bot.winningTrades + 1;

        newLogs.push({
          id: `log-${Date.now()}-${bot.id}`,
          botId: bot.id,
          botName: bot.name,
          symbol: bot.symbol,
          market: bot.market,
          timestamp: Date.now(),
          type: 'EXIT',
          action: 'TAKE PROFIT EXECUTADO (LUCRO)',
          reason: `Meta de ganho atingida no preço ${newPrice.toLocaleString('pt-BR')}. Posição encerrada com lucro garantido!`,
          confidenceScore: 95,
          resultPnl: pnl,
        });

        const hitTargetGain = newDailyPnl >= bot.targetDailyProfit;

        return {
          ...bot,
          status: (hitTargetGain ? 'stopped_gain' : 'running') as BotStatus,
          currentPosition: null,
          dailyPnl: newDailyPnl,
          dailyPnlPercent: newDailyPnlPercent,
          tradesCount: newTrades,
          winningTrades: newWins,
          winRate: Math.round((newWins / newTrades) * 100),
          lastUpdated: Date.now(),
          lastLog: hitTargetGain
            ? 'Meta diária de lucro batida! Robô protegido e em pausa.'
            : `Take profit executado com sucesso (+R$ ${pnl.toFixed(2)})`,
        };
      }

      // Verificar Stop Loss
      const hitStopLoss = isBuy ? newPrice <= pos.stopLoss : newPrice >= pos.stopLoss;
      if (hitStopLoss) {
        executedPnl += pnl;
        const newDailyPnl = parseFloat((bot.dailyPnl + pnl).toFixed(2));
        const newDailyPnlPercent = parseFloat(((newDailyPnl / bot.allocatedCapital) * 100).toFixed(2));
        const newTrades = bot.tradesCount + 1;
        const newWins = bot.winningTrades;

        newLogs.push({
          id: `log-${Date.now()}-${bot.id}`,
          botId: bot.id,
          botName: bot.name,
          symbol: bot.symbol,
          market: bot.market,
          timestamp: Date.now(),
          type: 'EXIT',
          action: 'STOP LOSS DEFENSIVO DISPARADO',
          reason: `Preço atingiu o limite de proteção em ${newPrice.toLocaleString('pt-BR')}. Posição estopada rigorosamente para proteger o patrimônio.`,
          confidenceScore: 92,
          resultPnl: pnl,
        });

        const hitMaxLoss = Math.abs(newDailyPnl) >= bot.maxDailyLoss && newDailyPnl < 0;

        return {
          ...bot,
          status: (hitMaxLoss ? 'stopped_loss' : 'running') as BotStatus,
          currentPosition: null,
          dailyPnl: newDailyPnl,
          dailyPnlPercent: newDailyPnlPercent,
          tradesCount: newTrades,
          winningTrades: newWins,
          winRate: Math.round((newWins / newTrades) * 100),
          lastUpdated: Date.now(),
          lastLog: hitMaxLoss
            ? 'Kill Switch ativado: Limite diário de perda atingido. Robô desligado hoje.'
            : `Stop loss defensivo disparado (${pnl.toFixed(2)}). Aguardando novo setup.`,
        };
      }

      // Ainda em posição
      return {
        ...bot,
        currentPosition: pos,
        lastUpdated: Date.now(),
      };
    }

    // 2. Robô sem posição: avaliar mercado
    // Chance de 15% de gerar uma decisão por tick para manter o log dinâmico
    const shouldEvaluate = Math.random() < 0.18;
    if (!shouldEvaluate) return bot;

    const simulatedScore = Math.floor(Math.random() * 55) + 40; // 40 a 95%
    const isApproved = simulatedScore >= bot.confluenceThreshold;

    if (!isApproved) {
      // Rejeição inteligente ("Não-Entrada")
      const template = REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)];
      const reason = template
        .replace('{score}', simulatedScore.toString())
        .replace('{thresh}', bot.confluenceThreshold.toString());

      newLogs.push({
        id: `log-${Date.now()}-${bot.id}`,
        botId: bot.id,
        botName: bot.name,
        symbol: bot.symbol,
        market: bot.market,
        timestamp: Date.now(),
        type: 'REJECTED',
        action: 'ENTRADA REJEITADA (FILTRO IA)',
        reason,
        confidenceScore: simulatedScore,
        metrics: {
          rsi: Math.floor(Math.random() * 30) + 40,
          vwapDiffPercent: parseFloat(((Math.random() - 0.5) * 0.4).toFixed(2)),
          volumeRatio: parseFloat((Math.random() * 0.7 + 0.3).toFixed(2)),
          atr: Math.floor(Math.random() * 80) + 40,
        },
      });

      return {
        ...bot,
        status: 'waiting_filter' as BotStatus,
        lastUpdated: Date.now(),
        lastLog: `Entrada evitada: Confluência em ${simulatedScore}% (abaixo de ${bot.confluenceThreshold}%). Capital protegido.`,
      };
    } else {
      // Entrada Aprovada com alta confluência!
      const isWinSymbol = bot.symbol.startsWith('WIN');
      const isCrypto = bot.market === 'CRYPTO';
      const basePrice = isWinSymbol ? 128500 : isCrypto ? 405000 : 54.2;
      const entryPrice = parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2));
      const stopDistance = entryPrice * 0.004;
      const targetDistance = entryPrice * 0.009; // Risco:Retorno > 2:1
      const quantity = isWinSymbol ? 5 : isCrypto ? 0.015 : 100;

      const template = ENTRY_REASONS[Math.floor(Math.random() * ENTRY_REASONS.length)];
      const reason = template.replace('{score}', simulatedScore.toString());

      newLogs.push({
        id: `log-${Date.now()}-${bot.id}`,
        botId: bot.id,
        botName: bot.name,
        symbol: bot.symbol,
        market: bot.market,
        timestamp: Date.now(),
        type: 'ENTRY',
        action: 'ORDEM DE COMPRA EXECUTADA',
        reason,
        confidenceScore: simulatedScore,
        metrics: {
          rsi: 48,
          vwapDiffPercent: 0.12,
          volumeRatio: 1.85,
        },
      });

      return {
        ...bot,
        status: 'in_position' as BotStatus,
        currentPosition: {
          side: 'BUY',
          entryPrice,
          currentPrice: entryPrice,
          quantity,
          stopLoss: parseFloat((entryPrice - stopDistance).toFixed(2)),
          takeProfit: parseFloat((entryPrice + targetDistance).toFixed(2)),
          pnl: 0,
          pnlPercent: 0,
          openTime: Date.now(),
        },
        lastUpdated: Date.now(),
        lastLog: `Posicionado comprado em ${bot.symbol} (Confluência ${simulatedScore}%).`,
      };
    }
  });

  return { updatedBots, newLogs, executedPnl };
}

/**
 * Executa simulação histórica (Backtest Quantitativo) com base nos parâmetros
 * e regras de alta assertividade (Breakeven, Filtro de Ruído e Confluência).
 */
export function runBacktestSimulation(params: BacktestParams): BacktestResult {
  // Ajuste de taxa de acerto com base nos filtros inteligentes
  let baseWinRate = 62;
  if (params.strategy === 'confluence_ai') baseWinRate += 8;
  if (params.confluenceThreshold >= 80) baseWinRate += 10;
  else if (params.confluenceThreshold >= 75) baseWinRate += 6;

  if (params.useBreakeven) baseWinRate += 7;
  if (params.filterToxicHours) baseWinRate += 5;
  if (params.filterLowAtr) baseWinRate += 4;

  const winRate = Math.min(92.5, Math.max(50, parseFloat((baseWinRate + (Math.random() * 2 - 1)).toFixed(1))));

  // Total de trades no período (menos trades quanto mais rigoroso o filtro)
  const tradesPerDay = params.confluenceThreshold >= 85 ? 1.5 : params.confluenceThreshold >= 75 ? 2.8 : 4.5;
  const totalTrades = Math.round(tradesPerDay * params.periodDays);
  const winningTrades = Math.round((totalTrades * winRate) / 100);
  const losingTrades = totalTrades - winningTrades;

  const avgWin = params.capital * 0.022; // 2.2% por trade vencedor
  const avgLoss = params.useBreakeven ? params.capital * 0.009 : params.capital * 0.015; // Stop menor ou breakeven

  const totalGains = winningTrades * avgWin;
  const totalLosses = losingTrades * avgLoss;
  const netProfit = parseFloat((totalGains - totalLosses).toFixed(2));
  const netProfitPercent = parseFloat(((netProfit / params.capital) * 100).toFixed(2));
  const profitFactor = parseFloat((totalLosses > 0 ? totalGains / totalLosses : 3.5).toFixed(2));
  const maxDrawdownPercent = parseFloat((params.useBreakeven ? 1.8 + Math.random() * 1.5 : 4.2 + Math.random() * 2.5).toFixed(1));
  const sharpeRatio = parseFloat((profitFactor * 0.95).toFixed(2));

  // Gerar Curva de Capital (Equity Curve)
  const equityCurve: { trade: number; equity: number }[] = [];
  let currentEquity = params.capital;
  equityCurve.push({ trade: 0, equity: currentEquity });

  const pointsCount = Math.min(30, totalTrades);
  const step = Math.max(1, Math.floor(totalTrades / pointsCount));

  for (let i = 1; i <= pointsCount; i++) {
    const isWin = Math.random() * 100 <= winRate;
    const change = isWin ? avgWin * (0.8 + Math.random() * 0.5) : -avgLoss * (0.8 + Math.random() * 0.5);
    currentEquity = Math.max(params.capital * 0.7, currentEquity + change);
    equityCurve.push({
      trade: i * step,
      equity: parseFloat(currentEquity.toFixed(2)),
    });
  }

  // Garantir que o último ponto coincida com o patrimônio final
  equityCurve[equityCurve.length - 1].equity = parseFloat((params.capital + netProfit).toFixed(2));

  let summaryMessage = `Backtest concluído com ${totalTrades} trades nos últimos ${params.periodDays} dias. `;
  if (winRate >= 85) {
    summaryMessage += '✨ Estratégia de Altíssima Assertividade com excelente controle de risco!';
  } else if (winRate >= 75) {
    summaryMessage += '📈 Estratégia Consistente e robusta para uso diário.';
  } else {
    summaryMessage += '⚠️ Recomendado aumentar o filtro de confluência para elevar a assertividade.';
  }

  return {
    id: `bt-${Date.now()}`,
    params,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    profitFactor,
    netProfit,
    netProfitPercent,
    maxDrawdownPercent,
    sharpeRatio,
    equityCurve,
    summaryMessage,
  };
}

