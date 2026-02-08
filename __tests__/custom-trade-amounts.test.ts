import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

function readFile(filePath: string): string {
  return fs.readFileSync(path.join(ROOT, filePath), "utf-8");
}

describe("Custom Trade Amounts", () => {
  const trade = readFile("app/(tabs)/trade.tsx");
  const amountInput = readFile("components/features/trading/amount-input.tsx");
  const quickAmountChips = readFile("components/features/trading/quick-amount-chips.tsx");
  const orderPreview = readFile("components/features/trading/order-preview.tsx");

  describe("Custom Amount Input", () => {
    it("should have a TextInput for custom amount entry", () => {
      expect(trade).toMatch(/TextInput/);
      expect(amountInput).toMatch(/TextInput/);
    });

    it("should use decimal-pad keyboard type", () => {
      expect(amountInput).toMatch(/keyboardType=["']decimal-pad["']/);
    });

    it("should display € prefix in the amount hero", () => {
      expect(amountInput).toMatch(/€/);
    });

    it("should have a placeholder of 0.00", () => {
      expect(amountInput).toMatch(/placeholder=["']0\.00["']/);
    });

    it("should use monospace bold font for the amount input", () => {
      expect(amountInput).toMatch(/FontFamily\.monoBold/);
    });

    it("should limit input to 9 characters max", () => {
      expect(amountInput).toMatch(/maxLength=\{9\}/);
    });
  });

  describe("Input Validation", () => {
    it("should have handleAmountChange that sanitizes input", () => {
      expect(trade).toMatch(/handleAmountChange/);
    });

    it("should strip non-numeric characters except decimal point", () => {
      expect(trade).toMatch(/replace\(/);
      expect(trade).toMatch(/\[\^0-9/);
    });

    it("should prevent multiple decimal points", () => {
      expect(trade).toMatch(/parts\.length\s*>\s*2/);
    });

    it("should limit to 2 decimal places", () => {
      expect(trade).toMatch(/parts\[1\]\.length\s*>\s*2/);
    });

    it("should have minimum trade amount of €1", () => {
      expect(trade).toMatch(/Minimum trade amount is €1/);
    });

    it("should check for insufficient balance on buy", () => {
      expect(trade).toMatch(/Insufficient balance/);
    });

    it("should check for insufficient shares on sell", () => {
      expect(trade).toMatch(/Insufficient shares/);
    });

    it("should display validation errors inline", () => {
      expect(amountInput).toMatch(/validationError/);
    });

    it("should highlight input border red on validation error", () => {
      expect(amountInput).toMatch(/validationError/);
    });

    it("should highlight input border primary when valid", () => {
      expect(amountInput).toMatch(/colors\.primary/);
    });
  });

  describe("MAX Button", () => {
    it("should have a MAX button", () => {
      expect(amountInput).toMatch(/MAX/);
      expect(trade).toMatch(/handleMax/);
    });

    it("should compute maxAmount based on buy/sell mode", () => {
      expect(trade).toMatch(/maxAmount/);
    });

    it("should use balance for buy max", () => {
      expect(trade).toMatch(/demoState\.balance/);
    });

    it("should use holding value for sell max", () => {
      expect(trade).toMatch(/currentHoldingValue/);
    });

    it("should set amountText to maxAmount on press", () => {
      expect(trade).toMatch(/setAmountText\(maxAmount\.toFixed\(2\)\)/);
    });

    it("should dismiss keyboard on MAX press", () => {
      expect(trade).toMatch(/Keyboard\.dismiss/);
    });
  });

  describe("Quick Amount Chips", () => {
    it("should render quick amount chips as horizontal scroll", () => {
      expect(quickAmountChips).toMatch(/flexWrap/);
    });

    it("should have quick amounts of 5, 10, 25, 50, 100, 250", () => {
      expect(trade).toMatch(/QUICK_AMOUNTS/);
      expect(trade).toMatch(/\[5,\s*10,\s*25,\s*50,\s*100,\s*250\]/);
    });

    it("should populate input field when quick amount is tapped", () => {
      expect(trade).toMatch(/handleQuickAmount/);
      expect(trade).toMatch(/setAmountText\(amount\.toString\(\)\)/);
    });

    it("should highlight selected quick amount chip", () => {
      expect(quickAmountChips).toMatch(/isSelected/);
      expect(quickAmountChips).toMatch(/selectedAmount\s*===\s*amount/);
    });

    it("should disable chips that exceed max amount", () => {
      expect(quickAmountChips).toMatch(/isDisabled/);
      expect(quickAmountChips).toMatch(/amount\s*>\s*maxAmount/);
    });

    it("should use pill/chip shape (borderRadius 20)", () => {
      expect(quickAmountChips).toMatch(/borderRadius:\s*12/);
    });
  });

  describe("Order Preview", () => {
    it("should show order preview only when amount is valid", () => {
      expect(trade).toMatch(/isValidAmount\s*&&/);
    });

    it("should show estimated shares", () => {
      expect(orderPreview).toMatch(/Est\. shares/);
    });

    it("should show market price", () => {
      expect(orderPreview).toMatch(/Price \(live\)/);
    });

    it("should show commission (€0.00)", () => {
      expect(orderPreview).toMatch(/Commission/);
    });

    it("should show balance after trade", () => {
      expect(orderPreview).toMatch(/Balance after/);
      expect(trade).toMatch(/balanceAfter/);
    });

    it("should compute balance after correctly for buy (subtract)", () => {
      expect(trade).toMatch(/demoState\.balance\s*-\s*parsedAmount/);
    });

    it("should compute balance after correctly for sell (add)", () => {
      expect(trade).toMatch(/demoState\.balance\s*\+\s*parsedAmount/);
    });

    it("should show balance after in red if negative", () => {
      expect(orderPreview).toMatch(/balanceAfter\s*>=\s*0\s*\?\s*["']foreground["']\s*:\s*["']error["']/);
    });
  });

  describe("Swipe to Confirm", () => {
    it("should use SwipeToConfirm component instead of Pressable button", () => {
      expect(trade).toMatch(/<SwipeToConfirm/);
      expect(trade).not.toMatch(/styles\.confirmButton/);
    });

    it("should pass enabled based on isValidAmount", () => {
      expect(trade).toMatch(/enabled=\{isValidAmount\}/);
    });

    it("should show dynamic label with amount and ticker", () => {
      expect(trade).toMatch(/Slide to.*Buy.*Sell/s);
    });

    it("should show 'Enter an amount' when no input", () => {
      expect(trade).toMatch(/Enter an amount/);
    });

    it("should show 'Fix amount to continue' when validation fails", () => {
      expect(trade).toMatch(/Fix amount to continue/);
    });

    it("should use parsedAmount (not selectedAmount) for trade execution", () => {
      expect(trade).toMatch(/amount:\s*parsedAmount/);
    });
  });

  describe("Keyboard Handling", () => {
    it("should import Keyboard from react-native", () => {
      expect(trade).toMatch(/import\s*{[^}]*Keyboard[^}]*}\s*from\s*["']react-native["']/);
    });

    it("should use keyboardShouldPersistTaps on ScrollView", () => {
      expect(trade).toMatch(/keyboardShouldPersistTaps=["']handled["']/);
    });

    it("should dismiss keyboard on quick amount tap", () => {
      expect(trade).toMatch(/Keyboard\.dismiss/);
    });

    it("should have returnKeyType done on amount input", () => {
      expect(amountInput).toMatch(/returnKeyType=["']done["']/);
    });
  });

  describe("No longer uses old preset-only pattern", () => {
    it("should NOT import QUICK_AMOUNTS from mock-data", () => {
      expect(trade).not.toMatch(/import\s*{[^}]*QUICK_AMOUNTS[^}]*}\s*from\s*["']@\/lib\/mock-data["']/);
    });

    it("should NOT have selectedAmount state (replaced by parsedAmount)", () => {
      expect(trade).not.toMatch(/useState<number\s*\|\s*null>\(null\)/);
    });

    it("should NOT have amountsGrid layout (replaced by horizontal chips)", () => {
      expect(trade).not.toMatch(/amountsGrid/);
    });
  });
});
