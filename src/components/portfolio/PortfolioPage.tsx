import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { PortfolioKPIs } from './PortfolioKPIs';
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart';
import { PortfolioAllocationChart, AllocationCategoryItem } from './PortfolioAllocationChart';
import { PortfolioStocksPerformance } from './PortfolioStocksPerformance';
import { PortfolioDividendsSection } from './PortfolioDividendsSection';
import { PortfolioAssetsList } from './PortfolioAssetsList';
import { OrderModal } from '../order/OrderModal';
import { PageHeader } from '../common/PageHeader';
import {
  INITIAL_NON_EQUITY_ASSETS,
  UPCOMING_DIVIDENDS,
  RECENT_PAID_DIVIDENDS,
} from '../../data/mockPortfolioData';
import { ActiveNav } from '../../types/market';
import { Wallet, ArrowLeft, PlusCircle } from 'lucide-react';

interface PortfolioPageProps {
  onNavigate: (nav: ActiveNav) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onNavigate }) => {
  const {
    portfolio,
    executeOrder,
    showBalance,
    mode,
  } = useMarket();

  const [nonEquityAssets] = useState(INITIAL_NON_EQUITY_ASSETS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [tradingSymbol, setTradingSymbol] = useState<string | undefined>(undefined);

  // Total Equity Value & Cost
  const equityInvested = useMemo(() => {
    return portfolio.reduce((acc, p) => acc + p.totalInvested, 0);
  }, [portfolio]);

  const equityCurrentValue = useMemo(() => {
    return portfolio.reduce((acc, p) => acc + p.currentValue, 0);
  }, [portfolio]);

  // Non-equity values
  const nonEquityInvested = useMemo(() => {
    return nonEquityAssets.reduce((acc, ne) => acc + ne.investedAmount, 0);
  }, [nonEquityAssets]);

  const nonEquityCurrentValue = useMemo(() => {
    return nonEquityAssets.reduce((acc, ne) => acc + ne.currentAmount, 0);
  }, [nonEquityAssets]);

  // Consolidated values
  const totalPatrimony = equityCurrentValue + nonEquityCurrentValue;
  const totalInvested = equityInvested + nonEquityInvested;
  const totalPL = totalPatrimony - totalInvested;
  const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  // Breakdown by Category for Allocation Chart
  const allocationCategories = useMemo<AllocationCategoryItem[]>(() => {
    // 1. Stocks (Ações B3)
    const stocksVal = portfolio
      .filter(p => !p.symbol.endsWith('11'))
      .reduce((acc, p) => acc + p.currentValue, 0);

    // 2. FIIs
    const fiisVal = portfolio
      .filter(p => p.symbol.endsWith('11'))
      .reduce((acc, p) => acc + p.currentValue, 0);

    // 3. CDB & Fixed Income
    const cdbVal = nonEquityAssets
      .filter(ne => ne.category === 'cdb')
      .reduce((acc, ne) => acc + ne.currentAmount, 0);

    // 4. Poupança
    const poupVal = nonEquityAssets
      .filter(ne => ne.category === 'poupanca')
      .reduce((acc, ne) => acc + ne.currentAmount, 0);

    // 5. Daytrade margin
    const dtVal = nonEquityAssets
      .filter(ne => ne.category === 'daytrade')
      .reduce((acc, ne) => acc + ne.currentAmount, 0);

    return [
      {
        key: 'acoes',
        label: 'Ações B3 (Stocks)',
        value: stocksVal,
        color: '#3B82F6', // Blue
        description: 'Empresas listadas na Bolsa de Valores',
      },
      {
        key: 'fiis',
        label: 'Fundos Imobiliários (FIIs)',
        value: fiisVal,
        color: '#A855F7', // Purple
        description: 'Rendimentos mensais isentos de IR',
      },
      {
        key: 'cdb',
        label: 'CDB & Renda Fixa',
        value: cdbVal,
        color: '#06B6D4', // Cyan
        description: 'Pós-fixados 102% CDI e Selic',
      },
      {
        key: 'poupanca',
        label: 'Poupança / Reserva',
        value: poupVal,
        color: '#38BDF8', // Light Blue / Sky
        description: 'Liquidez imediata para oportunidades',
      },
      {
        key: 'daytrade',
        label: 'Margem Daytrade',
        value: dtVal,
        color: '#F59E0B', // Amber
        description: 'Alocado para operações rápidas no intraday',
      },
    ];
  }, [portfolio, nonEquityAssets]);

  // Macro allocation: 3 Pillars (Ações vs FIIs vs Renda Fixa & Caixa)
  const stocksValue = useMemo(() => {
    return portfolio
      .filter(p => !p.symbol.endsWith('11'))
      .reduce((acc, p) => acc + p.currentValue, 0);
  }, [portfolio]);

  const fiisValue = useMemo(() => {
    return portfolio
      .filter(p => p.symbol.endsWith('11'))
      .reduce((acc, p) => acc + p.currentValue, 0);
  }, [portfolio]);

  const stocksPercent = totalPatrimony > 0 ? (stocksValue / totalPatrimony) * 100 : 0;
  const fiisPercent = totalPatrimony > 0 ? (fiisValue / totalPatrimony) * 100 : 0;
  const fixedIncomePercent = totalPatrimony > 0 ? (nonEquityCurrentValue / totalPatrimony) * 100 : 0;

  // Upcoming dividends total
  const upcomingDividendsTotal = useMemo(() => {
    return UPCOMING_DIVIDENDS.reduce((acc, d) => acc + d.totalAmount, 0);
  }, []);

  // Handlers
  const handleTradeAsset = (symbol: string) => {
    setTradingSymbol(symbol);
    setIsOrderModalOpen(true);
  };

  const handleClosePosition = (symbol: string, quantity: number, currentPrice: number) => {
    executeOrder({
      symbol,
      side: 'sell',
      type: 'market',
      quantity,
      price: currentPrice,
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Standardized Page Header */}
      <PageHeader
        icon={Wallet}
        title="Minha Carteira Consolidada"
        badge={{
          text: mode === 'DEMO' ? 'SIMULADOR B3' : 'CONTA REAL B3',
          variant: mode === 'DEMO' ? 'amber' : 'sky',
          pulse: true,
        }}
        subtitle="Visão consolidada do seu patrimônio: Ações, FIIs, Renda Fixa e Dividendos"
        rightActions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('bolsa')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-medium text-[#94A3B8] hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Home Broker</span>
            </button>
            <button
              onClick={() => {
                setTradingSymbol(undefined);
                setIsOrderModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2962FF] hover:bg-[#1D4ED8] text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-all"
            >
              <PlusCircle size={14} />
              <span>Nova Ordem</span>
            </button>
          </div>
        }
      />

      {/* 1. KPIs Row */}
      <PortfolioKPIs
        totalPatrimony={totalPatrimony}
        totalInvested={totalInvested}
        totalPL={totalPL}
        totalPLPercent={totalPLPercent}
        upcomingDividendsTotal={upcomingDividendsTotal}
        stocksPercent={stocksPercent}
        fiisPercent={fiisPercent}
        fixedIncomePercent={fixedIncomePercent}
        showBalance={showBalance}
        mode={mode}
      />

      {/* 2. Top Charts Grid (Evolução / P&L + Alocação Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Performance & P&L Curve */}
        <div className="lg:col-span-7 h-full">
          <PortfolioPerformanceChart
            showBalance={showBalance}
            totalPatrimony={totalPatrimony}
            totalPL={totalPL}
          />
        </div>

        {/* Right: Asset Allocation Donut */}
        <div className="lg:col-span-5 h-full">
          <PortfolioAllocationChart
            categories={allocationCategories}
            totalPatrimony={totalPatrimony}
            showBalance={showBalance}
            selectedCategory={selectedCategoryFilter}
            onSelectCategory={cat => setSelectedCategoryFilter(cat)}
          />
        </div>
      </div>

      {/* 3. Middle Grid (Stocks Performance + Dividends Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: How are my stocks doing */}
        <div className="lg:col-span-6 h-full">
          <PortfolioStocksPerformance
            positions={portfolio}
            nonEquityAssets={nonEquityAssets}
            onSelectAsset={handleTradeAsset}
            showBalance={showBalance}
          />
        </div>

        {/* Right: Upcoming Dividends + Last 3 Paid */}
        <div className="lg:col-span-6 h-full">
          <PortfolioDividendsSection
            upcomingDividends={UPCOMING_DIVIDENDS}
            recentPaidDividends={RECENT_PAID_DIVIDENDS}
            showBalance={showBalance}
          />
        </div>
      </div>

      {/* 4. Categorized Assets Table / Custody */}
      <PortfolioAssetsList
        portfolio={portfolio}
        nonEquityAssets={nonEquityAssets}
        showBalance={showBalance}
        onTradeAsset={handleTradeAsset}
        onClosePosition={handleClosePosition}
        selectedCategoryFilter={selectedCategoryFilter}
        onSelectCategoryFilter={setSelectedCategoryFilter}
      />

      {/* Modal Independente de Ordem / Boleta */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        symbol={tradingSymbol}
      />
    </div>
  );
};
