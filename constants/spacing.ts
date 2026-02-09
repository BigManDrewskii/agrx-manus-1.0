/**
 * AGRX Spacing System - 8px Grid
 *
 * All spacing follows an 8px baseline grid for consistency.
 * Usage: Spacing[4] → 16px
 *
 * Naming convention:
 * - 0-3: Micro spacing (tight UI)
 * - 4-8: Component internal spacing
 * - 12-24: Component external spacing
 * - 32+: Layout/section spacing
 */
export const Spacing = {
  // Micro (0-24px)
  0: 0,
  1: 4,   // Tight spacing between related items
  2: 8,   // Base unit
  3: 12,  // Compact padding

  // Component (16-32px)
  4: 16,  // Standard padding (cards, buttons)
  5: 20,  // Comfortable padding
  6: 24,  // Generous padding
  7: 28,
  8: 32,  // Large component spacing

  // Layout (40-96px)
  12: 48,   // Section spacing
  16: 64,   // Screen margins
  20: 80,   // Large sections
  24: 96,   // Hero sections
} as const;

export type SpacingValue = typeof Spacing[keyof typeof Spacing];

/**
 * Touch target sizes (iOS 44px, Android 48dp - use 48px for universal compliance)
 */
export const TouchTarget = {
  minimum: 44,  // iOS minimum
  standard: 48, // Android minimum (our standard)
  comfortable: 52, // Easier to hit
} as const;

/**
 * Component dimensions (replace hardcoded values)
 */
export const Size = {
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
  avatar: {
    xs: 32,
    sm: 40,
    md: 48,
    lg: 64,
  },
  card: {
    sm: 148,  // Trending card (current, will be responsive)
    md: 320,  // Share card width (current, will be responsive)
    lg: 0,    // Calculated from screen width
  },
  input: {
    height: 48,
  },
  button: {
    sm: { height: 36, paddingHorizontal: 16 },
    md: { height: 44, paddingHorizontal: 20 },
    lg: { height: 52, paddingHorizontal: 24 },
  },
} as const;

/**
 * Border radius tokens
 */
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
