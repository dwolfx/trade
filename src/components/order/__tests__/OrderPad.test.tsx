import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { OrderPad } from '../../OrderPad';
import { MarketProvider } from '../../../context/MarketContext';

describe('Boleta de Ordens e Negociação (OrderPad)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deve renderizar o ativo ativo e os controles do formulário da boleta', () => {
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

  it('deve somar a quantidade do lote ao clicar nos chips de atalho', () => {
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

  it('deve alternar entre os modos COMPRAR e VENDER', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    const sellTab = screen.getByRole('button', { name: 'VENDER' });
    fireEvent.click(sellTab);

    expect(screen.getByRole('button', { name: /VENDER 100/i })).toBeInTheDocument();

    const buyTab = screen.getByRole('button', { name: 'COMPRAR' });
    fireEvent.click(buyTab);
    expect(screen.getByRole('button', { name: /COMPRAR 100/i })).toBeInTheDocument();
  });

  it('deve executar ordem de COMPRA com sucesso e exibir mensagem de confirmação', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    const buyBtn = screen.getByRole('button', { name: /COMPRAR 100/i });
    fireEvent.click(buyBtn);

    expect(screen.getByText(/Ordem executada com sucesso/i)).toBeInTheDocument();
  });

  it('deve calcular a quantidade máxima comprável com base no saldo ao clicar em Máx', () => {
    render(
      <MarketProvider>
        <OrderPad />
      </MarketProvider>
    );

    const maxBtn = screen.getByRole('button', { name: 'Máx' });
    fireEvent.click(maxBtn);

    const input = screen.getByRole('spinbutton');
    const val = parseInt((input as HTMLInputElement).value);
    expect(val).toBeGreaterThan(100);
  });
});
