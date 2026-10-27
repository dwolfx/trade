import React from 'react';
import { LucideIcon, TrendingUp, Wallet, Coins, CalendarDays, Newspaper, Zap, Flame } from 'lucide-react';
import { ActiveNav } from '../../types/market';

export interface PageDefinition {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: 'sky' | 'amber' | 'blue';
    pulse?: boolean;
  };
}

/**
 * SINGLE SOURCE OF TRUTH (Design System Registry)
 * Todas as páginas, seus títulos, ícones, subtítulos e badges padrão
 * estão consolidados neste único registro central.
 */
export const PAGES_REGISTRY: Record<ActiveNav, PageDefinition> = {
  bolsa: {
    icon: TrendingUp,
    title: 'Bolsa de Valores B3',
    subtitle: 'Cotações em tempo real, candlesticks e livro de ofertas de Ações e FIIs',
    badge: {
      text: 'MERCADO AO VIVO',
      variant: 'sky',
      pulse: true,
    },
  },
  carteira: {
    icon: Wallet,
    title: 'Minha Carteira Consolidada',
    subtitle: 'Visão consolidada do seu patrimônio: Ações, FIIs, Renda Fixa e Dividendos',
    badge: {
      text: 'CONTA REAL B3',
      variant: 'sky',
      pulse: true,
    },
  },
  cripto: {
    icon: Coins,
    title: 'Criptoativos 24/7',
    subtitle: 'Mercado global sem interrupção · Liquidez em tempo real Binance Spot',
    badge: {
      text: 'AO VIVO 24/7',
      variant: 'sky',
      pulse: true,
    },
  },
  dividendos: {
    icon: CalendarDays,
    title: 'Calendário & Mapa de Dividendos',
    subtitle: 'Previsão de proventos de Ações e FIIs da sua custódia, favoritos e mapa de datas-com de todo o mercado',
    badge: {
      text: 'Pinga-Pinga B3 & Internacional',
      variant: 'sky',
      pulse: true,
    },
  },
  noticias: {
    icon: Newspaper,
    title: 'Terminal de Notícias & Fatos Relevantes',
    subtitle: 'Agregador de baixa latência: InfoMoney, G1 Economia, Brazil Journal e CoinDesk',
    badge: {
      text: 'AO VIVO',
      variant: 'sky',
      pulse: true,
    },
  },
  daytrade: {
    icon: Zap,
    title: 'Day Trade Cockpit',
    subtitle: 'Ambiente de alta densidade para mini-índice (WIN) e mini-dólar (WDO) com margem reduzida',
    badge: {
      text: 'FASE 3 · EM DESENVOLVIMENTO',
      variant: 'amber',
      pulse: true,
    },
  },
  heatmap: {
    icon: Flame,
    title: 'Mapa de Calor de Mercado (Heatmap)',
    subtitle: 'Visualização proporcional por Market Cap e variação percentual dos setores da B3 e Criptoativos',
    badge: {
      text: 'FINVIZ STYLE · REALTIME',
      variant: 'sky',
      pulse: true,
    },
  },
};

export interface PageHeaderProps {
  page?: ActiveNav;
  icon?: LucideIcon;
  iconGradient?: string;
  title?: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'sky' | 'amber' | 'blue' | 'purple';
    pulse?: boolean;
  };
  rightActions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  icon: explicitIcon,
  iconGradient = 'from-[#2962FF] to-[#1D4ED8]',
  title: explicitTitle,
  subtitle: explicitSubtitle,
  badge: explicitBadge,
  rightActions,
}) => {
  // Resolve metadata from central registry if page id is provided
  const config = page ? PAGES_REGISTRY[page] : undefined;

  const Icon = explicitIcon || config?.icon || TrendingUp;
  const title = explicitTitle || config?.title || '';
  const subtitle = explicitSubtitle || config?.subtitle || '';
  const badge = explicitBadge !== undefined ? explicitBadge : config?.badge;

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
