import { OrderSide } from '../types/market';

export function calculateNewAveragePrice(
  currentQty: number,
  currentAvgPrice: number,
  addedQty: number,
  addedPrice: number
): number {
  const totalQty = currentQty + addedQty;
  if (totalQty <= 0) return 0;
  const totalCost = (currentQty * currentAvgPrice) + (addedQty * addedPrice);
  return Number((totalCost / totalQty).toFixed(2));
}

export function calculatePositionPL(
  quantity: number,
  avgPrice: number,
  currentPrice: number
): {
  totalInvested: number;
  currentValue: number;
  plValue: number;
  plPercent: number;
} {
  const totalInvested = Number((quantity * avgPrice).toFixed(2));
  const currentValue = Number((quantity * currentPrice).toFixed(2));
  const plValue = Number((currentValue - totalInvested).toFixed(2));
  const plPercent = totalInvested > 0 ? Number(((plValue / totalInvested) * 100).toFixed(2)) : 0;

  return { totalInvested, currentValue, plValue, plPercent };
}

export function applyTradeToHoldings(
  currentHoldings: { quantity: number; avgPrice: number } | undefined,
  trade: { side: OrderSide; quantity: number; price: number }
): { quantity: number; avgPrice: number } | null {
  if (trade.side === 'buy') {
    if (!currentHoldings || currentHoldings.quantity <= 0) {
      return { quantity: trade.quantity, avgPrice: trade.price };
    }
    const newAvg = calculateNewAveragePrice(
      currentHoldings.quantity,
      currentHoldings.avgPrice,
      trade.quantity,
      trade.price
    );
    return {
      quantity: currentHoldings.quantity + trade.quantity,
      avgPrice: newAvg
    };
  } else {
    const existingQty = currentHoldings?.quantity || 0;
    const remainingQty = existingQty - trade.quantity;
    if (remainingQty <= 0) {
      return null; // Position completely closed!
    }
    // When selling, average price doesn't change
    return {
      quantity: remainingQty,
      avgPrice: currentHoldings!.avgPrice
    };
  }
}
