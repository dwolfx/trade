import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PortfolioPage } from '../PortfolioPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('Página da Carteira Consolidada (PortfolioPage)', () => {
  it('deve renderizar o título da carteira consolidada e os cards de KPIs', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('Minha Carteira Consolidada')).toBeInTheDocument();
    expect(screen.getByText('Patrimônio Consolidado')).toBeInTheDocument();
    expect(screen.getAllByText(/Lucro \/ Prejuízo \(P&L\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Próximos Proventos')).toBeInTheDocument();
    expect(screen.getByText(/Alocação Macro/i)).toBeInTheDocument();
  });

  it('deve renderizar as classes de alocação de ativos', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('Alocação Patrimonial por Classe')).toBeInTheDocument();
    expect(screen.getAllByText(/Ações B3 \(Stocks\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Fundos Imobiliários \(FIIs\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/CDB & Renda Fixa/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Poupança \/ Reserva/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Margem Daytrade/i).length).toBeGreaterThanOrEqual(1);
  });

  it('deve renderizar desempenho individual dos ativos com abas de filtro', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('Desempenho Individual dos Ativos')).toBeInTheDocument();
    expect(screen.getAllByText('PETR4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WEGE3').length).toBeGreaterThan(0);

    const cdbFilterButtons = screen.getAllByRole('button', { name: /CDB/i });
    fireEvent.click(cdbFilterButtons[0]);

    expect(screen.getAllByText(/Tesouro Selic 2029/i).length).toBeGreaterThan(0);
  });

  it('deve exibir proventos futuros e recentes permitindo alternar abas', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('Central de Dividendos & Proventos')).toBeInTheDocument();
    expect(screen.getByText(/Próximos a Receber/i)).toBeInTheDocument();

    const recentTab = screen.getByRole('button', { name: /Últimos 3 Recebidos/i });
    fireEvent.click(recentTab);

    expect(screen.getByText('Total dos Últimos 3 Recebidos')).toBeInTheDocument();
    expect(screen.getAllByText(/Depositado/i).length).toBeGreaterThanOrEqual(1);
  });

  it('deve abrir gaveta de ordens com seletor DEMO/LIVE e dados de custódia ao clicar em Operar', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const tradeButtons = screen.getAllByRole('button', { name: /Operar/i });
    fireEvent.click(tradeButtons[0]);

    expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /DEMO/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /LIVE/i }).length).toBeGreaterThan(0);

    const closeBtn = screen.getByTitle('Fechar boleta');
    fireEvent.click(closeBtn);

    expect(screen.queryByTitle('Fechar boleta')).not.toBeInTheDocument();
  });

  it('deve abrir gaveta de ordens ao clicar no botão Nova Ordem', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const novaOrdemButton = screen.getByRole('button', { name: /Nova Ordem/i });
    fireEvent.click(novaOrdemButton);

    expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
  });
});
