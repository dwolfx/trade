import React from 'react';
import { RealBacktestReport, RealBacktestTrade } from '../../services/realBacktestEngine';

interface BacktestTradeTableProps {
  report: RealBacktestReport;
  filterType: 'ALL' | 'WINS' | 'LOSSES';
  setFilterType: (filter: 'ALL' | 'WINS' | 'LOSSES') => void;
  filteredTrades: RealBacktestTrade[];
  currencyPrefix?: string;
}

export const BacktestTradeTable: React.FC<BacktestTradeTableProps> = ({
  report,
  filterType,
  setFilterType,
  filteredTrades,
  currencyPrefix = 'R$',
}) => {
  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Registro de Operações Concluídas
          </h4>
          <span className="text-[10px] text-[#64748B]">
            Todas as {report.trades.length} execuções simuladas barra a barra
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-[#1E293B] text-white font-bold'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            Todos ({report.trades.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('WINS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterType === 'WINS'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            Ganhos ({report.winningTrades})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('LOSSES')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filterType === 'LOSSES'
                ? 'bg-rose-500/20 text-rose-400 font-bold'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            Perdas ({report.losingTrades})
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <div className="backtest-table-container">
        <table className="backtest-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Preço Ent.</th>
              <th>Preço Saída</th>
              <th>Motivo</th>
              <th className="text-right">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/40 font-mono">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-[#64748B]">
                  Nenhum trade encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredTrades.map(trade => (
                <tr key={trade.id} className="hover:bg-[#161F33]/40 transition-colors">
                  <td className="text-[#64748B]">{trade.tradeNumber}</td>
                  <td>
                    {trade.side === 'BUY' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        COMPRA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        SHORT
                      </span>
                    )}
                  </td>
                  <td className="text-white">
                    {new Date(trade.entryTime).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="text-[#94A3B8]">
                    {new Date(trade.exitTime).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="text-white">{trade.entryPrice.toFixed(2)}</td>
                  <td className="text-white">{trade.exitPrice.toFixed(2)}</td>
                  <td>
                    {trade.exitReason === 'TAKE_PROFIT' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        TAKE PROFIT
                      </span>
                    ) : trade.exitReason === 'BREAKEVEN' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        BREAKEVEN
                      </span>
                    ) : trade.exitReason === 'STOP_LOSS' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        STOP LOSS
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        FIM PERÍODO
                      </span>
                    )}
                  </td>
                  <td
                    className={`text-right font-bold ${
                      trade.pnl > 0
                        ? 'text-emerald-400'
                        : trade.pnl < 0
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {trade.pnl < 0 ? '-' : trade.pnl > 0 ? '+' : ''}
                    {currencyPrefix}{' '}
                    {Math.abs(trade.pnl).toFixed(2)} ({trade.pnlPercent >= 0 ? '+' : ''}
                    {trade.pnlPercent.toFixed(2)}%)
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
