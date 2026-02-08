/**
 * AGRX Stock Router
 * 
 * tRPC router exposing live ATHEX stock data endpoints.
 * All endpoints are public (no auth required) for the MVP.
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getStockQuote,
  getMultipleQuotes,
  getStockChart,
  getAvailableStocks,
  clearCache,
} from "./stockService";

export const stockRouter = router({
  /**
   * Get a single stock quote by ID
   */
  getQuote: publicProcedure
    .input(z.object({ stockId: z.string() }))
    .query(async ({ input }) => {
      const quote = await getStockQuote(input.stockId);
      if (!quote) {
        return { success: false as const, error: "Stock not found" };
      }
      return { success: true as const, data: quote };
    }),

  /**
   * Get quotes for multiple stocks (or all if no IDs provided)
   */
  getQuotes: publicProcedure
    .input(
      z.object({
        stockIds: z.array(z.string()).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const quotes = await getMultipleQuotes(input?.stockIds);
      return {
        success: true as const,
        data: quotes,
        count: quotes.length,
        lastUpdated: Date.now(),
      };
    }),

  /**
   * Get chart data for a stock
   */
  getChart: publicProcedure
    .input(
      z.object({
        stockId: z.string(),
        range: z.enum(["1D", "1W", "1M", "3M", "1Y", "ALL"]).default("1M"),
      })
    )
    .query(async ({ input }) => {
      const chart = await getStockChart(input.stockId, input.range);
      if (!chart) {
        return { success: false as const, error: "Chart data not found" };
      }
      return { success: true as const, data: chart };
    }),

  /**
   * Get list of available stock IDs
   */
  getAvailable: publicProcedure.query(() => {
    return {
      success: true as const,
      data: getAvailableStocks(),
    };
  }),

  /**
   * Force refresh cache (for pull-to-refresh)
   */
  refreshCache: publicProcedure.mutation(() => {
    clearCache();
    return { success: true as const };
  }),
});
