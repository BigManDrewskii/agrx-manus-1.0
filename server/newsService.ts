/**
 * AGRX News Service
 *
 * Fetches real-time stock news from Google News RSS (free, no API key)
 * and computes sentiment scores via OpenRouter LLM analysis.
 * Includes in-memory caching to avoid excessive requests.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;      // ISO date string
  relativeTime: string;     // e.g. "2h ago", "3d ago"
  sentiment?: "bullish" | "bearish" | "neutral";
}

export interface StockNews {
  stockId: string;
  articles: NewsArticle[];
  sentiment: {
    score: number;           // -1 (very bearish) to +1 (very bullish)
    label: "Bullish" | "Bearish" | "Neutral";
    bullishPercent: number;  // 0-100
    bearishPercent: number;  // 0-100
    neutralPercent: number;  // 0-100
  };
  lastUpdated: number;
}

// ─── Stock Name Mapping (for search queries) ────────────────────────────────

const STOCK_SEARCH_TERMS: Record<string, string> = {
  eee: "Coca-Cola HBC Greece stock",
  eurob: "Eurobank Greece stock",
  ete: "National Bank Greece stock",
  tpeir: "Piraeus Bank Greece stock",
  alpha: "Alpha Bank Greece stock",
  ppc: "Public Power Corporation Greece",
  hto: "OTE Hellenic Telecom stock",
  opap: "OPAP Greece stock",
  mtln: "Metlen Energy Metals Greece",
  bochgr: "Bank of Cyprus stock",
  cener: "Cenergy Holdings stock",
  titc: "Titan Cement Greece stock",
  moh: "Motor Oil Hellas stock",
  gekterna: "GEK TERNA Greece stock",
  aia: "Athens International Airport stock",
  bela: "Jumbo SA Greece stock",
  vio: "Viohalco stock",
  elpe: "HELLENiQ Energy Greece stock",
  prodea: "Prodea REIC Greece",
  kare: "Karelia Tobacco Greece",
  ppa: "Piraeus Port Authority stock",
  eydap: "EYDAP Athens Water stock",
  kri: "Kri-Kri Milk Greece stock",
  admie: "ADMIE Holdings Greece",
  lamda: "Lamda Development Greece",
  aegn: "Aegean Airlines Greece stock",
  terna: "TERNA Energy Greece",
  foyrk: "Fourlis Holdings Greece",
  ffgrp: "Frigoglass Greece stock",
  quest: "Quest Holdings Greece",
  intrk: "Intracom Holdings Greece",
  avax: "AVAX Greece construction",
  exae: "Athens Stock Exchange ATHEX",
  opapr: "OPAP Greece gaming",
  autohellas: "Autohellas Greece car rental",
  plakr: "Plastika Kritis Greece",
  plath: "Plastika Thrakis Greece",
  olth: "Thessaloniki Port Authority",
};

// ─── Cache ──────────────────────────────────────────────────────────────────

interface CacheEntry {
  data: StockNews;
  timestamp: number;
}

const newsCache = new Map<string, CacheEntry>();
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const SENTIMENT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for sentiment

const sentimentCache = new Map<string, { sentiment: StockNews["sentiment"]; timestamp: number }>();

// General market news cache
let marketNewsCache: { articles: NewsArticle[]; timestamp: number } | null = null;
const MARKET_NEWS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ─── Google News RSS Parser ─────────────────────────────────────────────────

function parseRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  } catch {
    return "recently";
  }
}

function parseRSSXml(xml: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  // Simple XML parsing without external dependencies
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>|<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

    const rawTitle = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
    // Google News often appends " - Source Name" to titles
    const dashIdx = rawTitle.lastIndexOf(" - ");
    const title = dashIdx > 0 ? rawTitle.substring(0, dashIdx).trim() : rawTitle;
    const fallbackSource = dashIdx > 0 ? rawTitle.substring(dashIdx + 3).trim() : "";

    const url = (linkMatch?.[1] || "").trim();
    const publishedAt = (pubDateMatch?.[1] || "").trim();
    const source = (sourceMatch?.[1] || fallbackSource || "News").trim();

    if (title && url) {
      articles.push({
        title,
        source,
        url,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        relativeTime: publishedAt ? parseRelativeTime(publishedAt) : "recently",
      });
    }
  }

  return articles;
}

async function fetchGoogleNewsRSS(query: string, maxResults: number = 10): Promise<NewsArticle[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en&gl=GR&ceid=GR:en`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AGRX/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[NewsService] Google News RSS returned ${response.status} for query: ${query}`);
      return [];
    }

    const xml = await response.text();
    const articles = parseRSSXml(xml);

    return articles.slice(0, maxResults);
  } catch (error) {
    console.warn(`[NewsService] Failed to fetch Google News RSS for: ${query}`, error);
    return [];
  }
}

// ─── Sentiment Analysis via OpenRouter ──────────────────────────────────────

async function analyzeSentiment(
  stockId: string,
  stockName: string,
  headlines: string[]
): Promise<StockNews["sentiment"]> {
  // Check sentiment cache first
  const cached = sentimentCache.get(stockId);
  if (cached && Date.now() - cached.timestamp < SENTIMENT_CACHE_TTL) {
    return cached.sentiment;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || headlines.length === 0) {
    return computeFallbackSentiment(headlines);
  }

  try {
    const prompt = `Analyze the sentiment of these news headlines about ${stockName} (Greek stock market). For each headline, classify as bullish, bearish, or neutral. Then provide an overall sentiment score.

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Respond ONLY with valid JSON in this exact format, no other text:
{"bullish": <count>, "bearish": <count>, "neutral": <count>, "score": <number from -1.0 to 1.0>}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[NewsService] OpenRouter returned ${response.status}`);
      return computeFallbackSentiment(headlines);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return computeFallbackSentiment(headlines);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      bullish?: number;
      bearish?: number;
      neutral?: number;
      score?: number;
    };
    const total = (parsed.bullish || 0) + (parsed.bearish || 0) + (parsed.neutral || 0);

    const sentiment: StockNews["sentiment"] = {
      score: Math.max(-1, Math.min(1, parsed.score || 0)),
      label: (parsed.score || 0) > 0.15 ? "Bullish" : (parsed.score || 0) < -0.15 ? "Bearish" : "Neutral",
      bullishPercent: total > 0 ? Math.round(((parsed.bullish || 0) / total) * 100) : 33,
      bearishPercent: total > 0 ? Math.round(((parsed.bearish || 0) / total) * 100) : 33,
      neutralPercent: total > 0 ? Math.round(((parsed.neutral || 0) / total) * 100) : 34,
    };

    // Cache the result
    sentimentCache.set(stockId, { sentiment, timestamp: Date.now() });

    return sentiment;
  } catch (error) {
    console.warn(`[NewsService] Sentiment analysis failed for ${stockId}:`, error);
    return computeFallbackSentiment(headlines);
  }
}

/**
 * Keyword-based fallback sentiment when OpenRouter is unavailable.
 * Scans headlines for bullish/bearish signal words.
 */
function computeFallbackSentiment(headlines: string[]): StockNews["sentiment"] {
  const bullishWords = [
    "surge", "soar", "rally", "gain", "rise", "jump", "boost", "record", "high",
    "profit", "growth", "upgrade", "buy", "outperform", "beat", "strong", "positive",
    "expand", "dividend", "acquisition", "merger", "deal", "partnership",
  ];
  const bearishWords = [
    "fall", "drop", "decline", "loss", "plunge", "crash", "slump", "cut", "low",
    "downgrade", "sell", "underperform", "miss", "weak", "negative", "risk",
    "debt", "lawsuit", "fine", "penalty", "warning", "concern", "fear",
  ];

  let bullish = 0;
  let bearish = 0;
  let neutral = 0;

  for (const headline of headlines) {
    const lower = headline.toLowerCase();
    const bScore = bullishWords.filter((w) => lower.includes(w)).length;
    const sScore = bearishWords.filter((w) => lower.includes(w)).length;

    if (bScore > sScore) bullish++;
    else if (sScore > bScore) bearish++;
    else neutral++;
  }

  const total = bullish + bearish + neutral || 1;
  const score = (bullish - bearish) / total;

  return {
    score: Math.max(-1, Math.min(1, score)),
    label: score > 0.15 ? "Bullish" : score < -0.15 ? "Bearish" : "Neutral",
    bullishPercent: Math.round((bullish / total) * 100),
    bearishPercent: Math.round((bearish / total) * 100),
    neutralPercent: Math.round((neutral / total) * 100),
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get news and sentiment for a specific stock.
 */
export async function getStockNews(stockId: string): Promise<StockNews> {
  // Check cache
  const cached = newsCache.get(stockId);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL) {
    return cached.data;
  }

  // Build search query
  const searchTerm = STOCK_SEARCH_TERMS[stockId];
  const query = searchTerm || `${stockId} Greece stock`;

  // Fetch news
  const articles = await fetchGoogleNewsRSS(query, 10);

  // Analyze sentiment from headlines
  const stockName = searchTerm?.replace(/ stock$| Greece.*$/, "") || stockId;
  const sentiment = await analyzeSentiment(
    stockId,
    stockName,
    articles.map((a) => a.title)
  );

  // Tag individual articles with sentiment (keyword-based, fast)
  const taggedArticles = articles.map((article) => {
    const lower = article.title.toLowerCase();
    const bullishWords = ["surge", "soar", "rally", "gain", "rise", "jump", "boost", "record", "high", "profit", "growth", "upgrade", "buy", "beat", "strong", "positive", "expand", "dividend"];
    const bearishWords = ["fall", "drop", "decline", "loss", "plunge", "crash", "slump", "cut", "low", "downgrade", "sell", "miss", "weak", "negative", "risk", "debt", "lawsuit"];

    const bScore = bullishWords.filter((w) => lower.includes(w)).length;
    const sScore = bearishWords.filter((w) => lower.includes(w)).length;

    return {
      ...article,
      sentiment: bScore > sScore ? "bullish" as const : sScore > bScore ? "bearish" as const : "neutral" as const,
    };
  });

  const result: StockNews = {
    stockId,
    articles: taggedArticles,
    sentiment,
    lastUpdated: Date.now(),
  };

  // Cache
  newsCache.set(stockId, { data: result, timestamp: Date.now() });

  return result;
}

/**
 * Get general ATHEX market news (not stock-specific).
 */
export async function getMarketNews(): Promise<NewsArticle[]> {
  if (marketNewsCache && Date.now() - marketNewsCache.timestamp < MARKET_NEWS_CACHE_TTL) {
    return marketNewsCache.articles;
  }

  const queries = [
    "Athens stock exchange ATHEX",
    "Greek stock market",
  ];

  const allArticles: NewsArticle[] = [];
  for (const q of queries) {
    const articles = await fetchGoogleNewsRSS(q, 8);
    allArticles.push(...articles);
  }

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const unique = allArticles.filter((a) => {
    const key = a.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date (newest first)
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const result = unique.slice(0, 15);
  marketNewsCache = { articles: result, timestamp: Date.now() };

  return result;
}

/**
 * Clear all news caches.
 */
export function clearNewsCache(): void {
  newsCache.clear();
  sentimentCache.clear();
  marketNewsCache = null;
}
