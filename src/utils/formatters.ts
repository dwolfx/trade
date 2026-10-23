import { Timeframe } from '../types/market';

export function formatBRL(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number, withSign: boolean = true): string {
  if (value === undefined || value === null || isNaN(value)) return '0,00%';
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDateBR(timestamp: number): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTimeOrDateByTimeframe(timestamp: number, tf: Timeframe): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  if (tf === '1D' || tf === '1S' || tf === '1M' || tf === '1A') {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}
