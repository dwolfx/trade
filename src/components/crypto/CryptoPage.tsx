import React, { useState, useEffect } from 'react';
import { CryptoAsset, CryptoQuoteCurrency, FearAndGreedData } from '../../types/crypto';
import { fetchLiveCryptoAssets, fetchFearAndGreedIndex } from '../../services/binanceService';
import { CryptoFeaturedCards } from './CryptoFeaturedCards';
import { CryptoChart } from './CryptoChart';
import { CryptoOrderPad } from './CryptoOrderPad';
import { CryptoTable } from './CryptoTable';
import { Coins, Flame, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { ActiveNav } from '../../types/market';

interface CryptoPageProps {
  onNavigate?: (nav: ActiveNav) => void;
}

export const CryptoPage: React.FC<CryptoPageProps> = ({ onNavigate }) => {
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
      {/* Standardized Page Header */}
      <PageHeader
        icon={Coins}
        iconGradient="from-purple-600 to-indigo-500"
        title="Criptoativos 24/7"
        badge={{
          text: 'AO VIVO 24/7',
          variant: 'sky',
          pulse: true,
        }}
        subtitle="Mercado global sem interrupção · Liquidez em tempo real Binance Spot"
        rightActions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {onNavigate && (
              <button
                onClick={() => onNavigate('bolsa')}
                className="px-3.5 py-2 rounded-xl bg-[#161F33] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-white transition-all flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Voltar à Bolsa</span>
              </button>
            )}

            {fearAndGreed && (
              <div
                className="flex items-center gap-2 bg-[#0F1523] border border-[#1E293B] px-3 py-1.5 rounded-xl text-xs"
                title="Índice de Medo e Ganância do Mercado Cripto"
              >
                <Flame size={14} className="text-[#F59E0B]" />
                <span className="text-[#94A3B8] font-medium hidden sm:inline">Sentimento:</span>
                <strong className="text-white font-mono">{fearAndGreed.value}/100</strong>
                <span className="text-[11px] text-[#F59E0B] font-bold">
                  ({fearAndGreed.classification})
                </span>
              </div>
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

      {/* Featured Cards (BTC, ETH, SOL, USDT) */}
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
    </div>
  );
};
