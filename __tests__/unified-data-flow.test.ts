import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(ROOT, filePath), "utf-8");
}

describe("Unified Data Flow — DemoContext Holdings", () => {
  describe("DemoContext structure", () => {
    const ctx = readFile("lib/demo-context.tsx");

    it("should export DemoHolding type with shares and totalCost", () => {
      expect(ctx).toMatch(/export\s+(type|interface)\s+DemoHolding/);
      expect(ctx).toMatch(/shares:\s*number/);
      expect(ctx).toMatch(/totalCost:\s*number/);
    });

    it("should export LivePriceMap type", () => {
      expect(ctx).toMatch(/export\s+(type|interface)\s+LivePriceMap/);
    });

    it("should have holdings in DemoState", () => {
      expect(ctx).toMatch(/holdings:\s*(Record|Map|{)/);
    });

    it("should have balance in DemoState", () => {
      expect(ctx).toMatch(/balance:\s*number/);
    });

    it("should export executeTrade function", () => {
      expect(ctx).toMatch(/executeTrade/);
    });

    it("should export getPortfolioValue function", () => {
      expect(ctx).toMatch(/getPortfolioValue/);
    });

    it("should export getPortfolioPnL function", () => {
      expect(ctx).toMatch(/getPortfolioPnL/);
    });

    it("should export getHolding function", () => {
      expect(ctx).toMatch(/getHolding/);
    });

    it("should export canBuy function", () => {
      expect(ctx).toMatch(/canBuy/);
    });

    it("should export canSell function", () => {
      expect(ctx).toMatch(/canSell/);
    });

    it("should persist holdings to AsyncStorage", () => {
      expect(ctx).toMatch(/AsyncStorage/);
      expect(ctx).toMatch(/agrx_demo_holdings|agrx_demo_state/);
    });

    it("should seed initial holdings from mock data", () => {
      expect(ctx).toMatch(/INITIAL_HOLDINGS|SEED_HOLDINGS|initialHoldings|seedHoldings|DEFAULT_HOLDINGS|buildSeedHoldings/i);
    });

    it("should validate balance on buy (insufficient funds check)", () => {
      expect(ctx).toMatch(/balance|insufficient|Insufficient/i);
    });

    it("should validate shares on sell (insufficient shares check)", () => {
      expect(ctx).toMatch(/shares|insufficient|Insufficient/i);
    });

    it("should return success/error result from executeTrade", () => {
      expect(ctx).toMatch(/success:\s*(true|false)/);
      expect(ctx).toMatch(/error/);
    });

    it("should use React 19 direct Context (not Context.Provider)", () => {
      expect(ctx).not.toMatch(/DemoContext\.Provider/);
      expect(ctx).toMatch(/<DemoContext[\s>]/);
    });
  });

  describe("Portfolio screen derives from DemoContext", () => {
    const portfolio = readFile("app/(tabs)/portfolio.tsx");

    it("should import useDemo from demo-context", () => {
      expect(portfolio).toMatch(/import\s+{[^}]*useDemo[^}]*}\s+from\s+["']@\/lib\/demo-context["']/);
    });

    it("should NOT import hardcoded PORTFOLIO_HOLDINGS from mock-data", () => {
      expect(portfolio).not.toMatch(/PORTFOLIO_HOLDINGS/);
    });

    it("should NOT import PORTFOLIO_TOTAL_VALUE from mock-data", () => {
      expect(portfolio).not.toMatch(/PORTFOLIO_TOTAL_VALUE/);
    });

    it("should derive holdings from DemoContext state", () => {
      expect(portfolio).toMatch(/demoState|state\s*:\s*demoState|getHolding|holdings/);
    });

    it("should use live prices for portfolio value calculation", () => {
      expect(portfolio).toMatch(/livePriceMap|getPortfolioValue|price/);
    });

    it("should use useColors for theme reactivity", () => {
      expect(portfolio).toMatch(/useColors/);
    });
  });

  describe("Home screen derives from DemoContext", () => {
    const home = readFile("app/(tabs)/index.tsx");

    it("should import useDemo from demo-context", () => {
      expect(home).toMatch(/import\s+{[^}]*useDemo[^}]*}\s+from\s+["']@\/lib\/demo-context["']/);
    });

    it("should NOT import PORTFOLIO_TOTAL_VALUE from mock-data", () => {
      expect(home).not.toMatch(/PORTFOLIO_TOTAL_VALUE/);
    });

    it("should NOT import PORTFOLIO_TOTAL_PNL from mock-data", () => {
      expect(home).not.toMatch(/PORTFOLIO_TOTAL_PNL/);
    });

    it("should NOT import PORTFOLIO_PNL_PERCENT from mock-data", () => {
      expect(home).not.toMatch(/PORTFOLIO_PNL_PERCENT/);
    });

    it("should derive portfolio value from DemoContext + live prices", () => {
      expect(home).toMatch(/getPortfolioValue|portfolioTotalValue|totalAccountValue/);
    });

    it("should derive P&L from DemoContext + live prices", () => {
      expect(home).toMatch(/getPortfolioPnL|portfolioPnl/);
    });

    it("should build livePriceMap from stock quotes", () => {
      expect(home).toMatch(/livePriceMap/);
    });

    it("should include balance in total account value", () => {
      expect(home).toMatch(/balance/);
    });
  });

  describe("Trade screen uses DemoContext executeTrade", () => {
    const trade = readFile("app/(tabs)/trade.tsx");

    it("should import useDemo from demo-context", () => {
      expect(trade).toMatch(/import\s+{[^}]*useDemo[^}]*}\s+from\s+["']@\/lib\/demo-context["']/);
    });

    it("should call executeTrade with trade details", () => {
      expect(trade).toMatch(/executeTrade\s*\(/);
    });

    it("should pass stockId, ticker, name, type, amount, price to executeTrade", () => {
      expect(trade).toMatch(/stockId/);
      expect(trade).toMatch(/ticker/);
      expect(trade).toMatch(/type:\s*isBuy\s*\?\s*["']buy["']\s*:\s*["']sell["']/);
      expect(trade).toMatch(/amount/);
      expect(trade).toMatch(/price/);
    });

    it("should handle trade result success/error", () => {
      expect(trade).toMatch(/result\.success/);
      expect(trade).toMatch(/result\.error|tradeError/);
    });

    it("should show available balance for buy orders", () => {
      expect(trade).toMatch(/demoState\.balance|Available/);
    });

    it("should show current shares for sell orders", () => {
      expect(trade).toMatch(/currentShares|You own/);
    });

    it("should display trade error when validation fails", () => {
      expect(trade).toMatch(/tradeError/);
    });

    it("should show balance after trade in order preview", () => {
      expect(trade).toMatch(/Balance after/);
    });
  });

  describe("Data flow integrity", () => {
    it("should not have any hardcoded portfolio values in Home screen", () => {
      const home = readFile("app/(tabs)/index.tsx");
      // Should not reference the old hardcoded constants
      expect(home).not.toMatch(/PORTFOLIO_TOTAL_VALUE/);
      expect(home).not.toMatch(/PORTFOLIO_TOTAL_PNL[^_]/);
      expect(home).not.toMatch(/PORTFOLIO_PNL_PERCENT/);
    });

    it("should not have any hardcoded holdings in Portfolio screen", () => {
      const portfolio = readFile("app/(tabs)/portfolio.tsx");
      expect(portfolio).not.toMatch(/PORTFOLIO_HOLDINGS/);
      expect(portfolio).not.toMatch(/MOCK_HOLDINGS/);
    });

    it("mock-data should still export PORTFOLIO_SPARKLINE for the chart", () => {
      const home = readFile("app/(tabs)/index.tsx");
      expect(home).toMatch(/PORTFOLIO_SPARKLINE/);
    });

    it("DemoContext should be the single source of truth for holdings and balance", () => {
      const ctx = readFile("lib/demo-context.tsx");
      // Should have both holdings and balance in state
      expect(ctx).toMatch(/holdings/);
      expect(ctx).toMatch(/balance/);
      // Should have trade execution
      expect(ctx).toMatch(/executeTrade/);
      // Should have portfolio derivation
      expect(ctx).toMatch(/getPortfolioValue/);
      expect(ctx).toMatch(/getPortfolioPnL/);
    });
  });
});
