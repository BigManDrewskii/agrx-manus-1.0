import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(ROOT, filePath), "utf-8");
}

describe("Trade History Screen", () => {
  const tradeHistory = readFile("app/trade-history.tsx");
  const rootLayout = readFile("app/_layout.tsx");
  const portfolio = readFile("app/(tabs)/portfolio.tsx");

  // ─── Screen Structure ────────────────────────────────────────────────

  describe("Screen Structure", () => {
    it("should use ScreenContainer for proper SafeArea handling", () => {
      expect(tradeHistory).toMatch(/ScreenContainer/);
      expect(tradeHistory).toMatch(/edges=\{?\[?"top"/);
    });

    it("should have a back button to navigate back", () => {
      expect(tradeHistory).toMatch(/router\.back\(\)/);
      expect(tradeHistory).toMatch(/backButton/);
    });

    it("should display 'Trade History' as the screen title", () => {
      expect(tradeHistory).toMatch(/Trade History/);
      expect(tradeHistory).toMatch(/LargeTitle/);
    });

    it("should use FlatList for the trade list (not ScrollView with map)", () => {
      expect(tradeHistory).toMatch(/FlatList/);
      expect(tradeHistory).not.toMatch(/ScrollView/);
    });

    it("should use AnimatedPressable for interactive elements", () => {
      expect(tradeHistory).toMatch(/AnimatedPressable/);
      expect(tradeHistory).toMatch(/from "@\/components\/ui\/animated-pressable"/);
    });
  });

  // ─── Date Grouping ───────────────────────────────────────────────────

  describe("Date Grouping", () => {
    it("should define date group categories", () => {
      expect(tradeHistory).toMatch(/Today/);
      expect(tradeHistory).toMatch(/Yesterday/);
      expect(tradeHistory).toMatch(/This Week/);
      expect(tradeHistory).toMatch(/Earlier/);
    });

    it("should have a getDateGroup function for categorizing trades", () => {
      expect(tradeHistory).toMatch(/function getDateGroup/);
    });

    it("should render section headers for each date group", () => {
      expect(tradeHistory).toMatch(/sectionHeader/);
      expect(tradeHistory).toMatch(/kind: "header"/);
    });

    it("should flatten sections for FlatList with headers interleaved", () => {
      expect(tradeHistory).toMatch(/flatData/);
      expect(tradeHistory).toMatch(/kind: "header"/);
      expect(tradeHistory).toMatch(/kind: "trade"/);
    });

    it("should format time for today/yesterday trades", () => {
      expect(tradeHistory).toMatch(/function formatTime/);
      expect(tradeHistory).toMatch(/AM|PM/);
    });

    it("should format full date for older trades", () => {
      expect(tradeHistory).toMatch(/function formatFullDate/);
    });
  });

  // ─── Trade Row ────────────────────────────────────────────────────────

  describe("Trade Row Display", () => {
    it("should show a side indicator icon (up for buy, down for sell)", () => {
      expect(tradeHistory).toMatch(/sideIndicator/);
      expect(tradeHistory).toMatch(/arrow\.up/);
      expect(tradeHistory).toMatch(/arrow\.down/);
    });

    it("should display the ticker symbol", () => {
      expect(tradeHistory).toMatch(/trade\.ticker/);
    });

    it("should show BUY or SELL label", () => {
      expect(tradeHistory).toMatch(/BUY/);
      expect(tradeHistory).toMatch(/SELL/);
    });

    it("should display the trade amount in euros", () => {
      expect(tradeHistory).toMatch(/trade\.amount\.toFixed/);
      expect(tradeHistory).toMatch(/€/);
    });

    it("should show shares count and execution price", () => {
      expect(tradeHistory).toMatch(/trade\.shares/);
      expect(tradeHistory).toMatch(/trade\.price/);
      expect(tradeHistory).toMatch(/shares @/);
    });

    it("should use green for buy and red for sell", () => {
      expect(tradeHistory).toMatch(/colors\.success/);
      expect(tradeHistory).toMatch(/colors\.error/);
      expect(tradeHistory).toMatch(/isBuy.*success.*error|sideColor/);
    });

    it("should navigate to asset detail on trade press", () => {
      expect(tradeHistory).toMatch(/handleTradePress/);
      expect(tradeHistory).toMatch(/router\.push.*asset/);
    });
  });

  // ─── Per-Trade P&L ────────────────────────────────────────────────────

  describe("Per-Trade P&L", () => {
    it("should compute P&L for each trade against live prices", () => {
      expect(tradeHistory).toMatch(/getTradeP_L|tradePnL/);
    });

    it("should use live price map from stock quotes", () => {
      expect(tradeHistory).toMatch(/livePriceMap/);
      expect(tradeHistory).toMatch(/useStockQuotes/);
    });

    it("should display P&L with sign and euro symbol", () => {
      expect(tradeHistory).toMatch(/pnl.*>=.*0.*\+/);
      expect(tradeHistory).toMatch(/MonoCaption1/);
    });

    it("should color P&L green for positive and red for negative", () => {
      expect(tradeHistory).toMatch(/pnl.*>=.*0.*colors\.success.*colors\.error/s);
    });
  });

  // ─── Summary Card ─────────────────────────────────────────────────────

  describe("Summary Card", () => {
    it("should display a summary card with total volume", () => {
      expect(tradeHistory).toMatch(/summaryCard/);
      expect(tradeHistory).toMatch(/TOTAL VOLUME/);
    });

    it("should display net P&L in the summary", () => {
      expect(tradeHistory).toMatch(/NET P&L/);
      expect(tradeHistory).toMatch(/totalPnL/);
    });

    it("should show trade count breakdown (buys and sells)", () => {
      expect(tradeHistory).toMatch(/buyCount/);
      expect(tradeHistory).toMatch(/sellCount/);
    });

    it("should only show summary when trades exist", () => {
      expect(tradeHistory).toMatch(/state\.trades\.length > 0/);
    });
  });

  // ─── Empty State ──────────────────────────────────────────────────────

  describe("Empty State", () => {
    it("should show empty state when no trades exist", () => {
      expect(tradeHistory).toMatch(/No Trades Yet/);
      expect(tradeHistory).toMatch(/emptyState/);
    });

    it("should have a Start Trading action button in empty state", () => {
      expect(tradeHistory).toMatch(/Start Trading/);
      expect(tradeHistory).toMatch(/\/\(tabs\)\/trade/);
    });

    it("should show a clock icon in empty state", () => {
      expect(tradeHistory).toMatch(/clock/);
    });
  });

  // ─── Route Registration ───────────────────────────────────────────────

  describe("Route Registration", () => {
    it("should be registered in root layout with slide_from_right animation", () => {
      expect(rootLayout).toMatch(/trade-history/);
      expect(rootLayout).toMatch(/name="trade-history".*animation.*slide_from_right/s);
    });
  });

  // ─── Portfolio Integration ────────────────────────────────────────────

  describe("Portfolio Navigation", () => {
    it("should have a History chip in the Portfolio holdings header", () => {
      expect(portfolio).toMatch(/trade-history/);
      expect(portfolio).toMatch(/History/);
    });

    it("should only show History chip when trades exist", () => {
      expect(portfolio).toMatch(/state\.trades\.length > 0/);
    });
  });

  // ─── Design System Compliance ─────────────────────────────────────────

  describe("Design System Compliance", () => {
    it("should use theme colors from useColors hook", () => {
      expect(tradeHistory).toMatch(/useColors\(\)/);
      expect(tradeHistory).toMatch(/colors\.surface/);
      expect(tradeHistory).toMatch(/colors\.border/);
      expect(tradeHistory).toMatch(/colors\.foreground/);
    });

    it("should use typography components from the design system", () => {
      expect(tradeHistory).toMatch(/from "@\/components\/ui\/typography"/);
      expect(tradeHistory).toMatch(/LargeTitle/);
      expect(tradeHistory).toMatch(/Footnote/);
      expect(tradeHistory).toMatch(/Caption1/);
    });

    it("should use FontFamily constants for font styling", () => {
      expect(tradeHistory).toMatch(/FontFamily\.semibold/);
      expect(tradeHistory).toMatch(/FontFamily\.monoMedium/);
    });

    it("should use StyleSheet.create for styles", () => {
      expect(tradeHistory).toMatch(/StyleSheet\.create/);
    });

    it("should use IconSymbol for icons", () => {
      expect(tradeHistory).toMatch(/IconSymbol/);
      expect(tradeHistory).toMatch(/from "@\/components\/ui\/icon-symbol"/);
    });

    it("should not hardcode any hex color values", () => {
      // Allow only alpha suffixes like + "18" appended to color tokens
      const lines = tradeHistory.split("\n");
      const hardcodedHex = lines.filter(
        (line) =>
          /#[0-9a-fA-F]{3,8}/.test(line) &&
          !line.includes("//") &&
          !line.includes("/*") &&
          !line.includes("*")
      );
      expect(hardcodedHex.length).toBe(0);
    });
  });
});
