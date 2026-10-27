import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketHeatmap } from '../MarketHeatmap';
import { MarketProvider } from '../../../context/MarketContext';

describe('MarketHeatmap Component', () => {
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

  it('renders heatmap page header, controls, and B3 tickers', () => {
    renderComponent();

    // Check header and mode buttons
    expect(screen.getByText('Mapa de Calor de Mercado (Heatmap)')).toBeInTheDocument();
    expect(screen.getByText('Bolsa B3 (Ações)')).toBeInTheDocument();
    expect(screen.getByText('Cripto 24/7')).toBeInTheDocument();

    // Check period range buttons
    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('5D')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('1A')).toBeInTheDocument();

    // Check main B3 tickers are rendered
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('VALE3')).toBeInTheDocument();
    expect(screen.getByText('ITUB4')).toBeInTheDocument();
  });

  it('switches to Cripto mode and displays crypto tokens', () => {
    renderComponent();

    const cryptoBtn = screen.getByText('Cripto 24/7');
    fireEvent.click(cryptoBtn);

    // Tokens like BTC and ETH should appear
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('SOL')).toBeInTheDocument();
  });

  it('changes time range when clicking on 1M and 1A buttons', () => {
    renderComponent();

    const monthBtn = screen.getByText('1M');
    fireEvent.click(monthBtn);
    expect(monthBtn).toHaveClass('text-[#38BDF8]');

    const yearBtn = screen.getByText('1A');
    fireEvent.click(yearBtn);
    expect(yearBtn).toHaveClass('text-[#38BDF8]');
  });

  it('filters by sector when selecting a sector option', () => {
    renderComponent();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Petróleo & Gás' } });

    // PETR4 should be present
    expect(screen.getByText('PETR4')).toBeInTheDocument();
  });

  it('calls onSelectAsset when clicking a tile', () => {
    const handleSelect = vi.fn();
    renderComponent({ onSelectAsset: handleSelect });

    const petrTile = screen.getByText('PETR4').closest('div');
    if (petrTile) {
      fireEvent.click(petrTile);
      expect(handleSelect).toHaveBeenCalledWith('PETR4');
    }
  });
});
