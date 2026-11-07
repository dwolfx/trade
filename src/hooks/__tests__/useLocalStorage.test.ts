import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from '../useLocalStorage';

describe('Hook de Armazenamento Local (useLocalStorage)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deve retornar o valor inicial quando a chave não existir no localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial_value'));
    expect(result.current[0]).toBe('initial_value');
  });

  it('deve atualizar o estado e persistir no localStorage ao chamar a função setter', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    act(() => {
      result.current[1]('updated_value');
    });
    expect(result.current[0]).toBe('updated_value');
    expect(window.localStorage.getItem('test_key')).toBe(JSON.stringify('updated_value'));
  });

  it('deve ler e deserializar o valor previamente salvo no localStorage', () => {
    window.localStorage.setItem('existing_key', JSON.stringify({ count: 42 }));
    const { result } = renderHook(() => useLocalStorage('existing_key', { count: 0 }));
    expect(result.current[0]).toEqual({ count: 42 });
  });
});
