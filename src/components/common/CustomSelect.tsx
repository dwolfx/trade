import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T extends string | number> {
  value: T;
  label: string;
  badge?: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string | number> {
  value: T;
  onChange: (val: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#161F33] border rounded-xl px-3 py-2 text-xs text-white flex items-center justify-between gap-2 cursor-pointer transition-all ${
          isOpen
            ? 'border-[#38BDF8] shadow-md shadow-sky-500/10'
            : 'border-[#1E293B] hover:border-[#334155] hover:bg-[#1a253d]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="text-[#38BDF8] shrink-0">{selectedOption.icon}</span>
          )}
          <span className="font-semibold text-white truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-[#94A3B8] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#38BDF8]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0F1523] border border-[#1E293B] rounded-xl shadow-2xl p-1 z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                  isSelected
                    ? 'bg-sky-500/15 text-white border border-sky-500/30'
                    : 'text-[#94A3B8] hover:bg-[#161F33] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && (
                    <span
                      className={`shrink-0 transition-colors ${
                        isSelected ? 'text-[#38BDF8]' : 'text-[#64748B] group-hover:text-white'
                      }`}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium truncate ${isSelected ? 'text-[#38BDF8]' : ''}`}>
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#161F33] text-[#94A3B8] border border-[#1E293B]">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <span className="text-[10px] text-[#64748B] block truncate mt-0.5">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check size={14} className="text-[#38BDF8] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
