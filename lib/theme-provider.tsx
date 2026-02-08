import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Appearance,
  Platform,
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
  /** Increments on every theme change — use as React key to force re-renders. */
  themeVersion: number;
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
 * This runs SYNCHRONOUSLY before React re-renders to prevent FOUC.
 */
function applyWebCSSVariables(scheme: ColorScheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Set data-theme attribute for Tailwind dark: variant
  root.dataset.theme = scheme;
  root.classList.toggle("dark", scheme === "dark");

  // Apply all CSS variables from the palette
  const palette = SchemeColors[scheme];
  for (const [token, value] of Object.entries(palette)) {
    root.style.setProperty(`--color-${token}`, value);
  }

  // Also set meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", palette.background);
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
  // Monotonically increasing version to force re-renders on theme change
  const [themeVersion, setThemeVersion] = useState(0);
  const prevSchemeRef = useRef<ColorScheme | null>(null);

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

  // ── Apply scheme changes synchronously ──
  // This effect runs whenever the resolved colorScheme changes.
  // It applies CSS variables, sets NativeWind's color scheme, and bumps the version.
  useEffect(() => {
    if (!isHydrated) return;

    // Apply web CSS variables FIRST (synchronous DOM mutation)
    applyWebCSSVariables(colorScheme);

    // Set NativeWind's color scheme for class-based dark mode
    nativewindColorScheme.set(colorScheme);

    // Set RN Appearance for native components (StatusBar, etc.)
    Appearance.setColorScheme?.(colorScheme);

    // Only bump version if the scheme actually changed (not on initial mount)
    if (prevSchemeRef.current !== null && prevSchemeRef.current !== colorScheme) {
      setThemeVersion((v) => v + 1);
    }
    prevSchemeRef.current = colorScheme;
  }, [colorScheme, isHydrated]);

  // ── Public setter: persist + update state ──
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch(() => {});
  }, []);

  // ── Memoized NativeWind vars ──
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
      themeVersion,
    }),
    [colorScheme, preference, setPreference, themeVersion],
  );

  return (
    <ThemeContext value={value}>
      <View style={[{ flex: 1 }, themeVariables]} key={`theme-${colorScheme}`}>
        {children}
      </View>
    </ThemeContext>
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
