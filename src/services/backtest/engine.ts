import { Candle } from '../../types/market';
import {
  RealBacktestConfig,
  RealBacktestReport,
  RealBacktestTrade,
  BacktestFrame,
  BacktestEventLog,
} from './types';
import {
  calculateEMA,
  calculateRSI,
  calculateATR,
  calculateVWAP,
} from './indicators';

/**
 * Walk-Forward Engine (Replay Barra a Barra em Tempo Histórico Real)
 */
export function runRealHistoricalBacktest(
  candles: Candle[],
  config: RealBacktestConfig,
  isRealData: boolean,
  dataSource: string
): RealBacktestReport {
  if (!candles || candles.length < 30) {
    throw new Error('Mínimo de 30 candles necessários para calcular médias móveis e ATR com precisão.');
  }

  const closes = candles.map(c => c.close);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const ema50 = calculateEMA(closes, 50);
  const rsi14 = calculateRSI(closes, 14);
  const atr14 = calculateATR(candles, 14);
  const vwap = calculateVWAP(candles);

  let currentCapital = config.initialCapital;
  let peakCapital = config.initialCapital;
  let maxDrawdownValue = 0;
  let maxDrawdownPercent = 0;

  let dailyTradingHalted = false;
  let haltReason: string | null = null;
  let wasInDrawdown = false;
  let peakPnlPercent = 0;

  const trades: RealBacktestTrade[] = [];
  const equityCurve: { time: number; equity: number; tradeNumber: number }[] = [
    { time: candles[25].time, equity: currentCapital, tradeNumber: 0 },
  ];

  const frames: BacktestFrame[] = [];
  const eventLogs: BacktestEventLog[] = [];
  let idleBarsCount = 0;

  let inTrade: {
    entryBar: number;
    entryTime: number;
    side: 'BUY' | 'SELL';
    entryPrice: number;
    stopLoss: number;
    initialStopLoss: number;
    takeProfit: number;
    quantity: number;
    breakevenMoved: boolean;
  } | null = null;

  eventLogs.push({
    id: `log-start-${candles[25].time}`,
    barIndex: 25,
    timestamp: candles[25].time,
    type: 'INFO',
    title: 'Início do Replay Histórico Walk-Forward',
    description: `Setup inicializado com ${config.initialCapital.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Confluência mínima requerida: ${config.confluenceThreshold}%.`,
  });

  for (let i = 25; i < candles.length; i++) {
    const currentBar = candles[i];
    const prevBar = candles[i - 1];
    let latestLogId: string | undefined;

    // 1. Avalia saídas se estiver em operação
    if (inTrade) {
      idleBarsCount = 0;
      const barsHeld = i - inTrade.entryBar;
      let exitPrice: number | null = null;
      let exitReason: RealBacktestTrade['exitReason'] | null = null;

      if (config.useBreakeven && !inTrade.breakevenMoved && barsHeld >= 1) {
        if (inTrade.side === 'BUY') {
          const halfWayTarget = inTrade.entryPrice + (inTrade.takeProfit - inTrade.entryPrice) * 0.55;
          if (currentBar.high >= halfWayTarget) {
            inTrade.stopLoss = inTrade.entryPrice * (1 + config.slippagePercent / 100);
            inTrade.breakevenMoved = true;

            const beLog: BacktestEventLog = {
              id: `log-be-${currentBar.time}`,
              barIndex: i,
              timestamp: currentBar.time,
              type: 'BREAKEVEN',
              title: 'Stop Movido para Breakeven (0 a 0)',
              description: `Preço atingiu 55% do alvo. Stop Loss elevado para ${inTrade.stopLoss.toFixed(2)}. Risco zerado!`,
              price: inTrade.stopLoss,
            };
            eventLogs.push(beLog);
            latestLogId = beLog.id;
          }
        } else {
          const halfWayTarget = inTrade.entryPrice - (inTrade.entryPrice - inTrade.takeProfit) * 0.55;
          if (currentBar.low <= halfWayTarget) {
            inTrade.stopLoss = inTrade.entryPrice * (1 - config.slippagePercent / 100);
            inTrade.breakevenMoved = true;

            const beLog: BacktestEventLog = {
              id: `log-be-${currentBar.time}`,
              barIndex: i,
              timestamp: currentBar.time,
              type: 'BREAKEVEN',
              title: 'Stop Movido para Breakeven (0 a 0)',
              description: `Preço atingiu 55% da queda alvo. Stop Loss baixado para ${inTrade.stopLoss.toFixed(2)}. Risco zerado!`,
              price: inTrade.stopLoss,
            };
            eventLogs.push(beLog);
            latestLogId = beLog.id;
          }
        }
      }

      if (inTrade.side === 'BUY') {
        if (currentBar.low <= inTrade.stopLoss) {
          exitPrice = inTrade.stopLoss;
          exitReason = inTrade.breakevenMoved ? 'BREAKEVEN' : 'STOP_LOSS';
        } else if (currentBar.high >= inTrade.takeProfit) {
          exitPrice = inTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          exitPrice = currentBar.close;
          exitReason = 'END_OF_DATA';
        }
      } else {
        if (currentBar.high >= inTrade.stopLoss) {
          exitPrice = inTrade.stopLoss;
          exitReason = inTrade.breakevenMoved ? 'BREAKEVEN' : 'STOP_LOSS';
        } else if (currentBar.low <= inTrade.takeProfit) {
          exitPrice = inTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          exitPrice = currentBar.close;
          exitReason = 'END_OF_DATA';
        }
      }

      if (exitPrice !== null && exitReason !== null) {
        const finalExitPrice = inTrade.side === 'BUY'
          ? exitPrice * (1 - config.slippagePercent / 100)
          : exitPrice * (1 + config.slippagePercent / 100);

        const pnl = inTrade.side === 'BUY'
          ? (finalExitPrice - inTrade.entryPrice) * inTrade.quantity
          : (inTrade.entryPrice - finalExitPrice) * inTrade.quantity;

        const pnlPercent = inTrade.side === 'BUY'
          ? ((finalExitPrice - inTrade.entryPrice) / inTrade.entryPrice) * 100
          : ((inTrade.entryPrice - finalExitPrice) / inTrade.entryPrice) * 100;

        currentCapital += pnl;

        if (currentCapital > peakCapital) {
          peakCapital = currentCapital;
        } else {
          const ddVal = peakCapital - currentCapital;
          const ddPct = (ddVal / peakCapital) * 100;
          if (ddVal > maxDrawdownValue) maxDrawdownValue = ddVal;
          if (ddPct > maxDrawdownPercent) maxDrawdownPercent = ddPct;
        }

        const tradeNumber = trades.length + 1;
        trades.push({
          id: `t-${tradeNumber}-${currentBar.time}`,
          tradeNumber,
          entryTime: inTrade.entryTime,
          exitTime: currentBar.time,
          side: inTrade.side,
          entryPrice: parseFloat(inTrade.entryPrice.toFixed(2)),
          exitPrice: parseFloat(finalExitPrice.toFixed(2)),
          quantity: inTrade.quantity,
          pnl: parseFloat(pnl.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          exitReason,
          barsHeld,
          equityAfter: parseFloat(currentCapital.toFixed(2)),
        });

        equityCurve.push({
          time: currentBar.time,
          equity: parseFloat(currentCapital.toFixed(2)),
          tradeNumber,
        });

        const exitLog: BacktestEventLog = {
          id: `log-exit-${tradeNumber}-${currentBar.time}`,
          barIndex: i,
          timestamp: currentBar.time,
          type: exitReason === 'TAKE_PROFIT' ? 'TAKE_PROFIT' : exitReason === 'BREAKEVEN' ? 'BREAKEVEN' : 'STOP_LOSS',
          title: exitReason === 'TAKE_PROFIT'
            ? `🎯 Take Profit Executado (Trade #${tradeNumber})`
            : exitReason === 'BREAKEVEN'
            ? `🟡 Saída no Breakeven (Trade #${tradeNumber})`
            : `🛑 Stop Loss Acionado (Trade #${tradeNumber})`,
          description: `Venda a ${finalExitPrice.toFixed(2)} após ${barsHeld} candles. Resultado: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%). Saldo: ${currentCapital.toFixed(2)}.`,
          pnl: parseFloat(pnl.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          price: parseFloat(finalExitPrice.toFixed(2)),
        };
        eventLogs.push(exitLog);
        latestLogId = exitLog.id;

        inTrade = null;
      }
    } else {
      idleBarsCount += 1;
    }

    const currentPnl = currentCapital - config.initialCapital;
    const currentPnlPercent = (currentPnl / config.initialCapital) * 100;

    if (currentPnlPercent < -0.3) {
      wasInDrawdown = true;
    }
    if (currentPnlPercent > peakPnlPercent) {
      peakPnlPercent = currentPnlPercent;
    }

    // Regras diárias de risco e proteção de lucro
    if (!inTrade && !dailyTradingHalted) {
      if (config.enableComebackBreakeven && wasInDrawdown && currentPnl >= 0 && trades.length >= 2) {
        dailyTradingHalted = true;
        haltReason = 'Trava de Alívio (Comeback Breakeven): Conta recuperou ao 0x0 após drawdown. Capital 100% protegido!';
        const haltLog: BacktestEventLog = {
          id: `log-halt-breakeven-${currentBar.time}`,
          barIndex: i,
          timestamp: currentBar.time,
          type: 'INFO',
          title: '🛡️ Trava de Alívio Ativada (Empate Salvo)',
          description: haltReason,
        };
        eventLogs.push(haltLog);
        latestLogId = haltLog.id;
      }

      const stopLossLimit = config.dailyStopLossPercent ? -Math.abs(config.dailyStopLossPercent) : -2.0;
      if (currentPnlPercent <= stopLossLimit) {
        dailyTradingHalted = true;
        haltReason = `Stop Loss Diário Atingido (${currentPnlPercent.toFixed(2)}%). Circuit breaker ativado para proteger patrimônio!`;
        const haltLog: BacktestEventLog = {
          id: `log-halt-stoploss-${currentBar.time}`,
          barIndex: i,
          timestamp: currentBar.time,
          type: 'INFO',
          title: '🛑 Limite de Perda Diária Atingido',
          description: haltReason,
        };
        eventLogs.push(haltLog);
        latestLogId = haltLog.id;
      }

      if (config.enableDailyGoals) {
        if (currentPnlPercent >= 10.0) {
          dailyTradingHalted = true;
          haltReason = '🏆 Super Meta Diária Batida (+10%)! Dia encerrado com lucro espetacular!';
          const haltLog: BacktestEventLog = {
            id: `log-halt-meta3-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'INFO',
            title: '🏆 Meta Máxima Atingida (+10%)',
            description: haltReason,
          };
          eventLogs.push(haltLog);
          latestLogId = haltLog.id;
        } else if (peakPnlPercent >= 5.0 && currentPnlPercent <= 3.0) {
          dailyTradingHalted = true;
          haltReason = '🎯 Trava de Recuo (+5% ➔ +3%): Lucro mínimo de 3% garantido no bolso!';
          const haltLog: BacktestEventLog = {
            id: `log-halt-meta2-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'INFO',
            title: '🎯 Trava de Recuo Ativada (+3% garantido)',
            description: haltReason,
          };
          eventLogs.push(haltLog);
          latestLogId = haltLog.id;
        } else if (peakPnlPercent >= 2.0 && currentPnlPercent <= 0.0) {
          dailyTradingHalted = true;
          haltReason = '🔒 Trava de Recuo (+2% ➔ 0x0): Saída no empate protegendo o capital após bater Meta 1!';
          const haltLog: BacktestEventLog = {
            id: `log-halt-meta1-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'INFO',
            title: '🔒 Trava de Recuo Ativada (Capital Protegido)',
            description: haltReason,
          };
          eventLogs.push(haltLog);
          latestLogId = haltLog.id;
        }
      }
    }

    // 2. Avaliação de novas entradas
    let signalTriggered = false;
    let signalSide: 'BUY' | 'SELL' | null = null;
    let calculatedScore = 50;

    if (!inTrade && !dailyTradingHalted && i < candles.length - 1) {
      let skipDueToToxic = false;
      if (config.filterToxicHours) {
        const date = new Date(currentBar.time);
        const hours = date.getUTCHours();
        if (config.market === 'B3' && (hours === 12 || hours >= 20)) {
          skipDueToToxic = true;
        }
      }

      if (!skipDueToToxic) {
        const currentClose = currentBar.close;
        const currentEma9 = ema9[i];
        const currentEma21 = ema21[i];
        const currentEma50 = ema50[i];
        const prevEma9 = ema9[i - 1];
        const prevEma21 = ema21[i - 1];
        const currentRsi = rsi14[i];
        const currentVwap = vwap[i];
        const currentAtr = atr14[i] || (currentClose * 0.015);

        switch (config.strategy) {
          case 'confluence_ai': {
            const hasMacroData = i >= 49 && currentEma50 > 0;
            const isMacroBullish = hasMacroData ? currentClose > currentEma50 : true;
            const isMacroBearish = hasMacroData ? currentClose < currentEma50 : true;

            const slopeBuy = currentEma9 > prevEma9 && (currentEma9 - prevEma9) / currentClose >= 0.0001;
            const slopeSell = currentEma9 < prevEma9 && (prevEma9 - currentEma9) / currentClose >= 0.0001;

            const emaSpread = Math.abs(currentEma9 - currentEma21) / currentClose;
            const isNotChoppy = emaSpread >= 0.001;

            const isBullish = currentEma9 > currentEma21 && currentClose > currentVwap && isMacroBullish && isNotChoppy && slopeBuy;
            const isBearish = currentEma9 < currentEma21 && currentClose < currentVwap && isMacroBearish && isNotChoppy && slopeSell;
            const distEma9 = Math.abs(currentClose - currentEma9) / currentEma9;
            const isHealthyPullback = distEma9 <= 0.015;

            const candleRange = Math.max(0.0001, currentBar.high - currentBar.low);
            const upperWick = currentBar.high - Math.max(currentBar.open, currentClose);
            const lowerWick = Math.min(currentBar.open, currentClose) - currentBar.low;
            const upperWickRatio = upperWick / candleRange;
            const lowerWickRatio = lowerWick / candleRange;

            if (isBullish && isHealthyPullback) {
              let score = 45;
              if (currentClose > currentBar.open) score += 15;
              if (currentRsi >= 42 && currentRsi <= 68) score += 15;
              if (currentBar.volume > prevBar.volume * 1.05) score += 15;
              if (currentBar.low <= currentVwap * 1.006 && currentClose > currentVwap) score += 10;
              if (upperWickRatio <= 0.25) score += 10;
              else if (upperWickRatio > 0.40) score -= 25;

              calculatedScore = Math.max(0, Math.min(100, score));
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (isBearish && isHealthyPullback) {
              let score = 45;
              if (currentClose < currentBar.open) score += 15;
              if (currentRsi >= 32 && currentRsi <= 58) score += 15;
              if (currentBar.volume > prevBar.volume * 1.05) score += 15;
              if (currentBar.high >= currentVwap * 0.994 && currentClose < currentVwap) score += 10;
              if (lowerWickRatio <= 0.25) score += 10;
              else if (lowerWickRatio > 0.40) score -= 25;

              calculatedScore = Math.max(0, Math.min(100, score));
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }

          case 'ema_breakout': {
            const bullishCross = prevEma9 <= prevEma21 && currentEma9 > currentEma21;
            const bullishBreakout = currentClose > prevBar.high;
            const bearishCross = prevEma9 >= prevEma21 && currentEma9 < currentEma21;
            const bearishBreakout = currentClose < prevBar.low;

            if (bullishCross && bullishBreakout) {
              calculatedScore = 80 + (currentRsi > 50 ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (bearishCross && bearishBreakout) {
              calculatedScore = 80 + (currentRsi < 50 ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }

          case 'mean_reversion': {
            const oversold = currentRsi <= 35 && currentRsi > rsi14[i - 1];
            const bullishCandle = currentClose > currentBar.open;
            const overbought = currentRsi >= 65 && currentRsi < rsi14[i - 1];
            const bearishCandle = currentClose < currentBar.open;

            if (oversold && bullishCandle) {
              calculatedScore = 80 + (currentBar.low <= prevBar.low ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (overbought && bearishCandle) {
              calculatedScore = 80 + (currentBar.high >= prevBar.high ? 15 : 0);
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }

          case 'vwap_pullback': {
            const nearVwap = Math.abs(currentClose - currentVwap) / currentVwap <= 0.008;
            const bounce = currentClose > currentVwap && currentClose > currentBar.open;
            const reject = currentClose < currentVwap && currentClose < currentBar.open;

            if (nearVwap && bounce) {
              calculatedScore = 85;
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'BUY';
              }
            } else if (nearVwap && reject) {
              calculatedScore = 85;
              if (calculatedScore >= config.confluenceThreshold) {
                signalTriggered = true;
                signalSide = 'SELL';
              }
            }
            break;
          }
        }

        if (signalTriggered && signalSide) {
          const nextBar = candles[i + 1];
          const isBuy = signalSide === 'BUY';
          const entryPrice = isBuy
            ? nextBar.open * (1 + config.slippagePercent / 100)
            : nextBar.open * (1 - config.slippagePercent / 100);

          const stopDistance = Math.max(currentAtr * config.stopLossAtrMultiplier, entryPrice * 0.003);
          const stopLoss = isBuy ? entryPrice - stopDistance : entryPrice + stopDistance;
          const takeProfit = isBuy
            ? entryPrice + stopDistance * config.riskRewardRatio
            : entryPrice - stopDistance * config.riskRewardRatio;

          let capitalToAllocate = currentCapital * 0.20;
          if (config.positionSizingType === 'FIXED_VALUE') {
            const fixedAmount = config.positionSizeValue && config.positionSizeValue > 0
              ? config.positionSizeValue
              : 200;
            capitalToAllocate = Math.min(fixedAmount, currentCapital);
          } else if (config.positionSizingType === 'PERCENT' && config.positionSizeValue && config.positionSizeValue > 0) {
            capitalToAllocate = currentCapital * (config.positionSizeValue / 100);
          }

          let quantity = 0;
          if (config.market === 'CRYPTO') {
            quantity = parseFloat((capitalToAllocate / entryPrice).toFixed(6));
          } else {
            const shares = Math.floor(capitalToAllocate / entryPrice);
            quantity = shares > 0 ? shares : (currentCapital >= entryPrice ? 1 : 0);
          }

          if (quantity <= 0) {
            continue;
          }

          inTrade = {
            entryBar: i + 1,
            entryTime: nextBar.time,
            side: signalSide,
            entryPrice,
            stopLoss,
            initialStopLoss: stopLoss,
            takeProfit,
            quantity,
            breakevenMoved: false,
          };

          const entryLog: BacktestEventLog = {
            id: `log-entry-${trades.length + 1}-${nextBar.time}`,
            barIndex: i,
            timestamp: nextBar.time,
            type: 'ENTRY',
            title: isBuy
              ? `🚀 Ordem de Compra Executada (${config.symbol})`
              : `🔻 Ordem de Venda (SHORT) Executada (${config.symbol})`,
            description: `Gatilho ${isBuy ? 'COMPRA' : 'VENDA'} validado com ${calculatedScore}% de confluência. Entrada a ${entryPrice.toFixed(2)}. Alvo: ${takeProfit.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}.`,
            price: parseFloat(entryPrice.toFixed(2)),
            confidenceScore: calculatedScore,
          };
          eventLogs.push(entryLog);
          latestLogId = entryLog.id;
        } else if (idleBarsCount > 0 && idleBarsCount % 20 === 0) {
          const waitLog: BacktestEventLog = {
            id: `log-wait-${i}-${currentBar.time}`,
            barIndex: i,
            timestamp: currentBar.time,
            type: 'WAITING',
            title: `Aguardando Oportunidade (${idleBarsCount} candles)`,
            description: `Algoritmo em modo de espera há ${idleBarsCount} barras. Confluência atual ${calculatedScore}% abaixo da nota de corte (${config.confluenceThreshold}%). Capital protegido.`,
            confidenceScore: calculatedScore,
          };
          eventLogs.push(waitLog);
          latestLogId = waitLog.id;
        }
      }
    }

    // 3. Registra frame para replay visual
    let floatingPnl = 0;
    let floatingPnlPercent = 0;
    if (inTrade) {
      if (inTrade.side === 'BUY') {
        floatingPnl = (currentBar.close - inTrade.entryPrice) * inTrade.quantity;
        floatingPnlPercent = ((currentBar.close - inTrade.entryPrice) / inTrade.entryPrice) * 100;
      } else {
        floatingPnl = (inTrade.entryPrice - currentBar.close) * inTrade.quantity;
        floatingPnlPercent = ((inTrade.entryPrice - currentBar.close) / inTrade.entryPrice) * 100;
      }
    }

    frames.push({
      barIndex: i,
      time: currentBar.time,
      candle: currentBar,
      status: inTrade ? 'IN_POSITION' : 'IDLE',
      idleBarsCount: inTrade ? 0 : idleBarsCount,
      currentCapital: parseFloat(currentCapital.toFixed(2)),
      confluenceScore: calculatedScore,
      position: inTrade
        ? {
            side: inTrade.side,
            entryPrice: parseFloat(inTrade.entryPrice.toFixed(2)),
            currentPrice: currentBar.close,
            stopLoss: parseFloat(inTrade.stopLoss.toFixed(2)),
            takeProfit: parseFloat(inTrade.takeProfit.toFixed(2)),
            quantity: inTrade.quantity,
            floatingPnl: parseFloat(floatingPnl.toFixed(2)),
            floatingPnlPercent: parseFloat(floatingPnlPercent.toFixed(2)),
            barsHeld: i - inTrade.entryBar,
            breakevenMoved: inTrade.breakevenMoved,
          }
        : null,
      closedTradesCount: trades.length,
      winningTradesCount: trades.filter(t => t.pnl > 0).length,
      losingTradesCount: trades.filter(t => t.pnl < 0).length,
      currentPnl: parseFloat(currentPnl.toFixed(2)),
      currentPnlPercent: parseFloat(currentPnlPercent.toFixed(2)),
      equity: parseFloat((currentCapital + floatingPnl).toFixed(2)),
      lastLogId: latestLogId,
    });
  }

  // Estatísticas consolidadas
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const breakevenTrades = trades.filter(t => t.pnl === 0).length;

  const winRate = totalTrades > 0 ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;
  const totalGains = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));

  const profitFactor = totalLosses > 0 ? parseFloat((totalGains / totalLosses).toFixed(2)) : totalGains > 0 ? 99 : 0;
  const netProfit = parseFloat((currentCapital - config.initialCapital).toFixed(2));
  const netProfitPercent = parseFloat(((netProfit / config.initialCapital) * 100).toFixed(2));

  const avgWin = winningTrades > 0 ? parseFloat((totalGains / winningTrades).toFixed(2)) : 0;
  const avgLoss = losingTrades > 0 ? parseFloat((totalLosses / losingTrades).toFixed(2)) : 0;
  const avgTradePnl = totalTrades > 0 ? parseFloat((netProfit / totalTrades).toFixed(2)) : 0;

  const returns = trades.map(t => t.pnlPercent);
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    : 1;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? parseFloat(((meanReturn / stdDev) * Math.sqrt(totalTrades)).toFixed(2)) : 0;

  return {
    id: `bt-real-${Date.now()}`,
    config,
    totalCandles: candles.length,
    dateRange: {
      start: candles[0].time,
      end: candles[candles.length - 1].time,
    },
    initialCapital: config.initialCapital,
    finalCapital: parseFloat(currentCapital.toFixed(2)),
    netProfit,
    netProfitPercent,
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate,
    profitFactor,
    maxDrawdownPercent: parseFloat(maxDrawdownPercent.toFixed(1)),
    maxDrawdownValue: parseFloat(maxDrawdownValue.toFixed(2)),
    sharpeRatio,
    avgTradePnl,
    avgWin,
    avgLoss,
    trades,
    equityCurve,
    isRealData,
    dataSource,
    candles,
    frames,
    eventLogs,
  };
}
