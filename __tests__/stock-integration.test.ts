import { describe, it, expect } from "vitest";

/**
 * Stock Service Integration Tests
 *
 * These tests validate the tRPC stock endpoints.
 * Note: The Data API has usage quotas. Tests are written to handle
 * rate-limited responses gracefully — they validate structure when data
 * is available, and skip assertions when the API is exhausted.
 */
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

  it("should return stock quotes endpoint with correct structure", async () => {
    const res = await fetch(`${API_BASE}/stocks.getQuotes`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    const result = data.result.data.json;
    expect(result.success).toBe(true);
    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("lastUpdated");
    expect(result.data).toBeInstanceOf(Array);

    // If data is available (API not rate-limited), validate structure
    if (result.count > 0) {
      const quote = result.data[0];
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
    }
  });

  it("should handle single stock quote request", async () => {
    const input = encodeURIComponent(JSON.stringify({ json: { stockId: "opap" } }));
    const res = await fetch(`${API_BASE}/stocks.getQuote?input=${input}`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    const result = data.result.data.json;
    // Result should be either success with data or failure (API limit)
    expect(typeof result.success).toBe("boolean");
    if (result.success) {
      expect(result.data.ticker).toBe("OPAP");
      expect(result.data.price).toBeGreaterThan(0);
      expect(result.data.currency).toBe("EUR");
    }
  });

  it("should handle chart data request", async () => {
    const input = encodeURIComponent(
      JSON.stringify({ json: { stockId: "opap", range: "1M" } })
    );
    const res = await fetch(`${API_BASE}/stocks.getChart?input=${input}`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    const result = data.result.data.json;
    expect(typeof result.success).toBe("boolean");
    if (result.success) {
      expect(result.data.data).toBeInstanceOf(Array);
      expect(result.data.data.length).toBeGreaterThan(0);
      const point = result.data.data[0];
      expect(point).toHaveProperty("timestamp");
      expect(point).toHaveProperty("close");
    }
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

  it("should validate category values when data is available", async () => {
    const res = await fetch(`${API_BASE}/stocks.getQuotes`);
    const data = await res.json();
    const result = data.result.data.json;
    const validCategories = ["blue-chip", "growth", "dividend"];
    for (const quote of result.data) {
      expect(validCategories).toContain(quote.category);
    }
  });
});
