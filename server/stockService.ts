/**
 * AGRX Stock Data Service
 * 
 * Server-side service that fetches live ATHEX stock data from Yahoo Finance
 * via the built-in data API. Includes an in-memory cache to respect rate limits
 * and provide fast responses.
 */
import { callDataApi } from "./_core/dataApi";

// ─── Symbol Mapping ─────────────────────────────────────────────────────────
// Maps our internal AGRX stock IDs to Yahoo Finance ATHEX symbols (.AT suffix)
export const ATHEX_SYMBOLS: Record<string, { yahoo: string; name: string; category: "blue-chip" | "growth" | "dividend" | "etf" }> = {
  opap:     { yahoo: "OPAP.AT",     name: "OPAP S.A.",                   category: "blue-chip" },
  ete:      { yahoo: "ETE.AT",      name: "National Bank of Greece",     category: "blue-chip" },
  hto:      { yahoo: "HTO.AT",      name: "Hellenic Telecom (OTE)",      category: "blue-chip" },
  eurob:    { yahoo: "EUROB.AT",    name: "Eurobank Ergasias",           category: "blue-chip" },
  admie:    { yahoo: "ADMIE.AT",    name: "ADMIE Holdings",              category: "growth" },
  ppc:      { yahoo: "PPC.AT",      name: "Public Power Corp",           category: "dividend" },
  cener:    { yahoo: "CENER.AT",    name: "Cenergy Holdings",            category: "growth" },
  elpe:     { yahoo: "ELPE.AT",     name: "HELLENiQ Energy",             category: "dividend" },
  aegn:     { yahoo: "AEGN.AT",     name: "Aegean Airlines",             category: "growth" },
  alpha:    { yahoo: "ALPHA.AT",    name: "Alpha Bank",                  category: "blue-chip" },
  lamda:    { yahoo: "LAMDA.AT",    name: "LAMDA Development",           category: "growth" },
  gekterna: { yahoo: "GEKTERNA.AT", name: "GEK TERNA",                  category: "growth" },
  titc:     { yahoo: "TITC.AT",     name: "Titan Cement",                category: "blue-chip" },
  bela:     { yahoo: "BELA.AT",     name: "Jumbo S.A.",                  category: "dividend" },
  foyrk:    { yahoo: "FOYRK.AT",    name: "Fourlis Holdings",            category: "growth" },
};

// ─── Types ──────────────────────────────────────────────────────────────────
export interface StockQuote {
  id: string;
  ticker: string;
  yahooSymbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: string;
  currency: string;
  exchange: string;
  category: "blue-chip" | "growth" | "dividend" | "etf";
  sparkline: number[];
  lastUpdated: number;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartResponse {
  symbol: string;
  interval: string;
  range: string;
  data: ChartDataPoint[];
  meta: {
    currency: string;
    exchange: string;
    regularMarketPrice: number;
  };
}

// ─── Cache ──────────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry<StockQuote>>();
const chartCache = new Map<string, CacheEntry<ChartResponse>>();

// Cache TTLs in milliseconds
const QUOTE_CACHE_TTL = 60_000;       // 1 minute for quotes
const CHART_CACHE_TTL_1D = 60_000;    // 1 minute for intraday
const CHART_CACHE_TTL_OTHER = 300_000; // 5 minutes for longer ranges

function isCacheValid<T>(entry: CacheEntry<T> | undefined, ttl: number): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttl;
}

// ─── Format Helpers ─────────────────────────────────────────────────────────
function formatMarketCap(value: number | undefined): string {
  if (!value) return "N/A";
  if (value >= 1e9) return `€${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `€${(value / 1e6).toFixed(0)}M`;
  return `€${value.toLocaleString()}`;
}

function mapIntervalToYahoo(interval: string): string {
  const mapping: Record<string, string> = {
    "1D": "5m",
    "1W": "15m",
    "1M": "1d",
    "3M": "1d",
    "1Y": "1wk",
    "ALL": "1mo",
  };
  return mapping[interval] || "1d";
}

function mapRangeToYahoo(range: string): string {
  const mapping: Record<string, string> = {
    "1D": "1d",
    "1W": "5d",
    "1M": "1mo",
    "3M": "3mo",
    "1Y": "1y",
    "ALL": "5y",
  };
  return mapping[range] || "1mo";
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Fetch a single stock quote with sparkline data
 */
export async function getStockQuote(stockId: string): Promise<StockQuote | null> {
  const symbolInfo = ATHEX_SYMBOLS[stockId];
  if (!symbolInfo) return null;

  // Check cache
  const cached = quoteCache.get(stockId);
  if (isCacheValid(cached, QUOTE_CACHE_TTL)) {
    return cached.data;
  }

  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: symbolInfo.yahoo,
        interval: "5m",
        range: "1d",
      },
    }) as any;

    if (!response?.chart?.result?.[0]) return null;

    const result = response.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0] || {};
    const closePrices = (quotes.close || []).filter((p: number | null) => p !== null);

    const price = meta.regularMarketPrice ?? closePrices[closePrices.length - 1] ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    // Build sparkline from intraday close prices (sample every ~6 points for ~14 data points)
    const step = Math.max(1, Math.floor(closePrices.length / 14));
    const sparkline = closePrices.filter((_: number, i: number) => i % step === 0 || i === closePrices.length - 1);

    const quote: StockQuote = {
      id: stockId,
      ticker: symbolInfo.yahoo.replace(".AT", ""),
      yahooSymbol: symbolInfo.yahoo,
      name: meta.longName || symbolInfo.name,
      price,
      previousClose,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? Math.max(...closePrices),
      dayLow: meta.regularMarketDayLow ?? Math.min(...closePrices),
      volume: meta.regularMarketVolume ?? 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? 0,
      marketCap: formatMarketCap(meta.marketCap),
      currency: meta.currency ?? "EUR",
      exchange: meta.exchangeName ?? "ATH",
      category: symbolInfo.category,
      sparkline,
      lastUpdated: Date.now(),
    };

    quoteCache.set(stockId, { data: quote, timestamp: Date.now() });
    return quote;
  } catch (error) {
    console.error(`[StockService] Failed to fetch quote for ${stockId}:`, error);
    // Return stale cache if available
    const staleQuote = quoteCache.get(stockId);
    if (staleQuote) return staleQuote.data;
    return null;
  }
}

/**
 * Fetch quotes for multiple stocks in parallel
 */
export async function getMultipleQuotes(stockIds?: string[]): Promise<StockQuote[]> {
  const ids = stockIds ?? Object.keys(ATHEX_SYMBOLS);
  const results = await Promise.allSettled(ids.map((id) => getStockQuote(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((q): q is StockQuote => q !== null);
}

/**
 * Fetch chart data for a specific stock and time range
 */
export async function getStockChart(
  stockId: string,
  range: string = "1M",
): Promise<ChartResponse | null> {
  const symbolInfo = ATHEX_SYMBOLS[stockId];
  if (!symbolInfo) return null;

  const interval = mapIntervalToYahoo(range);
  const yahooRange = mapRangeToYahoo(range);
  const cacheKey = `${stockId}:${range}`;

  // Check cache
  const ttl = range === "1D" ? CHART_CACHE_TTL_1D : CHART_CACHE_TTL_OTHER;
  const cached = chartCache.get(cacheKey);
  if (isCacheValid(cached, ttl)) {
    return cached.data;
  }

  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: symbolInfo.yahoo,
        interval,
        range: yahooRange,
      },
    }) as any;

    if (!response?.chart?.result?.[0]) return null;

    const result = response.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    const data: ChartDataPoint[] = timestamps.map((ts: number, i: number) => ({
      timestamp: ts,
      open: quotes.open?.[i] ?? 0,
      high: quotes.high?.[i] ?? 0,
      low: quotes.low?.[i] ?? 0,
      close: quotes.close?.[i] ?? 0,
      volume: quotes.volume?.[i] ?? 0,
    })).filter((d: ChartDataPoint) => d.close > 0);

    const chartResponse: ChartResponse = {
      symbol: symbolInfo.yahoo,
      interval,
      range: yahooRange,
      data,
      meta: {
        currency: meta.currency ?? "EUR",
        exchange: meta.exchangeName ?? "ATH",
        regularMarketPrice: meta.regularMarketPrice ?? 0,
      },
    };

    chartCache.set(cacheKey, { data: chartResponse, timestamp: Date.now() });
    return chartResponse;
  } catch (error) {
    console.error(`[StockService] Failed to fetch chart for ${stockId}:`, error);
    const staleChart = chartCache.get(cacheKey);
    if (staleChart) return staleChart.data;
    return null;
  }
}

/**
 * Get all available stock IDs
 */
export function getAvailableStocks(): string[] {
  return Object.keys(ATHEX_SYMBOLS);
}

/**
 * Clear all caches (useful for testing or forced refresh)
 */
export function clearCache(): void {
  quoteCache.clear();
  chartCache.clear();
}
