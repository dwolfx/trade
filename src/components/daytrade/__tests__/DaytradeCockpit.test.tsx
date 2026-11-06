import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DaytradeCockpit } from '../DaytradeCockpit';
import { MarketProvider } from '../../../context/MarketContext';

describe('DaytradeCockpit Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MarketProvider>
        <DaytradeCockpit />
      </MarketProvider>
    );
  };

  it('renders page header, top KPIs, and default bots', () => {
    renderComponent();

    // Page header title
    expect(screen.getByText('Cockpit Day Trade & Robôs Quant')).toBeInTheDocument();

    // Top KPIs
    expect(screen.getByText('Resultado do Dia (P&L Robôs)')).toBeInTheDocument();
    expect(screen.getByText('Robôs em Execução')).toBeInTheDocument();
    expect(screen.getByText('Assertividade Média (Win Rate)')).toBeInTheDocument();
    expect(screen.getByText('Capital Total sob Gestão')).toBeInTheDocument();

    // Default bots (can appear in cards and logs)
    expect(screen.getAllByText('Maya Sniper B3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maya BTC Momentum').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maya PETR4 Flow').length).toBeGreaterThan(0);
  });

  it('filters bots by market when clicking B3 and Cripto tabs', () => {
    renderComponent();

    // Filter by Cripto
    const cryptoFilterBtn = screen.getByText(/Cripto \(/i);
    fireEvent.click(cryptoFilterBtn);

    expect(screen.getAllByText('Maya BTC Momentum').length).toBeGreaterThan(0);

    // Filter by B3
    const b3FilterBtn = screen.getByText(/B3 \(/i);
    fireEvent.click(b3FilterBtn);

    expect(screen.getAllByText('Maya Sniper B3').length).toBeGreaterThan(0);
  });

  it('toggles a bot power status to paused and back to running', () => {
    renderComponent();

    // Find first power button
    const powerButtons = screen.getAllByTitle(/Pausar Robô|Ativar Robô/i);
    expect(powerButtons.length).toBeGreaterThan(0);

    // Toggle power
    fireEvent.click(powerButtons[0]);
    expect(screen.getByText('PAUSADO')).toBeInTheDocument();
  });

  it('switches view mode between Cards Grid and Table Matrix', () => {
    renderComponent();

    // Switch to table mode
    const tableBtn = screen.getByTitle('Visualização em Tabela Compacta (Cockpit Matrix)');
    fireEvent.click(tableBtn);

    // Table headers should now be present
    expect(screen.getByText('Robô / Ativo')).toBeInTheDocument();
    expect(screen.getByText('Posição Aberta')).toBeInTheDocument();

    // Switch back to cards
    const cardsBtn = screen.getByTitle('Visualização em Cards');
    fireEvent.click(cardsBtn);
    expect(screen.getAllByText('Filtro:').length).toBeGreaterThan(0);
  });

  it('opens Strategy Lab Modal and executes backtest simulation', () => {
    renderComponent();

    const labBtn = screen.getByText('Laboratório Backtest');
    fireEvent.click(labBtn);

    // Lab modal should appear
    expect(screen.getByText('Laboratório Quant & Backtest de Estratégias')).toBeInTheDocument();
    expect(screen.getByText(/Filtros de Alta Assertividade/i)).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText(/Rodar Backtest Histórico/i)).toBeInTheDocument();

    // Click to run backtest
    const runBtn = screen.getByText(/Rodar Backtest Histórico/i);
    fireEvent.click(runBtn);
    expect(screen.getByText(/Calculando Simulação/i)).toBeInTheDocument();
  });

  it('filters decision stream by specific robot', () => {
    renderComponent();

    // Click on specific bot filter button in feed or on card
    const botButtons = screen.getAllByRole('button', { name: /Maya Sniper B3/i });
    expect(botButtons.length).toBeGreaterThan(0);
    fireEvent.click(botButtons[0]);

    // The clean filter button should appear
    expect(screen.getByText(/Limpar filtro/i)).toBeInTheDocument();
  });

  it('opens Edit Bot Modal and updates bot parameters', () => {
    renderComponent();

    // Click edit button on first card
    const editButtons = screen.getAllByTitle(/Editar Parâmetros & Estratégia/i);
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);

    // Modal should be open
    expect(screen.getByText('Editar Parâmetros & Estratégia')).toBeInTheDocument();
    expect(screen.getByText('Salvar e Aplicar Alterações')).toBeInTheDocument();

    // Click save
    fireEvent.click(screen.getByText('Salvar e Aplicar Alterações'));
    expect(screen.queryByText('Editar Parâmetros & Estratégia')).not.toBeInTheDocument();
  });

  it('opens Bot Logs Modal when clicking logs button on a card', () => {
    renderComponent();

    // Click view logs button
    const viewLogsButtons = screen.getAllByTitle(/Ver Histórico Completo de Logs deste Robô/i);
    expect(viewLogsButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewLogsButtons[0]);

    // Logs modal should open with title
    expect(screen.getByText('Histórico de Auditoria & Decisões')).toBeInTheDocument();
    expect(screen.getByText(/Decisões Registradas/i)).toBeInTheDocument();
  });
});
