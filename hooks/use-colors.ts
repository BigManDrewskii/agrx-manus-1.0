import { Colors, type ColorScheme, type ThemeColorPalette } from "@/constants/theme";
import { useColorScheme } from "./use-color-scheme";
import { useTheme } from "@coinbase/cds-mobile/hooks/useTheme";

/**
 * Returns the current theme's color palette.
 * Integrates CDS semantic colors with AGRX brand colors.
 * Usage: const colors = useColors(); then colors.text, colors.background, etc.
 */
export function useColors(colorSchemeOverride?: ColorScheme): ThemeColorPalette {
  const colorSchema = useColorScheme();
  const scheme = (colorSchemeOverride ?? colorSchema ?? "light") as ColorScheme;
  const agrxColors = Colors[scheme];

  // Get CDS theme colors
  const cdsTheme = useTheme();

  // Merge CDS colors with AGRX brand colors
  return {
    // CDS semantic colors
    foreground: cdsTheme.color.fg,
    background: cdsTheme.color.bg,
    surface: cdsTheme.color.bgAlternate,
    surfaceSecondary: cdsTheme.color.bgTertiary,
    primary: cdsTheme.color.fgPrimary,
    primaryAlpha: cdsTheme.color.fgPrimary + "20", // Add transparency
    muted: cdsTheme.color.fgMuted,
    onPrimary: cdsTheme.color.bgInverse,
    border: agrxColors.border, // Use AGRX border color for now

    // AGRX brand colors (preserve for trading interface)
    success: agrxColors.success,
    successAlpha: agrxColors.successAlpha,
    warning: agrxColors.warning || "#F59E0B",
    warningAlpha: agrxColors.warningAlpha || "#F59E0B20",
    error: agrxColors.error,
    errorAlpha: agrxColors.errorAlpha,
    gold: agrxColors.gold,
    bronze: agrxColors.bronze || "#CD7F32",
    accent: agrxColors.accent || "#4257E9",
    accentAlpha: agrxColors.accentAlpha || "rgba(66,87,233,0.10)",
    silver: agrxColors.silver || "#89909E",

    // Computed colors for backward compatibility
    text: cdsTheme.color.fg,
    tint: cdsTheme.color.fgPrimary,
    icon: cdsTheme.color.fgMuted,
    tabIconDefault: cdsTheme.color.fgMuted,
    tabIconSelected: cdsTheme.color.fgPrimary,
  };
}
