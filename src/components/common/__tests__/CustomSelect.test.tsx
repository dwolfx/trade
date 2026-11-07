import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomSelect } from '../CustomSelect';

describe('Componente de Seleção Customizada (CustomSelect)', () => {
  const options = [
    { value: '1m', label: '1 Minuto', badge: 'Ultra-Scalp', description: 'Reações instantâneas' },
    { value: '5m', label: '5 Minutos', badge: 'Scalp Rápido', description: 'Ponto de equilíbrio' },
    { value: '15m', label: '15 Minutos', badge: 'Daytrade Padrão', description: 'Institucional clássico' },
  ];

  it('renderiza o rótulo da opção selecionada e seu respectivo badge', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="5m" onChange={handleChange} options={options} />);

    expect(screen.getByText('5 Minutos')).toBeInTheDocument();
    expect(screen.getByText('Scalp Rápido')).toBeInTheDocument();
  });

  it('abre menu suspenso flutuante ao clicar e lista todas as opções com descrições', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="5m" onChange={handleChange} options={options} />);

    const trigger = screen.getByRole('button', { name: /5 Minutos/i });
    fireEvent.click(trigger);

    expect(screen.getByText('1 Minuto')).toBeInTheDocument();
    expect(screen.getByText('Ultra-Scalp')).toBeInTheDocument();
    expect(screen.getByText('Reações instantâneas')).toBeInTheDocument();

    expect(screen.getByText('15 Minutos')).toBeInTheDocument();
    expect(screen.getByText('Institucional clássico')).toBeInTheDocument();
  });

  it('chama onChange com o novo valor e fecha o menu ao selecionar uma opção', () => {
    const handleChange = vi.fn();
    render(<CustomSelect value="5m" onChange={handleChange} options={options} />);

    const trigger = screen.getByRole('button', { name: /5 Minutos/i });
    fireEvent.click(trigger);

    const option1m = screen.getByText('1 Minuto');
    fireEvent.click(option1m);

    expect(handleChange).toHaveBeenCalledWith('1m');
    expect(screen.queryByText('Reações instantâneas')).not.toBeInTheDocument();
  });
});
