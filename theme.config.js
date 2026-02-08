/**
 * AGRX Design System — Single Source of Truth
 *
 * Every color token is defined once here and flows to:
 *   1. tailwind.config.js  → className usage (bg-primary, text-foreground, …)
 *   2. lib/_core/theme.ts  → runtime Colors object (useColors hook)
 *   3. theme-provider.tsx  → CSS variables on web + NativeWind vars on native
 *   4. global.css          → initial CSS variables (prevents FOUC on web)
 *
 * Dark mode palette is modeled after the Coinbase Design System (CDS v8)
 * gray spectrum, with adjustments for the AGRX brand blue.
 *
 * Rules:
 *   - Every token MUST have both a `light` and `dark` value.
 *   - Use semantic names (what it IS), not descriptive names (what it LOOKS LIKE).
 *   - Components should NEVER hardcode hex values; always reference a token.
 *   - For translucent variants, use the *Alpha tokens (e.g. primaryAlpha).
 */

/** @type {const} */
const themeColors = {
  // ─── Brand ──────────────────────────────────────────────────────────
  //  Light: Deep trust-blue for authority.
  //  Dark:  Lifted to CDS dark-blue70 range for readability on dark surfaces.
  primary:        { light: '#0052FF', dark: '#578BFA' },
  primaryAlpha:   { light: 'rgba(0,82,255,0.10)', dark: 'rgba(87,139,250,0.16)' },

  // ─── Backgrounds ────────────────────────────────────────────────────
  //  Light: Cool off-white (CDS gray5 range).
  //  Dark:  Near-true-black (CDS gray0 #0A0B0D) for OLED power savings.
  //         Surface uses CDS gray5→gray10 steps for subtle elevation.
  background:          { light: '#F7F8F9', dark: '#0A0B0D' },
  surface:             { light: '#FFFFFF', dark: '#1A1C23' },
  surfaceSecondary:    { light: '#EEF0F3', dark: '#262830' },

  // ─── Text ───────────────────────────────────────────────────────────
  //  Light: Near-black for maximum readability.
  //  Dark:  CDS gray90 (#EEF0F3) — softer than pure white to reduce glare.
  //  Muted: CDS gray60 (#89909E) — passes WCAG AA on dark backgrounds.
  foreground:     { light: '#0A0B0D', dark: '#EEF0F3' },
  muted:          { light: '#5B616E', dark: '#89909E' },
  /** High-contrast text on filled primary buttons (always white). */
  onPrimary:      { light: '#FFFFFF', dark: '#FFFFFF' },

  // ─── Borders & Dividers ─────────────────────────────────────────────
  //  Light: CDS gray15 range.
  //  Dark:  CDS gray15 (#282A30) — subtle separation without harshness.
  border:         { light: '#DEE1E7', dark: '#282A30' },

  // ─── Semantic Status ────────────────────────────────────────────────
  //  Dark values lifted from CDS dark-green60/red60/orange60 range.
  //  Slightly desaturated vs light mode to reduce vibration on dark bg.
  success:        { light: '#09854F', dark: '#27AD74' },
  successAlpha:   { light: 'rgba(9,133,79,0.10)', dark: 'rgba(39,173,116,0.14)' },
  warning:        { light: '#CF7100', dark: '#EBBA00' },
  warningAlpha:   { light: 'rgba(207,113,0,0.10)', dark: 'rgba(235,186,0,0.14)' },
  error:          { light: '#CF2030', dark: '#ED5966' },
  errorAlpha:     { light: 'rgba(207,32,48,0.10)', dark: 'rgba(237,89,102,0.14)' },

  // ─── Accent (secondary actions, badges, ranks) ─────────────────────
  //  CDS indigo spectrum for a distinct secondary hue.
  accent:         { light: '#4257E9', dark: '#8A7BFA' },
  accentAlpha:    { light: 'rgba(66,87,233,0.10)', dark: 'rgba(138,123,250,0.14)' },

  // ─── Rank Colors (leaderboard) ──────────────────────────────────────
  //  Gold/Silver/Bronze tuned for visibility on both backgrounds.
  gold:           { light: '#CF9700', dark: '#EBBA00' },
  silver:         { light: '#89909E', dark: '#B1B7C3' },
  bronze:         { light: '#B54F06', dark: '#ED702F' },
};

module.exports = { themeColors };
