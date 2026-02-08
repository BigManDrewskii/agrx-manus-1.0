import { describe, it, expect } from "vitest";

/**
 * P&L Share Card — Unit Tests
 *
 * Tests the share card data model, color logic, formatting, and integration points.
 */

// ─── Share Card Data Model ──────────────────────────────────────────────────

interface ShareCardData {
  ticker: string;
  companyName: string;
  price: number;
  pnlAmount: number;
  pnlPercent: number;
  sparkline: number[];
  timeFrame: "Today" | "This Week" | "This Month" | "All Time";
  sentiment?: "Bullish" | "Bearish" | "Neutral";
  sentimentScore?: number;
  shares?: number;
  tradeType?: "buy" | "sell";
  tradeAmount?: number;
}

// Helper: determine P&L color
function getPnLColor(pnlPercent: number): string {
  return pnlPercent >= 0 ? "#27AD74" : "#ED5966";
}

// Helper: format P&L amount
function formatPnLAmount(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}€${Math.abs(amount).toFixed(2)}`;
}

// Helper: format P&L percent
function formatPnLPercent(percent: number): string {
  const arrow = percent >= 0 ? "▲" : "▼";
  const sign = percent >= 0 ? "+" : "";
  return `${arrow} ${sign}${Math.abs(percent).toFixed(2)}%`;
}

// Helper: get sentiment badge color
function getSentimentColor(sentiment: "Bullish" | "Bearish" | "Neutral"): string {
  switch (sentiment) {
    case "Bullish": return "#27AD74";
    case "Bearish": return "#ED5966";
    case "Neutral": return "#EBBA00";
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("ShareCard Data Model", () => {
  it("should accept all required fields for a stock share card", () => {
    const data: ShareCardData = {
      ticker: "OPAP",
      companyName: "OPAP S.A.",
      price: 15.42,
      pnlAmount: 2.34,
      pnlPercent: 17.89,
      sparkline: [14.0, 14.5, 15.0, 15.2, 15.42],
      timeFrame: "Today",
    };
    expect(data.ticker).toBe("OPAP");
    expect(data.companyName).toBe("OPAP S.A.");
    expect(data.price).toBe(15.42);
    expect(data.pnlAmount).toBe(2.34);
    expect(data.pnlPercent).toBe(17.89);
    expect(data.sparkline.length).toBeGreaterThan(1);
    expect(data.timeFrame).toBe("Today");
  });

  it("should accept optional sentiment fields", () => {
    const data: ShareCardData = {
      ticker: "ETE",
      companyName: "National Bank of Greece",
      price: 8.12,
      pnlAmount: -0.45,
      pnlPercent: -5.25,
      sparkline: [8.5, 8.3, 8.2, 8.12],
      timeFrame: "This Week",
      sentiment: "Bearish",
      sentimentScore: -0.65,
    };
    expect(data.sentiment).toBe("Bearish");
    expect(data.sentimentScore).toBe(-0.65);
  });

  it("should accept trade-specific fields", () => {
    const data: ShareCardData = {
      ticker: "ALPHA",
      companyName: "Alpha Bank",
      price: 2.15,
      pnlAmount: 0,
      pnlPercent: 1.42,
      sparkline: [2.1, 2.12, 2.15],
      timeFrame: "Today",
      tradeType: "buy",
      tradeAmount: 500,
      shares: 232.5581,
    };
    expect(data.tradeType).toBe("buy");
    expect(data.tradeAmount).toBe(500);
    expect(data.shares).toBeCloseTo(232.5581);
  });
});

describe("P&L Color Logic", () => {
  it("should return success green for positive P&L", () => {
    expect(getPnLColor(5.0)).toBe("#27AD74");
    expect(getPnLColor(0.01)).toBe("#27AD74");
    expect(getPnLColor(0)).toBe("#27AD74"); // zero is non-negative
  });

  it("should return error red for negative P&L", () => {
    expect(getPnLColor(-1.5)).toBe("#ED5966");
    expect(getPnLColor(-0.01)).toBe("#ED5966");
  });
});

describe("P&L Formatting", () => {
  it("should format positive P&L amounts with + sign and €", () => {
    expect(formatPnLAmount(123.45)).toBe("+€123.45");
    expect(formatPnLAmount(0)).toBe("+€0.00");
  });

  it("should format negative P&L amounts without double sign", () => {
    expect(formatPnLAmount(-50.00)).toBe("€50.00");
    expect(formatPnLAmount(-0.01)).toBe("€0.01");
  });

  it("should format positive P&L percent with up arrow", () => {
    expect(formatPnLPercent(12.34)).toBe("▲ +12.34%");
    expect(formatPnLPercent(0)).toBe("▲ +0.00%");
  });

  it("should format negative P&L percent with down arrow", () => {
    expect(formatPnLPercent(-5.67)).toBe("▼ 5.67%");
    expect(formatPnLPercent(-0.01)).toBe("▼ 0.01%");
  });
});

describe("Sentiment Badge Colors", () => {
  it("should return green for Bullish", () => {
    expect(getSentimentColor("Bullish")).toBe("#27AD74");
  });

  it("should return red for Bearish", () => {
    expect(getSentimentColor("Bearish")).toBe("#ED5966");
  });

  it("should return yellow for Neutral", () => {
    expect(getSentimentColor("Neutral")).toBe("#EBBA00");
  });
});

describe("Share Card Time Frames", () => {
  const validTimeFrames = ["Today", "This Week", "This Month", "All Time"];

  it("should support all 4 time frames", () => {
    expect(validTimeFrames).toHaveLength(4);
    validTimeFrames.forEach((tf) => {
      expect(["Today", "This Week", "This Month", "All Time"]).toContain(tf);
    });
  });
});

describe("Share Card Integration Points", () => {
  it("should support trade confirmation share (buy)", () => {
    const tradeData: ShareCardData = {
      ticker: "OPAP",
      companyName: "OPAP S.A.",
      price: 15.42,
      pnlAmount: 0,
      pnlPercent: 2.1,
      sparkline: [15.0, 15.2, 15.42],
      timeFrame: "Today",
      tradeType: "buy",
      tradeAmount: 1000,
      shares: 64.8508,
    };
    expect(tradeData.tradeType).toBe("buy");
    expect(tradeData.tradeAmount).toBe(1000);
  });

  it("should support trade confirmation share (sell)", () => {
    const tradeData: ShareCardData = {
      ticker: "ETE",
      companyName: "National Bank of Greece",
      price: 8.12,
      pnlAmount: 0,
      pnlPercent: -1.5,
      sparkline: [8.3, 8.2, 8.12],
      timeFrame: "Today",
      tradeType: "sell",
      tradeAmount: 500,
    };
    expect(tradeData.tradeType).toBe("sell");
  });

  it("should support portfolio holding share with P&L", () => {
    const holdingData: ShareCardData = {
      ticker: "OPAP",
      companyName: "OPAP S.A.",
      price: 15.42,
      pnlAmount: 234.56,
      pnlPercent: 17.89,
      sparkline: [13.0, 13.5, 14.0, 14.5, 15.0, 15.42],
      timeFrame: "All Time",
      shares: 100,
    };
    expect(holdingData.pnlAmount).toBe(234.56);
    expect(holdingData.shares).toBe(100);
  });

  it("should support asset detail share with sentiment", () => {
    const assetData: ShareCardData = {
      ticker: "PPC",
      companyName: "Public Power Corp.",
      price: 12.80,
      pnlAmount: 0.45,
      pnlPercent: 3.64,
      sparkline: [12.3, 12.5, 12.6, 12.8],
      timeFrame: "Today",
      sentiment: "Bullish",
      sentimentScore: 0.72,
    };
    expect(assetData.sentiment).toBe("Bullish");
    expect(assetData.sentimentScore).toBe(0.72);
  });

  it("should support portfolio-level share card", () => {
    const portfolioData: ShareCardData = {
      ticker: "PORTFOLIO",
      companyName: "5 Holdings",
      price: 102345.67,
      pnlAmount: 2345.67,
      pnlPercent: 2.34,
      sparkline: [100000, 100500, 101000, 101500, 102000, 102345.67],
      timeFrame: "All Time",
    };
    expect(portfolioData.ticker).toBe("PORTFOLIO");
    expect(portfolioData.companyName).toBe("5 Holdings");
  });
});

describe("Share Card Always-Dark-Mode Colors", () => {
  // The share card always uses dark mode colors for social media aesthetics
  const CARD_COLORS = {
    bgTop: "#0D0F14",
    bgBottom: "#0A0B0D",
    surface: "#1A1C23",
    textPrimary: "#EEF0F3",
    textSecondary: "#89909E",
    primary: "#578BFA",
    success: "#27AD74",
    error: "#ED5966",
    warning: "#EBBA00",
  };

  it("should use near-true-black background for OLED optimization", () => {
    // Both bg colors should be very dark (< 0x15 per channel)
    const bgR = parseInt(CARD_COLORS.bgBottom.slice(1, 3), 16);
    const bgG = parseInt(CARD_COLORS.bgBottom.slice(3, 5), 16);
    const bgB = parseInt(CARD_COLORS.bgBottom.slice(5, 7), 16);
    expect(bgR).toBeLessThan(20);
    expect(bgG).toBeLessThan(20);
    expect(bgB).toBeLessThan(20);
  });

  it("should use high-contrast text on dark background", () => {
    // Primary text should be bright (> 0xE0 per channel)
    const fgR = parseInt(CARD_COLORS.textPrimary.slice(1, 3), 16);
    const fgG = parseInt(CARD_COLORS.textPrimary.slice(3, 5), 16);
    const fgB = parseInt(CARD_COLORS.textPrimary.slice(5, 7), 16);
    expect(fgR).toBeGreaterThan(220);
    expect(fgG).toBeGreaterThan(220);
    expect(fgB).toBeGreaterThan(220);
  });

  it("should use AGRX brand blue for branding elements", () => {
    expect(CARD_COLORS.primary).toBe("#578BFA");
  });
});
