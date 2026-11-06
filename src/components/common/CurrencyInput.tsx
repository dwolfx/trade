import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface CurrencyInputProps {
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  quickPresets?: number[];
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  prefix = 'R$',
  min = 100,
  max = 10000000,
  step = 100,
  quickPresets = [100, 500, 1000, 2500, 5000, 10000],
  className = '',
}) => {
  // Local string state allows user to freely clear and type digits without immediate reset snaps
  const [textValue, setTextValue] = useState<string>(() => formatIntegerBRL(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync external changes when not actively typing/focused
  useEffect(() => {
    if (!isFocused) {
      setTextValue(formatIntegerBRL(value));
    }
  }, [value, isFocused]);

  function formatIntegerBRL(num: number): string {
    if (isNaN(num) || num === null || num === undefined) return '';
    return Math.round(num).toLocaleString('pt-BR');
  }

  function parseBRLString(str: string): number {
    const clean = str.replace(/[^\d]/g, '');
    return clean ? parseInt(clean, 10) : 0;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/[^\d]/g, '');

    if (!digitsOnly) {
      setTextValue('');
      return;
    }

    const numeric = parseInt(digitsOnly, 10);
    const clamped = Math.min(numeric, max);
    setTextValue(formatIntegerBRL(clamped));
    onChange(clamped);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseBRLString(textValue);
    if (!parsed || parsed < min) {
      const fallback = Math.max(min, value || min);
      setTextValue(formatIntegerBRL(fallback));
      onChange(fallback);
    } else {
      const clamped = Math.min(Math.max(parsed, min), max);
      setTextValue(formatIntegerBRL(clamped));
      onChange(clamped);
    }
  };

  const handleStep = (delta: number) => {
    const current = parseBRLString(textValue) || value || min;
    const next = Math.min(Math.max(current + delta, min), max);
    setTextValue(formatIntegerBRL(next));
    onChange(next);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Input container with custom stepper buttons */}
      <div
        className={`relative flex items-center bg-[#161F33] border rounded-xl transition-all ${
          isFocused
            ? 'border-[#38BDF8] shadow-md shadow-sky-500/10'
            : 'border-[#1E293B] hover:border-[#334155]'
        }`}
      >
        {/* Currency Prefix */}
        <span className="pl-3 pr-1 text-xs font-mono font-bold text-[#64748B] select-none shrink-0">
          {prefix}
        </span>

        {/* Formatted Text Input */}
        <input
          type="text"
          inputMode="numeric"
          value={textValue}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChange={handleInputChange}
          placeholder="0"
          className="w-full bg-transparent py-2 px-1 text-xs font-mono font-bold text-white outline-none placeholder-[#64748B]"
        />

        {/* Stepper buttons (Replaces ugly native browser arrows) */}
        <div className="flex items-center gap-0.5 pr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleStep(-step)}
            className="w-6 h-6 rounded-lg bg-[#0F1523] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={`Diminuir ${prefix} ${step.toLocaleString('pt-BR')}`}
          >
            <Minus size={11} />
          </button>
          <button
            type="button"
            onClick={() => handleStep(step)}
            className="w-6 h-6 rounded-lg bg-[#0F1523] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={`Aumentar ${prefix} ${step.toLocaleString('pt-BR')}`}
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

      {/* Quick Chips for One-click Selection */}
      {quickPresets && quickPresets.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          {quickPresets.map(preset => {
            const isSelected = value === preset;
            const label =
              preset >= 1000
                ? preset % 1000 === 0
                  ? `${preset / 1000}k`
                  : `${(preset / 1000).toFixed(1)}k`
                : `${preset}`;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setTextValue(formatIntegerBRL(preset));
                  onChange(preset);
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 text-[#38BDF8] border border-sky-500/40 shadow-xs'
                    : 'bg-[#161F33] text-[#64748B] hover:text-[#94A3B8] border border-[#1E293B]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
