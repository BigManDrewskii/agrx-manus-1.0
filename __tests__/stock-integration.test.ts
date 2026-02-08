import { describe, it, expect } from "vitest";

// Test the stock service data structures and logic
describe("Stock Service Integration", () => {
  const API_BASE = "http://127.0.0.1:3000/api/trpc";

  it("should return available stock list", async () => {
    const res = await fetch(`${API_BASE}/stocks.getAvailable`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.result.data.json.success).toBe(true);
    expect(data.result.data.json.data).toBeInstanceOf(Array);
    expect(data.result.data.json.data.length).toBeGreaterThanOrEqual(10);
    expect(data.result.data.json.data).toContain("opap");
    expect(data.result.data.json.data).toContain("ete");
    expect(data.result.data.json.data).toContain("alpha");
  });

  it("should return all stock quotes with live data", async () => {
    const res = await fetch(`${API_BASE}/stocks.getQuotes`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    const result = data.result.data.json;
    expect(result.success).toBe(true);
    expect(result.count).toBeGreaterThanOrEqual(10);
    expect(result.data).toBeInstanceOf(Array);

    // Verify each quote has required fields
    for (const quote of result.data) {
      expect(quote).toHaveProperty("id");
      expect(quote).toHaveProperty("ticker");
      expect(quote).toHaveProperty("name");
      expect(quote).toHaveProperty("price");
      expect(quote).toHaveProperty("change");
      expect(quote).toHaveProperty("changePercent");
      expect(quote).toHaveProperty("sparkline");
      expect(quote).toHaveProperty("category");
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.sparkline).toBeInstanceOf(Array);
      expect(quote.sparkline.length).toBeGreaterThan(0);
    }
  });

  it("should return a single stock quote for OPAP", async () => {
    const input = encodeURIComponent(JSON.stringify({ json: { stockId: "opap" } }));
    const res = await fetch(`${API_BASE}/stocks.getQuote?input=${input}`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    const result = data.result.data.json;
    expect(result.success).toBe(true);
    expect(result.data.ticker).toBe("OPAP");
    expect(result.data.price).toBeGreaterThan(0);
    expect(result.data.volume).toBeGreaterThanOrEqual(0);
    expect(result.data.dayHigh).toBeGreaterThan(0);
    expect(result.data.dayLow).toBeGreaterThan(0);
    expect(result.data.currency).toBe("EUR");
  });

  it("should return chart data for a stock", async () => {
    const input = encodeURIComponent(
      JSON.stringify({ json: { stockId: "opap", range: "1M" } })
    );
    const res = await fetch(`${API_BASE}/stocks.getChart?input=${input}`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    const result = data.result.data.json;
    expect(result.success).toBe(true);
    expect(result.data.data).toBeInstanceOf(Array);
    expect(result.data.data.length).toBeGreaterThan(0);

    // Verify chart data points have OHLCV structure
    const point = result.data.data[0];
    expect(point).toHaveProperty("timestamp");
    expect(point).toHaveProperty("open");
    expect(point).toHaveProperty("high");
    expect(point).toHaveProperty("low");
    expect(point).toHaveProperty("close");
    expect(point).toHaveProperty("volume");
    expect(point.close).toBeGreaterThan(0);
  });

  it("should handle invalid stock ID gracefully", async () => {
    const input = encodeURIComponent(
      JSON.stringify({ json: { stockId: "invalid_stock_xyz" } })
    );
    const res = await fetch(`${API_BASE}/stocks.getQuote?input=${input}`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    const result = data.result.data.json;
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should refresh cache via mutation", async () => {
    const res = await fetch(`${API_BASE}/stocks.refreshCache`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: {} }),
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.result.data.json.success).toBe(true);
  });

  it("should return quotes with consistent category values", async () => {
    const res = await fetch(`${API_BASE}/stocks.getQuotes`);
    const data = await res.json();
    const result = data.result.data.json;
    const validCategories = ["blue-chip", "growth", "dividend", "etf"];
    for (const quote of result.data) {
      expect(validCategories).toContain(quote.category);
    }
  });
});
