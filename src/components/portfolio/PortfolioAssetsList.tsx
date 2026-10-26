import React, { useState, useMemo } from 'react';
import { PortfolioPosition, NonEquityAsset } from '../../types/market';
import {
  TrendingUp,
  TrendingDown,
  Search,
  ExternalLink,
  Landmark,
  Zap,
  PiggyBank,
  Building2,
  TrendingUpDown,
} from 'lucide-react';
import { SearchBar } from '../common/SearchBar';
import { EmptyState } from '../common/EmptyState';

interface PortfolioAssetsListProps {
  portfolio: PortfolioPosition[];
  nonEquityAssets: NonEquityAsset[];
  showBalance: boolean;
  onTradeAsset: (symbol: string) => void;
  onClosePosition: (symbol: string, quantity: number, currentPrice: number) => void;
  selectedCategoryFilter?: string;
  onSelectCategoryFilter?: (cat: string) => void;
}

export const PortfolioAssetsList: React.FC<PortfolioAssetsListProps> = ({
  portfolio,
  nonEquityAssets,
  showBalance,
  onTradeAsset,
  onClosePosition,
  selectedCategoryFilter = 'todos',
  onSelectCategoryFilter,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategoryFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync if parent passes changed category
  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setActiveCategory(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    onSelectCategoryFilter?.(cat);
  };

  const formatCurrency = (val: number) => {
    if (!showBalance) return '••••••••••';
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Combine equity and non-equity assets into unified items
  const combinedItems = useMemo(() => {
    const equityList = portfolio.map(p => {
      const isFII = p.symbol.endsWith('11');
      return {
        id: p.symbol,
        symbol: p.symbol,
        name: p.name,
        category: (isFII ? 'fiis' : 'acoes') as 'acoes' | 'fiis' | 'cdb' | 'poupanca' | 'daytrade',
        quantity: p.quantity,
        avgPrice: p.avgPrice,
        currentPrice: p.currentPrice,
        totalInvested: p.totalInvested,
        currentValue: p.currentValue,
        plValue: p.plValue,
        plPercent: p.plPercent,
        institution: 'B3 Brasil Bolsa Balcão',
        extraInfo: isFII ? 'Fundo Imobiliário' : 'Ações B3',
        isEquity: true,
      };
    });

    const nonEquityList = nonEquityAssets.map(ne => ({
      id: ne.id,
      symbol: ne.name.split(' ')[0],
      name: ne.name,
      category: ne.category,
      quantity: 1,
      avgPrice: ne.investedAmount,
      currentPrice: ne.currentAmount,
      totalInvested: ne.investedAmount,
      currentValue: ne.currentAmount,
      plValue: ne.plValue,
      plPercent: ne.plPercent,
      institution: ne.institution,
      extraInfo: ne.rateDescription,
      isEquity: false,
      liquidity: ne.liquidity,
    }));

    return [...equityList, ...nonEquityList];
  }, [portfolio, nonEquityAssets]);

  // Filtered by category & query
  const filteredItems = useMemo(() => {
    return combinedItems.filter(item => {
      const matchesCategory =
        activeCategory === 'todos' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.institution.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [combinedItems, activeCategory, searchQuery]);

  const categories = [
    { key: 'todos', label: 'Todos os Ativos', count: combinedItems.length },
    {
      key: 'acoes',
      label: 'Ações (Stocks)',
      count: combinedItems.filter(i => i.category === 'acoes').length,
    },
    {
      key: 'fiis',
      label: 'FIIs',
      count: combinedItems.filter(i => i.category === 'fiis').length,
    },
    {
      key: 'cdb',
      label: 'CDB & Renda Fixa',
      count: combinedItems.filter(i => i.category === 'cdb').length,
    },
    {
      key: 'poupanca',
      label: 'Poupança / Caixa',
      count: combinedItems.filter(i => i.category === 'poupanca').length,
    },
    {
      key: 'daytrade',
      label: 'Alocação Daytrade',
      count: combinedItems.filter(i => i.category === 'daytrade').length,
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B] flex flex-col gap-5">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]/60">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <span>Ativos em Custódia & Alocações</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#161F33] text-[#60A5FA] border border-blue-500/20 font-mono">
              {filteredItems.length} posições
            </span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Gerencie e monitore cada ativo separado por tipo e classe de investimento
          </p>
        </div>

        {/* Search input */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por código ou ativo..."
          className="w-full md:w-72"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeCategory === cat.key
                ? 'bg-[#2962FF] text-white shadow-md shadow-blue-600/20'
                : 'bg-[#141C2E] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] border border-[#1E293B]/50'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-[#1E293B] text-[#64748B]'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Assets Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
              <th className="pb-3 pl-3">Ativo / Código</th>
              <th className="pb-3">Tipo / Instituição</th>
              <th className="pb-3 text-right">Qtd / Cotas</th>
              <th className="pb-3 text-right">Preço Médio / Taxa</th>
              <th className="pb-3 text-right">Preço Atual / Saldo</th>
              <th className="pb-3 text-right">Total Investido</th>
              <th className="pb-3 text-right">Valor de Mercado</th>
              <th className="pb-3 text-right">Lucro / Prejuízo (P&L)</th>
              <th className="pb-3 pr-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/50">
            {filteredItems.map(item => {
              const isPositive = item.plValue >= 0;

              return (
                <tr
                  key={item.id}
                  onClick={() => item.isEquity && onTradeAsset(item.symbol)}
                  className={`hover:bg-[#141C2E]/70 transition-colors group text-xs font-mono ${
                    item.isEquity ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Symbol & Name */}
                  <td className="py-3.5 pl-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#161F33] border border-[#1E293B] flex items-center justify-center font-bold text-white text-xs">
                        {item.symbol.slice(0, 4)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{item.symbol}</span>
                          {item.category === 'fiis' && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-500/15 text-[#C084FC]">
                              FII
                            </span>
                          )}
                          {item.category === 'acoes' && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-blue-500/15 text-[#60A5FA]">
                              AÇÃO
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] font-sans truncate max-w-[160px]">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Institution */}
                  <td className="py-3.5 font-sans">
                    <div className="text-white font-medium flex items-center gap-1.5">
                      {item.category === 'cdb' && <Landmark size={13} className="text-[#38BDF8]" />}
                      {item.category === 'poupanca' && <PiggyBank size={13} className="text-[#06B6D4]" />}
                      {item.category === 'daytrade' && <Zap size={13} className="text-[#F59E0B]" />}
                      {item.category === 'fiis' && <Building2 size={13} className="text-[#C084FC]" />}
                      {item.category === 'acoes' && <TrendingUpDown size={13} className="text-[#60A5FA]" />}
                      <span>{item.extraInfo}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">{item.institution}</div>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 text-right font-bold text-white">
                    {item.isEquity ? item.quantity : '—'}
                  </td>

                  {/* Avg Price / Rate */}
                  <td className="py-3.5 text-right text-[#94A3B8]">
                    {item.isEquity
                      ? `R$ ${item.avgPrice.toFixed(2)}`
                      : item.extraInfo}
                  </td>

                  {/* Current Price */}
                  <td className="py-3.5 text-right font-bold text-white">
                    {item.isEquity
                      ? `R$ ${item.currentPrice.toFixed(2)}`
                      : formatCurrency(item.currentValue)}
                  </td>

                  {/* Total Invested */}
                  <td className="py-3.5 text-right text-[#94A3B8]">
                    {formatCurrency(item.totalInvested)}
                  </td>

                  {/* Current Total Value */}
                  <td className="py-3.5 text-right font-bold text-white">
                    {formatCurrency(item.currentValue)}
                  </td>

                  {/* P&L */}
                  <td className="py-3.5 text-right">
                    <div
                      className={`font-bold flex items-center justify-end gap-1 ${
                        isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
                      }`}
                    >
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>
                        {isPositive ? '+' : ''}
                        {formatCurrency(item.plValue)}
                      </span>
                    </div>
                    <div
                      className={`text-[10px] ${
                        isPositive ? 'text-[#38BDF8]' : 'text-[#F43F5E]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {item.plPercent.toFixed(2)}%
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 pr-3 text-right">
                    <div className="flex items-center justify-end gap-2 font-sans">
                      {item.isEquity ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTradeAsset(item.symbol);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#161F33] hover:bg-[#2962FF] text-[#60A5FA] hover:text-white border border-blue-500/20 text-xs font-semibold transition-all flex items-center gap-1"
                            title="Operar no Gráfico & Boleta"
                          >
                            <span>Operar</span>
                            <ExternalLink size={12} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClosePosition(item.symbol, item.quantity, item.currentPrice);
                            }}
                            className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[#F43F5E] border border-rose-500/20 text-xs font-semibold transition-all"
                            title="Zerar posição a mercado"
                          >
                            Zerar
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#64748B] px-2 py-1 bg-[#141C2E] rounded border border-[#1E293B]">
                          Custódia Ativa
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <EmptyState
          icon={Search}
          title="Nenhum ativo encontrado"
          description="Nenhum ativo encontrado para os filtros selecionados. Tente alterar a categoria ou limpar a busca."
        />
      )}
    </div>
  );
};
