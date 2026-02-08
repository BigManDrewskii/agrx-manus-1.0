/**
 * AGRX News Hooks
 *
 * Client-side React Query hooks for fetching live news and sentiment data.
 */
import { trpc } from "@/lib/trpc";

/**
 * Hook to fetch news and sentiment for a specific stock.
 * Caches for 5 minutes, refetches on window focus.
 */
export function useStockNews(stockId: string | undefined) {
  return trpc.news.getStockNews.useQuery(
    { stockId: stockId || "" },
    {
      enabled: !!stockId,
      staleTime: 5 * 60 * 1000,       // 5 min
      gcTime: 15 * 60 * 1000,         // 15 min
      refetchOnWindowFocus: true,
      retry: 1,
    }
  );
}

/**
 * Hook to fetch general ATHEX market news.
 * Caches for 5 minutes.
 */
export function useMarketNews() {
  return trpc.news.getMarketNews.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
