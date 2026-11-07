import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DaytradeCockpit } from '../DaytradeCockpit';
import { MarketProvider } from '../../../context/MarketContext';

describe('Cockpit de Daytrade e Robôs Autônomos (DaytradeCockpit)', () => {
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

  it('renderiza o cabeçalho da página, KPIs principais e os robôs padrão', () => {
    renderComponent();

    expect(screen.getByText('Cockpit Day Trade & Robôs Quant')).toBeInTheDocument();
    expect(screen.getByText('Resultado do Dia (P&L Robôs)')).toBeInTheDocument();
    expect(screen.getByText('Robôs em Execução')).toBeInTheDocument();
    expect(screen.getByText('Assertividade Média (Win Rate)')).toBeInTheDocument();
    expect(screen.getByText('Capital Total sob Gestão')).toBeInTheDocument();

    expect(screen.getAllByText('Maya Sniper B3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maya BTC Momentum').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Maya PETR4 Flow').length).toBeGreaterThan(0);
  });

  it('filtra robôs por mercado ao clicar nas abas B3 e Cripto', () => {
    renderComponent();

    const cryptoFilterBtn = screen.getByText(/Cripto \(/i);
    fireEvent.click(cryptoFilterBtn);

    expect(screen.getAllByText('Maya BTC Momentum').length).toBeGreaterThan(0);

    const b3FilterBtn = screen.getByText(/B3 \(/i);
    fireEvent.click(b3FilterBtn);

    expect(screen.getAllByText('Maya Sniper B3').length).toBeGreaterThan(0);
  });

  it('alterna o estado de execução do robô entre pausado e rodando', () => {
    renderComponent();

    const powerButtons = screen.getAllByTitle(/Pausar Robô|Ativar Robô/i);
    expect(powerButtons.length).toBeGreaterThan(0);

    fireEvent.click(powerButtons[0]);
    expect(screen.getByText('PAUSADO')).toBeInTheDocument();
  });

  it('alterna o modo de visualização entre Grid de Cards e Matriz em Tabela', () => {
    renderComponent();

    const tableBtn = screen.getByTitle('Visualização em Tabela Compacta (Cockpit Matrix)');
    fireEvent.click(tableBtn);

    expect(screen.getByText('Robô / Ativo')).toBeInTheDocument();
    expect(screen.getByText('Posição Aberta')).toBeInTheDocument();

    const cardsBtn = screen.getByTitle('Visualização em Cards');
    fireEvent.click(cardsBtn);
    expect(screen.getAllByText('Filtro:').length).toBeGreaterThan(0);
  });

  it('abre o modal do Laboratório de Estratégias e executa a simulação de backtest', () => {
    renderComponent();

    const labBtn = screen.getByText('Laboratório Backtest');
    fireEvent.click(labBtn);

    expect(screen.getByText('Laboratório Quant & Backtest de Estratégias')).toBeInTheDocument();
    expect(screen.getByText(/Filtros de Alta Assertividade/i)).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText(/Rodar Backtest Histórico/i)).toBeInTheDocument();

    const runBtn = screen.getByText(/Rodar Backtest Histórico/i);
    fireEvent.click(runBtn);
    expect(screen.getByText(/Calculando Simulação/i)).toBeInTheDocument();
  });

  it('filtra o feed de decisões para exibir apenas o robô selecionado', () => {
    renderComponent();

    const botButtons = screen.getAllByRole('button', { name: /Maya Sniper B3/i });
    expect(botButtons.length).toBeGreaterThan(0);
    fireEvent.click(botButtons[0]);

    expect(screen.getByText(/Limpar filtro/i)).toBeInTheDocument();
  });

  it('abre o modal de edição de robô e atualiza seus parâmetros', () => {
    renderComponent();

    const editButtons = screen.getAllByTitle(/Editar Parâmetros & Estratégia/i);
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Editar Parâmetros & Estratégia')).toBeInTheDocument();
    expect(screen.getByText('Salvar e Aplicar Alterações')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Salvar e Aplicar Alterações'));
    expect(screen.queryByText('Editar Parâmetros & Estratégia')).not.toBeInTheDocument();
  });

  it('abre o modal de logs e auditoria ao clicar no botão de logs do card', () => {
    renderComponent();

    const viewLogsButtons = screen.getAllByTitle(/Ver Histórico Completo de Logs deste Robô/i);
    expect(viewLogsButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewLogsButtons[0]);

    expect(screen.getByText('Histórico de Auditoria & Decisões')).toBeInTheDocument();
    expect(screen.getByText(/Decisões Registradas/i)).toBeInTheDocument();
  });
});
