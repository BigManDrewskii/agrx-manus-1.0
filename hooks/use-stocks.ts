/**
 * Client-side hooks for live ATHEX stock data.
 *
 * Uses tRPC + React Query for automatic caching, refetching, and loading states.
 * Falls back to mock data when the server returns empty results (e.g. rate limit)
 * or is completely unreachable.
 */
import { trpc } from "@/lib/trpc";
import { GREEK_STOCKS, PORTFOLIO_HOLDINGS, generateChartData } from "@/lib/mock-data";
import type { Asset } from "@/lib/mock-data";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface LiveStockQuote {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  category: "blue-chip" | "growth" | "dividend" | "etf";
  marketCap: string;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  isLive: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a mock Asset to a LiveStockQuote with isLive: false */
function mockToQuote(s: Asset): LiveStockQuote {
  return {
    id: s.id,
    ticker: s.ticker,
    name: s.name,
    price: s.price,
    change: s.change,
    changePercent: s.changePercent,
    sparkline: s.sparkline,
    category: s.category,
    marketCap: s.marketCap ?? "N/A",
    dayHigh: s.price * 1.02,
    dayLow: s.price * 0.98,
    volume: 0,
    fiftyTwoWeekHigh: s.price * 1.2,
    fiftyTwoWeekLow: s.price * 0.8,
    currency: "EUR",
    isLive: false,
  };
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch all stock quotes with automatic refresh.
 *
 * The key fix: we check `data.length > 0` instead of just `data` truthiness.
 * An empty array from the server (rate-limit / market closed) is truthy but
 * contains no stocks — in that case we fall back to mock data.
 */
export function useStockQuotes() {
  const query = trpc.stocks.getQuotes.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 2,
  });

  const liveData = query.data?.data;
  const hasLiveData = Array.isArray(liveData) && liveData.length > 0;

  const stocks: LiveStockQuote[] = hasLiveData
    ? liveData.map((q) => ({
        id: q.id,
        ticker: q.ticker,
        name: q.name,
        price: q.price,
        change: q.change,
        changePercent: q.changePercent,
        sparkline: q.sparkline,
        category: q.category,
        marketCap: q.marketCap,
        dayHigh: q.dayHigh,
        dayLow: q.dayLow,
        volume: q.volume,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow,
        currency: q.currency,
        isLive: true,
      }))
    : GREEK_STOCKS.map(mockToQuote);

  return {
    stocks,
    isLoading: query.isLoading,
    isError: query.isError,
    isLive: hasLiveData,
    lastUpdated: query.data?.lastUpdated ?? null,
    refetch: query.refetch,
  };
}

/**
 * Fetch a single stock quote.
 */
export function useStockQuote(stockId: string) {
  const query = trpc.stocks.getQuote.useQuery(
    { stockId },
    {
      refetchInterval: 30_000,
      staleTime: 15_000,
      retry: 2,
      enabled: !!stockId,
    }
  );

  const mockStock = GREEK_STOCKS.find((s) => s.id === stockId);
  const hasLiveData = query.data?.success === true && !!query.data.data;

  const stock: LiveStockQuote | null = hasLiveData
    ? {
        id: query.data!.data!.id,
        ticker: query.data!.data!.ticker,
        name: query.data!.data!.name,
        price: query.data!.data!.price,
        change: query.data!.data!.change,
        changePercent: query.data!.data!.changePercent,
        sparkline: query.data!.data!.sparkline,
        category: query.data!.data!.category,
        marketCap: query.data!.data!.marketCap,
        dayHigh: query.data!.data!.dayHigh,
        dayLow: query.data!.data!.dayLow,
        volume: query.data!.data!.volume,
        fiftyTwoWeekHigh: query.data!.data!.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: query.data!.data!.fiftyTwoWeekLow,
        currency: query.data!.data!.currency,
        isLive: true,
      }
    : mockStock
    ? mockToQuote(mockStock)
    : null;

  return {
    stock,
    isLoading: query.isLoading,
    isError: query.isError,
    isLive: hasLiveData,
    refetch: query.refetch,
  };
}

/**
 * Fetch chart data for a stock.
 */
export function useStockChart(stockId: string, range: string = "1M") {
  const validRange = ["1D", "1W", "1M", "3M", "1Y", "ALL"].includes(range)
    ? (range as "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL")
    : ("1M" as const);

  const query = trpc.stocks.getChart.useQuery(
    { stockId, range: validRange },
    {
      refetchInterval: range === "1D" ? 60_000 : 300_000,
      staleTime: range === "1D" ? 30_000 : 120_000,
      retry: 2,
      enabled: !!stockId,
    }
  );

  const hasLiveChart =
    query.data?.success === true &&
    !!query.data.data &&
    query.data.data.data.length > 0;

  const mockStock = GREEK_STOCKS.find((s) => s.id === stockId);
  const mockPoints =
    range === "1D"
      ? 48
      : range === "1W"
      ? 168
      : range === "1M"
      ? 30
      : range === "3M"
      ? 90
      : range === "1Y"
      ? 365
      : 730;

  const chartData = hasLiveChart
    ? query.data!.data!.data.map((d) => d.close)
    : mockStock
    ? generateChartData(mockStock.price * 0.9, mockStock.price * 0.02, mockPoints).map(
        (d) => d.value
      )
    : [];

  return {
    chartData,
    isLoading: query.isLoading,
    isError: query.isError,
    isLive: hasLiveChart,
    refetch: query.refetch,
  };
}

/**
 * Mutation to force-refresh the server cache
 */
export function useRefreshCache() {
  return trpc.stocks.refreshCache.useMutation();
}
