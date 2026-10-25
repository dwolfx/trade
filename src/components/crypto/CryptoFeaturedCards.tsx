import React from 'react';
import { CryptoAsset, CryptoQuoteCurrency } from '../../types/crypto';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { formatBRL } from '../../utils/formatters';

interface CryptoFeaturedCardsProps {
  assets: CryptoAsset[];
  activeAsset: CryptoAsset;
  onSelectAsset: (asset: CryptoAsset) => void;
  quoteCurrency: CryptoQuoteCurrency;
}

export const CryptoFeaturedCards: React.FC<CryptoFeaturedCardsProps> = ({
  assets,
  activeAsset,
  onSelectAsset,
  quoteCurrency,
}) => {
  const featuredSymbols = ['BTC', 'ETH', 'SOL', 'USDT'];
  const featured = featuredSymbols
    .map(sym => assets.find(a => a.baseAsset === sym))
    .filter((a): a is CryptoAsset => !!a);

  const formatPrice = (price: number) => {
    if (quoteCurrency === 'BRL') {
      return formatBRL(price);
    }
    return `$ ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCryptoIcon = (base: string) => {
    switch (base) {
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'SOL': return '◎';
      case 'USDT': return '₮';
      case 'BNB': return '🔶';
      case 'ADA': return '₳';
      default: return '🪙';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {featured.map(asset => {
        const isActive = asset.symbol === activeAsset.symbol;
        const isPositive = asset.changePercent24h >= 0;

        return (
          <div
            key={asset.symbol}
            onClick={() => onSelectAsset(asset)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
              isActive
                ? 'bg-[#141C2E] border-[#2962FF] ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
                : 'bg-[#0F1523] border-[#1E293B] hover:border-[#334155] hover:bg-[#121A2B]'
            }`}
          >
            {/* Header: Icon + Symbol + Name */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${
                  asset.baseAsset === 'BTC' ? 'bg-amber-500/20 text-[#F59E0B] border border-amber-500/30' :
                  asset.baseAsset === 'ETH' ? 'bg-indigo-500/20 text-[#818CF8] border border-indigo-500/30' :
                  asset.baseAsset === 'SOL' ? 'bg-sky-500/20 text-[#38BDF8] border border-sky-500/30' :
                  'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                }`}>
                  {getCryptoIcon(asset.baseAsset)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-white font-mono group-hover:text-[#60A5FA] transition-colors">
                      {asset.baseAsset}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161F33] text-[#94A3B8] font-mono">
                      /{quoteCurrency}
                    </span>
                  </div>
                  <span className="text-xs text-[#94A3B8] block truncate max-w-[120px]">
                    {asset.name}
                  </span>
                </div>
              </div>

              {isActive && (
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              )}
            </div>

            {/* Price & 24h variation */}
            <div className="my-3 flex items-baseline justify-between gap-2">
              <span className="text-xl font-bold font-mono tracking-tight text-white truncate">
                {formatPrice(asset.price)}
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-lg shrink-0 ${
                  isPositive
                    ? 'bg-sky-500/10 text-[#38BDF8] border border-sky-500/20'
                    : 'bg-rose-500/10 text-[#F43F5E] border border-rose-500/20'
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? `+${asset.changePercent24h.toFixed(2)}%` : `${asset.changePercent24h.toFixed(2)}%`}
              </span>
            </div>

            {/* Footer: 24h Volume & Quick operate button */}
            <div className="pt-2 border-t border-[#1E293B]/70 flex items-center justify-between text-[11px]">
              <span className="text-[#64748B] truncate max-w-[140px]">
                Vol 24h {quoteCurrency === 'BRL' ? 'R$' : '$'} {(asset.quoteVolume24h / 1e6).toFixed(1)}M
              </span>

              <button
                type="button"
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'bg-[#161F33] text-[#94A3B8] group-hover:text-white group-hover:bg-[#1E293B]'
                }`}
              >
                <span>{isActive ? 'No Gráfico' : 'Operar'}</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
