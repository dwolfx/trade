import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { OrderSide, OrderType } from '../types/market';
import { ShieldAlert, Target, CheckCircle2 } from 'lucide-react';
import { OrderSideToggle } from './order/OrderSideToggle';
import { OrderTypeControl } from './order/OrderTypeControl';
import { QuantityStepper } from './order/QuantityStepper';
import { QuickLotChips } from './order/QuickLotChips';
import { ProtectionStepper } from './order/ProtectionStepper';
import { OrderSummaryCard } from './order/OrderSummaryCard';
import {
  calculateOrderTotal,
  calculateTakeProfitPrice,
  calculateStopLossPrice,
  validateOrder
} from '../utils/orderCalculator';
import { formatBRL } from '../utils/formatters';

export const OrderPad: React.FC = () => {
  const { activeAsset, executeOrder, mode, demoBalance, liveBalance, portfolio } = useMarket();

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState<number>(100);
  const [limitPrice, setLimitPrice] = useState<number>(activeAsset.price);
  const [takeProfitPercent, setTakeProfitPercent] = useState<number>(8.0);
  const [stopLossPercent, setStopLossPercent] = useState<number>(3.9);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setLimitPrice(activeAsset.price);
  }, [activeAsset.symbol, activeAsset.price]);

  const effectivePrice = orderType === 'limit' ? limitPrice : activeAsset.price;
  const { fees, netTotal } = calculateOrderTotal(effectivePrice, quantity, side);
  const tpPrice = calculateTakeProfitPrice(effectivePrice, takeProfitPercent);
  const slPrice = calculateStopLossPrice(effectivePrice, stopLossPercent);

  const currentCash = mode === 'DEMO' ? demoBalance : liveBalance;
  const position = portfolio.find(p => p.symbol === activeAsset.symbol);
  const currentHoldings = position?.quantity || 0;

  const handleMaxQuantity = () => {
    if (side === 'buy') {
      const maxAffordable = Math.floor(currentCash / (effectivePrice * 1.0003));
      const rounded = maxAffordable > 100 ? Math.floor(maxAffordable / 100) * 100 : Math.max(1, maxAffordable);
      setQuantity(rounded);
    } else {
      setQuantity(Math.max(1, currentHoldings));
    }
  };

  const handleExecute = () => {
    const validation = validateOrder({
      side,
      quantity,
      price: effectivePrice,
      availableCash: currentCash,
      currentHoldings
    });

    if (!validation.isValid) {
      setFeedback({ success: false, message: validation.error || 'Ordem inválida.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const result = executeOrder({
      symbol: activeAsset.symbol,
      side,
      type: orderType,
      quantity,
      price: effectivePrice,
      takeProfit: tpPrice,
      stopLoss: slPrice
    });

    setFeedback(result);
    setIsSubmitting(false);

    if (result.success) {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Pad Header */}
      <div className="border-b border-[#1E293B] pb-3.5 flex items-center justify-between">
        <h3 className="text-base font-bold text-white tracking-tight">
          Boleta de Ordem · <span className="font-mono text-[#60A5FA]">{activeAsset.symbol}</span>
        </h3>
        <span className="text-[11px] font-mono text-[#64748B]">
          {side === 'buy' ? 'Disponível: ' : 'Na Carteira: '}
          <strong className="text-white">
            {side === 'buy' ? formatBRL(currentCash) : `${currentHoldings} ações`}
          </strong>
        </span>
      </div>

      {/* Buy / Sell Toggle */}
      <OrderSideToggle side={side} onChange={setSide} />

      {/* Execution Type Control */}
      <OrderTypeControl orderType={orderType} onChange={setOrderType} />

      {/* If Limit Order: Custom limit input */}
      {orderType === 'limit' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#94A3B8] font-medium">Preço Limite Desejado</label>
          <div className="h-11 bg-[#141C2E] border border-[#1E293B] rounded-xl px-3 flex items-center justify-between">
            <span className="text-xs font-mono text-[#64748B]">R$</span>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={e => setLimitPrice(Number(e.target.value))}
              className="bg-transparent text-right font-mono font-bold text-white text-sm focus:outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* Quantity Stepper & Quick Lot Chips */}
      <div className="flex flex-col">
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
        <QuickLotChips onAddLot={lot => setQuantity(prev => prev + lot)} onMax={handleMaxQuantity} />
      </div>

      {/* Take Profit Stepper */}
      <ProtectionStepper
        label="Take Profit (Alvo de Venda)"
        icon={<Target size={12} className="text-[#38BDF8]" />}
        price={tpPrice}
        percent={takeProfitPercent}
        stepPercent={1}
        textColorClass="text-[#38BDF8]"
        onChangePercent={setTakeProfitPercent}
      />

      {/* Stop Loss Stepper */}
      <ProtectionStepper
        label="Stop Loss (Proteção)"
        icon={<ShieldAlert size={12} className="text-[#F43F5E]" />}
        price={slPrice}
        percent={stopLossPercent}
        stepPercent={0.5}
        textColorClass="text-[#F43F5E]"
        onChangePercent={setStopLossPercent}
      />

      {/* Order Summary Card */}
      <OrderSummaryCard netTotal={netTotal} fees={fees} />

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.success
              ? 'bg-sky-500/10 border border-sky-500/30 text-[#38BDF8]'
              : 'bg-rose-500/10 border border-rose-500/30 text-[#F43F5E]'
          }`}
        >
          {feedback.success ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Big Action Button */}
      <button
        type="button"
        onClick={handleExecute}
        disabled={isSubmitting}
        className={`w-full py-3.5 rounded-xl font-black font-mono text-sm tracking-wide text-white transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 ${
          side === 'buy'
            ? 'bg-[#0284C7] hover:bg-[#0369A1] shadow-lg shadow-sky-500/25'
            : 'bg-[#F43F5E] hover:bg-[#E11D48] shadow-lg shadow-rose-500/25'
        }`}
      >
        <span>
          {side === 'buy' ? 'COMPRAR' : 'VENDER'} {quantity} {activeAsset.symbol}
        </span>
      </button>
    </div>
  );
};
