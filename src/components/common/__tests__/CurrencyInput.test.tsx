import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CurrencyInput } from '../CurrencyInput';

describe('Componente de Entrada Monetária (CurrencyInput)', () => {
  it('renderiza o valor inicial formatado com separador brasileiro e prefixo de moeda', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} prefix="R$" />);

    expect(screen.getByText('R$')).toBeInTheDocument();
    const input = screen.getByDisplayValue('10.000');
    expect(input).toBeInTheDocument();
  });

  it('permite limpar e digitar novos números livremente sem travar a digitação', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} prefix="R$" min={500} />);

    const input = screen.getByDisplayValue('10.000');
    fireEvent.focus(input);

    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');

    fireEvent.change(input, { target: { value: '25000' } });
    expect(input).toHaveValue('25.000');
    expect(handleChange).toHaveBeenCalledWith(25000);
  });

  it('incrementa e decrementa o valor usando os botões customizados de + e -', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} step={1000} />);

    const plusBtn = screen.getByTitle(/Aumentar/i);
    fireEvent.click(plusBtn);

    expect(handleChange).toHaveBeenCalledWith(11000);

    const minusBtn = screen.getByTitle(/Diminuir/i);
    fireEvent.click(minusBtn);
    expect(handleChange).toHaveBeenCalledWith(10000);
  });

  it('seleciona valores predefinidos ao clicar nos chips de atalho', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={1000} onChange={handleChange} quickPresets={[100, 500, 1000, 2500, 5000, 10000]} />);

    expect(screen.getByRole('button', { name: '100' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '500' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1k' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2.5k' })).toBeInTheDocument();

    const chip100 = screen.getByRole('button', { name: '100' });
    fireEvent.click(chip100);

    expect(handleChange).toHaveBeenCalledWith(100);
  });

  it('restaura o valor mínimo no evento blur se o campo for deixado vazio', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput value={10000} onChange={handleChange} min={500} />);

    const input = screen.getByDisplayValue('10.000');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input).toHaveValue('10.000');
  });
});
