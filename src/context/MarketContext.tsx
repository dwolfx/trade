import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StockAsset, ExecutedOrder, PortfolioPosition, Timeframe, FeaturedTab, OrderSide, OrderType } from '../types/market';
import { INITIAL_ASSETS, INITIAL_PORTFOLIO, INITIAL_LIVE_PORTFOLIO } from '../data/mockAssets';
import { generateInitialCandles } from '../utils/candleGenerator';
import { fetchBrapiQuote, getTimeframeParams } from '../services/brapiService';
import { fetchYahooCandles } from '../services/yahooFinanceService';
import { Candle } from '../types/market';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getB3MarketStatus, MarketStatus } from '../utils/marketStatus';

interface MarketContextType {
  mode: 'DEMO' | 'LIVE';
  setMode: (mode: 'DEMO' | 'LIVE') => void;
  showBalance: boolean;
  setShowBalance: (show: boolean | ((prev: boolean) => boolean)) => void;
  demoBalance: number;
  liveBalance: number;
  activeAsset: StockAsset;
  setActiveAsset: (asset: StockAsset) => void;
  selectOrCreateAsset: (symbol: string, initialData?: Partial<StockAsset>) => Promise<void>;
  assets: StockAsset[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedExchange: string;
  setSelectedExchange: (ex: string) => void;
  featuredTab: FeaturedTab;
  setFeaturedTab: (tab: FeaturedTab) => void;
  toggleFavorite: (symbol: string) => void;
  recentSymbols: string[];
  favoriteSymbols: string[];
  multiChartSymbols: [string, string, string, string];
  setMultiChartSlot: (slotIndex: number, symbol: string) => void;
  portfolio: PortfolioPosition[];
  orders: ExecutedOrder[];
  executeOrder: (params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity: number;
    price: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => { success: boolean; message: string };
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  candles: Candle[];
  isMultiChart: boolean;
  setIsMultiChart: (multi: boolean | ((prev: boolean) => boolean)) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  marketStatus: MarketStatus;
  isLoadingCandles: boolean;
  prefetchAsset: (symbol: string) => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useLocalStorage<'DEMO' | 'LIVE'>('tradecraft_mode', 'DEMO');
  const [showBalance, setShowBalance] = useLocalStorage<boolean>('tradecraft_show_balance', true);
  const [demoBalance, setDemoBalance] = useLocalStorage<number>('tradecraft_demo_balance', 50000.00);
  const [liveBalance, setLiveBalance] = useLocalStorage<number>('tradecraft_live_balance', 12840.50);

  const [assets, setAssets] = useLocalStorage<StockAsset[]>('tradecraft_assets', INITIAL_ASSETS);
  const [activeSymbol, setActiveSymbol] = useLocalStorage<string>('tradecraft_active_symbol', 'PETR4');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExchange, setSelectedExchange] = useLocalStorage<string>('tradecraft_exchange', 'B3');
  
  // Bug 2: Default selected tab MUST BE 'portfolio' (Minha carteira)!
  const [featuredTab, setFeaturedTab] = useLocalStorage<FeaturedTab>('tradecraft_featured_tab', 'portfolio');
  
  // Default timeframe is '1D', and user selection is preserved across token changes!
  const [timeframe, setTimeframe] = useLocalStorage<Timeframe>('tradecraft_timeframe', '1D');
  const [isMultiChart, setIsMultiChart] = useLocalStorage<boolean>('tradecraft_is_multichart', false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(false);

  // Bug 2 & 3: Recent searches starts completely empty if no user history!
  const [recentSymbols, setRecentSymbols] = useLocalStorage<string[]>('tradecraft_recent_symbols', []);

  // Bug 3: Favorites starts completely clean from user explicit actions!
  const [favoriteSymbols, setFavoriteSymbols] = useLocalStorage<string[]>('tradecraft_favorite_symbols', []);

  // 4 Slots for Multi-Gráfico (2x2)
  const [multiChartSymbols, setMultiChartSymbols] = useLocalStorage<[string, string, string, string]>(
    'tradecraft_multichart_slots',
    ['PETR4', 'VALE3', 'ITUB4', 'WEGE3']
  );

  // Separate Portfolios for DEMO and LIVE accounts
  const [demoPortfolio, setDemoPortfolio] = useLocalStorage<Record<string, { quantity: number; avgPrice: number }>>(
    'tradecraft_portfolio_demo',
    INITIAL_PORTFOLIO
  );

  const [livePortfolio, setLivePortfolio] = useLocalStorage<Record<string, { quantity: number; avgPrice: number }>>(
    'tradecraft_portfolio_live',
    INITIAL_LIVE_PORTFOLIO
  );

  // Current active raw portfolio depends strictly on selected mode!
  const rawPortfolio = useMemo(() => {
    return mode === 'DEMO' ? demoPortfolio : livePortfolio;
  }, [mode, demoPortfolio, livePortfolio]);

  const [orders, setOrders] = useLocalStorage<ExecutedOrder[]>('tradecraft_orders', [
    {
      id: 'ORD-101',
      symbol: 'PETR4',
      side: 'buy',
      type: 'market',
      quantity: 100,
      price: 56.50,
      total: 5650.00,
      fees: 1.70,
      timestamp: Date.now() - 3600000 * 2,
      mode: 'DEMO'
    }
  ]);

  // Bug 4: Market status (Open or Closed)
  const marketStatus = useMemo(() => getB3MarketStatus(), []);

  const activeAsset = useMemo(() => {
    return assets.find(a => a.symbol === activeSymbol) || assets[0] || INITIAL_ASSETS[0];
  }, [assets, activeSymbol]);

  // Initial Candles for active asset
  const [candles, setCandles] = useState<Candle[]>(() => {
    return generateInitialCandles(activeAsset?.price || 57.83, '1D', 40);
  });

  // Helper to register recent symbol view
  const markAsRecent = useCallback((symbol: string) => {
    setRecentSymbols(prev => {
      const filtered = prev.filter(s => s !== symbol);
      return [symbol, ...filtered].slice(0, 10);
    });
  }, [setRecentSymbols]);

  // Set active asset (maintains selected timeframe) + mark recent
  const handleSetActiveAsset = useCallback((asset: StockAsset) => {
    setActiveSymbol(asset.symbol);
    markAsRecent(asset.symbol);
  }, [setActiveSymbol, markAsRecent]);

  // Update a specific slot in Multi-Chart 2x2
  const setMultiChartSlot = useCallback((slotIndex: number, symbol: string) => {
    setMultiChartSymbols(prev => {
      const copy: [string, string, string, string] = [...prev];
      copy[slotIndex] = symbol.toUpperCase().trim();
      return copy;
    });
  }, [setMultiChartSymbols]);

  // Select or create asset (maintains selected timeframe)
  const selectOrCreateAsset = useCallback(async (symbol: string, initialData?: Partial<StockAsset>) => {
    const sym = symbol.toUpperCase().trim();
    markAsRecent(sym);

    const existing = assets.find(a => a.symbol === sym);
    if (existing) {
      setActiveSymbol(sym);
      return;
    }

    const newAsset: StockAsset = {
      symbol: sym,
      name: initialData?.name || sym,
      exchange: 'B3',
      price: initialData?.price || 10.0,
      changePercent: initialData?.changePercent || 0.0,
      changeValue: initialData?.changeValue || 0.0,
      volume: initialData?.volume || 'R$ 50M',
      high: initialData?.high || (initialData?.price || 10.0),
      low: initialData?.low || (initialData?.price || 10.0),
      open: initialData?.open || (initialData?.price || 10.0),
      previousClose: initialData?.previousClose || (initialData?.price || 10.0),
      category: sym.endsWith('11') ? 'fiis' : 'acoes',
      isFavorite: false,
      lastSearched: 'agora mesmo',
      tradesCount: 10000
    };

    setAssets(prev => [newAsset, ...prev.filter(a => a.symbol !== sym)]);
    setActiveSymbol(sym);

    const quote = await fetchBrapiQuote(sym, '3mo', '1d');
    if (quote) {
      setAssets(prev => prev.map(a => {
        if (a.symbol === sym) {
          return {
            ...a,
            name: quote.longName || quote.shortName || a.name,
            price: Number(quote.regularMarketPrice.toFixed(2)),
            changePercent: Number(quote.regularMarketChangePercent.toFixed(2)),
            changeValue: Number(quote.regularMarketChange.toFixed(2)),
            high: Number(quote.regularMarketDayHigh.toFixed(2)),
            low: Number(quote.regularMarketDayLow.toFixed(2)),
            open: Number(quote.regularMarketOpen.toFixed(2)),
            previousClose: Number(quote.regularMarketPreviousClose.toFixed(2)),
          };
        }
        return a;
      }));
    }
  }, [assets, setActiveSymbol, setAssets, markAsRecent]);

  // Toggle Favorite: pure add/remove saved in favoriteSymbols localStorage
  const toggleFavorite = useCallback((symbol: string) => {
    setFavoriteSymbols(prev => {
      const exists = prev.includes(symbol);
      const next = exists ? prev.filter(s => s !== symbol) : [...prev, symbol];
      return next;
    });

    setAssets(prev => prev.map(a => {
      if (a.symbol === symbol) {
        return { ...a, isFavorite: !a.isFavorite };
      }
      return a;
    }));
  }, [setFavoriteSymbols, setAssets]);

  // Lazy prefetch asset quote for carousel buffer/lookahead
  const prefetchAsset = useCallback(async (symbol: string) => {
    if (!symbol) return;
    const sym = symbol.toUpperCase().trim();
    const existing = assets.find(a => a.symbol === sym);
    // If already has fresh complete quote, skip
    if (existing && existing.price > 0 && existing.name !== sym && existing.volume !== 'R$ 0') {
      return;
    }
    const quote = await fetchBrapiQuote(sym, '1d', '1d');
    if (quote) {
      setAssets(prev => {
        const idx = prev.findIndex(a => a.symbol === sym);
        const updated: StockAsset = {
          symbol: sym,
          name: quote.longName || quote.shortName || (idx >= 0 ? prev[idx].name : sym),
          exchange: 'B3',
          price: Number(quote.regularMarketPrice.toFixed(2)),
          changePercent: Number(quote.regularMarketChangePercent.toFixed(2)),
          changeValue: Number(quote.regularMarketChange.toFixed(2)),
          volume: `R$ ${(Math.round((quote.regularMarketVolume * quote.regularMarketPrice) / 1000000))}M`,
          high: Number(quote.regularMarketDayHigh.toFixed(2)),
          low: Number(quote.regularMarketDayLow.toFixed(2)),
          open: Number(quote.regularMarketOpen.toFixed(2)),
          previousClose: Number(quote.regularMarketPreviousClose.toFixed(2)),
          category: sym.endsWith('11') ? 'fiis' : 'acoes',
          tradesCount: quote.regularMarketVolume || 10000,
          isFavorite: favoriteSymbols.includes(sym),
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...prev[idx], ...updated };
          return next;
        }
        return [...prev, updated];
      });
    }
  }, [assets, favoriteSymbols, setAssets]);

  // Reference to track active symbol and prevent async race conditions
  const activeSymbolRef = useRef(activeSymbol);
  useEffect(() => {
    activeSymbolRef.current = activeSymbol;
  }, [activeSymbol]);

  // Load real candles for active asset matching selected timeframe
  useEffect(() => {
    let isMounted = true;
    const currentSymbol = activeSymbol;

    async function loadCandlesForTimeframe() {
      setIsLoadingCandles(true);

      try {
        // 1. Fetch live quote from Brapi (always 1d interval to avoid HTTP 400 on Free Plan)
        const quotePromise = fetchBrapiQuote(currentSymbol, '3mo', '1d');

        // 2. Fetch candles based on timeframe:
        // '1D' uses Brapi's historical daily bars directly.
        // Intraday (1m, 5m, 15m, 1h) and weekly/monthly (1S, 1M) use proxied Yahoo Finance bars.
        let candlePromise: Promise<Candle[] | null>;
        if (timeframe === '1D') {
          candlePromise = quotePromise.then(q => {
            if (q?.historicalDataPrice && q.historicalDataPrice.length > 0) {
              return q.historicalDataPrice.map(bar => ({
                time: bar.date * 1000,
                open: Number(bar.open.toFixed(2)),
                high: Number(bar.high.toFixed(2)),
                low: Number(bar.low.toFixed(2)),
                close: Number(bar.close.toFixed(2)),
                volume: bar.volume || 1000,
              }));
            }
            return fetchYahooCandles(currentSymbol, '1D');
          });
        } else {
          candlePromise = fetchYahooCandles(currentSymbol, timeframe);
        }

        const [quote, candlesData] = await Promise.all([quotePromise, candlePromise]);

        if (isMounted && activeSymbolRef.current === currentSymbol && quote) {
          // Update asset price & info with real B3 market data
          setAssets(prev =>
            prev.map(a => {
              if (a.symbol === currentSymbol) {
                return {
                  ...a,
                  price: Number(quote.regularMarketPrice.toFixed(2)),
                  changePercent: Number(quote.regularMarketChangePercent.toFixed(2)),
                  changeValue: Number(quote.regularMarketChange.toFixed(2)),
                  high: Number(quote.regularMarketDayHigh.toFixed(2)),
                  low: Number(quote.regularMarketDayLow.toFixed(2)),
                  open: Number(quote.regularMarketOpen.toFixed(2)),
                  previousClose: Number(quote.regularMarketPreviousClose.toFixed(2)),
                  name: quote.longName || quote.shortName || a.name
                };
              }
              return a;
            })
          );
        }

        if (isMounted && activeSymbolRef.current === currentSymbol) {
          if (candlesData && candlesData.length >= 2) {
            const visibleBars = candlesData.length > 60 ? candlesData.slice(-60) : candlesData;
            setCandles(visibleBars);
          } else {
            const targetAsset = assets.find(a => a.symbol === currentSymbol) || activeAsset;
            setCandles(generateInitialCandles(targetAsset.price, timeframe, 45));
          }
          setIsLoadingCandles(false);
        }
      } catch {
        if (isMounted && activeSymbolRef.current === currentSymbol) {
          const targetAsset = assets.find(a => a.symbol === currentSymbol) || activeAsset;
          setCandles(generateInitialCandles(targetAsset.price, timeframe, 45));
          setIsLoadingCandles(false);
        }
      }
    }

    loadCandlesForTimeframe();

    return () => {
      isMounted = false;
    };
  }, [activeSymbol, timeframe]);

  // Live Market Real-time Quotes: Refresh active asset real quote every 15s during market hours
  // NEVER inject random synthetic ticks that scramble real B3 prices!
  useEffect(() => {
    if (!marketStatus.isOpen) {
      return; // Market closed, quotes are frozen
    }

    const currentSymbol = activeSymbol;
    const refreshInterval = setInterval(async () => {
      if (activeSymbolRef.current !== currentSymbol) return;

      const { range, interval } = getTimeframeParams(timeframe);
      const quote = await fetchBrapiQuote(currentSymbol, range, interval);

      if (quote && activeSymbolRef.current === currentSymbol) {
        setAssets(prev =>
          prev.map(a => {
            if (a.symbol === currentSymbol) {
              return {
                ...a,
                price: Number(quote.regularMarketPrice.toFixed(2)),
                changePercent: Number(quote.regularMarketChangePercent.toFixed(2)),
                changeValue: Number(quote.regularMarketChange.toFixed(2)),
                high: Number(quote.regularMarketDayHigh.toFixed(2)),
                low: Number(quote.regularMarketDayLow.toFixed(2)),
                open: Number(quote.regularMarketOpen.toFixed(2)),
                previousClose: Number(quote.regularMarketPreviousClose.toFixed(2)),
              };
            }
            return a;
          })
        );

        if (quote.historicalDataPrice && quote.historicalDataPrice.length > 0) {
          const mapped: Candle[] = quote.historicalDataPrice.map(bar => ({
            time: bar.date * 1000,
            open: Number(bar.open.toFixed(2)),
            high: Number(bar.high.toFixed(2)),
            low: Number(bar.low.toFixed(2)),
            close: Number(bar.close.toFixed(2)),
            volume: bar.volume || 1000
          }));
          const visibleBars = mapped.length > 60 ? mapped.slice(-60) : mapped;
          setCandles(visibleBars);
        }
      }
    }, 15000); // 15 seconds polling for real live B3 quotes

    return () => clearInterval(refreshInterval);
  }, [marketStatus.isOpen, activeSymbol, timeframe]);

  // Compute calculated portfolio with real-time P&L
  const portfolio: PortfolioPosition[] = useMemo(() => {
    return Object.entries(rawPortfolio).map(([sym, item]) => {
      const asset = assets.find(a => a.symbol === sym);
      const currentPrice = asset ? asset.price : item.avgPrice;
      const totalInvested = item.quantity * item.avgPrice;
      const currentValue = item.quantity * currentPrice;
      const plValue = currentValue - totalInvested;
      const plPercent = totalInvested > 0 ? (plValue / totalInvested) * 100 : 0;

      return {
        symbol: sym,
        name: asset ? asset.name : sym,
        quantity: item.quantity,
        avgPrice: item.avgPrice,
        currentPrice,
        totalInvested,
        currentValue,
        plValue,
        plPercent
      };
    }).filter(p => p.quantity > 0);
  }, [rawPortfolio, assets]);

  // Execute Order (Buy or Sell)
  const executeOrder = useCallback((params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity: number;
    price: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => {
    const grossTotal = params.price * params.quantity;
    const b3Fees = Number((grossTotal * 0.0003).toFixed(2));
    const netTotal = params.side === 'buy' ? grossTotal + b3Fees : grossTotal - b3Fees;

    const currentCash = mode === 'DEMO' ? demoBalance : liveBalance;

    if (params.side === 'buy' && netTotal > currentCash) {
      return {
        success: false,
        message: `Saldo insuficiente! Necessário: R$ ${netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      };
    }

    const currentHoldings = rawPortfolio[params.symbol]?.quantity || 0;
    if (params.side === 'sell' && params.quantity > currentHoldings) {
      return {
        success: false,
        message: `Quantidade indisponível para venda! Você possui ${currentHoldings} ações de ${params.symbol}.`
      };
    }

    const updateHoldings = (
      prev: Record<string, { quantity: number; avgPrice: number }>
    ) => {
      const existing = prev[params.symbol];
      if (params.side === 'buy') {
        if (!existing || existing.quantity === 0) {
          return {
            ...prev,
            [params.symbol]: { quantity: params.quantity, avgPrice: params.price }
          };
        } else {
          const totalQty = existing.quantity + params.quantity;
          const totalCost = (existing.quantity * existing.avgPrice) + (params.quantity * params.price);
          const newAvgPrice = totalCost / totalQty;
          return {
            ...prev,
            [params.symbol]: { quantity: totalQty, avgPrice: Number(newAvgPrice.toFixed(2)) }
          };
        }
      } else {
        const remaining = (existing?.quantity || 0) - params.quantity;
        if (remaining <= 0) {
          const copy = { ...prev };
          delete copy[params.symbol];
          return copy;
        } else {
          return {
            ...prev,
            [params.symbol]: { ...existing, quantity: remaining }
          };
        }
      }
    };

    if (mode === 'DEMO') {
      setDemoBalance(prev => params.side === 'buy' ? prev - netTotal : prev + netTotal);
      setDemoPortfolio(updateHoldings);
    } else {
      setLiveBalance(prev => params.side === 'buy' ? prev - netTotal : prev + netTotal);
      setLivePortfolio(updateHoldings);
    }

    const newOrder: ExecutedOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: params.symbol,
      side: params.side,
      type: params.type,
      quantity: params.quantity,
      price: params.price,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      total: Number(grossTotal.toFixed(2)),
      fees: b3Fees,
      timestamp: Date.now(),
      mode
    };

    setOrders(prev => [newOrder, ...prev]);

    const actionText = params.side === 'buy' ? 'compra' : 'venda';
    setToastMessage(`✅ Ordem de ${actionText} de ${params.quantity} ${params.symbol} executada a R$ ${params.price.toFixed(2)}!`);
    setTimeout(() => setToastMessage(null), 4000);

    return {
      success: true,
      message: `Ordem executada com sucesso!`
    };
  }, [demoBalance, liveBalance, mode, rawPortfolio, setDemoBalance, setLiveBalance, setDemoPortfolio, setLivePortfolio, setOrders]);

  return (
    <MarketContext.Provider
      value={{
        mode,
        setMode,
        showBalance,
        setShowBalance,
        demoBalance,
        liveBalance,
        activeAsset,
        setActiveAsset: handleSetActiveAsset,
        selectOrCreateAsset,
        assets,
        searchQuery,
        setSearchQuery,
        selectedExchange,
        setSelectedExchange,
        featuredTab,
        setFeaturedTab,
        toggleFavorite,
        recentSymbols,
        favoriteSymbols,
        multiChartSymbols,
        setMultiChartSlot,
        portfolio,
        orders,
        executeOrder,
        timeframe,
        setTimeframe,
        candles,
        isMultiChart,
        setIsMultiChart,
        toastMessage,
        setToastMessage,
        marketStatus,
        isLoadingCandles,
        prefetchAsset
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
};
