/**
 * Responsive layout constants
 *
 * Platform-specific breakpoints and safe areas
 */
import { Dimensions, Platform } from 'react-native';
import { Spacing } from './spacing';

export const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

/**
 * Breakpoints (inspired by web, adapted for mobile)
 */
export const Breakpoint = {
  xs: 375,  // iPhone SE
  sm: 390,  // iPhone 14
  md: 414,  // iPhone 14 Pro Max
  lg: 768,  // iPad Mini
  xl: 1024, // iPad Pro
} as const;

/**
 * Hook for responsive breakpoint detection
 */
export const useBreakpoint = () => {
  const width = Screen.width;
  return {
    isXs: width < Breakpoint.sm,
    isSm: width >= Breakpoint.sm && width < Breakpoint.md,
    isMd: width >= Breakpoint.md && width < Breakpoint.lg,
    isLg: width >= Breakpoint.lg && width < Breakpoint.xl,
    isXl: width >= Breakpoint.xl,
    isMobile: width < Breakpoint.lg,
    isTablet: width >= Breakpoint.lg,
    columnCount: width >= 768 ? 3 : width >= 414 ? 2 : 1,
  };
};

/**
 * Calculate responsive card width
 */
export const ResponsiveCardWidth = Math.min(
  Screen.width - Spacing[16] * 2,
  340
);

/**
 * Calculate responsive trending card width
 */
export const TrendingCardWidth = Math.floor(
  (Screen.width - Spacing[4] * 2 - Spacing[3] * 4) / 2.2
);

/**
 * Safe area insets
 */
export const getSafeArea = () => ({
  top: Platform.OS === 'ios' ? 44 : 0,
  bottom: Platform.OS === 'ios' ? 34 : 0,
});

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (
  compact: number,
  standard: number,
  generous: number
) => {
  if (Screen.width < 390) return compact;
  if (Screen.width < 768) return standard;
  return generous;
};

/**
 * Calculate column count for grid layouts
 */
export const getColumnCount = () => {
  if (Screen.width >= 768) return 3; // Tablet
  if (Screen.width >= 414) return 2; // Large phone
  return 1; // Standard phone
};
