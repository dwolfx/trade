import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  onClear,
  className = '',
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0F1523] border border-[#1E293B] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#2962FF] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
          title="Limpar busca"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};
