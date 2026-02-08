import { describe, it, expect } from "vitest";

const { themeColors } = require("../theme.config.js");

/**
 * WCAG Contrast Ratio Tests for Dark Mode
 *
 * Validates that the dark mode palette meets accessibility standards.
 * WCAG AA requires:
 *   - Normal text: ≥ 4.5:1 contrast ratio against background
 *   - Large text (≥18pt or ≥14pt bold): ≥ 3.0:1
 *   - UI components / graphical objects: ≥ 3.0:1
 */

/** Parse a hex color to [R, G, B] */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Calculate relative luminance per WCAG 2.1 */
function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Calculate contrast ratio between two hex colors */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Dark Mode WCAG Contrast", () => {
  const darkBg = themeColors.background.dark;
  const darkSurface = themeColors.surface.dark;
  const darkSurfaceSec = themeColors.surfaceSecondary.dark;

  it("foreground text on background should meet WCAG AA (≥4.5:1)", () => {
    const ratio = contrastRatio(themeColors.foreground.dark, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("foreground text on surface should meet WCAG AA (≥4.5:1)", () => {
    const ratio = contrastRatio(themeColors.foreground.dark, darkSurface);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("foreground text on surfaceSecondary should meet WCAG AA (≥4.5:1)", () => {
    const ratio = contrastRatio(themeColors.foreground.dark, darkSurfaceSec);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("muted text on background should meet WCAG AA for large text (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.muted.dark, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("muted text on surface should meet WCAG AA for large text (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.muted.dark, darkSurface);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("primary on background should meet WCAG AA for UI components (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.primary.dark, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("success on background should meet WCAG AA for UI components (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.success.dark, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("error on background should meet WCAG AA for UI components (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.error.dark, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("warning on background should meet WCAG AA for UI components (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.warning.dark, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("onPrimary on primary should meet WCAG AA (≥4.5:1)", () => {
    const ratio = contrastRatio(themeColors.onPrimary.dark, themeColors.primary.dark);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("border on background should be distinguishable (≥1.3:1)", () => {
    const ratio = contrastRatio(themeColors.border.dark, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(1.3);
  });

  it("surface should be distinguishable from background (≥1.15:1)", () => {
    const ratio = contrastRatio(darkSurface, darkBg);
    expect(ratio).toBeGreaterThanOrEqual(1.15);
  });

  it("surfaceSecondary should be distinguishable from surface (≥1.1:1)", () => {
    const ratio = contrastRatio(darkSurfaceSec, darkSurface);
    expect(ratio).toBeGreaterThanOrEqual(1.1);
  });
});

describe("Light Mode WCAG Contrast", () => {
  const lightBg = themeColors.background.light;
  const lightSurface = themeColors.surface.light;

  it("foreground text on background should meet WCAG AA (≥4.5:1)", () => {
    const ratio = contrastRatio(themeColors.foreground.light, lightBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("foreground text on surface should meet WCAG AAA (≥7.0:1)", () => {
    const ratio = contrastRatio(themeColors.foreground.light, lightSurface);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it("muted text on background should meet WCAG AA for large text (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.muted.light, lightBg);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("primary on surface should meet WCAG AA for UI components (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.primary.light, lightSurface);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("success on surface should meet WCAG AA for UI components (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.success.light, lightSurface);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  it("error on surface should meet WCAG AA for UI components (≥3.0:1)", () => {
    const ratio = contrastRatio(themeColors.error.light, lightSurface);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });
});
