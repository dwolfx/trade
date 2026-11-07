import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { FeaturedCards } from '../../FeaturedCards';
import { MarketProvider } from '../../../context/MarketContext';

describe('Componente Cards em Destaque (FeaturedCards)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deve renderizar as 4 abas na ordem exata requerida', () => {
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

  it('deve exibir estado vazio ao selecionar Últimas pesquisadas sem histórico', () => {
    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    const recentTab = screen.getByRole('button', { name: /Últimas pesquisadas/i });
    fireEvent.click(recentTab);

    expect(screen.getByText('Nenhuma pesquisa recente')).toBeInTheDocument();
  });

  it('deve exibir ativos da carteira quando a aba Minha Carteira estiver ativa', () => {
    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    expect(screen.getByText('PETR4')).toBeInTheDocument();
  });

  it('deve alternar estrela de favoritos ao clicar no botão', () => {
    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    const favButtons = screen.getAllByTitle(/Adicionar aos favoritos|Remover dos favoritos/i);
    expect(favButtons.length).toBeGreaterThan(0);

    // Clica no primeiro botão de favorito
    fireEvent.click(favButtons[0]);

    // Alterna para aba Favoritos
    const favTab = screen.getByText('Favoritos').closest('button')!;
    fireEvent.click(favTab);

    // Valida que ao menos um card favoritado é exibido
    expect(screen.queryByText('Nenhum favorito selecionado')).not.toBeInTheDocument();
  });

  it('deve suportar navegação por carrossel e buffer quando o usuário possuir mais de 4 favoritos', async () => {
    const sixFavorites = ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'AUVP11', 'WEGE3'];
    window.localStorage.setItem('tradecraft_favorite_symbols', JSON.stringify(sixFavorites));
    window.localStorage.setItem('tradecraft_featured_tab', JSON.stringify('favorites'));

    render(
      <MarketProvider>
        <FeaturedCards />
      </MarketProvider>
    );

    // Indicador de posição deve exibir 1-4 de 6
    const indicator = screen.getByTestId('carousel-indicator');
    expect(indicator).toHaveTextContent('1-4 de 6');

    // Cards 1 a 4 devem estar visíveis
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('VALE3')).toBeInTheDocument();
    expect(screen.getByText('ITUB4')).toBeInTheDocument();
    expect(screen.getByText('BBAS3')).toBeInTheDocument();
    expect(screen.queryByText('AUVP11')).not.toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Próximo card/i });
    const prevBtn = screen.getByRole('button', { name: /Card anterior/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Avança para 2-5 de 6
    fireEvent.click(nextBtn);

    expect(indicator).toHaveTextContent('2-5 de 6');
    expect(screen.getAllByText('AUVP11').length).toBeGreaterThan(0);
    expect(screen.queryByText('PETR4')).not.toBeInTheDocument();
    expect(prevBtn).toBeEnabled();

    // Avança para 3-6 de 6
    fireEvent.click(nextBtn);
    expect(indicator).toHaveTextContent('3-6 de 6');
    expect(screen.getAllByText('WEGE3').length).toBeGreaterThan(0);
    expect(nextBtn).toBeDisabled();

    // Retorna para 2-5 de 6
    fireEvent.click(prevBtn);
    expect(indicator).toHaveTextContent('2-5 de 6');
    expect(screen.getAllByText('AUVP11').length).toBeGreaterThan(0);
  });
});
