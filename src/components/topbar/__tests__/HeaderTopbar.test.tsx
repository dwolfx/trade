import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeaderTopbar } from '../../HeaderTopbar';
import { MarketProvider } from '../../../context/MarketContext';

describe('HeaderTopbar Functional Tests', () => {
  it('should render brand logo, avatar VH, and demo balance', () => {
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={() => {}} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText('TradeCraft')).toBeInTheDocument();
    expect(screen.getByText('VH')).toBeInTheDocument();
    expect(screen.getByText('DEMO')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('should toggle balance visibility when eye icon is clicked', () => {
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={() => {}} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    // Initial: balance is visible
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();

    // Click eye button
    const eyeButton = screen.getByTitle('Ocultar saldo');
    fireEvent.click(eyeButton);

    // Now balance should be hidden with dots
    expect(screen.getByText('••••••••••')).toBeInTheDocument();

    // Click again to reveal
    const showButton = screen.getByTitle('Mostrar saldo');
    fireEvent.click(showButton);
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it('should call onOpenPositions when clicking Minha Carteira in nav', () => {
    const handleOpenPositions = vi.fn();
    const handleNav = vi.fn();

    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={handleNav} onOpenPositions={handleOpenPositions} />
      </MarketProvider>
    );

    const carteiraButton = screen.getByRole('button', { name: /Minha Carteira/i });
    fireEvent.click(carteiraButton);

    expect(handleOpenPositions).toHaveBeenCalled();
    expect(handleNav).toHaveBeenCalledWith('carteira');
  });

  it('should switch mode between DEMO and LIVE', () => {
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={() => {}} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    const liveBtn = screen.getByRole('button', { name: /LIVE/i });
    fireEvent.click(liveBtn);

    // Mode switched to LIVE: displays "Saldo Disponível"
    expect(screen.getByText('Saldo Disponível')).toBeInTheDocument();

    const demoBtn = screen.getByRole('button', { name: /DEMO/i });
    fireEvent.click(demoBtn);
    expect(screen.getByText('Saldo Simulado')).toBeInTheDocument();
  });

  it('should toggle mobile menu drawer when clicking hamburger button and handle mobile navigation', () => {
    const handleNav = vi.fn();
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={handleNav} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    // Initial: mobile drawer is closed
    expect(screen.queryByText('Victor Hugo')).not.toBeInTheDocument();

    // Click hamburger button
    const menuBtn = screen.getByLabelText(/Abrir menu de navegação/i);
    fireEvent.click(menuBtn);

    // Mobile drawer opened
    expect(screen.getByText('Victor Hugo')).toBeInTheDocument();
    expect(screen.getByText('Navegação Principal')).toBeInTheDocument();
    expect(screen.getByText('Notícias & Radar B3')).toBeInTheDocument();

    // Click "Notícias & Radar B3" in drawer
    const noticiasBtn = screen.getByText('Notícias & Radar B3');
    fireEvent.click(noticiasBtn);

    expect(handleNav).toHaveBeenCalledWith('noticias');
    // Drawer closes after navigation
    expect(screen.queryByText('Victor Hugo')).not.toBeInTheDocument();
  });

  it('should toggle user profile dropdown when clicking avatar VH and open settings modal', () => {
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={() => {}} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    // Initial: dropdown closed
    expect(screen.queryByText('victor9009@gmail.com')).not.toBeInTheDocument();

    // Click VH avatar button
    const avatarBtn = screen.getByTitle('Menu Victor Hugo');
    fireEvent.click(avatarBtn);

    // Dropdown opened with options
    expect(screen.getByText('victor9009@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Meu Perfil & Documentos')).toBeInTheDocument();
    expect(screen.getByText('Conectar Contas (B3/Cripto)')).toBeInTheDocument();
    expect(screen.getByText('Segurança & Senha')).toBeInTheDocument();

    // Click "Conectar Contas (B3/Cripto)" to open modal
    const conexoesOption = screen.getByText('Conectar Contas (B3/Cripto)');
    fireEvent.click(conexoesOption);

    // Modal opened
    expect(screen.getByText('Central de Configurações & Administração')).toBeInTheDocument();
    expect(screen.getByText('Conexões Criptografadas & Open Finance')).toBeInTheDocument();
  });
});
