import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsModal } from '../SettingsModal';

describe('SettingsModal Integration & Tab Navigation', () => {
  it('renders all tabs and switches between them', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} initialTab="perfil" />);

    // Perfil tab loaded by default
    expect(screen.getByText('Central de Configurações & Administração')).toBeInTheDocument();
    expect(screen.getByText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByText('TradeCraft Vitalício')).toBeInTheDocument();

    // Click on "Conectar Contas" tab
    const conexoesBtns = screen.getAllByRole('button', { name: /Conectar Contas/i });
    fireEvent.click(conexoesBtns[0]);
    expect(screen.getByText('Conexões Criptografadas & Open Finance')).toBeInTheDocument();
    expect(screen.getByText('Open Finance B3 (Bolsa Oficial)')).toBeInTheDocument();

    // Click on "Segurança & Acesso" tab
    const segurancaBtns = screen.getAllByRole('button', { name: /Segurança & Acesso/i });
    fireEvent.click(segurancaBtns[0]);
    expect(screen.getByText('Autenticação em Dois Fatores (2FA)')).toBeInTheDocument();
    expect(screen.getByText('Trocar Senha de Acesso')).toBeInTheDocument();

    // Click on "Terminal & Maya IA" tab
    const terminalBtns = screen.getAllByRole('button', { name: /Terminal & Maya IA/i });
    fireEvent.click(terminalBtns[0]);
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
