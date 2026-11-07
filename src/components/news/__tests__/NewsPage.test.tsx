import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NewsPage } from '../NewsPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('Terminal de Notícias e Radar Institucional (NewsPage)', () => {
  it('renderiza o cabeçalho da página e o radar de notícias da carteira e favoritos', () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/Terminal de Notícias/i)).toBeInTheDocument();
    expect(screen.getByText(/Radar da Minha Carteira & Favoritos/i)).toBeInTheDocument();
    expect(screen.getByText(/Alta Prioridade/i)).toBeInTheDocument();
  });

  it('filtra as notícias por termo pesquisado no campo de busca', () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por notícia, empresa ou ticker/i);
    fireEvent.change(searchInput, { target: { value: 'WEGE3' } });

    const matchingHeadlines = screen.getAllByText(/VoltTech|WEG/i);
    expect(matchingHeadlines.length).toBeGreaterThanOrEqual(1);
  });

  it('filtra notícias ao clicar na pílula de categoria correspondente', () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const criptoBtn = screen.getByRole('button', { name: /Cripto 24\/7/i });
    fireEvent.click(criptoBtn);

    expect(screen.getByText(/Bitcoin supera/i)).toBeInTheDocument();
  });

  it('abre o modal de leitura e resumo executivo ao clicar em um card de notícia', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const readButtons = screen.getAllByRole('button', { name: /Ler resumo/i });
    expect(readButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(readButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Resumo Executivo para Decisão/i)).toBeInTheDocument();
    });
  });

  it('abre a gaveta de ordens ao clicar no botão Operar em um ativo da notícia', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const operateButtons = screen.getAllByRole('button', { name: /Operar PETR4/i });
    expect(operateButtons.length).toBeGreaterThan(0);
    fireEvent.click(operateButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
      expect(screen.getAllByText(/PETR4/i).length).toBeGreaterThan(0);
    });
  });

  it('renderiza botões de tickers interativos no título que abrem a boleta rápida', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const tickerButtons = screen.getAllByRole('button', { name: /⚡PETR4/i });
    expect(tickerButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(tickerButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Boleta Rápida B3/i)).toBeInTheDocument();
    });
  });

  it('carrega mais notícias ao clicar no botão Carregar mais notícias', async () => {
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

  it('renderiza o ticker animado de notícias urgentes (PLANTÃO B3)', async () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/PLANTÃO B3/i)).toBeInTheDocument();
  });

  it('filtra as notícias pelos botões de período (Ao Vivo, Hoje, Essa Semana, 15 Dias, Esse Mês)', () => {
    render(
      <MarketProvider>
        <NewsPage onNavigate={() => {}} />
      </MarketProvider>
    );

    const aoVivoBtn = screen.getByRole('button', { name: /Ao Vivo/i });
    expect(aoVivoBtn).toBeInTheDocument();
    fireEvent.click(aoVivoBtn);

    expect(screen.getByText(/Exibindo/i)).toBeInTheDocument();

    const hojeBtn = screen.getByRole('button', { name: /^Hoje$/i });
    fireEvent.click(hojeBtn);
    expect(screen.getByText(/Exibindo/i)).toBeInTheDocument();
  });
});
