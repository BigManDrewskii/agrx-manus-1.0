import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ViewMode = "simple" | "pro";

interface ViewModeContextValue {
  /** Current view mode */
  mode: ViewMode;
  /** Whether the mode is "simple" */
  isSimple: boolean;
  /** Whether the mode is "pro" */
  isPro: boolean;
  /** Toggle between simple and pro */
  toggle: () => void;
  /** Set a specific mode */
  setMode: (mode: ViewMode) => void;
  /** Whether the mode has been loaded from storage */
  isLoaded: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "@agrx/view-mode";
const DEFAULT_MODE: ViewMode = "simple";

// ─── Context ────────────────────────────────────────────────────────────────

const ViewModeContext = createContext<ViewModeContextValue>({
  mode: DEFAULT_MODE,
  isSimple: true,
  isPro: false,
  toggle: () => {},
  setMode: () => {},
  isLoaded: false,
});

// ─── Provider ───────────────────────────────────────────────────────────────

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(DEFAULT_MODE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "simple" || stored === "pro") {
          setModeState(stored);
        }
      } catch {
        // Silently fall back to default
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setMode = useCallback((newMode: ViewMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "simple" ? "pro" : "simple";
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value: ViewModeContextValue = {
    mode,
    isSimple: mode === "simple",
    isPro: mode === "pro",
    toggle,
    setMode,
    isLoaded,
  };

  return <ViewModeContext value={value}>{children}</ViewModeContext>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useViewMode(): ViewModeContextValue {
  return useContext(ViewModeContext);
}
