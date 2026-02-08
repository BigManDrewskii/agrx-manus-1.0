import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEMO_BALANCE,
  PORTFOLIO_HOLDINGS,
  GREEK_STOCKS,
  type Asset,
} from "@/lib/mock-data";

// ─── Types ──────────────────────────────────────────────────────────────

/** A single holding: how many shares of a stock the user owns and at what cost */
export interface DemoHolding {
  stockId: string;
  ticker: string;
  name: string;
  shares: number;
  /** Total cost paid for all shares (used to derive avgCost = totalCost / shares) */
  totalCost: number;
}

/** A recorded trade (immutable log entry) */
export interface DemoTrade {
  id: string;
  stockId: string;
  ticker: string;
  name: string;
  type: "buy" | "sell";
  amount: number;
  shares: number;
  price: number;
  timestamp: number;
}

/** Trade input — what the caller passes to executeTrade */
export interface TradeInput {
  stockId: string;
  ticker: string;
  name: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
}

/** Result of a trade attempt */
export interface TradeResult {
  success: boolean;
  error?: string;
  trade?: DemoTrade;
}

/** Live price lookup — stockId → current price */
export type LivePriceMap = Record<string, number>;

interface DemoState {
  isDemo: boolean;
  balance: number;
  holdings: Record<string, DemoHolding>;
  trades: DemoTrade[];
  xp: number;
  level: number;
  streak: number;
  isLoaded: boolean;
}

interface DemoContextType {
  state: DemoState;
  /** Execute a trade — returns success/error. Updates balance + holdings atomically. */
  executeTrade: (input: TradeInput) => TradeResult;
  addXP: (amount: number) => void;
  resetDemo: () => void;
  /** Get all holdings as an array (convenience) */
  holdingsArray: DemoHolding[];
  /** Derive portfolio total value from live prices */
  getPortfolioValue: (livePrices: LivePriceMap) => number;
  /** Derive portfolio total cost basis */
  getPortfolioCost: () => number;
  /** Derive portfolio P&L from live prices */
  getPortfolioPnL: (livePrices: LivePriceMap) => { pnl: number; pnlPercent: number };
  /** Check if user can afford a buy */
  canBuy: (amount: number) => boolean;
  /** Check if user has enough shares to sell */
  canSell: (stockId: string, shares: number) => boolean;
  /** Get holding for a specific stock (or undefined) */
  getHolding: (stockId: string) => DemoHolding | undefined;
}

// ─── Storage Keys ───────────────────────────────────────────────────────

const STORAGE_KEY_BALANCE = "agrx_demo_balance";
const STORAGE_KEY_HOLDINGS = "agrx_demo_holdings";
const STORAGE_KEY_TRADES = "agrx_demo_trades";
const STORAGE_KEY_XP = "agrx_demo_xp";
const STORAGE_KEY_STREAK = "agrx_demo_streak";

// ─── Seed Holdings ──────────────────────────────────────────────────────

/** Build initial holdings from the mock PORTFOLIO_HOLDINGS so users start with positions */
function buildSeedHoldings(): Record<string, DemoHolding> {
  const holdings: Record<string, DemoHolding> = {};
  for (const h of PORTFOLIO_HOLDINGS) {
    holdings[h.asset.id] = {
      stockId: h.asset.id,
      ticker: h.asset.ticker,
      name: h.asset.name,
      shares: h.shares,
      totalCost: h.shares * h.avgCost,
    };
  }
  return holdings;
}

/** Calculate initial balance: DEMO_BALANCE minus the cost of seed holdings */
function calculateSeedBalance(): number {
  const seedCost = PORTFOLIO_HOLDINGS.reduce(
    (sum, h) => sum + h.shares * h.avgCost,
    0
  );
  return DEMO_BALANCE - seedCost;
}

// ─── Initial State ──────────────────────────────────────────────────────

const initialState: DemoState = {
  isDemo: true,
  balance: calculateSeedBalance(),
  holdings: buildSeedHoldings(),
  trades: [],
  xp: 240,
  level: 3,
  streak: 5,
  isLoaded: false,
};

// ─── Context ────────────────────────────────────────────────────────────

const DemoContext = createContext<DemoContextType>({
  state: initialState,
  executeTrade: () => ({ success: false, error: "Not initialized" }),
  addXP: () => {},
  resetDemo: () => {},
  holdingsArray: [],
  getPortfolioValue: () => 0,
  getPortfolioCost: () => 0,
  getPortfolioPnL: () => ({ pnl: 0, pnlPercent: 0 }),
  canBuy: () => false,
  canSell: () => false,
  getHolding: () => undefined,
});

// ─── Provider ───────────────────────────────────────────────────────────

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);

  // ── Load persisted state on mount ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [balanceStr, holdingsStr, tradesStr, xpStr, streakStr] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY_BALANCE),
            AsyncStorage.getItem(STORAGE_KEY_HOLDINGS),
            AsyncStorage.getItem(STORAGE_KEY_TRADES),
            AsyncStorage.getItem(STORAGE_KEY_XP),
            AsyncStorage.getItem(STORAGE_KEY_STREAK),
          ]);

        setState((prev) => ({
          ...prev,
          balance: balanceStr != null ? JSON.parse(balanceStr) : prev.balance,
          holdings:
            holdingsStr != null ? JSON.parse(holdingsStr) : prev.holdings,
          trades: tradesStr != null ? JSON.parse(tradesStr) : prev.trades,
          xp: xpStr != null ? JSON.parse(xpStr) : prev.xp,
          streak: streakStr != null ? JSON.parse(streakStr) : prev.streak,
          level: xpStr != null ? Math.floor(JSON.parse(xpStr) / 100) + 1 : prev.level,
          isLoaded: true,
        }));
      } catch {
        // If loading fails, just mark as loaded with defaults
        setState((prev) => ({ ...prev, isLoaded: true }));
      }
    })();
  }, []);

  // ── Persist state changes ─────────────────────────────────────────
  useEffect(() => {
    if (!state.isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY_BALANCE, JSON.stringify(state.balance));
    AsyncStorage.setItem(STORAGE_KEY_HOLDINGS, JSON.stringify(state.holdings));
    AsyncStorage.setItem(STORAGE_KEY_TRADES, JSON.stringify(state.trades));
    AsyncStorage.setItem(STORAGE_KEY_XP, JSON.stringify(state.xp));
    AsyncStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(state.streak));
  }, [state.isLoaded, state.balance, state.holdings, state.trades, state.xp, state.streak]);

  // ── Execute Trade ─────────────────────────────────────────────────
  const executeTrade = useCallback(
    (input: TradeInput): TradeResult => {
      const { stockId, ticker, name, type, amount, price } = input;
      const shares = amount / price;

      // Validation
      if (amount <= 0) {
        return { success: false, error: "Amount must be positive" };
      }
      if (price <= 0) {
        return { success: false, error: "Price must be positive" };
      }

      let result: TradeResult = { success: false };

      setState((prev) => {
        if (type === "buy") {
          // Check balance
          if (amount > prev.balance) {
            result = {
              success: false,
              error: `Insufficient balance. You have €${prev.balance.toFixed(2)} but need €${amount.toFixed(2)}`,
            };
            return prev;
          }

          // Update holdings
          const existing = prev.holdings[stockId];
          const newHolding: DemoHolding = existing
            ? {
                ...existing,
                shares: existing.shares + shares,
                totalCost: existing.totalCost + amount,
              }
            : {
                stockId,
                ticker,
                name,
                shares,
                totalCost: amount,
              };

          const trade: DemoTrade = {
            id: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            stockId,
            ticker,
            name,
            type: "buy",
            amount,
            shares,
            price,
            timestamp: Date.now(),
          };

          result = { success: true, trade };

          return {
            ...prev,
            balance: prev.balance - amount,
            holdings: { ...prev.holdings, [stockId]: newHolding },
            trades: [...prev.trades, trade],
            xp: prev.xp + 15,
            level: Math.floor((prev.xp + 15) / 100) + 1,
          };
        } else {
          // Sell
          const existing = prev.holdings[stockId];
          if (!existing || existing.shares < shares) {
            const ownedShares = existing?.shares ?? 0;
            result = {
              success: false,
              error: `Insufficient shares. You own ${ownedShares.toFixed(4)} shares of ${ticker} but tried to sell ${shares.toFixed(4)}`,
            };
            return prev;
          }

          // Calculate proportional cost basis being removed
          const avgCost = existing.totalCost / existing.shares;
          const costRemoved = avgCost * shares;
          const newShares = existing.shares - shares;
          const newTotalCost = existing.totalCost - costRemoved;

          // Build updated holdings
          const updatedHoldings = { ...prev.holdings };
          if (newShares < 0.0001) {
            // Essentially sold all shares — remove the holding
            delete updatedHoldings[stockId];
          } else {
            updatedHoldings[stockId] = {
              ...existing,
              shares: newShares,
              totalCost: Math.max(0, newTotalCost),
            };
          }

          const trade: DemoTrade = {
            id: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            stockId,
            ticker,
            name,
            type: "sell",
            amount,
            shares,
            price,
            timestamp: Date.now(),
          };

          result = { success: true, trade };

          return {
            ...prev,
            balance: prev.balance + amount,
            holdings: updatedHoldings,
            trades: [...prev.trades, trade],
            xp: prev.xp + 15,
            level: Math.floor((prev.xp + 15) / 100) + 1,
          };
        }
      });

      return result;
    },
    []
  );

  // ── Add XP ────────────────────────────────────────────────────────
  const addXP = useCallback((amount: number) => {
    setState((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  // ── Reset Demo ────────────────────────────────────────────────────
  const resetDemo = useCallback(() => {
    setState({ ...initialState, isLoaded: true });
    // Clear persisted data
    AsyncStorage.multiRemove([
      STORAGE_KEY_BALANCE,
      STORAGE_KEY_HOLDINGS,
      STORAGE_KEY_TRADES,
      STORAGE_KEY_XP,
      STORAGE_KEY_STREAK,
    ]);
  }, []);

  // ── Derived: holdings array ───────────────────────────────────────
  const holdingsArray = useMemo(
    () => Object.values(state.holdings),
    [state.holdings]
  );

  // ── Derived: portfolio value from live prices ─────────────────────
  const getPortfolioValue = useCallback(
    (livePrices: LivePriceMap): number => {
      return Object.values(state.holdings).reduce((sum, h) => {
        const price = livePrices[h.stockId];
        // Fall back to mock price if live price unavailable
        if (price != null) {
          return sum + h.shares * price;
        }
        const mockAsset = GREEK_STOCKS.find((s) => s.id === h.stockId);
        return sum + h.shares * (mockAsset?.price ?? 0);
      }, 0);
    },
    [state.holdings]
  );

  // ── Derived: portfolio total cost ─────────────────────────────────
  const getPortfolioCost = useCallback((): number => {
    return Object.values(state.holdings).reduce(
      (sum, h) => sum + h.totalCost,
      0
    );
  }, [state.holdings]);

  // ── Derived: portfolio P&L ────────────────────────────────────────
  const getPortfolioPnL = useCallback(
    (livePrices: LivePriceMap): { pnl: number; pnlPercent: number } => {
      const value = getPortfolioValue(livePrices);
      const cost = getPortfolioCost();
      const pnl = value - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
      return { pnl, pnlPercent };
    },
    [getPortfolioValue, getPortfolioCost]
  );

  // ── Helpers ───────────────────────────────────────────────────────
  const canBuy = useCallback(
    (amount: number): boolean => amount > 0 && amount <= state.balance,
    [state.balance]
  );

  const canSell = useCallback(
    (stockId: string, shares: number): boolean => {
      const holding = state.holdings[stockId];
      return !!holding && holding.shares >= shares;
    },
    [state.holdings]
  );

  const getHolding = useCallback(
    (stockId: string): DemoHolding | undefined => state.holdings[stockId],
    [state.holdings]
  );

  // ── Context Value ─────────────────────────────────────────────────
  const contextValue = useMemo<DemoContextType>(
    () => ({
      state,
      executeTrade,
      addXP,
      resetDemo,
      holdingsArray,
      getPortfolioValue,
      getPortfolioCost,
      getPortfolioPnL,
      canBuy,
      canSell,
      getHolding,
    }),
    [
      state,
      executeTrade,
      addXP,
      resetDemo,
      holdingsArray,
      getPortfolioValue,
      getPortfolioCost,
      getPortfolioPnL,
      canBuy,
      canSell,
      getHolding,
    ]
  );

  return <DemoContext value={contextValue}>{children}</DemoContext>;
}

export function useDemo() {
  return useContext(DemoContext);
}
