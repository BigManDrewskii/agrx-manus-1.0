/**
 * AGRX Typography System
 *
 * Defines the complete type scale used across the app.
 * Font families map to the loaded Inter and JetBrains Mono fonts.
 *
 * Scale follows iOS HIG sizing conventions:
 *   - Large Title:  34pt  (hero numbers, portfolio value)
 *   - Title 1:      28pt  (screen titles)
 *   - Title 2:      22pt  (section headers)
 *   - Title 3:      20pt  (card titles)
 *   - Headline:     17pt  (emphasized body, bold)
 *   - Body:         17pt  (default readable text)
 *   - Callout:      16pt  (secondary body)
 *   - Subhead:      15pt  (list subtitles)
 *   - Footnote:     13pt  (timestamps, metadata)
 *   - Caption 1:    12pt  (labels, badges)
 *   - Caption 2:    11pt  (smallest readable)
 *
 * Monospace is used for prices, percentages, and numeric data.
 */

// ─── Font Family Names ──────────────────────────────────────────────────────
// These must match the keys passed to `useFonts()` in the root layout.
export const FontFamily = {
  regular:    "Inter_400Regular",
  medium:     "Inter_500Medium",
  semibold:   "Inter_600SemiBold",
  bold:       "Inter_700Bold",
  mono:       "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
  monoBold:   "JetBrainsMono_700Bold",
} as const;

// ─── Type Scale ─────────────────────────────────────────────────────────────
// Each entry defines fontSize, lineHeight, letterSpacing, and fontFamily.
// lineHeight uses a 1.3–1.5× multiplier for comfortable reading.

export const TypeScale = {
  // Hero — portfolio value, large numbers
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 0.37,
    fontFamily: FontFamily.bold,
  },

  // Screen titles
  title1: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.36,
    fontFamily: FontFamily.bold,
  },

  // Section headers
  title2: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.35,
    fontFamily: FontFamily.bold,
  },

  // Card titles
  title3: {
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: 0.38,
    fontFamily: FontFamily.semibold,
  },

  // Emphasized body text
  headline: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: FontFamily.semibold,
  },

  // Default body text
  body: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: FontFamily.regular,
  },

  // Secondary body text
  callout: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.32,
    fontFamily: FontFamily.regular,
  },

  // List subtitles, descriptions
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    fontFamily: FontFamily.regular,
  },

  // Timestamps, metadata
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.08,
    fontFamily: FontFamily.regular,
  },

  // Labels, badges, small UI elements
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    fontFamily: FontFamily.regular,
  },

  // Smallest readable text
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.07,
    fontFamily: FontFamily.regular,
  },

  // ─── Monospace variants (prices, percentages, numeric data) ────────────

  // Large price display
  monoLargeTitle: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 0,
    fontFamily: FontFamily.monoBold,
  },

  // Standard price in lists
  monoHeadline: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily: FontFamily.monoMedium,
  },

  // Price in cards, secondary numbers
  monoBody: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily: FontFamily.mono,
  },

  // Smaller numeric data
  monoSubhead: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: FontFamily.mono,
  },

  // Small numeric labels (change %, volume)
  monoCaption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    fontFamily: FontFamily.mono,
  },

  // Smallest numeric text
  monoCaption2: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0,
    fontFamily: FontFamily.mono,
  },
} as const;

export type TypeScaleKey = keyof typeof TypeScale;
