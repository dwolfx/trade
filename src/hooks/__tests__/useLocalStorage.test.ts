import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return initial value when key is not in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial_value'));
    expect(result.current[0]).toBe('initial_value');
  });

  it('should update state and write to localStorage when setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    act(() => {
      result.current[1]('updated_value');
    });
    expect(result.current[0]).toBe('updated_value');
    expect(window.localStorage.getItem('test_key')).toBe(JSON.stringify('updated_value'));
  });

  it('should read existing value from localStorage', () => {
    window.localStorage.setItem('existing_key', JSON.stringify({ count: 42 }));
    const { result } = renderHook(() => useLocalStorage('existing_key', { count: 0 }));
    expect(result.current[0]).toEqual({ count: 42 });
  });
});
