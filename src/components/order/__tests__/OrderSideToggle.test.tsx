import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderSideToggle } from '../OrderSideToggle';

describe('OrderSideToggle', () => {
  it('should render both COMPRAR and VENDER buttons', () => {
    render(<OrderSideToggle side="buy" onChange={() => {}} />);
    expect(screen.getByText('COMPRAR')).toBeInTheDocument();
    expect(screen.getByText('VENDER')).toBeInTheDocument();
  });

  it('should call onChange with "sell" when VENDER is clicked', () => {
    const handleChange = vi.fn();
    render(<OrderSideToggle side="buy" onChange={handleChange} />);
    fireEvent.click(screen.getByText('VENDER'));
    expect(handleChange).toHaveBeenCalledWith('sell');
  });

  it('should call onChange with "buy" when COMPRAR is clicked', () => {
    const handleChange = vi.fn();
    render(<OrderSideToggle side="sell" onChange={handleChange} />);
    fireEvent.click(screen.getByText('COMPRAR'));
    expect(handleChange).toHaveBeenCalledWith('buy');
  });
});
