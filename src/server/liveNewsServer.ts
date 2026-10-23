import type { Plugin } from 'vite';
import type { NewsItem, NewsSource, NewsCategory, NewsSentiment } from '../types/news';

interface FeedConfig {
  name: string;
  url: string;
  source: NewsSource;
  defaultCategory: NewsCategory;
}

const FEEDS: FeedConfig[] = [
  {
    name: 'InfoMoney',
    url: 'https://www.infomoney.com.br/feed/',
    source: 'InfoMoney',
    defaultCategory: 'acoes',
  },
  {
    name: 'Brazil Journal',
    url: 'https://braziljournal.com/feed/',
    source: 'Brazil Journal',
    defaultCategory: 'acoes',
  },
  {
    name: 'G1 Economia & Negócios',
    url: 'https://g1.globo.com/rss/g1/economia/',
    source: 'Valor PRO',
    defaultCategory: 'macro',
  },
  {
    name: 'CoinDesk Crypto',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    source: 'CryptoPanic',
    defaultCategory: 'cripto',
  },
];

// Fallback high-res photos if RSS feed doesn't contain a media thumbnail
const CATEGORY_IMAGES: Record<string, string> = {
  acoes: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
  macro: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  cripto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  cvm: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
};

// Comprehensive dictionary mapping company names, brands and aliases to B3/Crypto tickers
const COMPANY_TICKER_MAP: Record<string, string[]> = {
  PETR4: ['petrobras', 'petrobrás', 'petr4', 'petr3', 'pré-sal', 'pre-sal'],
  VALE3: ['mineradora vale', 'vale s.a', 'vale sa', 'vale3', 'minério da vale', 'ações da vale', 'papeis da vale'],
  ITUB4: ['itaú', 'itau', 'itub4', 'itub3', 'itaú unibanco', 'itau unibanco'],
  BBDC4: ['bradesco', 'bbdc4', 'bbdc3'],
  BBAS3: ['banco do brasil', 'bbas3'],
  WEGE3: ['weg', 'wege3'],
  EMBR3: ['embraer', 'embr3', 'jatos e2', 'e195'],
  PRIO3: ['prio', 'petrorio', 'prio3', 'campo de frade'],
  RENT3: ['localiza', 'rent3', 'localiza rent a car'],
  ABEV3: ['ambev', 'abev3', 'cervejaria ambev'],
  GGBR4: ['gerdau', 'ggbr4', 'ggbr3'],
  SUZB3: ['suzano', 'suzb3'],
  MGLU3: ['magazine luiza', 'magalu', 'mglu3'],
  CSNA3: ['csn', 'siderúrgica nacional', 'csna3'],
  USIM5: ['usiminas', 'usim5'],
  XPML11: ['xpml11', 'xp malls', 'xpmalls'],
  HGLG11: ['hglg11', 'cshg logística'],
  MXRF11: ['mxrf11', 'maxi renda'],
  KNIP11: ['knip11', 'kinea'],
  ALZR11: ['alzr11', 'alr11'],
  SNEL11: ['snel11'],
  BTC: ['bitcoin', 'btc', 'satoshi'],
  ETH: ['ethereum', 'ether', 'eth'],
  SOL: ['solana', 'sol'],
};

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8217;/gi, "'")
    .replace(/&#8220;/gi, '"')
    .replace(/&#8221;/gi, '"')
    .replace(/&#8211;/gi, '-')
    .replace(/&#8212;/gi, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTickers(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();

  for (const [ticker, keywords] of Object.entries(COMPANY_TICKER_MAP)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        found.push(ticker);
        break;
      }
    }
  }

  // Also match generic B3 patterns like ABCD3 or ABCD11
  const genericMatches = text.match(/\b([A-Z]{4}[0-9]{1,2})\b/g);
  if (genericMatches) {
    for (const m of genericMatches) {
      if (!found.includes(m) && m.length >= 5) {
        found.push(m);
      }
    }
  }

  return Array.from(new Set(found));
}

function detectSentiment(text: string): NewsSentiment {
  const lower = text.toLowerCase();
  const bullishWords = ['alta', 'sobe', 'salta', 'lucro', 'recorde', 'ganho', 'aprova', 'recompra', 'supera', 'avança', 'dispara', 'cresce', 'otimista'];
  const bearishWords = ['queda', 'recua', 'cai', 'prejuízo', 'crise', 'pesa', 'perde', 'baixa', 'negativo', 'derrete', 'tomba', 'despenca', 'recessão'];

  let score = 0;
  for (const w of bullishWords) {
    if (lower.includes(w)) score++;
  }
  for (const w of bearishWords) {
    if (lower.includes(w)) score--;
  }

  if (score > 0) return 'bullish';
  if (score < 0) return 'bearish';
  return 'neutral';
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;
  if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  return 'Ontem';
}

let cachedNews: NewsItem[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache

export async function fetchAllRssFeeds(): Promise<NewsItem[]> {
  if (cachedNews.length > 0 && Date.now() - lastFetchTime < CACHE_TTL_MS) {
    return cachedNews;
  }

  const allItems: NewsItem[] = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      });

      if (!res.ok) {
        console.warn(`[LiveNews] Failed to fetch feed ${feed.name}: HTTP ${res.status}`);
        continue;
      }

      const xmlText = await res.text();
      const rawItems = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

      for (let i = 0; i < Math.min(rawItems.length, 12); i++) {
        const itemXml = rawItems[i];

        const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
        const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
        const pubDateMatch = itemXml.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);

        const imgMatch =
          itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i) ||
          itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i) ||
          itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);

        if (!titleMatch || !linkMatch) continue;

        const rawTitle = titleMatch[1];
        const title = cleanHtml(rawTitle);
        if (!title || title.length < 10) continue;

        const link = cleanHtml(linkMatch[1]);
        const description = cleanHtml(descMatch ? descMatch[1] : '');
        const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
        const timestamp = isNaN(pubDate.getTime()) ? Date.now() : pubDate.getTime();

        const tickers = extractTickers(`${title} ${description}`);
        const sentiment = detectSentiment(`${title} ${description}`);

        // Extract image or use category fallback
        let imageUrl = imgMatch ? imgMatch[1].trim() : undefined;
        if (!imageUrl || imageUrl.includes('.ico')) {
          imageUrl = CATEGORY_IMAGES[feed.defaultCategory] || CATEGORY_IMAGES.acoes;
        }

        const summary = description.length > 20
          ? description.slice(0, 240) + (description.length > 240 ? '...' : '')
          : title;

        const isBreaking = Date.now() - timestamp < 45 * 60 * 1000;

        const keyTakeaways: string[] = [
          summary.slice(0, 120) + (summary.length > 120 ? '...' : ''),
          tickers.length > 0
            ? `Ativos diretamente impactados no pregão: ${tickers.join(', ')}.`
            : `Matéria relevante com foco em ${feed.defaultCategory.toUpperCase()}.`,
          `Publicado originalmente pelos canais oficiais do ${feed.source}.`,
        ];

        allItems.push({
          id: `live-${feed.name.toLowerCase().replace(/\s+/g, '-')}-${i}-${timestamp}`,
          title,
          summary,
          content: description || summary,
          aiSummary: `${feed.source}: ${summary}`,
          keyTakeaways,
          imageUrl,
          source: feed.source,
          category: feed.defaultCategory as 'cvm' | 'acoes' | 'macro' | 'cripto',
          sentiment,
          publishedAt: formatRelativeTime(new Date(timestamp)),
          timestamp,
          relatedTickers: tickers,
          isBreaking,
          readTime: '2 min de leitura',
          url: link,
        });
      }
    } catch (err) {
      console.error(`[LiveNews] Error fetching feed ${feed.name}:`, err);
    }
  }

  // Sort descending by timestamp
  allItems.sort((a, b) => b.timestamp - a.timestamp);

  if (allItems.length > 0) {
    cachedNews = allItems;
    lastFetchTime = Date.now();
  }

  return cachedNews;
}

export function createLiveNewsPlugin(): Plugin {
  return {
    name: 'tradecraft-live-news-plugin',
    configureServer(server) {
      server.middlewares.use('/api/live-news', async (_req, res) => {
        try {
          const news = await fetchAllRssFeeds();
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify({ success: true, count: news.length, data: news }));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: message }));
        }
      });
    },
  };
}
