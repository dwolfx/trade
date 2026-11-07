import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StrategyLabModal } from '../StrategyLabModal';

describe('Modal do Laboratório de Estratégias Quantitativas (StrategyLabModal)', () => {
  it('não deve renderizar quando isOpen for falso', () => {
    const handleClose = vi.fn();
    render(<StrategyLabModal isOpen={false} onClose={handleClose} />);

    expect(screen.queryByText('Laboratório Quant & Backtest de Estratégias')).not.toBeInTheDocument();
  });

  it('deve renderizar os controles do laboratório, ativos e curva de capital simulada', () => {
    const handleClose = vi.fn();
    render(<StrategyLabModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Laboratório Quant & Backtest de Estratégias')).toBeInTheDocument();
    expect(screen.getByText('Ativo para Simulação')).toBeInTheDocument();
    expect(screen.getByText('Curva de Capital Simulada (Equity Curve)')).toBeInTheDocument();
    expect(screen.getByText('Rodar Backtest Histórico')).toBeInTheDocument();
  });

  it('deve permitir trocar o ativo selecionado para teste', () => {
    const handleClose = vi.fn();
    render(<StrategyLabModal isOpen={true} onClose={handleClose} />);

    const petr4Btn = screen.getByRole('button', { name: /PETR4/i });
    fireEvent.click(petr4Btn);

    expect(petr4Btn.className).toContain('border-sky-500/40');
  });

  it('deve disparar onApplyStrategy ao clicar no botão de aplicar estratégia em novo robô', () => {
    const handleClose = vi.fn();
    const handleApply = vi.fn();
    render(
      <StrategyLabModal
        isOpen={true}
        onClose={handleClose}
        onApplyStrategy={handleApply}
      />
    );

    const applyBtn = screen.getByRole('button', {
      name: /Aplicar esta Estratégia em um Novo Robô/i,
    });
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
