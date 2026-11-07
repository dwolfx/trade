import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DividendsCalendarPage } from '../DividendsCalendarPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('Calendário de Proventos e Dividendos (DividendsCalendarPage)', () => {
  it('renderiza o cabeçalho da página, o badge do pinga-pinga e os cards de KPIs', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/Calendário & Mapa de Dividendos/i)).toBeInTheDocument();
    expect(screen.getByText(/Pinga-Pinga B3 & Internacional/i)).toBeInTheDocument();
    expect(screen.getByText(/Previsto na Carteira/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximo Pinga-Pinga/i)).toBeInTheDocument();
  });

  it('renderiza 3 botões de filtro de origem com suporte a seleção múltipla (Carteira + Favoritos simultaneamente)', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const carteiraBtn = screen.getByRole('button', { name: /Minha Carteira/i });
    const favoritosBtn = screen.getByRole('button', { name: /Meus Favoritos/i });
    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado/i });

    expect(carteiraBtn).toBeInTheDocument();
    expect(favoritosBtn).toBeInTheDocument();
    expect(mercadoBtn).toBeInTheDocument();

    expect(carteiraBtn).toHaveAttribute('aria-pressed', 'true');
    expect(favoritosBtn).toHaveAttribute('aria-pressed', 'false');

    // Ao clicar em Meus Favoritos, adiciona a seleção sem desmarcar a Carteira
    fireEvent.click(favoritosBtn);

    expect(carteiraBtn).toHaveAttribute('aria-pressed', 'true');
    expect(favoritosBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renderiza a grade mensal do calendário com dias da semana e legenda visual (FII, Ação B3 e US$)', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('DOM')).toBeInTheDocument();
    expect(screen.getByText('SEG')).toBeInTheDocument();
    expect(screen.getByText('SEX')).toBeInTheDocument();
    expect(screen.getByText('SÁB')).toBeInTheDocument();

    expect(screen.getByText(/Fundos Imobiliários \(Rendimento Isento\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ações \/ Stocks \(Dividendo & JCP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ações Globais/i)).toBeInTheDocument();
  });

  it('alterna a visualização entre grade (Calendário) e lista (Lista / Agenda)', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    expect(screen.getAllByText(/Data-COM:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Valor por cota/i).length).toBeGreaterThan(0);
  });

  it('filtra por Todo o Mercado (Nível 1) e Sub-filtro de FIIs (Nível 2)', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado/i });
    fireEvent.click(mercadoBtn);

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const fiiFilterBtn = screen.getByRole('button', { name: /FIIs \(Imobiliários\)/i });
    fireEvent.click(fiiFilterBtn);

    expect(screen.getAllByText(/\$HGLG11/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$KNIP11/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$VISC11/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/\$PETR4/i)).not.toBeInTheDocument();
  });

  it('filtra por Todo o Mercado (Nível 1) e Sub-filtro de Ativos Internacionais US$ (Nível 2)', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado/i });
    fireEvent.click(mercadoBtn);

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const intlBtn = screen.getByRole('button', { name: /Internacionais \(US\$\)/i });
    fireEvent.click(intlBtn);

    expect(screen.getAllByText(/\$AAPL/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$KO/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$JNJ/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/FII · Imobiliário/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ação · B3/i)).not.toBeInTheDocument();
  });

  it('filtra por Minha Carteira e Sub-filtro de Ações B3', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const acoesBtn = screen.getByRole('button', { name: /Ações B3/i });
    fireEvent.click(acoesBtn);

    expect(screen.getAllByText(/\$PETR4/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/FII · Imobiliário/i)).not.toBeInTheDocument();
  });

  it('filtra os proventos por ticker ao digitar no campo de busca', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado/i });
    fireEvent.click(mercadoBtn);

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const searchInput = screen.getByPlaceholderText(/Buscar por ticker/i);
    fireEvent.change(searchInput, { target: { value: 'TAEE11' } });

    expect(screen.getByText(/\$TAEE11/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$KO/i)).not.toBeInTheDocument();
  });

  it('abre o modal de ordens ao clicar no botão Operar', async () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const operateButtons = screen.getAllByRole('button', { name: /Operar/i });
    expect(operateButtons.length).toBeGreaterThan(0);
    fireEvent.click(operateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
    });
  });

  it('renderiza o card interativo de simulação de renda passiva pinga-pinga', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/Simulador de Pinga-Pinga/i)).toBeInTheDocument();
    expect(screen.getByText(/Quantidade de cotas/i)).toBeInTheDocument();
    expect(screen.getByText(/Renda Mensal/i)).toBeInTheDocument();
  });
});
