import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BotLogsModal } from '../BotLogsModal';
import { EditBotModal } from '../EditBotModal';
import { NewBotModal } from '../NewBotModal';
import { DaytradeBot, BotDecisionLog } from '../../../types/daytrade';

const mockBot: DaytradeBot = {
  id: 'bot-test-1',
  name: 'Robô WIN Teste',
  market: 'B3',
  symbol: 'WINZ24',
  assetName: 'Mini-Índice B3',
  strategy: 'confluence_ai',
  strategyLabel: 'Confluência Quântica Multi-Fator',
  strategyDescription: 'Validação tripla de momentum e VWAP',
  allocatedCapital: 5000,
  status: 'running',
  currentPosition: null,
  dailyPnl: 350.5,
  dailyPnlPercent: 7.01,
  tradesCount: 4,
  winningTrades: 3,
  winRate: 75,
  maxDailyLoss: 400,
  targetDailyProfit: 800,
  confluenceThreshold: 80,
  createdAt: Date.now() - 3600000,
  lastUpdated: Date.now(),
  lastLog: 'Aguardando confluência de rompimento.',
};

const mockLogs: BotDecisionLog[] = [
  {
    id: 'log-1',
    botId: 'bot-test-1',
    botName: 'Robô WIN Teste',
    market: 'B3',
    action: 'BUY 5 WINZ24',
    timestamp: Date.now() - 60000,
    type: 'ENTRY',
    symbol: 'WINZ24',
    confidenceScore: 88,
    reason: 'Entrada executada no rompimento com 88% de confluência.',
    resultPnl: 120,
  },
  {
    id: 'log-2',
    botId: 'bot-test-1',
    botName: 'Robô WIN Teste',
    market: 'B3',
    action: 'REJECT ENTRY',
    timestamp: Date.now() - 30000,
    type: 'REJECTED',
    symbol: 'WINZ24',
    confidenceScore: 55,
    reason: 'Entrada rejeitada por confluência insuficiente (55% < 80%).',
  },
];

describe('Modais do Módulo de Day Trade (BotModals)', () => {
  describe('Modal de Histórico e Auditoria de Decisões (BotLogsModal)', () => {
    it('deve renderizar logs, KPIs do robô e permitir alternar filtros', () => {
      const handleClose = vi.fn();
      render(
        <BotLogsModal
          isOpen={true}
          bot={mockBot}
          logs={mockLogs}
          onClose={handleClose}
        />
      );

      expect(screen.getByText('Histórico de Auditoria & Decisões')).toBeInTheDocument();
      expect(screen.getByText(/Robô WIN Teste/)).toBeInTheDocument();
      expect(screen.getByText('Entrada executada no rompimento com 88% de confluência.')).toBeInTheDocument();

      // Clica no filtro de Rejeições
      const rejectFilterBtn = screen.getByRole('button', { name: /Rejeições/i });
      fireEvent.click(rejectFilterBtn);

      expect(screen.getByText('Entrada rejeitada por confluência insuficiente (55% < 80%).')).toBeInTheDocument();
      expect(screen.queryByText('Entrada executada no rompimento com 88% de confluência.')).not.toBeInTheDocument();
    });
  });

  describe('Modal de Edição de Robô (EditBotModal)', () => {
    it('deve submeter parâmetros atualizados do robô', () => {
      const handleClose = vi.fn();
      const handleSave = vi.fn();

      render(
        <EditBotModal
          isOpen={true}
          bot={mockBot}
          onClose={handleClose}
          onSaveBot={handleSave}
        />
      );

      expect(screen.getByText('Editar Parâmetros & Estratégia')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Robô WIN Teste')).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /Salvar e Aplicar Alterações/i });
      fireEvent.click(submitBtn);

      expect(handleSave).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal de Criação de Novo Robô (NewBotModal)', () => {
    it('deve criar novo robô com capital e ativo selecionados', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <NewBotModal
          isOpen={true}
          onClose={handleClose}
          onCreateBot={handleCreate}
          demoBalance={50000}
        />
      );

      expect(screen.getByText('Criar Novo Robô de Day Trade')).toBeInTheDocument();
      expect(screen.getByText('Saldo Disp: R$ 50.000')).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /Criar e Iniciar Robô Autônomo/i });
      fireEvent.click(submitBtn);

      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
