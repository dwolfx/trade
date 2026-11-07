import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SegmentedControl } from '../SegmentedControl';

describe('Componente de Controle Segmentado (SegmentedControl)', () => {
  const options = [
    { value: 'ALL', label: 'Todas', count: 15 },
    { value: 'WINS', label: 'Ganhadoras', count: 10 },
    { value: 'LOSSES', label: 'Perdedoras', count: 5 },
  ];

  it('deve renderizar todas as opções com rótulos e contadores numéricos', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="ALL"
        onChange={handleChange}
        ariaLabel="Filtro de operações"
      />
    );

    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Ganhadoras')).toBeInTheDocument();
    expect(screen.getByText('Perdedoras')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('deve destacar visualmente a opção selecionada com a classe ativa', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="WINS"
        onChange={handleChange}
      />
    );

    const winTab = screen.getByRole('tab', { name: /ganhadoras/i });
    expect(winTab).toHaveAttribute('aria-selected', 'true');
    expect(winTab.className).toContain('tc-tab-btn-active');

    const lossTab = screen.getByRole('tab', { name: /perdedoras/i });
    expect(lossTab).toHaveAttribute('aria-selected', 'false');
    expect(lossTab.className).not.toContain('tc-tab-btn-active');
  });

  it('deve disparar onChange com o valor correspondente ao clicar em uma aba', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="ALL"
        onChange={handleChange}
      />
    );

    const lossTab = screen.getByRole('tab', { name: /perdedoras/i });
    fireEvent.click(lossTab);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('LOSSES');
  });
});
