import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NewsPage } from '../NewsPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('NewsPage Functional & Integration Tests', () => {
  it('renders page header and radar for portfolio/favorites', () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/Terminal de Notícias/i)).toBeInTheDocument();
    expect(screen.getByText(/Radar da Minha Carteira & Favoritos/i)).toBeInTheDocument();
    expect(screen.getByText(/Alta Prioridade/i)).toBeInTheDocument();
  });

  it('filters news by search query', () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por notícia, empresa ou ticker/i);
    fireEvent.change(searchInput, { target: { value: 'WEGE3' } });

    // WEG news should be displayed
    const matchingHeadlines = screen.getAllByText(/VoltTech|WEG/i);
    expect(matchingHeadlines.length).toBeGreaterThanOrEqual(1);
  });

  it('filters news by category pill click', () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const criptoBtn = screen.getByRole('button', { name: /Cripto 24\/7/i });
    fireEvent.click(criptoBtn);

    expect(screen.getByText(/Bitcoin supera/i)).toBeInTheDocument();
  });

  it('opens news reader modal when clicking on a card', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const readButtons = screen.getAllByRole('button', { name: /Ler resumo/i });
    expect(readButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(readButtons[0]);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText(/Resumo Executivo para Decisão/i)).toBeInTheDocument();
    });
  });

  it('opens order drawer when clicking Operar on an asset in news', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const operateButtons = screen.getAllByRole('button', { name: /Operar PETR4/i });
    expect(operateButtons.length).toBeGreaterThan(0);
    fireEvent.click(operateButtons[0]);

    // Slide-over boleta drawer should open right on the news page!
    await waitFor(() => {
      expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
      expect(screen.getAllByText(/PETR4/i).length).toBeGreaterThan(0);
    });
  });

  it('renders interactive clickable ticker buttons inside headlines that open boleta drawer', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    // Any button containing ⚡PETR4 inside text
    const tickerButtons = screen.getAllByRole('button', { name: /⚡PETR4/i });
    expect(tickerButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(tickerButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
    });
  });

  it('loads more news when clicking Carregar mais notícias button', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const loadMoreButton = screen.getByRole('button', { name: /Carregar mais notícias/i });
    expect(loadMoreButton).toBeInTheDocument();
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText(/Exibindo/i)).toBeInTheDocument();
    });
  });
  it('renders the breaking news ticker (PLANTÃO B3)', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/PLANTÃO B3/i)).toBeInTheDocument();
  });
});