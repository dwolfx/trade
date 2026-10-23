import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { FeaturedCards } from '../../FeaturedCards';
import { MarketProvider } from '../../../context/MarketContext';

describe('FeaturedCards Functional Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should render the 4 tabs in the exact required order', () => {
    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    const tabs = screen.getAllByRole('button');
    const tabTexts = tabs.map(t => t.textContent).filter(t => t && (t.includes('pesquisadas') || t.includes('carteira') || t.includes('Favoritos') || t.includes('negociadas')));

    expect(tabTexts[0]).toContain('Últimas pesquisadas');
    expect(tabTexts[1]).toContain('Mais negociadas');
    expect(tabTexts[2]).toContain('Favoritos');
    expect(tabTexts[3]).toContain('Minha carteira');
  });

  it('should display empty state when selecting Últimas pesquisadas without history', () => {
    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    const recentTab = screen.getByRole('button', { name: /Últimas pesquisadas/i });
    fireEvent.click(recentTab);

    expect(screen.getByText('Nenhuma pesquisa recente')).toBeInTheDocument();
  });

  it('should display portfolio assets when Minha Carteira tab is selected', () => {
    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    // Initial default tab is Minha carteira
    expect(screen.getByText('PETR4')).toBeInTheDocument();
  });

  it('should toggle favorite star when clicked', () => {
    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    const favButtons = screen.getAllByTitle(/Adicionar aos favoritos|Remover dos favoritos/i);
    expect(favButtons.length).toBeGreaterThan(0);

    // Click first favorite star
    fireEvent.click(favButtons[0]);

    // Switch to Favoritos tab
    const favTab = screen.getByText('Favoritos').closest('button')!;
    fireEvent.click(favTab);

    // Expect at least one favorited card to appear
    expect(screen.queryByText('Nenhum favorito selecionado')).not.toBeInTheDocument();
  });

  it('should support carousel navigation and lazy buffer when user has more than 4 favorites', async () => {
    // Seed 6 favorite symbols in localStorage
    const sixFavorites = ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'AUVP11', 'WEGE3'];
    window.localStorage.setItem('tradecraft_favorite_symbols', JSON.stringify(sixFavorites));
    window.localStorage.setItem('tradecraft_featured_tab', JSON.stringify('favorites'));

    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    // Position indicator should display 1-4 de 6
    const indicator = screen.getByTestId('carousel-indicator');
    expect(indicator).toHaveTextContent('1-4 de 6');

    // Cards 1-4 should be visible
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('VALE3')).toBeInTheDocument();
    expect(screen.getByText('ITUB4')).toBeInTheDocument();
    expect(screen.getByText('BBAS3')).toBeInTheDocument();
    // 5th card (AUVP11) is not visible yet in window 1-4
    expect(screen.queryByText('AUVP11')).not.toBeInTheDocument();

    // Next button
    const nextBtn = screen.getByRole('button', { name: /Próximo card/i });
    const prevBtn = screen.getByRole('button', { name: /Card anterior/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Click Next (moves window to 2-5 de 6)
    fireEvent.click(nextBtn);

    expect(indicator).toHaveTextContent('2-5 de 6');
    // Now AUVP11 is visible and PETR4 moved out of view
    expect(screen.getAllByText('AUVP11').length).toBeGreaterThan(0);
    expect(screen.queryByText('PETR4')).not.toBeInTheDocument();
    expect(prevBtn).toBeEnabled();

    // Click Next again (moves window to 3-6 de 6)
    fireEvent.click(nextBtn);
    expect(indicator).toHaveTextContent('3-6 de 6');
    expect(screen.getAllByText('WEGE3').length).toBeGreaterThan(0);
    // Reached the end, next button disabled
    expect(nextBtn).toBeDisabled();

    // Click Previous (moves back to 2-5 de 6)
    fireEvent.click(prevBtn);
    expect(indicator).toHaveTextContent('2-5 de 6');
    expect(screen.getAllByText('AUVP11').length).toBeGreaterThan(0);
  });
});
