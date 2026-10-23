import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { BrazilFlag } from './common/BrazilFlag';

export const AssetsTable: React.FC = () => {
  const { assets, activeAsset, setActiveAsset } = useMarket();
  const [activeTab, setActiveTab] = useState<'todas' | 'mais_compradas' | 'maiores_altas' | 'fiis'>('todas');

  const filteredAssets = assets.filter(a => {
    if (activeTab === 'fiis') return a.category === 'fiis';
    if (activeTab === 'maiores_altas') return a.changePercent > 0;
    return true;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (activeTab === 'maiores_altas') return b.changePercent - a.changePercent;
    if (activeTab === 'mais_compradas') return (b.tradesCount || 0) - (a.tradesCount || 0);
    return 0;
  });

  return (
    <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Table Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3.5">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          Todas as Ações da B3
          <span className="text-xs text-[#64748B] font-mono">({assets.length})</span>
        </h3>

        {/* Tab Controls */}
        <div className="flex items-center bg-[#0B0F19] p-1 rounded-xl border border-[#1E293B] overflow-x-auto">
          <button
            onClick={() => setActiveTab('todas')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'todas'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveTab('mais_compradas')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'mais_compradas'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Mais Compradas
          </button>
          <button
            onClick={() => setActiveTab('maiores_altas')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'maiores_altas'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Maiores Altas
          </button>
          <button
            onClick={() => setActiveTab('fiis')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'fiis'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            FIIs
          </button>
        </div>
      </div>

      {/* Asset Rows List */}
      <div className="divide-y divide-[#1E293B]/60 max-h-[300px] overflow-y-auto pr-1">
        {sortedAssets.map(asset => {
          const isActive = asset.symbol === activeAsset.symbol;
          const isPositive = asset.changePercent >= 0;

          return (
            <div
              key={asset.symbol}
              onClick={() => setActiveAsset(asset)}
              className={`py-3 px-3 rounded-xl flex items-center justify-between transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#141C2E] border border-blue-500/30'
                  : 'hover:bg-[#121A2B]'
              }`}
            >
              {/* Asset Identity */}
              <div className="flex items-center gap-3">
                <BrazilFlag size="sm" />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-sm text-white group-hover:text-[#60A5FA] transition-colors">
                      {asset.symbol}
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-[#60A5FA] font-bold">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#94A3B8] truncate max-w-[140px] sm:max-w-[220px]">
                    {asset.name}
                  </span>
                </div>
              </div>

              {/* Price & Change */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end font-mono">
                  <span className="text-sm font-bold text-white">
                    R$ {asset.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 ${
                      isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
                    }`}
                  >
                    {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {isPositive ? `+${asset.changePercent.toFixed(2)}%` : `${asset.changePercent.toFixed(2)}%`}
                  </span>
                </div>

                {/* Volume (hidden on small screens) */}
                <span className="hidden md:block text-xs font-mono text-[#64748B] w-20 text-right">
                  {asset.volume}
                </span>

                {/* Action button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveAsset(asset);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#2962FF] text-white shadow-sm'
                      : 'bg-[#161F33] text-[#94A3B8] group-hover:text-white group-hover:bg-[#1E293B]'
                  }`}
                >
                  <span>{isActive ? 'Selecionado' : 'Selecionar'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
