import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`w-full py-12 px-6 rounded-2xl bg-[#0F1523] border border-dashed border-[#1E293B] text-center flex flex-col items-center justify-center gap-3 animate-in fade-in ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#141C2E] border border-[#1E293B] text-[#64748B] flex items-center justify-center shadow-inner">
        <Icon size={24} />
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#141C2E] hover:bg-[#2962FF] text-white border border-blue-500/30 hover:border-transparent transition-all shadow-sm"
        >
          {ActionIcon && <ActionIcon size={14} />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};
