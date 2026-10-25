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

  it('renders monthly calendar grid with week days', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('DOM')).toBeInTheDocument();
    expect(screen.getByText('SEG')).toBeInTheDocument();
    expect(screen.getByText('SEX')).toBeInTheDocument();
    expect(screen.getByText('SÁB')).toBeInTheDocument();
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

  it('filters by search input', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // Switch to list view to inspect filtered items
    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const searchInput = screen.getByPlaceholderText(/Buscar por ticker/i);
    fireEvent.change(searchInput, { target: { value: 'MXRF11' } });

    expect(screen.getByText(/\$MXRF11/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$PETR4/i)).not.toBeInTheDocument();
  });

  it('filters by "Só FIIs" scope pill', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const fiiFilterBtn = screen.getByRole('button', { name: /Fundos Imobiliários \(FIIs\)/i });
    fireEvent.click(fiiFilterBtn);

    // FIIs should be visible
    expect(screen.getAllByText(/\$MXRF11/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$HGLG11/i).length).toBeGreaterThan(0);
    // Stock should not be visible
    expect(screen.queryByText(/\$PETR4/i)).not.toBeInTheDocument();
  });

  it('filters by "Só Minha Carteira" scope pill', () => {
    render(
      <MarketProvider>
        <DividendsCalendarPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const listBtn = screen.getByRole('button', { name: /Lista \/ Agenda/i });
    fireEvent.click(listBtn);

    const portfolioFilterBtn = screen.getByRole('button', { name: /Só Minha Carteira/i });
    fireEvent.click(portfolioFilterBtn);

    // Owned items in portfolio
    expect(screen.getAllByText(/Em Carteira/i).length).toBeGreaterThan(0);
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
