/**
 * AGRX News Router
 *
 * tRPC router exposing live news and sentiment endpoints.
 * Uses Google News RSS (free) + OpenRouter for sentiment analysis.
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getStockNews, getMarketNews, clearNewsCache } from "./newsService";

export const newsRouter = router({
  /**
   * Get news and sentiment for a specific stock
   */
  getStockNews: publicProcedure
    .input(z.object({ stockId: z.string() }))
    .query(async ({ input }) => {
      try {
        const news = await getStockNews(input.stockId);
        return { success: true as const, data: news };
      } catch (error) {
        console.error(`[NewsRouter] Failed to get news for ${input.stockId}:`, error);
        return { success: false as const, error: "Failed to fetch news" };
      }
    }),

  /**
   * Get general ATHEX market news
   */
  getMarketNews: publicProcedure.query(async () => {
    try {
      const articles = await getMarketNews();
      return {
        success: true as const,
        data: articles,
        count: articles.length,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error("[NewsRouter] Failed to get market news:", error);
      return { success: false as const, error: "Failed to fetch market news" };
    }
  }),

  /**
   * Force refresh news cache
   */
  refreshNews: publicProcedure.mutation(() => {
    clearNewsCache();
    return { success: true as const };
  }),
});
