export interface HeatmapAssetMeta {
  symbol: string;
  name: string;
  sector: string;
  marketCapBRL: number; // in Billions BRL
  defaultPrice: number;
  defaultChangePercent: number;
}

export interface CryptoHeatmapMeta {
  symbol: string;
  name: string;
  sector: string;
  marketCapUSD: number; // in Billions USD
  defaultPriceUSD: number;
  defaultChangePercent: number;
}

export const B3_HEATMAP_DATA: HeatmapAssetMeta[] = [
  // Petróleo, Gás & Biocombustíveis
  { symbol: 'PETR4', name: 'Petrobras PN', sector: 'Petróleo & Gás', marketCapBRL: 385, defaultPrice: 53.22, defaultChangePercent: -9.30 },
  { symbol: 'PETR3', name: 'Petrobras ON', sector: 'Petróleo & Gás', marketCapBRL: 275, defaultPrice: 56.40, defaultChangePercent: -8.91 },
  { symbol: 'PRIO3', name: 'Prio', sector: 'Petróleo & Gás', marketCapBRL: 42, defaultPrice: 48.90, defaultChangePercent: -2.40 },
  { symbol: 'UGPA3', name: 'Ultrapar', sector: 'Petróleo & Gás', marketCapBRL: 28, defaultPrice: 24.50, defaultChangePercent: -8.64 },
  { symbol: 'VBBR3', name: 'Vibra Energia', sector: 'Petróleo & Gás', marketCapBRL: 26, defaultPrice: 22.80, defaultChangePercent: -10.61 },
  { symbol: 'CSAN3', name: 'Cosan', sector: 'Petróleo & Gás', marketCapBRL: 23, defaultPrice: 12.10, defaultChangePercent: -14.27 },

  // Financeiro & Bancos
  { symbol: 'ITUB4', name: 'Itaú Unibanco', sector: 'Financeiro', marketCapBRL: 320, defaultPrice: 35.90, defaultChangePercent: -13.62 },
  { symbol: 'BBDC4', name: 'Bradesco PN', sector: 'Financeiro', marketCapBRL: 140, defaultPrice: 14.20, defaultChangePercent: -22.24 },
  { symbol: 'BBDC3', name: 'Bradesco ON', sector: 'Financeiro', marketCapBRL: 45, defaultPrice: 12.80, defaultChangePercent: -21.32 },
  { symbol: 'BBAS3', name: 'Banco do Brasil', sector: 'Financeiro', marketCapBRL: 155, defaultPrice: 27.60, defaultChangePercent: -28.03 },
  { symbol: 'BPAC11', name: 'BTG Pactual', sector: 'Financeiro', marketCapBRL: 135, defaultPrice: 34.50, defaultChangePercent: -6.15 },
  { symbol: 'ITSA4', name: 'Itaúsa', sector: 'Financeiro', marketCapBRL: 95, defaultPrice: 10.35, defaultChangePercent: -13.52 },
  { symbol: 'B3SA3', name: 'B3 Brasil Bolsa', sector: 'Financeiro', marketCapBRL: 68, defaultPrice: 11.90, defaultChangePercent: -16.19 },
  { symbol: 'BBSE3', name: 'BB Seguridade', sector: 'Financeiro', marketCapBRL: 64, defaultPrice: 33.40, defaultChangePercent: -3.37 },
  { symbol: 'CXSE3', name: 'Caixa Seguridade', sector: 'Financeiro', marketCapBRL: 44, defaultPrice: 14.80, defaultChangePercent: -3.36 },

  // Mineração & Siderurgia
  { symbol: 'VALE3', name: 'Vale', sector: 'Mineração & Siderurgia', marketCapBRL: 290, defaultPrice: 62.18, defaultChangePercent: -0.65 },
  { symbol: 'SUZB3', name: 'Suzano', sector: 'Mineração & Siderurgia', marketCapBRL: 68, defaultPrice: 56.40, defaultChangePercent: 1.45 },
  { symbol: 'GGBR4', name: 'Gerdau', sector: 'Mineração & Siderurgia', marketCapBRL: 36, defaultPrice: 19.80, defaultChangePercent: -4.10 },
  { symbol: 'CSNA3', name: 'Siderúrgica Nacional', sector: 'Mineração & Siderurgia', marketCapBRL: 18, defaultPrice: 13.50, defaultChangePercent: -7.20 },
  { symbol: 'KLBN11', name: 'Klabin', sector: 'Mineração & Siderurgia', marketCapBRL: 25, defaultPrice: 21.30, defaultChangePercent: 0.80 },

  // Bens de Capital & Industrial
  { symbol: 'WEGE3', name: 'WEG', sector: 'Industrial', marketCapBRL: 220, defaultPrice: 54.10, defaultChangePercent: 3.05 },
  { symbol: 'EMBR3', name: 'Embraer', sector: 'Industrial', marketCapBRL: 42, defaultPrice: 52.30, defaultChangePercent: 4.80 },
  { symbol: 'RAIL3', name: 'Rumo', sector: 'Industrial', marketCapBRL: 34, defaultPrice: 18.90, defaultChangePercent: -2.15 },

  // Consumo, Varejo & Bebidas
  { symbol: 'ABEV3', name: 'Ambev', sector: 'Consumo & Varejo', marketCapBRL: 195, defaultPrice: 12.45, defaultChangePercent: -7.73 },
  { symbol: 'RENT3', name: 'Localiza', sector: 'Consumo & Varejo', marketCapBRL: 46, defaultPrice: 42.10, defaultChangePercent: -38.97 },
  { symbol: 'RADL3', name: 'RaiaDrogasil', sector: 'Consumo & Varejo', marketCapBRL: 44, defaultPrice: 26.30, defaultChangePercent: -1.20 },
  { symbol: 'LREN3', name: 'Lojas Renner', sector: 'Consumo & Varejo', marketCapBRL: 17, defaultPrice: 17.50, defaultChangePercent: -5.40 },
  { symbol: 'ASAI3', name: 'Assaí', sector: 'Consumo & Varejo', marketCapBRL: 14, defaultPrice: 9.80, defaultChangePercent: -38.04 },
  { symbol: 'MGLU3', name: 'Magazine Luiza', sector: 'Consumo & Varejo', marketCapBRL: 8, defaultPrice: 9.20, defaultChangePercent: -12.50 },

  // Energia Elétrica & Saneamento
  { symbol: 'ELET3', name: 'Eletrobras', sector: 'Energia & Saneamento', marketCapBRL: 85, defaultPrice: 38.90, defaultChangePercent: 0.40 },
  { symbol: 'SBSP3', name: 'Sabesp', sector: 'Energia & Saneamento', marketCapBRL: 62, defaultPrice: 92.40, defaultChangePercent: -20.98 },
  { symbol: 'EQTL3', name: 'Equatorial', sector: 'Energia & Saneamento', marketCapBRL: 38, defaultPrice: 32.80, defaultChangePercent: -29.07 },
  { symbol: 'CPFE3', name: 'CPFL Energia', sector: 'Energia & Saneamento', marketCapBRL: 37, defaultPrice: 34.20, defaultChangePercent: -12.77 },
  { symbol: 'EGIE3', name: 'Engie Brasil', sector: 'Energia & Saneamento', marketCapBRL: 35, defaultPrice: 42.10, defaultChangePercent: -10.52 },
  { symbol: 'CMIG4', name: 'Cemig', sector: 'Energia & Saneamento', marketCapBRL: 31, defaultPrice: 11.20, defaultChangePercent: -11.48 },
  { symbol: 'CPLE3', name: 'Copel', sector: 'Energia & Saneamento', marketCapBRL: 29, defaultPrice: 9.90, defaultChangePercent: -13.49 },
  { symbol: 'ENEV3', name: 'Eneva', sector: 'Energia & Saneamento', marketCapBRL: 22, defaultPrice: 12.80, defaultChangePercent: -15.82 },
];

export const CRYPTO_HEATMAP_DATA: CryptoHeatmapMeta[] = [
  { symbol: 'BTC', name: 'Bitcoin', sector: 'Layer 1', marketCapUSD: 1350, defaultPriceUSD: 67800, defaultChangePercent: 2.45 },
  { symbol: 'ETH', name: 'Ethereum', sector: 'Smart Contracts', marketCapUSD: 315, defaultPriceUSD: 2540, defaultChangePercent: 1.80 },
  { symbol: 'BNB', name: 'BNB Chain', sector: 'Exchange Token', marketCapUSD: 87, defaultPriceUSD: 590, defaultChangePercent: -0.45 },
  { symbol: 'SOL', name: 'Solana', sector: 'Layer 1', marketCapUSD: 82, defaultPriceUSD: 174, defaultChangePercent: 5.60 },
  { symbol: 'XRP', name: 'Ripple', sector: 'Pagamentos', marketCapUSD: 31, defaultPriceUSD: 0.54, defaultChangePercent: 0.35 },
  { symbol: 'DOGE', name: 'Dogecoin', sector: 'Memecoins', marketCapUSD: 21, defaultPriceUSD: 0.14, defaultChangePercent: -3.20 },
  { symbol: 'ADA', name: 'Cardano', sector: 'Layer 1', marketCapUSD: 13, defaultPriceUSD: 0.36, defaultChangePercent: -1.15 },
  { symbol: 'AVAX', name: 'Avalanche', sector: 'Smart Contracts', marketCapUSD: 11, defaultPriceUSD: 27.5, defaultChangePercent: 3.10 },
  { symbol: 'SUI', name: 'Sui Network', sector: 'Layer 1', marketCapUSD: 8.5, defaultPriceUSD: 1.95, defaultChangePercent: 8.40 },
  { symbol: 'LINK', name: 'Chainlink', sector: 'Oráculos / DeFi', marketCapUSD: 7.2, defaultPriceUSD: 11.8, defaultChangePercent: -0.80 },
  { symbol: 'NEAR', name: 'Near Protocol', sector: 'AI & Layer 1', marketCapUSD: 6.1, defaultPriceUSD: 4.85, defaultChangePercent: 4.25 },
  { symbol: 'DOT', name: 'Polkadot', sector: 'Interoperabilidade', marketCapUSD: 5.8, defaultPriceUSD: 4.15, defaultChangePercent: -1.40 },
  { symbol: 'UNI', name: 'Uniswap', sector: 'DEX / DeFi', marketCapUSD: 5.2, defaultPriceUSD: 7.85, defaultChangePercent: 1.10 },
  { symbol: 'PEPE', name: 'Pepe', sector: 'Memecoins', marketCapUSD: 4.3, defaultPriceUSD: 0.0000095, defaultChangePercent: 12.30 },
  { symbol: 'APT', name: 'Aptos', sector: 'Layer 1', marketCapUSD: 4.1, defaultPriceUSD: 9.20, defaultChangePercent: -2.80 },
];
