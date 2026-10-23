import { describe, it, expect } from 'vitest';
import { formatBRL, formatPercent, formatDateBR } from '../formatters';

describe('formatters', () => {
  it('should format currency in Brazilian Real (BRL)', () => {
    expect(formatBRL(1250.5)).toContain('1.250,50');
    expect(formatBRL(0)).toContain('0,00');
  });

  it('should format positive percentage with plus sign', () => {
    expect(formatPercent(2.14)).toBe('+2.14%');
  });

  it('should format negative percentage', () => {
    expect(formatPercent(-0.65)).toBe('-0.65%');
  });

  it('should format date in Brazilian format dd/mm/yyyy', () => {
    const ts = new Date(2026, 9, 22).getTime(); // Oct 22, 2026
    expect(formatDateBR(ts)).toBe('22/10/2026');
  });
});
