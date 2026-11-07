import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BacktestPage } from '../BacktestPage';

// Mock do buscador histórico para garantir testes determinísticos e rápidos
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

describe('Componente Página de Backtest', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renderiza o estado inicial limpo e executa a simulação ao clicar no botão', async () => {
    render(<BacktestPage />);

    expect(screen.getByText(/Laboratório de Backtesting Quantitativo/i)).toBeInTheDocument();
    expect(screen.getByText(/Parâmetros do Replay Quant/i)).toBeInTheDocument();
    expect(screen.getByText(/Mercado de Atuação/i)).toBeInTheDocument();

    // Valida o estado inicial limpo
    expect(screen.getByText(/Laboratório Quantitativo Pronto/i)).toBeInTheDocument();
    expect(screen.getByText(/O painel está limpo aguardando seus parâmetros/i)).toBeInTheDocument();

    const runBtn = screen.getByRole('button', { name: /Executar Replay Histórico Real/i });
    expect(runBtn).toBeInTheDocument();

    // Seleciona o período de 7 dias
    const period7dBtn = screen.getByRole('button', { name: '7D' });
    fireEvent.click(period7dBtn);
    expect(screen.getByText(/Últimos 7 dias/i)).toBeInTheDocument();

    fireEvent.click(runBtn);

    // Após clicar em executar, os cards de métricas e replay devem surgir
    await waitFor(() => {
      expect(screen.getByText(/Resultado Líquido/i)).toBeInTheDocument();
      expect(screen.getByText(/Taxa de Acerto/i)).toBeInTheDocument();
      expect(screen.getByText(/Profit Factor/i)).toBeInTheDocument();
      expect(screen.getByText(/Max Drawdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Gráfico de Candles em Replay/i)).toBeInTheDocument();
      expect(screen.getByText(/Terminal de Decisões & Auditoria/i)).toBeInTheDocument();
    });
  });

  it('alterna entre mercados B3 e CRIPTO exibindo Real Brasileiro (R$) de forma consistente sem U$', () => {
    render(<BacktestPage />);

    // Mercado padrão Cripto utiliza R$ estritamente
    expect(screen.getAllByText('R$')[0]).toBeInTheDocument();
    expect(screen.queryByText('U$')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BTCBRL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ETHBRL' })).toBeInTheDocument();

    const b3Btn = screen.getByRole('button', { name: /Bolsa B3/i });
    fireEvent.click(b3Btn);

    // Mercado B3 também usa R$
    expect(screen.getAllByText('R$')[0]).toBeInTheDocument();
    expect(screen.queryByText('U$')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PETR4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'VALE3' })).toBeInTheDocument();

    const cryptoBtn = screen.getByRole('button', { name: /Criptoativos 24\/7/i });
    fireEvent.click(cryptoBtn);

    // De volta para Cripto mantém estritamente R$
    expect(screen.getAllByText('R$')[0]).toBeInTheDocument();
    expect(screen.queryByText('U$')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BTCBRL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ETHBRL' })).toBeInTheDocument();
  });

  it('abre e fecha caixas explicativas interativas de Confluência e Risco:Retorno', () => {
    render(<BacktestPage />);

    const confluenceHelp = screen.getByTitle(/Clique para entender o que é Confluência Mínima/i);
    fireEvent.click(confluenceHelp);

    expect(screen.getByText(/O que é Confluência Mínima\?/i)).toBeInTheDocument();
    expect(screen.getByText(/nota quantitativa \(0 a 100%\)/i)).toBeInTheDocument();

    // Fecha ao clicar novamente
    fireEvent.click(confluenceHelp);
    expect(screen.queryByText(/O que é Confluência Mínima\?/i)).not.toBeInTheDocument();

    const rrHelp = screen.getByTitle(/Clique para entender o que é Relação Risco : Retorno/i);
    fireEvent.click(rrHelp);

    expect(screen.getByText(/O que é Relação Risco : Retorno\?/i)).toBeInTheDocument();
    expect(screen.getByText(/tamanho do seu Stop Loss/i)).toBeInTheDocument();
  });

  it('permite digitar ticker personalizado, adiciona ao histórico e roda o backtest', async () => {
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

  it('chama onNavigate ao clicar no CTA para ir ao Daytrade Cockpit', async () => {
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
