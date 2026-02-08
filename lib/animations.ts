/**
 * AGRX Motion Language — Animation Constants & Utilities
 *
 * Single source of truth for all animation parameters.
 * Import from here — never hardcode durations or spring configs.
 */
import {
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

// ─── Spring Presets ──────────────────────────────────────────────

/** Fast, crisp. Press feedback, toggles, chips, small state changes. ~150ms feel. */
export const SPRING_SNAPPY: WithSpringConfig = {
  damping: 20,
  stiffness: 400,
  mass: 0.8,
  overshootClamping: false,
};

/** Smooth, controlled. Modals, sheets, card expansions. ~220ms feel. */
export const SPRING_RESPONSIVE: WithSpringConfig = {
  damping: 22,
  stiffness: 300,
  mass: 1,
  overshootClamping: false,
};

/** Slow, elegant. Page transitions, large content shifts. ~350ms feel. */
export const SPRING_GENTLE: WithSpringConfig = {
  damping: 18,
  stiffness: 180,
  mass: 1.2,
  overshootClamping: false,
};

/** Visible bounce. Success celebrations, achievement unlocks. ~300ms feel. */
export const SPRING_BOUNCY: WithSpringConfig = {
  damping: 12,
  stiffness: 200,
  mass: 0.9,
  overshootClamping: false,
};

// ─── Timing Presets ──────────────────────────────────────────────

/** 80ms — immediate press-down feedback */
export const TIMING_INSTANT: WithTimingConfig = {
  duration: 80,
  easing: Easing.out(Easing.quad),
};

/** 150ms — opacity fades, color transitions */
export const TIMING_FAST: WithTimingConfig = {
  duration: 150,
  easing: Easing.out(Easing.quad),
};

/** 250ms — content reveals, skeleton-to-content */
export const TIMING_NORMAL: WithTimingConfig = {
  duration: 250,
  easing: Easing.inOut(Easing.quad),
};

/** 400ms — progress bar fills, chart draws */
export const TIMING_SLOW: WithTimingConfig = {
  duration: 400,
  easing: Easing.inOut(Easing.cubic),
};

// ─── Press Feedback Constants ────────────────────────────────────

export const PRESS = {
  /** Primary buttons (CTA) */
  button: { scale: 0.97, opacity: 0.9 },
  /** Cards, list items */
  card: { scale: 0.985, opacity: 0.85 },
  /** Icon-only buttons */
  icon: { scale: 1.0, opacity: 0.6 },
  /** Chips, tags, filter pills */
  chip: { scale: 0.96, opacity: 0.85 },
  /** Toggle segments */
  toggle: { scale: 1.0, opacity: 0.7 },
  /** Destructive actions */
  destructive: { scale: 0.97, opacity: 0.9 },
} as const;

// ─── Stagger Delay ───────────────────────────────────────────────

/** Delay between staggered list items (ms) */
export const STAGGER_DELAY = 30;

/** Max items to stagger (avoid long waits on large lists) */
export const STAGGER_MAX = 12;

/** Calculate stagger delay, capped at STAGGER_MAX */
export function staggerDelay(index: number): number {
  "worklet";
  return Math.min(index, STAGGER_MAX) * STAGGER_DELAY;
}
