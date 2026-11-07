import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsModal } from '../SettingsModal';

describe('Modal de Configurações e Navegação por Abas (SettingsModal)', () => {
  it('renderiza todas as abas e alterna entre elas corretamente', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} initialTab="perfil" />);

    // Aba de Perfil por padrão
    expect(screen.getByText('Central de Configurações & Administração')).toBeInTheDocument();
    expect(screen.getByText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByText('TradeCraft Vitalício')).toBeInTheDocument();

    // Alterna para aba "Conectar Contas"
    const conexoesBtns = screen.getAllByRole('button', { name: /Conectar Contas/i });
    fireEvent.click(conexoesBtns[0]);
    expect(screen.getByText('Central de Conexões Financeiras')).toBeInTheDocument();
    expect(screen.getByText('Área do Investidor B3')).toBeInTheDocument();

    // Alterna para aba "Segurança & Acesso"
    const segurancaBtns = screen.getAllByRole('button', { name: /Segurança & Acesso/i });
    fireEvent.click(segurancaBtns[0]);
    expect(screen.getByText('Autenticação em Dois Fatores (2FA)')).toBeInTheDocument();
    expect(screen.getByText('Trocar Senha de Acesso')).toBeInTheDocument();

    // Alterna para aba "Terminal & Maya IA"
    const terminalBtns = screen.getAllByRole('button', { name: /Terminal & Maya IA/i });
    fireEvent.click(terminalBtns[0]);
    expect(screen.getByText('Maya IA Co-Piloto')).toBeInTheDocument();
    expect(screen.getByText('Alertas de Rompimento & Volume Alto (Breakouts)')).toBeInTheDocument();
  }, 10000);

  it('chama a função onClose quando o botão fechar for clicado', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} initialTab="perfil" />);

    const closeBtn = screen.getByLabelText('Fechar configurações');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
