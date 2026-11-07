import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BacktestKpiStrip } from '../BacktestKpiStrip';
import { BacktestFrame, RealBacktestReport } from '../../../services/realBacktestEngine';

describe('Componente BacktestKpiStrip', () => {
  const mockReport: RealBacktestReport = {
    id: 'rep-1',
    config: {} as any,
    totalCandles: 100,
    dateRange: { start: 1000, end: 2000 },
    initialCapital: 1000,
    finalCapital: 1150,
    netProfit: 150,
    netProfitPercent: 15,
    totalTrades: 10,
    winningTrades: 7,
    losingTrades: 3,
    breakevenTrades: 1,
    winRate: 70,
    profitFactor: 2.5,
    maxDrawdownPercent: 1.2,
    maxDrawdownValue: 12,
    sharpeRatio: 1.85,
    avgTradePnl: 15,
    avgWin: 25,
    avgLoss: 10,
    trades: [],
    equityCurve: [],
    isRealData: true,
    dataSource: 'Binance Live',
    candles: [],
    frames: [],
    eventLogs: [],
  };

  const mockFrame: BacktestFrame = {
    barIndex: 50,
    time: 1500,
    candle: { time: 1500, open: 10, high: 12, low: 9, close: 11, volume: 1000 },
    status: 'IN_POSITION',
    idleBarsCount: 0,
    currentCapital: 1150,
    confluenceScore: 85,
    position: null,
    closedTradesCount: 10,
    winningTradesCount: 7,
    losingTradesCount: 3,
    currentPnl: 150,
    currentPnlPercent: 15,
    equity: 1150,
  };

  it('renderiza os 6 cards de KPIs principais com dados formatados em Real Brasileiro', () => {
    render(
      <BacktestKpiStrip
        currentFrame={mockFrame}
        report={mockReport}
        isFinished={true}
        currencyPrefix="R$"
      />
    );

    // Valida Resultado Líquido
    expect(screen.getByText('Resultado Líquido')).toBeInTheDocument();
    expect(screen.getByText(/\+R\$ 150,00/i)).toBeInTheDocument();
    expect(screen.getByText(/\+15.00%/i)).toBeInTheDocument();

    // Valida Taxa de Acerto (Win Rate)
    expect(screen.getByText('Taxa de Acerto')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('7W / 3L')).toBeInTheDocument();

    // Valida Fator de Lucro
    expect(screen.getByText('Profit Factor')).toBeInTheDocument();
    expect(screen.getByText('2.5x')).toBeInTheDocument();

    // Valida Rebaixamento Máximo (Drawdown)
    expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
    expect(screen.getByText('-1.2%')).toBeInTheDocument();

    // Valida Total de Operações e Breakevens
    expect(screen.getByText('Total Trades')).toBeInTheDocument();
    expect(screen.getByText('10 / 10')).toBeInTheDocument();
    expect(screen.getByText('1 no 0x0')).toBeInTheDocument();

    // Valida Índice de Sharpe
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
    expect(screen.getByText('1.85')).toBeInTheDocument();
  });
});
