import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoPage } from '../CryptoPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('Página de Criptoativos 24/7 (CryptoPage)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deve renderizar o cabeçalho da página de cripto com status 24/7 e seletor de moeda', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    expect(screen.getByText('Criptoativos 24/7')).toBeInTheDocument();
    expect(screen.getByText('AO VIVO 24/7')).toBeInTheDocument();
    expect(screen.getByText('🇧🇷 BRL (R$)')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸 USDT ($)')).toBeInTheDocument();
  });

  it('deve renderizar os cards em destaque das principais criptos (BTC, ETH, SOL)', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('BTC').length).toBeGreaterThan(0);
      expect(screen.getAllByText('ETH').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SOL').length).toBeGreaterThan(0);
    }, { timeout: 4000 });
  });

  it('deve alternar a moeda de exibição entre BRL (R$) e USDT ($)', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    const usdtBtn = screen.getByText('🇺🇸 USDT ($)');
    fireEvent.click(usdtBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/\/USDT/i).length).toBeGreaterThan(0);
    });
  });

  it('deve renderizar a boleta de cripto com abas COMPRAR/VENDER e chips percentuais', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    expect(screen.getByText('COMPRAR')).toBeInTheDocument();
    expect(screen.getByText('VENDER')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('deve filtrar a tabela de ativos ao digitar no campo de busca', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    const searchInput = screen.getByPlaceholderText('Buscar criptoativo...');
    fireEvent.change(searchInput, { target: { value: 'Solana' } });

    await waitFor(() => {
      expect(screen.getAllByText('SOL').length).toBeGreaterThan(0);
    });
  });

  it('deve alternar modo multi-gráfico 2x2 e renderizar 4 quadrantes simultâneos', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    const multiBtn = screen.getByRole('button', { name: /Multi-Gráfico \(2×2\)/i });
    expect(multiBtn).toBeInTheDocument();

    fireEvent.click(multiBtn);

    expect(screen.getByText(/1 Gráfico/i)).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
  });
});
