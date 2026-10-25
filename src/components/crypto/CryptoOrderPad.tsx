import React, { useState } from 'react';
import { CryptoAsset, CryptoQuoteCurrency } from '../../types/crypto';
import { useMarket } from '../../context/MarketContext';
import { formatBRL } from '../../utils/formatters';
import { Zap } from 'lucide-react';

interface CryptoOrderPadProps {
  asset: CryptoAsset;
  quoteCurrency: CryptoQuoteCurrency;
}

export const CryptoOrderPad: React.FC<CryptoOrderPadProps> = ({
  asset,
  quoteCurrency,
}) => {
  const { mode, demoBalance, liveBalance, setToastMessage } = useMarket();
  const balance = mode === 'DEMO' ? demoBalance : liveBalance;

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState<string>('0.01');
  const [limitPrice, setLimitPrice] = useState<string>(asset.price.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numQty = parseFloat(quantity) || 0;
  const executionPrice = orderType === 'market' ? asset.price : parseFloat(limitPrice) || asset.price;
  const subtotal = numQty * executionPrice;
  const fee = subtotal * 0.00075; // Binance 0.075% standard maker/taker fee with BNB
  const total = side === 'buy' ? subtotal + fee : subtotal - fee;

  const handleQuickPercent = (percent: number) => {
    if (side === 'buy') {
      const budget = (balance * (percent / 100)) / (1 + 0.00075);
      const calculatedQty = budget / executionPrice;
      setQuantity(calculatedQty.toFixed(4));
    } else {
      // For sell, dummy 1.0 holding
      const calculatedQty = 1.0 * (percent / 100);
      setQuantity(calculatedQty.toFixed(4));
    }
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) return;

    if (side === 'buy' && total > balance) {
      setToastMessage('⚠️ Saldo insuficiente para executar a ordem cripto!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const actionText = side === 'buy' ? 'compra' : 'venda';
      setToastMessage(`⚡ Ordem de ${actionText} de ${numQty} ${asset.baseAsset} executada a ${quoteCurrency === 'BRL' ? 'R$' : '$'} ${executionPrice.toFixed(2)}!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 400);
  };

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
            Boleta Cripto · {asset.baseAsset}/{quoteCurrency}
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-[#60A5FA] border border-blue-500/20">
          Binance Spot
        </span>
      </div>

      {/* Side Toggle: COMPRAR vs VENDER */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0F19] rounded-xl border border-[#1E293B]">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            side === 'buy'
              ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          COMPRAR
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`py-2 rounded-lg text-xs font-bold transition-all ${
            side === 'sell'
              ? 'bg-[#F43F5E] text-white shadow-md shadow-rose-500/20'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          VENDER
        </button>
      </div>

      {/* Order Type: Mercado vs Limitada */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
        <span>Tipo de Ordem:</span>
        <div className="flex items-center gap-1 bg-[#0B0F19] p-0.5 rounded-lg border border-[#1E293B]">
          <button
            type="button"
            onClick={() => setOrderType('market')}
            className={`px-2.5 py-1 rounded text-[11px] transition-all ${
              orderType === 'market' ? 'bg-[#1E293B] text-white font-bold' : 'hover:text-white'
            }`}
          >
            A Mercado
          </button>
          <button
            type="button"
            onClick={() => setOrderType('limit')}
            className={`px-2.5 py-1 rounded text-[11px] transition-all ${
              orderType === 'limit' ? 'bg-[#1E293B] text-white font-bold' : 'hover:text-white'
            }`}
          >
            Limitada
          </button>
        </div>
      </div>

      <form onSubmit={handleExecute} className="flex flex-col gap-3.5">
        {/* Limit Price Input if limit order */}
        {orderType === 'limit' && (
          <div>
            <label className="text-[11px] text-[#94A3B8] font-medium block mb-1">
              Preço Limite ({quoteCurrency})
            </label>
            <input
              type="number"
              step="any"
              value={limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#2962FF]"
            />
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-1">
            <span>Quantidade ({asset.baseAsset})</span>
            <span>Saldo Disp: <strong className="text-white font-mono">{formatBRL(balance)}</strong></span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0.0001"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#2962FF]"
            />
            <span className="absolute right-3 top-2.5 text-xs font-mono text-[#64748B]">
              {asset.baseAsset}
            </span>
          </div>
        </div>

        {/* Quick Percent Chips */}
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map(pct => (
            <button
              key={pct}
              type="button"
              onClick={() => handleQuickPercent(pct)}
              className="py-1 rounded-lg bg-[#0B0F19] hover:bg-[#1E293B] border border-[#1E293B] text-[10px] font-mono font-bold text-[#94A3B8] hover:text-white transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-[#0B0F19] rounded-xl p-3 border border-[#1E293B] flex flex-col gap-1.5 text-xs font-mono">
          <div className="flex justify-between text-[#94A3B8]">
            <span>Subtotal:</span>
            <span>{quoteCurrency === 'BRL' ? 'R$' : '$'} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#64748B] text-[11px]">
            <span>Taxa Binance (0.075%):</span>
            <span>{quoteCurrency === 'BRL' ? 'R$' : '$'} {fee.toFixed(2)}</span>
          </div>
          <div className="border-t border-[#1E293B] pt-1.5 flex justify-between text-white font-bold text-sm">
            <span>Total da Ordem:</span>
            <span className={side === 'buy' ? 'text-[#10B981]' : 'text-[#F43F5E]'}>
              {quoteCurrency === 'BRL' ? 'R$' : '$'} {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || numQty <= 0}
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-lg transition-all ${
            side === 'buy'
              ? 'bg-[#10B981] hover:bg-emerald-600 shadow-emerald-500/20'
              : 'bg-[#F43F5E] hover:bg-rose-600 shadow-rose-500/20'
          } disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span>Enviando ordem...</span>
          ) : (
            <>
              <Zap size={14} className="fill-white" />
              <span>{side === 'buy' ? 'Comprar' : 'Vender'} {asset.baseAsset}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
