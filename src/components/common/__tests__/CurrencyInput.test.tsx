import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CurrencyInput } from '../CurrencyInput';

describe('CurrencyInput Component', () => {
  it('renders initial formatted value with Brazilian separator and currency prefix', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} prefix="R$" />);

    expect(screen.getByText('R$')).toBeInTheDocument();
    const input = screen.getByDisplayValue('10.000');
    expect(input).toBeInTheDocument();
  });

  it('allows user to clear and type new digits freely without snapping back', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} prefix="R$" min={500} />);

    const input = screen.getByDisplayValue('10.000');
    fireEvent.focus(input);

    // Clear input
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');

    // Type 25000
    fireEvent.change(input, { target: { value: '25000' } });
    expect(input).toHaveValue('25.000');
    expect(handleChange).toHaveBeenCalledWith(25000);
  });

  it('steps value using custom + and - buttons', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} step={1000} />);

    const plusBtn = screen.getByTitle(/Aumentar/i);
    fireEvent.click(plusBtn);

    expect(handleChange).toHaveBeenCalledWith(11000);

    const minusBtn = screen.getByTitle(/Diminuir/i);
    fireEvent.click(minusBtn);
    expect(handleChange).toHaveBeenCalledWith(10000);
  });

  it('selects quick preset chips on click', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} quickPresets={[5000, 10000, 50000]} />);

    const chip50k = screen.getByRole('button', { name: '50k' });
    fireEvent.click(chip50k);

    expect(handleChange).toHaveBeenCalledWith(50000);
  });

  it('clamps to min on blur if left empty', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} min={500} />);

    const input = screen.getByDisplayValue('10.000');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input).toHaveValue('10.000');
  });
});
