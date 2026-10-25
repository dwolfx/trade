import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoPage } from '../CryptoPage';
import { MarketProvider } from '../../../context/MarketContext';

describe('CryptoPage Functional Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should render crypto page header with 24/7 status and currency toggle', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    expect(screen.getByText('Criptoativos 24/7')).toBeInTheDocument();
    expect(screen.getByText('24/7 ONLINE')).toBeInTheDocument();
    expect(screen.getByText('🇧🇷 BRL (R$)')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸 USDT ($)')).toBeInTheDocument();
  });

  it('should render featured crypto cards including BTC, ETH, SOL, USDT', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    // Wait for featured cards to render
    await waitFor(() => {
      expect(screen.getAllByText('BTC').length).toBeGreaterThan(0);
      expect(screen.getAllByText('ETH').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SOL').length).toBeGreaterThan(0);
    }, { timeout: 4000 });
  });

  it('should toggle currency between BRL and USDT', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    const usdtBtn = screen.getByText('🇺🇸 USDT ($)');
    fireEvent.click(usdtBtn);

    // After clicking USDT, active currency indicators reflect USDT
    await waitFor(() => {
      expect(screen.getAllByText('/USDT').length).toBeGreaterThan(0);
    });
  });

  it('should render crypto order pad with COMPRAR/VENDER modes and percentage chips', async () => {
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

  it('should filter crypto assets table when typing in search input', async () => {
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

  it('should toggle multi-chart 2x2 mode and render 4 quadrants', async () => {
    render(
      <MarketProvider>
        <CryptoPage />
      </MarketProvider>
    );

    const multiBtn = screen.getByRole('button', { name: /Multi-Gráfico \(2×2\)/i });
    expect(multiBtn).toBeInTheDocument();

    fireEvent.click(multiBtn);

    // After clicking, button says '1 Gráfico' and 4 slots are visible
    expect(screen.getByText('1 Gráfico')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
  });
});
