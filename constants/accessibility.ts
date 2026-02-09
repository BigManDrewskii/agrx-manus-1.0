/**
 * AGRX Accessibility Standards
 *
 * WCAG AA compliance requirements
 */
export const Accessibility = {
  // Touch target minimums
  touchTarget: {
    minimum: 44,  // iOS HIG minimum
    standard: 48, // Android Material minimum
  },

  // Color contrast ratios
  contrast: {
    aa: {
      normal: 4.5,    // Body text
      large: 3.1,     // 18pt+ or 14pt+ bold
      components: 3,  // UI components, borders
    },
    aaa: {
      normal: 7,
      large: 4.5,
    },
  },

  // Screen reader announcements
  announcement: {
    delay: 300, // ms before announcing dynamic changes
  },
} as const;

/**
 * Helper to ensure minimum touch target size
 *
 * @param size - The current size
 * @param minimum - The minimum allowed size (default: 48px for Android standard)
 * @returns The larger of size or minimum
 */
export function ensureTouchTargetSize(
  size: number,
  minimum: number = Accessibility.touchTarget.standard
): number {
  return Math.max(size, minimum);
}

/**
 * Calculate hitSlop to achieve minimum touch target
 *
 * @param elementSize - The current visual size of the element
 * @param targetSize - The desired touch target size (default: 48px)
 * @returns hitSlop value to add to achieve targetSize
 */
export function calculateHitSlop(
  elementSize: number,
  targetSize: number = Accessibility.touchTarget.standard
): number {
  const needed = targetSize - elementSize;
  return Math.max(0, Math.floor(needed / 2));
}

/**
 * Check if text size meets WCAG AA contrast requirements
 *
 * @param fontSize - Font size in points
 * @param isBold - Whether the text is bold (14pt+)
 * @returns The minimum contrast ratio required
 */
export function getMinimumContrast(
  fontSize: number,
  isBold: boolean = false
): number {
  // Large text: 18pt+ or 14pt+ bold
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);

  return isLargeText
    ? Accessibility.contrast.aa.large
    : Accessibility.contrast.aa.normal;
}
