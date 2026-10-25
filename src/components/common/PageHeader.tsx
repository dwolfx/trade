import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  icon: LucideIcon;
  iconGradient?: string;
  title: string;
  badge?: {
    text: string;
    variant?: 'sky' | 'amber' | 'blue' | 'purple';
    pulse?: boolean;
  };
  subtitle: string;
  rightActions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  iconGradient = 'from-[#2962FF] to-[#1D4ED8]',
  title,
  badge,
  subtitle,
  rightActions,
}) => {
  const getBadgeStyle = () => {
    switch (badge?.variant) {
      case 'amber':
        return 'bg-amber-500/15 text-[#F59E0B] border-amber-500/30';
      case 'blue':
        return 'bg-blue-500/15 text-[#60A5FA] border-blue-500/30';
      case 'purple':
        return 'bg-purple-500/15 text-[#C084FC] border-purple-500/30';
      case 'sky':
      default:
        return 'bg-sky-500/15 text-[#38BDF8] border-sky-500/30';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
      {/* Left: Standardized Icon + Title + Badge + Subtitle */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${iconGradient} border border-blue-400/20 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0`}
        >
          <Icon size={22} className="sm:w-6 sm:h-6" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              {title}
            </h1>

            {badge && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getBadgeStyle()}`}
              >
                {badge.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                <span>{badge.text}</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5 line-clamp-1 sm:line-clamp-none font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions slot (search, filters, toggles, buttons) */}
      {rightActions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {rightActions}
        </div>
      )}
    </div>
  );
};
