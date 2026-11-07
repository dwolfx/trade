import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BacktestTradeTable } from '../BacktestTradeTable';
import { RealBacktestReport, RealBacktestTrade } from '../../../services/realBacktestEngine';

describe('Componente BacktestTradeTable', () => {
  const mockTrades: RealBacktestTrade[] = [
    {
      id: 'trade-1',
      tradeNumber: 1,
      entryTime: 1700000000000,
      exitTime: 1700000300000,
      side: 'BUY',
      entryPrice: 100.0,
      exitPrice: 105.0,
      quantity: 2,
      pnl: 10.0,
      pnlPercent: 5.0,
      exitReason: 'TAKE_PROFIT',
      barsHeld: 3,
      equityAfter: 1010.0,
    },
    {
      id: 'trade-2',
      tradeNumber: 2,
      entryTime: 1700000400000,
      exitTime: 1700000700000,
      side: 'SELL',
      entryPrice: 105.0,
      exitPrice: 107.0,
      quantity: 2,
      pnl: -4.0,
      pnlPercent: -1.9,
      exitReason: 'STOP_LOSS',
      barsHeld: 2,
      equityAfter: 1006.0,
    },
  ];

  const mockReport: RealBacktestReport = {
    id: 'rep-1',
    config: {} as any,
    totalCandles: 100,
    dateRange: { start: 1000, end: 2000 },
    initialCapital: 1000,
    finalCapital: 1006,
    netProfit: 6,
    netProfitPercent: 0.6,
    totalTrades: 2,
    winningTrades: 1,
    losingTrades: 1,
    breakevenTrades: 0,
    winRate: 50,
    profitFactor: 2.5,
    maxDrawdownPercent: 0.4,
    maxDrawdownValue: 4,
    sharpeRatio: 1.2,
    avgTradePnl: 3,
    avgWin: 10,
    avgLoss: 4,
    trades: mockTrades,
    equityCurve: [],
    isRealData: true,
    dataSource: 'Binance Live',
    candles: [],
    frames: [],
    eventLogs: [],
  };

  it('renderiza títulos, colunas e lista de operações corretamente', () => {
    const handleSetFilter = vi.fn();
    render(
      <BacktestTradeTable
        report={mockReport}
        filterType="ALL"
        setFilterType={handleSetFilter}
        filteredTrades={mockTrades}
        currencyPrefix="R$"
      />
    );

    expect(screen.getByText('Registro de Operações Concluídas')).toBeInTheDocument();
    expect(screen.getByText('COMPRA')).toBeInTheDocument();
    expect(screen.getByText('SHORT')).toBeInTheDocument();
    expect(screen.getByText('TAKE PROFIT')).toBeInTheDocument();
    expect(screen.getByText('STOP LOSS')).toBeInTheDocument();
    expect(screen.getByText(/\+R\$ 10.00/i)).toBeInTheDocument();
    expect(screen.getByText(/-R\$ 4.00/i)).toBeInTheDocument();

    const winsFilterBtn = screen.getByRole('button', { name: /Ganhos \(1\)/i });
    fireEvent.click(winsFilterBtn);
    expect(handleSetFilter).toHaveBeenCalledWith('WINS');
  });
});
