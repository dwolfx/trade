import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketHeatmap } from '../MarketHeatmap';
import { MarketProvider } from '../../../context/MarketContext';

describe('Mapa de Calor de Mercado (MarketHeatmap)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MarketProvider>
        <MarketHeatmap {...props} />
      </MarketProvider>
    );
  };

  it('renderiza o cabeçalho do mapa de calor, controles e os tickers da B3', () => {
    renderComponent();

    expect(screen.getByText('Mapa de Calor de Mercado (Heatmap)')).toBeInTheDocument();
    expect(screen.getByText('Bolsa B3 (Ações)')).toBeInTheDocument();
    expect(screen.getByText('Cripto 24/7')).toBeInTheDocument();

    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('5D')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('1A')).toBeInTheDocument();

    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('VALE3')).toBeInTheDocument();
    expect(screen.getByText('ITUB4')).toBeInTheDocument();
  });

  it('alterna para o modo Cripto 24/7 e exibe os tokens de criptomoedas', () => {
    renderComponent();

    const cryptoBtn = screen.getByText('Cripto 24/7');
    fireEvent.click(cryptoBtn);

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('SOL')).toBeInTheDocument();
  });

  it('altera o período temporal ao clicar nos botões 1M e 1A', () => {
    renderComponent();

    const monthBtn = screen.getByText('1M');
    fireEvent.click(monthBtn);
    expect(monthBtn).toHaveClass('text-[#38BDF8]');

    const yearBtn = screen.getByText('1A');
    fireEvent.click(yearBtn);
    expect(yearBtn).toHaveClass('text-[#38BDF8]');
  });

  it('filtra por setor econômico ao escolher uma opção no seletor', () => {
    renderComponent();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Petróleo & Gás' } });

    expect(screen.getByText('PETR4')).toBeInTheDocument();
  });

  it('chama onSelectAsset com o ticker ao clicar em um bloco do mapa', () => {
    const handleSelect = vi.fn();
    renderComponent({ onSelectAsset: handleSelect });

    const petrTile = screen.getByText('PETR4').closest('div');
    if (petrTile) {
      fireEvent.click(petrTile);
      expect(handleSelect).toHaveBeenCalledWith('PETR4');
    }
  });
});
