import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeaderTopbar } from '../../HeaderTopbar';
import { MarketProvider } from '../../../context/MarketContext';

describe('Barra Superior e Navegação Global (HeaderTopbar)', () => {
  it('deve renderizar logotipo, avatar VH e seletor de saldo DEMO/LIVE', () => {
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

  it('deve alternar a visibilidade do saldo ao clicar no ícone do olho', () => {
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={() => {}} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    expect(screen.getByText(/50\.000/)).toBeInTheDocument();

    const eyeButton = screen.getByTitle('Ocultar saldo');
    fireEvent.click(eyeButton);

    expect(screen.getByText('••••••••••')).toBeInTheDocument();

    const showButton = screen.getByTitle('Mostrar saldo');
    fireEvent.click(showButton);
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it('deve disparar onOpenPositions ao clicar na opção Minha Carteira', () => {
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

  it('deve alternar o modo de conta entre DEMO (Simulado) e LIVE (Real)', () => {
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={() => {}} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    const liveBtn = screen.getByRole('button', { name: /LIVE/i });
    fireEvent.click(liveBtn);

    expect(screen.getByText('Saldo Disponível')).toBeInTheDocument();

    const demoBtn = screen.getByRole('button', { name: /DEMO/i });
    fireEvent.click(demoBtn);
    expect(screen.getByText('Saldo Simulado')).toBeInTheDocument();
  });

  it('deve abrir e fechar gaveta de navegação mobile e direcionar para rota selecionada', () => {
    const handleNav = vi.fn();
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={handleNav} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    expect(screen.queryByText('Victor Hugo')).not.toBeInTheDocument();

    const menuBtn = screen.getByLabelText(/Abrir menu de navegação/i);
    fireEvent.click(menuBtn);

    expect(screen.getByText('Victor Hugo')).toBeInTheDocument();
    expect(screen.getByText('Navegação Principal')).toBeInTheDocument();
    expect(screen.getByText('Notícias & Radar B3')).toBeInTheDocument();

    const noticiasBtn = screen.getByText('Notícias & Radar B3');
    fireEvent.click(noticiasBtn);

    expect(handleNav).toHaveBeenCalledWith('noticias');
    expect(screen.queryByText('Victor Hugo')).not.toBeInTheDocument();
  });

  it('deve abrir menu suspenso de perfil ao clicar no avatar VH e abrir modal de configurações', () => {
    render(
      <MarketProvider>
        <HeaderTopbar activeNav="bolsa" setActiveNav={() => {}} onOpenPositions={() => {}} />
      </MarketProvider>
    );

    expect(screen.queryByText('victor9009@gmail.com')).not.toBeInTheDocument();

    const avatarBtn = screen.getByTitle('Menu Victor Hugo');
    fireEvent.click(avatarBtn);

    expect(screen.getByText('victor9009@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Meu Perfil & Documentos')).toBeInTheDocument();
    expect(screen.getByText('Conectar Contas (B3/Cripto)')).toBeInTheDocument();
    expect(screen.getByText('Segurança & Senha')).toBeInTheDocument();

    const conexoesOption = screen.getByText('Conectar Contas (B3/Cripto)');
    fireEvent.click(conexoesOption);

    expect(screen.getByText('Central de Configurações & Administração')).toBeInTheDocument();
    expect(screen.getByText('Central de Conexões Financeiras')).toBeInTheDocument();
  });
});
