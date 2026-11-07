import { describe, it, expect } from 'vitest';
import { formatBRL, formatPercent, formatDateBR } from '../formatters';

describe('Formatadores Utilitários (Formatters)', () => {
  it('deve formatar valores monetários em Real Brasileiro (BRL)', () => {
    expect(formatBRL(1250.5)).toContain('1.250,50');
    expect(formatBRL(0)).toContain('0,00');
  });

  it('deve formatar porcentagem positiva com sinal de mais (+)', () => {
    expect(formatPercent(2.14)).toBe('+2.14%');
  });

  it('deve formatar porcentagem negativa com sinal de menos (-)', () => {
    expect(formatPercent(-0.65)).toBe('-0.65%');
  });

  it('deve formatar data no formato brasileiro dd/mm/aaaa', () => {
    const ts = new Date(2026, 9, 22).getTime();
    expect(formatDateBR(ts)).toBe('22/10/2026');
  });
});
