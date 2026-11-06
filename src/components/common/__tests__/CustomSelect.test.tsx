import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomSelect } from '../CustomSelect';

describe('CustomSelect Component', () => {
  const options = [
    { value: '1m', label: '1 Minuto', badge: 'Ultra-Scalp', description: 'Reações instantâneas' },
    { value: '5m', label: '5 Minutos', badge: 'Scalp Rápido', description: 'Ponto de equilíbrio' },
    { value: '15m', label: '15 Minutos', badge: 'Daytrade Padrão', description: 'Institucional clássico' },
  ];

  it('renders with selected option label and badge', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="5m" onChange={handleChange} options={options} />);

    expect(screen.getByText('5 Minutos')).toBeInTheDocument();
    expect(screen.getByText('Scalp Rápido')).toBeInTheDocument();
  });

  it('opens floating dropdown menu on click and lists all options with descriptions', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="5m" onChange={handleChange} options={options} />);

    // Click trigger button
    const trigger = screen.getByRole('button', { name: /5 Minutos/i });
    fireEvent.click(trigger);

    // All options should now be visible
    expect(screen.getByText('1 Minuto')).toBeInTheDocument();
    expect(screen.getByText('Ultra-Scalp')).toBeInTheDocument();
    expect(screen.getByText('Reações instantâneas')).toBeInTheDocument();

    expect(screen.getByText('15 Minutos')).toBeInTheDocument();
    expect(screen.getByText('Institucional clássico')).toBeInTheDocument();
  });

  it('calls onChange and closes dropdown when an option is clicked', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="5m" onChange={handleChange} options={options} />);

    const trigger = screen.getByRole('button', { name: /5 Minutos/i });
    fireEvent.click(trigger);

    const option1m = screen.getByText('1 Minuto');
    fireEvent.click(option1m);

    expect(handleChange).toHaveBeenCalledWith('1m');
    // Dropdown closes
    expect(screen.queryByText('Reações instantâneas')).not.toBeInTheDocument();
  });
});
