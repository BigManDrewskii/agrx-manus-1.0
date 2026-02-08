import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@agrx/watchlist";
const SEEDED_KEY = "@agrx/watchlist-seeded";

// Popular ATHEX blue-chip stocks to auto-seed for new users
const DEFAULT_WATCHLIST = ["eee", "eurob", "alpha", "hto", "opap", "mtln"];

interface WatchlistContextValue {
  /** Set of stock IDs currently in the watchlist */
  watchlist: Set<string>;
  /** Toggle a stock in/out of the watchlist */
  toggle: (stockId: string) => void;
  /** Check if a stock is in the watchlist */
  isWatchlisted: (stockId: string) => boolean;
  /** Number of stocks in the watchlist */
  count: number;
}

const WatchlistContext = createContext<WatchlistContextValue>({
  watchlist: new Set(),
  toggle: () => {},
  isWatchlisted: () => false,
  count: 0,
});

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from AsyncStorage on mount, auto-seed for first-time users
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const seeded = await AsyncStorage.getItem(SEEDED_KEY);
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          setWatchlist(new Set(ids));
        } else if (!seeded) {
          // First-time user: seed with popular ATHEX stocks
          setWatchlist(new Set(DEFAULT_WATCHLIST));
          await AsyncStorage.setItem(SEEDED_KEY, "true");
        }
      } catch {
        // Silently handle — start with empty watchlist
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist to AsyncStorage whenever watchlist changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    const ids = Array.from(watchlist);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids)).catch(() => {});
  }, [watchlist, loaded]);

  const toggle = useCallback((stockId: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(stockId)) {
        next.delete(stockId);
      } else {
        next.add(stockId);
      }
      return next;
    });
  }, []);

  const isWatchlisted = useCallback(
    (stockId: string) => watchlist.has(stockId),
    [watchlist]
  );

  const value = useMemo<WatchlistContextValue>(
    () => ({
      watchlist,
      toggle,
      isWatchlisted,
      count: watchlist.size,
    }),
    [watchlist, toggle, isWatchlisted]
  );

  return (
    <WatchlistContext value={value}>
      {children}
    </WatchlistContext>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
