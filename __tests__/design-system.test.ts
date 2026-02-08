import { describe, it, expect } from "vitest";

// Import theme config directly
const { themeColors } = require("../theme.config.js");

/**
 * Design System Token Tests
 *
 * Validates that the design system is complete, consistent, and robust.
 * Every token must have both light and dark values, and key semantic tokens
 * must be present for the UI to function correctly.
 */
describe("Design System Tokens", () => {
  const REQUIRED_TOKENS = [
    "primary",
    "primaryAlpha",
    "background",
    "surface",
    "surfaceSecondary",
    "foreground",
    "muted",
    "onPrimary",
    "border",
    "success",
    "successAlpha",
    "warning",
    "warningAlpha",
    "error",
    "errorAlpha",
    "accent",
    "accentAlpha",
    "gold",
    "silver",
    "bronze",
  ];

  it("should contain all required semantic tokens", () => {
    for (const token of REQUIRED_TOKENS) {
      expect(themeColors).toHaveProperty(token);
    }
  });

  it("every token should have both light and dark values", () => {
    for (const [name, swatch] of Object.entries(themeColors)) {
      const s = swatch as { light: string; dark: string };
      expect(s).toHaveProperty("light");
      expect(s).toHaveProperty("dark");
      expect(typeof s.light).toBe("string");
      expect(typeof s.dark).toBe("string");
      expect(s.light.length).toBeGreaterThan(0);
      expect(s.dark.length).toBeGreaterThan(0);
    }
  });

  it("light and dark values should be different for key tokens (not identical)", () => {
    // These tokens MUST differ between light and dark for proper theming
    const mustDiffer = [
      "primary",
      "background",
      "surface",
      "surfaceSecondary",
      "foreground",
      "muted",
      "border",
    ];
    for (const token of mustDiffer) {
      const swatch = themeColors[token] as { light: string; dark: string };
      expect(swatch.light).not.toBe(swatch.dark);
    }
  });

  it("onPrimary should be white in both modes (text on filled buttons)", () => {
    expect(themeColors.onPrimary.light).toBe("#FFFFFF");
    expect(themeColors.onPrimary.dark).toBe("#FFFFFF");
  });

  it("alpha tokens should use rgba format", () => {
    const alphaTokens = ["primaryAlpha", "successAlpha", "warningAlpha", "errorAlpha", "accentAlpha"];
    for (const token of alphaTokens) {
      const swatch = themeColors[token] as { light: string; dark: string };
      expect(swatch.light).toMatch(/^rgba\(/);
      expect(swatch.dark).toMatch(/^rgba\(/);
    }
  });

  it("non-alpha tokens should use hex format", () => {
    const hexTokens = ["primary", "background", "surface", "foreground", "muted", "border", "success", "warning", "error"];
    for (const token of hexTokens) {
      const swatch = themeColors[token] as { light: string; dark: string };
      expect(swatch.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(swatch.dark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("dark mode background should be significantly darker than light mode", () => {
    // Parse hex to get brightness
    const hexToBrightness = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const lightBg = hexToBrightness(themeColors.background.light);
    const darkBg = hexToBrightness(themeColors.background.dark);

    expect(lightBg).toBeGreaterThan(200); // Light bg should be bright
    expect(darkBg).toBeLessThan(50); // Dark bg should be very dark
  });
});

describe("Design System - No Hardcoded Colors in Source", () => {
  it("should not have any hardcoded hex colors in app/ or components/ files", async () => {
    const { execSync } = require("child_process");
    const result = execSync(
      `grep -rn '#[0-9A-Fa-f]\\{6\\}' /home/ubuntu/agrx/app/ /home/ubuntu/agrx/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v 'share-card' | grep -v 'price-alerts' | grep -v 'add-alert-modal' || true`,
      { encoding: "utf-8" }
    );
    expect(result.trim()).toBe("");
  });

  it("should not have any color + string concatenation patterns", async () => {
    const { execSync } = require("child_process");
    // Use a file-based approach to avoid shell escaping issues
    const result = execSync(
      `grep -rn -E 'colors\.[a-zA-Z]+ \+ .' /home/ubuntu/agrx/app/ /home/ubuntu/agrx/components/ --include='*.tsx' 2>/dev/null || true`,
      { encoding: "utf-8" }
    );
    // Filter to only lines with color string concatenation (e.g. colors.primary + "20")
    const violations = result.split('\n').filter((line: string) => /colors\.[a-zA-Z]+ \+ ["']/.test(line));
    expect(violations).toEqual([]);
  });
});
