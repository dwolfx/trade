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
    expect(screen.getByText(/Pinga-Pinga B3 & Internacional/i)).toBeInTheDocument();
    expect(screen.getByText(/Previsto na Carteira/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximo Pinga-Pinga/i)).toBeInTheDocument();
  });

  it('renders 3 origin filter buttons with multi-select capability (Carteira + Favoritos simultaneously)', () => {
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

    // Default: Carteira is active
    expect(carteiraBtn).toHaveAttribute('aria-pressed', 'true');
    expect(favoritosBtn).toHaveAttribute('aria-pressed', 'false');

    // Click Meus Favoritos -> ADDS it (does not replace!)
    fireEvent.click(favoritosBtn);

    expect(carteiraBtn).toHaveAttribute('aria-pressed', 'true');
    expect(favoritosBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders monthly calendar grid with week days and visual legend for FII, Ação B3 and US$', () => {
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
    expect(screen.getByText(/Ações Globais/i)).toBeInTheDocument();
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

  it('filters by Level 1 Todo o Mercado and Level 2 Sub-filtro FIIs', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // 1. Switch to Todo o Mercado
    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado/i });
    fireEvent.click(mercadoBtn);

    // 2. Switch to List view
    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    // 3. Sub-filter by FIIs
    const fiiFilterBtn = screen.getByRole('button', { name: /FIIs \(Imobiliários\)/i });
    fireEvent.click(fiiFilterBtn);

    // FIIs should be visible
    expect(screen.getAllByText(/\$HGLG11/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$KNIP11/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$VISC11/i).length).toBeGreaterThan(0);

    // Stock should not be visible
    expect(screen.queryByText(/\$PETR4/i)).not.toBeInTheDocument();
  });

  it('filters by Level 1 Todo o Mercado and Level 2 Sub-filtro Internacionais (US$)', () => {
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

    // International stocks should be visible
    expect(screen.getAllByText(/\$AAPL/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$KO/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$JNJ/i).length).toBeGreaterThan(0);

    // Brazilian Stock or FII should not be visible in list
    expect(screen.queryByText(/FII · Imobiliário/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ação · B3/i)).not.toBeInTheDocument();
  });

  it('filters by Minha Carteira and Sub-filtro Ações B3', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // Default origin is Minha Carteira
    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    // Sub-filter by Ações B3
    const acoesBtn = screen.getByRole('button', { name: /Ações B3/i });
    fireEvent.click(acoesBtn);

    // PETR4 should be visible as it is owned in portfolio
    expect(screen.getAllByText(/\$PETR4/i).length).toBeGreaterThan(0);

    // FII should not be visible in Ações sub-filter
    expect(screen.queryByText(/FII · Imobiliário/i)).not.toBeInTheDocument();
  });

  it('filters by search input', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // Select Mercado to have full pool
    const mercadoBtn = screen.getByRole('button', { name: /Todo o Mercado/i });
    fireEvent.click(mercadoBtn);

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const searchInput = screen.getByPlaceholderText(/Buscar por ticker/i);
    fireEvent.change(searchInput, { target: { value: 'TAEE11' } });

    expect(screen.getByText(/\$TAEE11/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$KO/i)).not.toBeInTheDocument();
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
