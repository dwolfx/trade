import React from 'react';

export interface SegmentedOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  count?: number | string;
}

export interface SegmentedControlProps<T extends string | number = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

export const SegmentedControl = <T extends string | number = string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  ariaLabel = 'Seletor de opções',
}: SegmentedControlProps<T>): React.ReactElement => {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`tc-tab-track overflow-x-auto scrollbar-none ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={`tc-tab-btn whitespace-nowrap cursor-pointer ${
              isActive ? 'tc-tab-btn-active' : ''
            } ${size === 'sm' ? 'py-1 px-2 text-[11px]' : 'py-1.5 px-3 text-xs'}`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/30 text-[#94A3B8]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
