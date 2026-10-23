import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PortfolioPage } from '../PortfolioPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('PortfolioPage Integration Tests', () => {
  it('should render consolidated portfolio title and KPIs', () => {
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

  it('should render asset allocation classes', () => {
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

  it('should render stocks individual performance with filter tabs', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('Desempenho Individual dos Ativos')).toBeInTheDocument();
    expect(screen.getAllByText('PETR4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WEGE3').length).toBeGreaterThan(0);

    // Test filter tabs in individual performance
    const cdbFilterButtons = screen.getAllByRole('button', { name: /CDB/i });
    fireEvent.click(cdbFilterButtons[0]);

    expect(screen.getAllByText(/Tesouro Selic 2029/i).length).toBeGreaterThan(0);
  });

  it('should render upcoming and recent dividends with tab switching', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('Central de Dividendos & Proventos')).toBeInTheDocument();
    expect(screen.getByText(/Próximos a Receber/i)).toBeInTheDocument();

    // Click on "Últimos 3 Recebidos"
    const recentTab = screen.getByRole('button', { name: /Últimos 3 Recebidos/i });
    fireEvent.click(recentTab);

    expect(screen.getByText('Total dos Últimos 3 Recebidos')).toBeInTheDocument();
    expect(screen.getAllByText(/Depositado/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should open order drawer with DEMO/LIVE switch and custody info when clicking Operar', () => {
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // Find first "Operar" button in table
    const tradeButtons = screen.getAllByRole('button', { name: /Operar/i });
    fireEvent.click(tradeButtons[0]);

    // Drawer with Boleta Rápida B3 should open!
    expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /DEMO/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /LIVE/i }).length).toBeGreaterThan(0);

    // Close button should close drawer
    const closeBtn = screen.getByTitle('Fechar boleta');
    fireEvent.click(closeBtn);

    expect(screen.queryByTitle('Fechar boleta')).not.toBeInTheDocument();
  });

  it('should navigate back to home broker when button clicked', () => {
    const handleNavigate = vi.fn();
    render(
      <MarketProvider>
        <PortfolioPage onNavigate={handleNavigate} />
      </MarketProvider>
    );

    const backButton = screen.getByRole('button', { name: /Voltar ao Home Broker/i });
    fireEvent.click(backButton);

    expect(handleNavigate).toHaveBeenCalledWith('bolsa');
  });
});
