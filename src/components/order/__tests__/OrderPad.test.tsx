import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { OrderPad } from '../../OrderPad';
import { MarketProvider } from '../../../context/MarketContext';

describe('OrderPad Integration Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should render active asset and order form controls', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    expect(screen.getByText(/Boleta de Ordem/i)).toBeInTheDocument();
    expect(screen.getByText('COMPRAR')).toBeInTheDocument();
    expect(screen.getByText('VENDER')).toBeInTheDocument();
    expect(screen.getByText('A Mercado')).toBeInTheDocument();
    expect(screen.getByText('+100')).toBeInTheDocument();
    expect(screen.getByText('Máx')).toBeInTheDocument();
  });

  it('should add lot quantity when quick lot chips are clicked', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    const input = screen.getByDisplayValue('100');
    expect(input).toBeInTheDocument();

    const add100Btn = screen.getByText('+100');
    fireEvent.click(add100Btn);

    expect(screen.getByDisplayValue('200')).toBeInTheDocument();
  });

  it('should switch between COMPRAR and VENDER modes', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    const sellTab = screen.getByRole('button', { name: 'VENDER' });
    fireEvent.click(sellTab);

    // Confirmation button text changes to VENDER
    expect(screen.getByRole('button', { name: /VENDER 100/i })).toBeInTheDocument();

    const buyTab = screen.getByRole('button', { name: 'COMPRAR' });
    fireEvent.click(buyTab);
    expect(screen.getByRole('button', { name: /COMPRAR 100/i })).toBeInTheDocument();
  });

  it('should execute BUY order successfully and show confirmation', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    const buyBtn = screen.getByRole('button', { name: /COMPRAR 100/i });
    fireEvent.click(buyBtn);

    // Toast or feedback message appears
    expect(screen.getByText(/Ordem executada com sucesso/i)).toBeInTheDocument();
  });

  it('should calculate max affordable quantity when Máx is clicked', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    const maxBtn = screen.getByRole('button', { name: 'Máx' });
    fireEvent.click(maxBtn);

    // Should have calculated hundreds of shares with R$ 50.000 balance
    const input = screen.getByRole('spinbutton');
    const val = parseInt((input as HTMLInputElement).value);
    expect(val).toBeGreaterThan(100);
  });
});
