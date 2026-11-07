import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  headerRight?: React.ReactNode;
  subHeader?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  hideHeader?: boolean;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
}

const maxWidthMap: Record<NonNullable<ModalProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[96vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = '2xl',
  headerRight,
  subHeader,
  footer,
  children,
  className = '',
  bodyClassName = '',
  hideHeader = false,
  closeOnEsc = true,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = maxWidthMap[maxWidth] || 'max-w-2xl';

  return (
    <div
      className="tc-modal-backdrop animate-in fade-in duration-200"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`tc-modal-dialog ${maxWidthClass} max-h-[92vh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="tc-modal-header">
            <div className="flex items-center gap-3 min-w-0">
              {icon && <div className="shrink-0">{icon}</div>}
              <div className="min-w-0">
                {title && (
                  <div className="font-bold text-white text-base leading-snug truncate">
                    {title}
                  </div>
                )}
                {subtitle && (
                  <p className="text-xs text-[#94A3B8] mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                type="button"
                onClick={onClose}
                className="tc-modal-close"
                aria-label="Fechar"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {subHeader}

        <div className={`tc-modal-body ${bodyClassName}`}>{children}</div>

        {footer && <div className="tc-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
