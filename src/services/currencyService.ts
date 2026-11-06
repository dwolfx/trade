/**
 * Serviço de Câmbio em Tempo Real com Travas de Segurança (Guardrails)
 * 
 * Travas implementadas:
 * 1. Waterfall Cascading: Binance USDTBRL -> Yahoo USDBRL=X -> AwesomeAPI -> Local Cache -> Fallback
 * 2. Sanity Range Clamp: Rejeita taxas < R$ 2.50 ou > R$ 15.00 contra corrupção de dados/APIs
 * 3. Smart TTL Caching: Evita spam de rede preservando taxa fresca do dia
 * 4. Persistência Resiliente: Guarda última taxa válida no localStorage
 */

export interface UsdRateInfo {
  rate: number;
  source: 'BINANCE_LIVE' | 'YAHOO_LIVE' | 'AWESOME_API' | 'LOCAL_CACHE' | 'FALLBACK';
  sourceLabel: string;
  timestamp: number;
  formattedRate: string;
}

const STORAGE_KEY = 'tradecraft_live_usd_rate';
const CACHE_TTL_MS = 60 * 1000; // 60 segundos de cache em memória
const FALLBACK_SAFE_RATE = 5.52; // Cotação de segurança caso todas as redes falhem

let memoryCache: UsdRateInfo | null = null;

export function isRateSane(rate: number): boolean {
  return typeof rate === 'number' && !isNaN(rate) && isFinite(rate) && rate >= 2.5 && rate <= 15.0;
}

function getBinanceBaseUrl(): string {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  return isBrowser ? '/api/binance' : 'https://api.binance.com';
}

function getYahooBaseUrl(): string {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  return isBrowser ? '/api/yahoo' : 'https://query1.finance.yahoo.com';
}

/**
 * Puxa a cotação do dólar ao vivo do dia com múltiplas travas de segurança
 */
export async function getLiveUsdRate(): Promise<UsdRateInfo> {
  const now = Date.now();

  // Trava de Cache em memória (evita chamadas excessivas)
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache;
  }

  // 1. Trava Primária: Binance Spot Live (USDT/BRL)
  try {
    const binanceUrl = `${getBinanceBaseUrl()}/api/v3/ticker/price?symbol=USDTBRL`;
    const res = await fetch(binanceUrl);
    if (res.ok) {
      const data = await res.json();
      const parsed = parseFloat(data.price);
      if (isRateSane(parsed)) {
        return saveAndReturn(parsed, 'BINANCE_LIVE', 'Binance Spot Live (USDT/BRL)');
      }
    }
  } catch (err) {
    // Falha silenciosa, segue para Trava Secundária
  }

  // 2. Trava Secundária: Yahoo Finance Live Spot (USDBRL=X)
  try {
    const yahooUrl = `${getYahooBaseUrl()}/v8/finance/chart/USDBRL=X?interval=1d&range=1d`;
    const res = await fetch(yahooUrl);
    if (res.ok) {
      const data = await res.json();
      const parsed = data.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (isRateSane(parsed)) {
        return saveAndReturn(parsed, 'YAHOO_LIVE', 'Yahoo Finance Spot (USD/BRL)');
      }
    }
  } catch (err) {
    // Falha silenciosa, segue para Trava Terciária
  }

  // 3. Trava Terciária: AwesomeAPI (Banco Central do Brasil / Dólar Comercial)
  try {
    const awesomeUrl = 'https://economia.awesomeapi.com.br/last/USD-BRL';
    const res = await fetch(awesomeUrl);
    if (res.ok) {
      const data = await res.json();
      const parsed = parseFloat(data.USDBRL?.bid);
      if (isRateSane(parsed)) {
        return saveAndReturn(parsed, 'AWESOME_API', 'AwesomeAPI / Banco Central (Dólar Comercial)');
      }
    }
  } catch (err) {
    // Falha silenciosa
  }

  // 4. Trava Quartenária: Última taxa válida salva no localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        if (isRateSane(parsedSaved.rate)) {
          const info: UsdRateInfo = {
            rate: parsedSaved.rate,
            source: 'LOCAL_CACHE',
            sourceLabel: 'Cache Persistido Offline',
            timestamp: now,
            formattedRate: `R$ ${parsedSaved.rate.toFixed(2)}`,
          };
          memoryCache = info;
          return info;
        }
      }
    }
  } catch (err) {
    // Falha silenciosa
  }

  // 5. Trava Final (Circuito Absoluto): Fallback plausível garantido
  const finalFallback: UsdRateInfo = {
    rate: FALLBACK_SAFE_RATE,
    source: 'FALLBACK',
    sourceLabel: 'Trava de Segurança Padrão',
    timestamp: now,
    formattedRate: `R$ ${FALLBACK_SAFE_RATE.toFixed(2)}`,
  };
  memoryCache = finalFallback;
  return finalFallback;
}

function saveAndReturn(rate: number, source: UsdRateInfo['source'], sourceLabel: string): UsdRateInfo {
  const rounded = Number(rate.toFixed(4));
  const info: UsdRateInfo = {
    rate: rounded,
    source,
    sourceLabel,
    timestamp: Date.now(),
    formattedRate: `R$ ${rounded.toFixed(2)}`,
  };

  memoryCache = info;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rate: rounded, timestamp: Date.now() }));
    }
  } catch {}

  return info;
}

export function resetUsdRateCache(): void {
  memoryCache = null;
}
