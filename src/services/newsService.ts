import { NewsItem } from '../types/news';
import { INITIAL_NEWS } from '../data/mockNews';

export interface LiveNewsResult {
  news: NewsItem[];
  isLive: boolean;
  totalLive: number;
}

export async function fetchLiveNews(): Promise<LiveNewsResult> {
  try {
    const baseUrl = typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('null')
      ? window.location.origin
      : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/live-news`);
    if (!res.ok) {
      return { news: INITIAL_NEWS, isLive: false, totalLive: 0 };
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      // Use 100% real live news without mixing mock news
      const liveItems: NewsItem[] = data.data;

      // Sort: newest first
      liveItems.sort((a, b) => b.timestamp - a.timestamp);

      return {
        news: liveItems,
        isLive: true,
        totalLive: liveItems.length,
      };
    }

    return { news: INITIAL_NEWS, isLive: false, totalLive: 0 };
  } catch (err) {
    console.warn('[newsService] Live news endpoint unreachable, using fallback cache:', err);
    return { news: INITIAL_NEWS, isLive: false, totalLive: 0 };
  }
}
