import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Build the NativeWind `vars()` object dynamically from ALL tokens in SchemeColors.
 * This ensures every token added to theme.config.js is automatically available
 * as a CSS variable without manual wiring.
 */
function buildNativeWindVars(scheme: ColorScheme) {
  const palette = SchemeColors[scheme];
  const entries: Record<string, string> = {};
  for (const [token, value] of Object.entries(palette)) {
    entries[`color-${token}`] = value;
  }
  return vars(entries);
}

/**
 * Apply CSS variables to the document root (web only).
 * This runs on initial mount and on every scheme change.
 */
function applyWebCSSVariables(scheme: ColorScheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = scheme;
  root.classList.toggle("dark", scheme === "dark");

  const palette = SchemeColors[scheme];
  for (const [token, value] of Object.entries(palette)) {
    root.style.setProperty(`--color-${token}`, value);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    applyWebCSSVariables(scheme);
  }, []);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      applyScheme(scheme);
    },
    [applyScheme],
  );

  // Apply on mount and on scheme change
  useEffect(() => {
    applyScheme(colorScheme);
  }, [applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () => buildNativeWindVars(colorScheme),
    [colorScheme],
  );

  const value = useMemo(
    () => ({ colorScheme, setColorScheme }),
    [colorScheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
