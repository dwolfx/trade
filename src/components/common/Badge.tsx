import React from 'react';

export type BadgeVariant =
  | 'profit'
  | 'loss'
  | 'demo'
  | 'warning'
  | 'brand'
  | 'purple'
  | 'cyan'
  | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantClassMap: Record<BadgeVariant, string> = {
  profit: 'tc-badge-profit',
  loss: 'tc-badge-loss',
  demo: 'tc-badge-demo',
  warning: 'tc-badge-warning',
  brand: 'tc-badge-brand',
  purple: 'tc-badge-purple',
  cyan: 'tc-badge-cyan',
  neutral: 'tc-badge-neutral',
};

const dotColorMap: Record<BadgeVariant, string> = {
  profit: 'bg-[#38BDF8]',
  loss: 'bg-[#F43F5E]',
  demo: 'bg-[#F59E0B]',
  warning: 'bg-[#FBBF24]',
  brand: 'bg-[#60A5FA]',
  purple: 'bg-[#C084FC]',
  cyan: 'bg-[#22D3EE]',
  neutral: 'bg-[#94A3B8]',
};

const sizeClassMap = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-0.5',
  lg: 'text-xs px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
}) => {
  const variantClass = variantClassMap[variant] || 'tc-badge-brand';
  const sizeClass = sizeClassMap[size] || sizeClassMap.md;
  const dotColor = dotColorMap[variant] || 'bg-current';

  return (
    <span
      className={`tc-badge ${variantClass} ${sizeClass} ${className}`}
      data-testid="tc-badge"
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
