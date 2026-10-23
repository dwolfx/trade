import { OrderSide } from '../types/market';

export const B3_FEE_RATE = 0.0003; // 0.030% taxa de liquidação e emolumentos B3

export function calculateB3Fees(grossTotal: number): number {
  if (grossTotal <= 0) return 0;
  return Number((grossTotal * B3_FEE_RATE).toFixed(2));
}

export function calculateOrderTotal(
  price: number,
  quantity: number,
  side: OrderSide
): { grossTotal: number; fees: number; netTotal: number } {
  if (price <= 0 || quantity <= 0) {
    return { grossTotal: 0, fees: 0, netTotal: 0 };
  }
  const grossTotal = Number((price * quantity).toFixed(2));
  const fees = calculateB3Fees(grossTotal);
  const netTotal = side === 'buy'
    ? Number((grossTotal + fees).toFixed(2))
    : Number((grossTotal - fees).toFixed(2));

  return { grossTotal, fees, netTotal };
}

export function calculateTakeProfitPrice(basePrice: number, percentGain: number): number {
  if (basePrice <= 0) return 0;
  return Number((basePrice * (1 + percentGain / 100)).toFixed(2));
}

export function calculateStopLossPrice(basePrice: number, percentLoss: number): number {
  if (basePrice <= 0) return 0;
  return Number((basePrice * (1 - percentLoss / 100)).toFixed(2));
}

export function validateOrder(params: {
  side: OrderSide;
  quantity: number;
  price: number;
  availableCash: number;
  currentHoldings: number;
}): { isValid: boolean; error?: string } {
  if (params.quantity <= 0) {
    return { isValid: false, error: 'A quantidade deve ser maior que zero.' };
  }
  if (params.price <= 0) {
    return { isValid: false, error: 'O preço deve ser maior que zero.' };
  }

  const { netTotal } = calculateOrderTotal(params.price, params.quantity, params.side);

  if (params.side === 'buy' && netTotal > params.availableCash) {
    return {
      isValid: false,
      error: `Saldo insuficiente. Necessário R$ ${netTotal.toFixed(2)}, mas você possui R$ ${params.availableCash.toFixed(2)}.`
    };
  }

  if (params.side === 'sell' && params.quantity > params.currentHoldings) {
    return {
      isValid: false,
      error: `Quantidade indisponível para venda. Você possui ${params.currentHoldings} ações em carteira.`
    };
  }

  return { isValid: true };
}
