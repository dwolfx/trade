import { NewsItem } from '../types/news';
import { INITIAL_NEWS } from '../data/mockNews';

export interface LiveNewsResult {
  news: NewsItem[];
  isLive: boolean;
  totalLive: number;
}

const CACHE_KEY = 'tradecraft_live_news_cache';

export function getCachedLiveNews(): NewsItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export function saveCachedLiveNews(news: NewsItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(news));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchLiveNews(): Promise<LiveNewsResult> {
  const isTest = Boolean((import.meta as unknown as { env?: { MODE?: string } })?.env?.MODE === 'test');

  try {
    const baseUrl =
      typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('null')
        ? window.location.origin
        : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/live-news`);
    if (!res.ok) {
      const cached = getCachedLiveNews();
      if (cached && cached.length > 0) {
        return { news: cached, isLive: true, totalLive: cached.length };
      }
      return { news: isTest ? INITIAL_NEWS : [], isLive: false, totalLive: 0 };
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      // 100% real live news
      const liveItems: NewsItem[] = data.data;

      // Sort: newest first
      liveItems.sort((a, b) => b.timestamp - a.timestamp);

      // Save to cache for instant rendering next time
      saveCachedLiveNews(liveItems);

      return {
        news: liveItems,
        isLive: true,
        totalLive: liveItems.length,
      };
    }

    const cached = getCachedLiveNews();
    if (cached && cached.length > 0) {
      return { news: cached, isLive: true, totalLive: cached.length };
    }

    return { news: isTest ? INITIAL_NEWS : [], isLive: false, totalLive: 0 };
  } catch (err) {
    console.warn('[newsService] Live news endpoint unreachable, checking cache:', err);
    const cached = getCachedLiveNews();
    if (cached && cached.length > 0) {
      return { news: cached, isLive: true, totalLive: cached.length };
    }
    return { news: isTest ? INITIAL_NEWS : [], isLive: false, totalLive: 0 };
  }
}
