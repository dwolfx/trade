import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsModal } from '../SettingsModal';

describe('SettingsModal Integration & Tab Navigation', () => {
  it('renders all tabs and switches between them', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} initialTab="perfil" />);

    // Perfil tab loaded by default
    expect(screen.getByText('Central de Configurações & Administração')).toBeInTheDocument();
    expect(screen.getByText('Dados Pessoais & Trader')).toBeInTheDocument();

    // Click on "Conectar Contas" tab
    const conexoesBtn = screen.getByRole('button', { name: /Conectar Contas/i });
    fireEvent.click(conexoesBtn);
    expect(screen.getByText('Conexões Criptografadas & Open Finance')).toBeInTheDocument();
    expect(screen.getByText('Open Finance B3 (Bolsa Oficial)')).toBeInTheDocument();

    // Click on "Segurança & Acesso" tab
    const segurancaBtn = screen.getByRole('button', { name: /Segurança & Acesso/i });
    fireEvent.click(segurancaBtn);
    expect(screen.getByText('Autenticação em Dois Fatores (2FA)')).toBeInTheDocument();
    expect(screen.getByText('Trocar Senha de Acesso')).toBeInTheDocument();

    // Click on "Terminal & Maya IA" tab
    const terminalBtn = screen.getByRole('button', { name: /Terminal & Maya IA/i });
    fireEvent.click(terminalBtn);
    expect(screen.getByText('Maya IA Co-Piloto')).toBeInTheDocument();
    expect(screen.getByText('Alertas de Rompimento & Volume Alto (Breakouts)')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} initialTab="perfil" />);

    const closeBtn = screen.getByLabelText('Fechar configurações');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
