import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Componente Modal Reutilizável (Modal)', () => {
  it('não deve renderizar quando isOpen for falso', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={false} onClose={handleClose} title="Teste de Modal">
        <div>Conteúdo Secreto</div>
      </Modal>
    );

    expect(screen.queryByText('Teste de Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Secreto')).not.toBeInTheDocument();
  });

  it('deve renderizar o título, subtítulo e o conteúdo quando aberto', () => {
    const handleClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Título do Diálogo"
        subtitle="Subtítulo descritivo de teste"
        footer={<button>Confirmar Ação</button>}
      >
        <p>Corpo da Janela Modal</p>
      </Modal>
    );

    expect(screen.getByText('Título do Diálogo')).toBeInTheDocument();
    expect(screen.getByText('Subtítulo descritivo de teste')).toBeInTheDocument();
    expect(screen.getByText('Corpo da Janela Modal')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Ação')).toBeInTheDocument();
  });

  it('deve disparar onClose ao clicar no botão de fechar (X)', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modal com Botão Fechar">
        <div>Conteúdo</div>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('deve disparar onClose ao clicar no backdrop escuro', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modal com Backdrop">
        <div>Conteúdo Interno</div>
      </Modal>
    );

    const dialogBackdrop = screen.getByRole('dialog');
    fireEvent.click(dialogBackdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('não deve disparar onClose ao clicar dentro do corpo da janela', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modal de Proteção">
        <div data-testid="conteudo-interno">Conteúdo Protegido</div>
      </Modal>
    );

    const innerContent = screen.getByTestId('conteudo-interno');
    fireEvent.click(innerContent);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('deve disparar onClose ao pressionar a tecla Escape', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modal com Tecla ESC">
        <div>Pressione ESC para sair</div>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
