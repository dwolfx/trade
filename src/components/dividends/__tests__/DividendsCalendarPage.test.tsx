import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DividendsCalendarPage } from '../DividendsCalendarPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('DividendsCalendarPage Functional & Integration Tests', () => {
  it('renders page header, pinga-pinga badge and KPIs', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/Calendário & Mapa de Dividendos/i)).toBeInTheDocument();
    expect(screen.getByText(/Pinga-Pinga Mensal B3/i)).toBeInTheDocument();
    expect(screen.getByText(/Previsto na Carteira/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximo Pinga-Pinga/i)).toBeInTheDocument();
  });

  it('renders Level 1 origin filter tabs (Minha Carteira vs Todo o Mercado B3)', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByRole('button', { name: /Minha Carteira/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Todo o Mercado B3/i })).toBeInTheDocument();
  });

  it('renders monthly calendar grid with week days and visual legend for FII vs Ação', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('DOM')).toBeInTheDocument();
    expect(screen.getByText('SEG')).toBeInTheDocument();
    expect(screen.getByText('SEX')).toBeInTheDocument();
    expect(screen.getByText('SÁB')).toBeInTheDocument();

    // Visual legend in footer
    expect(screen.getByText(/Fundos Imobiliários \(Rendimento Isento\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ações \/ Stocks \(Dividendo & JCP\)/i)).toBeInTheDocument();
  });

  it('switches between grid (Calendário) and list (Lista / Agenda) views', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    // List view displays detailed rows with valor por cota and Data-COM
    expect(screen.getAllByText(/Data-COM:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Valor por cota/i).length).toBeGreaterThan(0);
  });

  it('filters by Level 1 Mercado B3 and Level 2 Sub-filtro FIIs', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // 1. Switch to Todo o Mercado B3
    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado B3/i });
    fireEvent.click(mercadoBtn);

    // 2. Switch to List view
    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    // 3. Sub-filter by FIIs
    const fiiFilterBtn = screen.getByRole('button', { name: /Fundos Imobiliários \(FIIs\)/i });
    fireEvent.click(fiiFilterBtn);

    // FIIs should be visible
    expect(screen.getAllByText(/\$HGLG11/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$KNIP11/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$VISC11/i).length).toBeGreaterThan(0);

    // Stock should not be visible
    expect(screen.queryByText(/\$PETR4/i)).not.toBeInTheDocument();
  });

  it('filters by Minha Carteira and Sub-filtro Ações (Stocks)', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // Default origin is Minha Carteira
    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    // Sub-filter by Ações
    const acoesBtn = screen.getByRole('button', { name: /Ações \(Stocks\)/i });
    fireEvent.click(acoesBtn);

    // PETR4 should be visible as it is owned in portfolio
    expect(screen.getAllByText(/\$PETR4/i).length).toBeGreaterThan(0);

    // FII HGLG11 should not be visible in Ações sub-filter
    expect(screen.queryByText(/FII · Imobiliário/i)).not.toBeInTheDocument();
  });

  it('filters by search input', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // Select Mercado to have full pool
    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado B3/i });
    fireEvent.click(mercadoBtn);

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const searchInput = screen.getByPlaceholderText(/Buscar por ticker/i);
    fireEvent.change(searchInput, { target: { value: 'TAEE11' } });

    expect(screen.getByText(/\$TAEE11/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$PETR4/i)).not.toBeInTheDocument();
  });

  it('opens order modal when clicking Operar button', async () => {
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

    // Slide-over boleta drawer should open
    await waitFor(() => {
      expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
    });
  });

  it('renders interactive passive income simulator card', () => {
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
