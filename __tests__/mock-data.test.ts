import { describe, it, expect } from "vitest";
import {
  GREEK_STOCKS,
  TRENDING_STOCKS,
  PORTFOLIO_HOLDINGS,
  SOCIAL_FEED,
  LEADERBOARD,
  DAILY_CHALLENGE,
  ACHIEVEMENTS,
  PORTFOLIO_TOTAL_VALUE,
  PORTFOLIO_TOTAL_PNL,
  PORTFOLIO_PNL_PERCENT,
  PORTFOLIO_SPARKLINE,
  USER_STREAK,
  DEMO_BALANCE,
  generateChartData,
} from "@/lib/mock-data";

describe("Mock Data Layer", () => {
  describe("GREEK_STOCKS", () => {
    it("should contain at least 8 Greek stocks", () => {
      expect(GREEK_STOCKS.length).toBeGreaterThanOrEqual(8);
    });

    it("each stock should have required fields", () => {
      GREEK_STOCKS.forEach((stock) => {
        expect(stock).toHaveProperty("id");
        expect(stock).toHaveProperty("ticker");
        expect(stock).toHaveProperty("name");
        expect(stock).toHaveProperty("price");
        expect(stock).toHaveProperty("change");
        expect(stock).toHaveProperty("changePercent");
        expect(stock).toHaveProperty("sparkline");
        expect(typeof stock.price).toBe("number");
        expect(stock.price).toBeGreaterThan(0);
        expect(Array.isArray(stock.sparkline)).toBe(true);
        expect(stock.sparkline.length).toBeGreaterThan(0);
      });
    });

    it("each stock should have a unique id", () => {
      const ids = GREEK_STOCKS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("each stock should have a unique ticker", () => {
      const tickers = GREEK_STOCKS.map((s) => s.ticker);
      expect(new Set(tickers).size).toBe(tickers.length);
    });
  });

  describe("TRENDING_STOCKS", () => {
    it("should be a subset of GREEK_STOCKS", () => {
      const allIds = GREEK_STOCKS.map((s) => s.id);
      TRENDING_STOCKS.forEach((stock) => {
        expect(allIds).toContain(stock.id);
      });
    });
  });

  describe("PORTFOLIO_HOLDINGS", () => {
    it("should contain at least 3 holdings", () => {
      expect(PORTFOLIO_HOLDINGS.length).toBeGreaterThanOrEqual(3);
    });

    it("each holding should have required fields", () => {
      PORTFOLIO_HOLDINGS.forEach((h) => {
        expect(h).toHaveProperty("asset");
        expect(h.asset).toHaveProperty("ticker");
        expect(h.asset).toHaveProperty("name");
        expect(h).toHaveProperty("shares");
        expect(h).toHaveProperty("avgCost");
        expect(h).toHaveProperty("currentValue");
        expect(h).toHaveProperty("pnl");
        expect(h).toHaveProperty("pnlPercent");
        expect(typeof h.shares).toBe("number");
        expect(h.shares).toBeGreaterThan(0);
      });
    });
  });

  describe("SOCIAL_FEED", () => {
    it("should contain at least 3 posts", () => {
      expect(SOCIAL_FEED.length).toBeGreaterThanOrEqual(3);
    });

    it("each post should have required fields", () => {
      SOCIAL_FEED.forEach((post) => {
        expect(post).toHaveProperty("id");
        expect(post).toHaveProperty("username");
        expect(post).toHaveProperty("content");
        expect(post).toHaveProperty("likes");
        expect(post).toHaveProperty("comments");
        expect(post).toHaveProperty("timestamp");
      });
    });
  });

  describe("LEADERBOARD", () => {
    it("should contain at least 5 entries", () => {
      expect(LEADERBOARD.length).toBeGreaterThanOrEqual(5);
    });

    it("entries should be sorted by rank", () => {
      for (let i = 1; i < LEADERBOARD.length; i++) {
        expect(LEADERBOARD[i].rank).toBeGreaterThan(LEADERBOARD[i - 1].rank);
      }
    });
  });

  describe("DAILY_CHALLENGE", () => {
    it("should have required fields", () => {
      expect(DAILY_CHALLENGE).toHaveProperty("title");
      expect(DAILY_CHALLENGE).toHaveProperty("description");
      expect(DAILY_CHALLENGE).toHaveProperty("reward");
      expect(DAILY_CHALLENGE).toHaveProperty("progress");
      expect(DAILY_CHALLENGE).toHaveProperty("total");
      expect(DAILY_CHALLENGE.progress).toBeLessThanOrEqual(DAILY_CHALLENGE.total);
    });
  });

  describe("ACHIEVEMENTS", () => {
    it("should contain at least 4 achievements", () => {
      expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(4);
    });

    it("each achievement should have required fields", () => {
      ACHIEVEMENTS.forEach((a) => {
        expect(a).toHaveProperty("id");
        expect(a).toHaveProperty("title");
        expect(a).toHaveProperty("description");
        expect(a).toHaveProperty("icon");
        expect(a).toHaveProperty("unlocked");
        expect(typeof a.unlocked).toBe("boolean");
      });
    });
  });

  describe("Portfolio aggregates", () => {
    it("PORTFOLIO_TOTAL_VALUE should be a positive number", () => {
      expect(typeof PORTFOLIO_TOTAL_VALUE).toBe("number");
      expect(PORTFOLIO_TOTAL_VALUE).toBeGreaterThan(0);
    });

    it("PORTFOLIO_TOTAL_PNL should be a number", () => {
      expect(typeof PORTFOLIO_TOTAL_PNL).toBe("number");
    });

    it("PORTFOLIO_PNL_PERCENT should be a number", () => {
      expect(typeof PORTFOLIO_PNL_PERCENT).toBe("number");
    });

    it("PORTFOLIO_SPARKLINE should be a non-empty array of numbers", () => {
      expect(Array.isArray(PORTFOLIO_SPARKLINE)).toBe(true);
      expect(PORTFOLIO_SPARKLINE.length).toBeGreaterThan(0);
      PORTFOLIO_SPARKLINE.forEach((v) => expect(typeof v).toBe("number"));
    });
  });

  describe("USER_STREAK", () => {
    it("should be a non-negative integer", () => {
      expect(typeof USER_STREAK).toBe("number");
      expect(USER_STREAK).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(USER_STREAK)).toBe(true);
    });
  });

  describe("DEMO_BALANCE", () => {
    it("should be 100000", () => {
      expect(DEMO_BALANCE).toBe(100000);
    });
  });

  describe("generateChartData", () => {
    it("should generate the correct number of data points", () => {
      const data = generateChartData(100, 2, 50);
      expect(data.length).toBe(50);
    });

    it("each data point should have a value property", () => {
      const data = generateChartData(100, 2, 10);
      data.forEach((d) => {
        expect(d).toHaveProperty("value");
        expect(typeof d.value).toBe("number");
      });
    });

    it("values should be near the base value", () => {
      const base = 100;
      const data = generateChartData(base, 1, 100);
      data.forEach((d) => {
        // Values should be within a reasonable range of the base
        expect(d.value).toBeGreaterThan(base * 0.5);
        expect(d.value).toBeLessThan(base * 2);
      });
    });
  });
});
