import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Componente Badge Reutilizável (Badge)', () => {
  it('deve renderizar o texto do badge corretamente com a variante padrão', () => {
    render(<Badge>COMPRA EXECUTADA</Badge>);

    const badge = screen.getByTestId('tc-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('COMPRA EXECUTADA');
    expect(badge.className).toContain('tc-badge-brand');
  });

  it('deve aplicar as classes corretas para a variante de lucro (profit)', () => {
    render(<Badge variant="profit">+12.5% LUCRO</Badge>);

    const badge = screen.getByTestId('tc-badge');
    expect(badge.className).toContain('tc-badge-profit');
    expect(badge).toHaveTextContent('+12.5% LUCRO');
  });

  it('deve aplicar as classes corretas para a variante de prejuízo (loss)', () => {
    render(<Badge variant="loss">-4.2% STOP</Badge>);

    const badge = screen.getByTestId('tc-badge');
    expect(badge.className).toContain('tc-badge-loss');
    expect(badge).toHaveTextContent('-4.2% STOP');
  });

  it('deve renderizar o ponto indicador (dot) quando a propriedade dot for verdadeira', () => {
    const { container } = render(
      <Badge variant="profit" dot>
        ATIVO AO VIVO
      </Badge>
    );

    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('deve renderizar ícones personalizados passados como propriedade', () => {
    render(
      <Badge variant="warning" icon={<span data-testid="icone-alerta">⚠</span>}>
        ATENÇÃO
      </Badge>
    );

    expect(screen.getByTestId('icone-alerta')).toBeInTheDocument();
    expect(screen.getByText('ATENÇÃO')).toBeInTheDocument();
  });
});
