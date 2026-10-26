import React from 'react';

export interface CategoryOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface CategoryPillsProps<T extends string = string> {
  categories: CategoryOption<T>[];
  activeCategory: T;
  onSelectCategory: (id: T) => void;
  size?: 'sm' | 'md';
}

export const CategoryPills = <T extends string = string>({
  categories,
  activeCategory,
  onSelectCategory,
  size = 'md',
}: CategoryPillsProps<T>): React.ReactElement => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 rounded-xl font-medium transition-all whitespace-nowrap shrink-0 ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
            } ${
              isActive
                ? 'bg-[#2962FF] text-white shadow-sm font-semibold'
                : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-transparent hover:border-[#334155]'
            }`}
          >
            {cat.icon && <span className="shrink-0">{cat.icon}</span>}
            <span>{cat.label}</span>
            {cat.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#0B0F19] text-[#64748B]'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
