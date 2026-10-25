import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'sky' | 'amber' | 'rose' | 'blue';
  };
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  iconColor = 'text-[#60A5FA]',
  iconBg = 'bg-blue-500/10',
  label,
  value,
  subValue,
  badge,
  footerLeft,
  footerRight,
  onClick,
  className = '',
  children,
}) => {
  const getBadgeStyle = () => {
    switch (badge?.variant) {
      case 'sky':
        return 'bg-sky-500/15 text-[#38BDF8] border-sky-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-[#F59E0B] border-amber-500/30';
      case 'rose':
        return 'bg-rose-500/15 text-[#F43F5E] border-rose-500/30';
      case 'blue':
      default:
        return 'bg-blue-500/15 text-[#60A5FA] border-blue-500/30';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl bg-[#0F1523] border border-[#1E293B] hover:border-[#334155] transition-all flex flex-col justify-between relative overflow-hidden group shadow-sm ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div>
        {/* Top Header: Label + Icon */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
          <span className="uppercase tracking-wider font-mono text-[11px] truncate">
            {label}
          </span>
          <div
            className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-sm`}
          >
            <Icon size={16} />
          </div>
        </div>

        {/* Main Metric Value */}
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight flex items-center gap-2">
            {value}
          </div>
          {subValue && (
            <div className="flex items-center gap-2 mt-1 text-xs text-[#64748B] font-mono">
              {subValue}
            </div>
          )}
          {children}
        </div>
      </div>

      {/* Footer Divider & Metadata */}
      {(footerLeft || footerRight || badge) && (
        <div className="mt-3 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px] text-[#94A3B8]">
          <div className="truncate">{footerLeft}</div>
          <div>
            {badge ? (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getBadgeStyle()}`}
              >
                {badge.text}
              </span>
            ) : (
              footerRight
            )}
          </div>
        </div>
      )}
    </div>
  );
};
