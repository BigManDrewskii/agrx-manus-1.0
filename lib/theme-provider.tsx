import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Appearance,
  View,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

// ─── Types ───────────────────────────────────────────────────────────────────

/** User-facing preference: "system" follows device, "light"/"dark" are manual overrides. */
export type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  /** The resolved color scheme currently applied (always "light" or "dark"). */
  colorScheme: ColorScheme;
  /** The user's stored preference ("system" | "light" | "dark"). */
  preference: ThemePreference;
  /** Change the preference. Persists to AsyncStorage automatically. */
  setPreference: (pref: ThemePreference) => void;
  /** Convenience: is dark mode currently active? */
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "@agrx/theme-preference";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/**
 * Resolve a ThemePreference into a concrete ColorScheme.
 */
function resolveScheme(
  preference: ThemePreference,
  systemScheme: ColorScheme,
): ColorScheme {
  if (preference === "system") return systemScheme;
  return preference;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme: ColorScheme = useSystemColorScheme() ?? "light";
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isHydrated, setIsHydrated] = useState(false);

  // Resolve the active scheme from preference + system
  const colorScheme = resolveScheme(preference, systemScheme);

  // ── Hydrate from AsyncStorage on mount ──
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          setPreferenceState(stored);
        }
      })
      .catch(() => {})
      .finally(() => setIsHydrated(true));
  }, []);

  // ── Apply scheme to NativeWind + Appearance + web CSS vars ──
  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    applyWebCSSVariables(scheme);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      applyScheme(colorScheme);
    }
  }, [applyScheme, colorScheme, isHydrated]);

  // ── Public setter: persist + update state ──
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
  }, []);

  // ── Memoized values ──
  const themeVariables = useMemo(
    () => buildNativeWindVars(colorScheme),
    [colorScheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      preference,
      setPreference,
      isDark: colorScheme === "dark",
    }),
    [colorScheme, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
