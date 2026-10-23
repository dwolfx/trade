import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuantityStepper } from '../QuantityStepper';

describe('QuantityStepper', () => {
  it('should render initial quantity', () => {
    render(<QuantityStepper quantity={100} onChange={() => {}} />);
    const input = screen.getByDisplayValue('100');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange with increased value when + is clicked', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={100} step={100} onChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    const plusButton = buttons[1];
    fireEvent.click(plusButton);
    expect(handleChange).toHaveBeenCalledWith(200);
  });

  it('should call onChange with decreased value when - is clicked', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={300} step={100} onChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    const minusButton = buttons[0];
    fireEvent.click(minusButton);
    expect(handleChange).toHaveBeenCalledWith(200);
  });

  it('should not allow decreasing below 1', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper quantity={50} step={100} onChange={handleChange} />);
    const buttons = screen.getAllByRole('button');
    const minusButton = buttons[0];
    fireEvent.click(minusButton);
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
