import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuantityStepper } from '../QuantityStepper';

describe('Controle de Incremento de Quantidade (QuantityStepper)', () => {
  it('deve renderizar a quantidade inicial no campo', () => {
    render(<QuantityStepper quantity={100} onChange={() => {}} />);
    const input = screen.getByDisplayValue('100');
    expect(input).toBeInTheDocument();
  });

  it('deve chamar onChange com valor incrementado ao clicar no botão +', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={100} step={100} onChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    const plusButton = buttons[1];
    fireEvent.click(plusButton);
    expect(handleChange).toHaveBeenCalledWith(200);
  });

  it('deve chamar onChange com valor decrementado ao clicar no botão -', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={300} step={100} onChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    const minusButton = buttons[0];
    fireEvent.click(minusButton);
    expect(handleChange).toHaveBeenCalledWith(200);
  });

  it('não deve permitir reduzir a quantidade para menos de 1', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={50} step={100} onChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    const minusButton = buttons[0];
    fireEvent.click(minusButton);
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
