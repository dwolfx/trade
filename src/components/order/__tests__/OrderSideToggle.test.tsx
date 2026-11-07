import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderSideToggle } from '../OrderSideToggle';

describe('Alternador de Ponta de Ordem (OrderSideToggle)', () => {
  it('deve renderizar ambos os botões COMPRAR e VENDER', () => {
    render(<OrderSideToggle side="buy" onChange={() => {}} />);
    expect(screen.getByText('COMPRAR')).toBeInTheDocument();
    expect(screen.getByText('VENDER')).toBeInTheDocument();
  });

  it('deve chamar onChange com "sell" ao clicar no botão VENDER', () => {
    const handleChange = vi.fn();
    render(<OrderSideToggle side="buy" onChange={handleChange} />);
    fireEvent.click(screen.getByText('VENDER'));
    expect(handleChange).toHaveBeenCalledWith('sell');
  });

  it('deve chamar onChange com "buy" ao clicar no botão COMPRAR', () => {
    const handleChange = vi.fn();
    render(<OrderSideToggle side="sell" onChange={handleChange} />);
    fireEvent.click(screen.getByText('COMPRAR'));
    expect(handleChange).toHaveBeenCalledWith('buy');
  });
});
