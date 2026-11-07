import { describe, it, expect } from 'vitest';
import { computeSquarifiedTreemap, TreemapItem } from '../treemap';

describe('Algoritmo de Mosaico Proporcional (Squarified Treemap)', () => {
  it('retorna array vazio quando a entrada estiver vazia ou dimensões do contêiner forem inválidas', () => {
    expect(computeSquarifiedTreemap([], 800, 600)).toEqual([]);
    expect(computeSquarifiedTreemap([{ id: 'A', value: 10, data: {} }], 0, 600)).toEqual([]);
    expect(computeSquarifiedTreemap([{ id: 'A', value: 10, data: {} }], 800, 0)).toEqual([]);
    expect(computeSquarifiedTreemap([{ id: 'A', value: -5, data: {} }], 800, 600)).toEqual([]);
  });

  it('aloca áreas proporcionalmente maiores para itens com maior peso financeiro', () => {
    const items: TreemapItem[] = [
      { id: 'PETR4', value: 400, data: { symbol: 'PETR4' } },
      { id: 'VALE3', value: 200, data: { symbol: 'VALE3' } },
      { id: 'ITUB4', value: 200, data: { symbol: 'ITUB4' } },
    ];

    const width = 1000;
    const height = 500;
    const rects = computeSquarifiedTreemap(items, width, height, 0);

    expect(rects).toHaveLength(3);

    const petr = rects.find(r => r.id === 'PETR4')!;
    const vale = rects.find(r => r.id === 'VALE3')!;
    const itub = rects.find(r => r.id === 'ITUB4')!;

    const petrArea = petr.width * petr.height;
    const valeArea = vale.width * vale.height;
    const itubArea = itub.width * itub.height;

    // PETR4 possui 50% do total (400 / 800)
    expect(petrArea).toBeCloseTo((width * height) * 0.5, -1);
    // VALE3 e ITUB4 possuem 25% cada
    expect(valeArea).toBeCloseTo((width * height) * 0.25, -1);
    expect(itubArea).toBeCloseTo((width * height) * 0.25, -1);
  });

  it('aplica espaçamento interno (padding) sem gerar dimensões negativas', () => {
    const items: TreemapItem[] = [
      { id: 'A', value: 10, data: {} },
      { id: 'B', value: 5, data: {} },
    ];

    const padding = 4;
    const rects = computeSquarifiedTreemap(items, 400, 300, padding);

    expect(rects.length).toBe(2);
    rects.forEach(r => {
      expect(r.width).toBeGreaterThanOrEqual(0);
      expect(r.height).toBeGreaterThanOrEqual(0);
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
    });
  });

  it('mantém todas as coordenadas dentro dos limites do contêiner', () => {
    const items: TreemapItem[] = [
      { id: '1', value: 100, data: {} },
      { id: '2', value: 80, data: {} },
      { id: '3', value: 60, data: {} },
      { id: '4', value: 40, data: {} },
      { id: '5', value: 20, data: {} },
    ];

    const containerW = 800;
    const containerH = 600;
    const rects = computeSquarifiedTreemap(items, containerW, containerH, 2);

    expect(rects).toHaveLength(5);
    rects.forEach(r => {
      expect(r.x + r.width).toBeLessThanOrEqual(containerW + 2);
      expect(r.y + r.height).toBeLessThanOrEqual(containerH + 2);
    });
  });
});
