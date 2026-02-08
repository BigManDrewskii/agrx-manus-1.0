/**
 * News Integration Tests
 *
 * Validates the news service endpoints and data structure.
 * Uses the tRPC superjson response format: result.data.json
 */
import { describe, it, expect } from "vitest";

const API_BASE = "http://127.0.0.1:3000/api/trpc";

function encodeInput(obj: Record<string, unknown>): string {
  return encodeURIComponent(JSON.stringify({ json: obj }));
}

describe("News Service Integration", () => {
  it("should return market news endpoint with correct structure", async () => {
    const res = await fetch(`${API_BASE}/news.getMarketNews`);
    expect(res.ok).toBe(true);

    const json = await res.json();
    const data = json.result?.data?.json;
    expect(data).toBeDefined();

    // Should have success field
    expect(typeof data.success).toBe("boolean");

    if (data.success && data.data) {
      // Articles should be an array
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const article = data.data[0];
        // Each article should have required fields
        expect(typeof article.title).toBe("string");
        expect(article.title.length).toBeGreaterThan(0);
        expect(typeof article.source).toBe("string");
        expect(typeof article.url).toBe("string");
        expect(article.url).toMatch(/^https?:\/\//);
        expect(typeof article.publishedAt).toBe("string");
        expect(typeof article.relativeTime).toBe("string");
      }

      // Should have count and lastUpdated
      expect(typeof data.count).toBe("number");
      expect(typeof data.lastUpdated).toBe("number");
    }
  });

  it("should return stock news with sentiment for a valid stock", async () => {
    const input = encodeInput({ stockId: "opap" });
    const res = await fetch(`${API_BASE}/news.getStockNews?input=${input}`);
    expect(res.ok).toBe(true);

    const json = await res.json();
    const data = json.result?.data?.json;
    expect(data).toBeDefined();
    expect(typeof data.success).toBe("boolean");

    if (data.success && data.data) {
      const stockNews = data.data;

      // Should have stockId
      expect(stockNews.stockId).toBe("opap");

      // Should have articles array
      expect(Array.isArray(stockNews.articles)).toBe(true);

      // Should have sentiment object
      expect(stockNews.sentiment).toBeDefined();
      expect(typeof stockNews.sentiment.score).toBe("number");
      expect(stockNews.sentiment.score).toBeGreaterThanOrEqual(-1);
      expect(stockNews.sentiment.score).toBeLessThanOrEqual(1);
      expect(["Bullish", "Bearish", "Neutral"]).toContain(stockNews.sentiment.label);
      expect(typeof stockNews.sentiment.bullishPercent).toBe("number");
      expect(typeof stockNews.sentiment.bearishPercent).toBe("number");
      expect(typeof stockNews.sentiment.neutralPercent).toBe("number");

      // Percentages should roughly sum to 100
      const totalPercent =
        stockNews.sentiment.bullishPercent +
        stockNews.sentiment.bearishPercent +
        stockNews.sentiment.neutralPercent;
      expect(totalPercent).toBeGreaterThanOrEqual(95);
      expect(totalPercent).toBeLessThanOrEqual(105);

      // Should have lastUpdated
      expect(typeof stockNews.lastUpdated).toBe("number");

      // If articles exist, validate structure
      if (stockNews.articles.length > 0) {
        const article = stockNews.articles[0];
        expect(typeof article.title).toBe("string");
        expect(typeof article.source).toBe("string");
        expect(typeof article.url).toBe("string");
        expect(typeof article.publishedAt).toBe("string");
        expect(typeof article.relativeTime).toBe("string");
        // Individual article sentiment should be valid
        if (article.sentiment) {
          expect(["bullish", "bearish", "neutral"]).toContain(article.sentiment);
        }
      }
    }
  });

  it("should handle unknown stock ID gracefully", async () => {
    const input = encodeInput({ stockId: "nonexistent_xyz" });
    const res = await fetch(`${API_BASE}/news.getStockNews?input=${input}`);
    expect(res.ok).toBe(true);

    const json = await res.json();
    const data = json.result?.data?.json;
    expect(data).toBeDefined();
    expect(typeof data.success).toBe("boolean");

    if (data.success && data.data) {
      // Even for unknown stocks, should return valid structure
      expect(data.data.stockId).toBe("nonexistent_xyz");
      expect(Array.isArray(data.data.articles)).toBe(true);
      expect(data.data.sentiment).toBeDefined();
    }
  });

  it("should return articles sorted by date (newest first) for market news", async () => {
    const res = await fetch(`${API_BASE}/news.getMarketNews`);
    const json = await res.json();
    const data = json.result?.data?.json;

    if (data?.success && data.data && data.data.length >= 2) {
      for (let i = 0; i < data.data.length - 1; i++) {
        const dateA = new Date(data.data[i].publishedAt).getTime();
        const dateB = new Date(data.data[i + 1].publishedAt).getTime();
        expect(dateA).toBeGreaterThanOrEqual(dateB);
      }
    }
  });

  it("should tag individual articles with sentiment labels", async () => {
    const input = encodeInput({ stockId: "opap" });
    const res = await fetch(`${API_BASE}/news.getStockNews?input=${input}`);
    const json = await res.json();
    const data = json.result?.data?.json;

    if (data?.success && data.data?.articles?.length > 0) {
      for (const article of data.data.articles) {
        // Each article should have a sentiment tag
        expect(["bullish", "bearish", "neutral"]).toContain(article.sentiment);
      }
    }
  });
});
