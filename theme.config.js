/**
 * AGRX Design System — Single Source of Truth
 *
 * Every color token is defined once here and flows to:
 *   1. tailwind.config.js  → className usage (bg-primary, text-foreground, …)
 *   2. lib/_core/theme.ts  → runtime Colors object (useColors hook)
 *   3. theme-provider.tsx  → CSS variables on web + NativeWind vars on native
 *   4. global.css          → initial CSS variables (prevents FOUC on web)
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
  primary:        { light: '#0055DD', dark: '#3B82F6' },
  primaryAlpha:   { light: 'rgba(0,85,221,0.12)', dark: 'rgba(59,130,246,0.18)' },

  // ─── Backgrounds ────────────────────────────────────────────────────
  background:          { light: '#F8F9FB', dark: '#0F1116' },
  surface:             { light: '#FFFFFF', dark: '#1A1D26' },
  surfaceSecondary:    { light: '#F0F1F5', dark: '#242834' },

  // ─── Text ───────────────────────────────────────────────────────────
  foreground:     { light: '#111827', dark: '#F0F2F5' },
  muted:          { light: '#6B7280', dark: '#8B919E' },
  /** High-contrast text on filled buttons / badges (always white or near-white) */
  onPrimary:      { light: '#FFFFFF', dark: '#FFFFFF' },

  // ─── Borders & Dividers ─────────────────────────────────────────────
  border:         { light: '#E5E7EB', dark: '#2E3342' },

  // ─── Semantic Status ────────────────────────────────────────────────
  success:        { light: '#10B981', dark: '#34D399' },
  successAlpha:   { light: 'rgba(16,185,129,0.12)', dark: 'rgba(52,211,153,0.15)' },
  warning:        { light: '#F59E0B', dark: '#FBBF24' },
  warningAlpha:   { light: 'rgba(245,158,11,0.12)', dark: 'rgba(251,191,36,0.15)' },
  error:          { light: '#EF4444', dark: '#F87171' },
  errorAlpha:     { light: 'rgba(239,68,68,0.12)', dark: 'rgba(248,113,113,0.15)' },

  // ─── Accent (secondary actions, badges, ranks) ─────────────────────
  accent:         { light: '#8B5CF6', dark: '#A78BFA' },
  accentAlpha:    { light: 'rgba(139,92,246,0.12)', dark: 'rgba(167,139,250,0.15)' },

  // ─── Rank Colors (leaderboard) ──────────────────────────────────────
  gold:           { light: '#F59E0B', dark: '#FBBF24' },
  silver:         { light: '#9CA3AF', dark: '#D1D5DB' },
  bronze:         { light: '#B45309', dark: '#D97706' },
};

module.exports = { themeColors };
