import React, { useState, useEffect } from 'react';
import { CryptoAsset, CryptoQuoteCurrency, FearAndGreedData } from '../../types/crypto';
import { fetchLiveCryptoAssets, fetchFearAndGreedIndex } from '../../services/binanceService';
import { CryptoFeaturedCards } from './CryptoFeaturedCards';
import { CryptoChart } from './CryptoChart';
import { CryptoOrderPad } from './CryptoOrderPad';
import { CryptoTable } from './CryptoTable';
import { X } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { SearchAndExchange } from '../SearchAndExchange';
import { MobileQuickTradeBar } from '../common/MobileQuickTradeBar';
import { MarketSentimentBadge } from '../common/MarketSentimentBadge';
import { formatBRL } from '../../utils/formatters';
import { ActiveNav } from '../../types/market';

interface CryptoPageProps {
  onNavigate?: (nav: ActiveNav) => void;
}

export const CryptoPage: React.FC<CryptoPageProps> = () => {
  const [quoteCurrency, setQuoteCurrency] = useState<CryptoQuoteCurrency>('BRL');
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<CryptoAsset>(() => ({
    symbol: 'BTCBRL',
    baseAsset: 'BTC',
    quoteAsset: 'BRL',
    name: 'Bitcoin',
    price: 400000,
    changePercent24h: 1.25,
    changeValue24h: 5000,
    high24h: 405000,
    low24h: 395000,
    volume24h: 1200,
    quoteVolume24h: 480000000,
    category: 'top',
  }));
  const [fearAndGreed, setFearAndGreed] = useState<FearAndGreedData | null>(null);
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);

  // Load assets and Fear & Greed on mount & currency change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [cryptoList, fng] = await Promise.all([
        fetchLiveCryptoAssets(quoteCurrency),
        fetchFearAndGreedIndex(),
      ]);

      if (isMounted) {
        setAssets(cryptoList);
        setFearAndGreed(fng);

        // Keep active asset synced with new quote currency
        const match = cryptoList.find(a => a.baseAsset === activeAsset.baseAsset) || cryptoList[0];
        if (match) {
          setActiveAsset(match);
        }
      }
    }

    loadData();
    const interval = setInterval(loadData, 12000); // 12s live ticker polling

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [quoteCurrency]);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Centralized Page Header */}
      <PageHeader
        page="cripto"
        rightActions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {fearAndGreed && (
              <MarketSentimentBadge
                value={fearAndGreed.value}
                classification={fearAndGreed.classification}
                title="Índice de Medo e Ganância do Mercado Cripto (Alternative.me)"
              />
            )}

            {/* Currency Toggle (BRL vs USDT) */}
            <div className="flex items-center bg-[#0F1523] p-1 rounded-xl border border-[#1E293B]">
              <button
                onClick={() => setQuoteCurrency('BRL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  quoteCurrency === 'BRL'
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                🇧🇷 BRL (R$)
              </button>
              <button
                onClick={() => setQuoteCurrency('USDT')}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  quoteCurrency === 'USDT'
                    ? 'bg-[#2962FF] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#161F33]'
                }`}
              >
                🇺🇸 USDT ($)
              </button>
            </div>
          </div>
        }
      />

      {/* Search Input & Exchange Selector Dropdown */}
      <SearchAndExchange />

      {/* Featured Cards with 4 Tabs & Carousel */}
      <CryptoFeaturedCards
        assets={assets}
        activeAsset={activeAsset}
        onSelectAsset={setActiveAsset}
        quoteCurrency={quoteCurrency}
      />

      {/* Main Grid: Left Chart & Table (8 cols) | Right Order Pad (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <CryptoChart
            asset={activeAsset}
            allAssets={assets}
            quoteCurrency={quoteCurrency}
            onSelectAsset={setActiveAsset}
            onOpenOrder={() => setIsMobileOrderOpen(true)}
          />
          <CryptoTable
            assets={assets}
            activeAsset={activeAsset}
            onSelectAsset={setActiveAsset}
            quoteCurrency={quoteCurrency}
          />
        </div>

        {/* Right Sticky Order Pad */}
        <div className="lg:col-span-4 sticky top-24">
          <CryptoOrderPad
            asset={activeAsset}
            quoteCurrency={quoteCurrency}
          />
        </div>
      </div>

      {/* Mobile Floating Quick Trade Bar */}
      <MobileQuickTradeBar
        symbol={activeAsset.baseAsset}
        priceFormatted={
          quoteCurrency === 'BRL'
            ? formatBRL(activeAsset.price)
            : `$ ${activeAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
        changePercent={activeAsset.changePercent24h}
        changePercentFormatted={`${activeAsset.changePercent24h >= 0 ? '+' : ''}${activeAsset.changePercent24h.toFixed(2)}%`}
        icon="⚡"
        onOpenOrder={() => setIsMobileOrderOpen(true)}
      />

      {/* Mobile Quick Order Modal */}
      {isMobileOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F1523] border border-[#1E293B] rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsMobileOrderOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#161F33] text-[#94A3B8] hover:text-white flex items-center justify-center"
            >
              <X size={16} />
            </button>
            <CryptoOrderPad
              asset={activeAsset}
              quoteCurrency={quoteCurrency}
            />
          </div>
        </div>
      )}
    </div>
  );
};
