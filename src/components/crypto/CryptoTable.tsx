import React, { useState } from 'react';
import { CryptoAsset, CryptoCategory, CryptoQuoteCurrency } from '../../types/crypto';
import { Search, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { formatBRL } from '../../utils/formatters';

interface CryptoTableProps {
  assets: CryptoAsset[];
  activeAsset: CryptoAsset;
  onSelectAsset: (asset: CryptoAsset) => void;
  quoteCurrency: CryptoQuoteCurrency;
}

export const CryptoTable: React.FC<CryptoTableProps> = ({
  assets,
  activeAsset,
  onSelectAsset,
  quoteCurrency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CryptoCategory>('todos');

  const categories: { id: CryptoCategory; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'top', label: 'Top 10' },
    { id: 'layer1', label: 'Layer 1' },
    { id: 'defi', label: 'DeFi' },
    { id: 'meme', label: 'Memes' },
    { id: 'stablecoin', label: 'Stablecoins' },
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.baseAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'todos' || asset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatPrice = (val: number) => {
    if (quoteCurrency === 'BRL') {
      return formatBRL(val);
    }
    return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: val < 1 ? 4 : 2 })}`;
  };

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Table Header: Search & Category Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#1E293B] text-white shadow-sm border border-blue-500/20'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#141C2E]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-2.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar criptoativo..."
            className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#2962FF]"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              <th className="py-2.5 px-3">Ativo</th>
              <th className="py-2.5 px-3">Preço</th>
              <th className="py-2.5 px-3">Variação 24h</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Máx 24h</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">Mín 24h</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Volume 24h</th>
              <th className="py-2.5 px-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/40 text-xs font-mono">
            {filteredAssets.map(asset => {
              const isActive = asset.symbol === activeAsset.symbol;
              const isPositive = asset.changePercent24h >= 0;

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className={`cursor-pointer transition-colors ${
                    isActive ? 'bg-[#141C2E]' : 'hover:bg-[#121A2B]'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{asset.baseAsset}</span>
                      <span className="text-[10px] text-[#94A3B8] font-sans truncate max-w-[100px]">{asset.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                    {formatPrice(asset.price)}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        isPositive ? 'text-[#10B981] bg-emerald-500/10' : 'text-[#F43F5E] bg-rose-500/10'
                      }`}
                    >
                      {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[#94A3B8] hidden sm:table-cell whitespace-nowrap">
                    {formatPrice(asset.high24h)}
                  </td>

                  <td className="py-3 px-3 text-[#94A3B8] hidden sm:table-cell whitespace-nowrap">
                    {formatPrice(asset.low24h)}
                  </td>

                  <td className="py-3 px-3 text-[#64748B] hidden md:table-cell whitespace-nowrap">
                    {quoteCurrency === 'BRL' ? 'R$' : '$'} {(asset.quoteVolume24h / 1e6).toFixed(1)}M
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(asset);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-sans inline-flex items-center gap-1 transition-all ${
                        isActive
                          ? 'bg-[#2962FF] text-white shadow-sm'
                          : 'bg-[#161F33] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                      }`}
                    >
                      <span>{isActive ? 'No Gráfico' : 'Operar'}</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
