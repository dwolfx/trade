import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BacktestPage } from '../BacktestPage';

// Mock the historical fetcher so unit tests run fast and deterministically
vi.mock('../../services/realBacktestEngine', async importOriginal => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    fetchHistoricalCandlesForBacktest: vi.fn(async (symbol: string, market: string) => ({
      candles: actual.generateRealisticWalkCandles(symbol, market as any, 100),
      isReal: true,
      source: 'Mock Binance Live API',
    })),
  };
});

describe('BacktestPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('renders initial clean state and runs simulation on button click', async () => {
    render(<BacktestPage />);

    expect(screen.getByText(/Laboratório de Backtesting Quantitativo/i)).toBeInTheDocument();
    expect(screen.getByText(/Parâmetros do Replay Quant/i)).toBeInTheDocument();
    expect(screen.getByText(/Mercado de Atuação/i)).toBeInTheDocument();

    // Verifies clean initial empty state!
    expect(screen.getByText(/Laboratório Quantitativo Pronto/i)).toBeInTheDocument();
    expect(screen.getByText(/O painel está limpo aguardando seus parâmetros/i)).toBeInTheDocument();

    const runBtn = screen.getByRole('button', { name: /Executar Replay Histórico Real/i });
    expect(runBtn).toBeInTheDocument();

    // Select 7D period
    const period7dBtn = screen.getByRole('button', { name: '7D' });
    fireEvent.click(period7dBtn);
    expect(screen.getByText(/Últimos 7 dias/i)).toBeInTheDocument();

    fireEvent.click(runBtn);

    // After clicking run, results and playback elements appear
    await waitFor(() => {
      expect(screen.getByText(/Resultado Líquido/i)).toBeInTheDocument();
      expect(screen.getByText(/Taxa de Acerto/i)).toBeInTheDocument();
      expect(screen.getByText(/Profit Factor/i)).toBeInTheDocument();
      expect(screen.getByText(/Max Drawdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Gráfico de Candles em Replay/i)).toBeInTheDocument();
      expect(screen.getByText(/Terminal de Decisões & Auditoria/i)).toBeInTheDocument();
    });
  });

  it('switches between B3 and CRYPTO markets and displays Brazilian Real (R$) consistently without U$', () => {
    render(<BacktestPage />);

    // Default Crypto market uses R$ (not U$)
    expect(screen.getAllByText('R$')[0]).toBeInTheDocument();
    expect(screen.queryByText('U$')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BTCBRL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ETHBRL' })).toBeInTheDocument();

    const b3Btn = screen.getByRole('button', { name: /Bolsa B3/i });
    fireEvent.click(b3Btn);

    // B3 market uses R$
    expect(screen.getAllByText('R$')[0]).toBeInTheDocument();
    expect(screen.queryByText('U$')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PETR4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'VALE3' })).toBeInTheDocument();

    const cryptoBtn = screen.getByRole('button', { name: /Criptoativos 24\/7/i });
    fireEvent.click(cryptoBtn);

    // Back to Crypto still uses strictly R$
    expect(screen.getAllByText('R$')[0]).toBeInTheDocument();
    expect(screen.queryByText('U$')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BTCBRL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ETHBRL' })).toBeInTheDocument();
  });

  it('opens and closes interactive explanatory popovers for Confluence and Risk:Reward', () => {
    render(<BacktestPage />);

    const confluenceHelp = screen.getByTitle(/Clique para entender o que é Confluência Mínima/i);
    fireEvent.click(confluenceHelp);

    expect(screen.getByText(/O que é Confluência Mínima\?/i)).toBeInTheDocument();
    expect(screen.getByText(/nota quantitativa \(0 a 100%\)/i)).toBeInTheDocument();

    // Toggle close
    fireEvent.click(confluenceHelp);
    expect(screen.queryByText(/O que é Confluência Mínima\?/i)).not.toBeInTheDocument();

    const rrHelp = screen.getByTitle(/Clique para entender o que é Relação Risco : Retorno/i);
    fireEvent.click(rrHelp);

    expect(screen.getByText(/O que é Relação Risco : Retorno\?/i)).toBeInTheDocument();
    expect(screen.getByText(/tamanho do seu Stop Loss/i)).toBeInTheDocument();
  });

  it('allows typing a custom ticker, adds to history, and runs backtest', async () => {
    render(<BacktestPage />);

    const customInput = screen.getByPlaceholderText(/Ou pesquise/i);
    fireEvent.change(customInput, { target: { value: 'SOLBRL' } });

    expect(screen.getByText(/Personalizado/i)).toBeInTheDocument();

    const runBtn = screen.getByRole('button', { name: /Executar Replay Histórico Real/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Gráfico de Candles em Replay/i)).toBeInTheDocument();
    });
  });

  it('calls onNavigate when clicking CTA to go to Daytrade Cockpit', async () => {
    const handleNavigate = vi.fn();
    render(<BacktestPage onNavigate={handleNavigate} />);

    const runBtn = screen.getByRole('button', { name: /Executar Replay Histórico Real/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Ir para Daytrade Cockpit/i })).toBeInTheDocument();
    });

    const ctaBtn = screen.getByRole('button', { name: /Ir para Daytrade Cockpit/i });
    fireEvent.click(ctaBtn);

    expect(handleNavigate).toHaveBeenCalledWith('daytrade');
  });
});
