import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { DEMO_BALANCE } from "@/lib/mock-data";

interface DemoState {
  isDemo: boolean;
  balance: number;
  trades: DemoTrade[];
  xp: number;
  level: number;
  streak: number;
}

interface DemoTrade {
  id: string;
  ticker: string;
  type: "buy" | "sell";
  amount: number;
  shares: number;
  price: number;
  timestamp: number;
}

interface DemoContextType {
  state: DemoState;
  executeTrade: (trade: Omit<DemoTrade, "id" | "timestamp">) => void;
  addXP: (amount: number) => void;
  resetDemo: () => void;
}

const initialState: DemoState = {
  isDemo: true,
  balance: DEMO_BALANCE,
  trades: [],
  xp: 240,
  level: 3,
  streak: 5,
};

const DemoContext = createContext<DemoContextType>({
  state: initialState,
  executeTrade: () => {},
  addXP: () => {},
  resetDemo: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);

  const executeTrade = useCallback(
    (trade: Omit<DemoTrade, "id" | "timestamp">) => {
      setState((prev) => {
        const newBalance =
          trade.type === "buy"
            ? prev.balance - trade.amount
            : prev.balance + trade.amount;
        return {
          ...prev,
          balance: newBalance,
          trades: [
            ...prev.trades,
            {
              ...trade,
              id: `trade-${Date.now()}`,
              timestamp: Date.now(),
            },
          ],
          xp: prev.xp + 15,
        };
      });
    },
    []
  );

  const addXP = useCallback((amount: number) => {
    setState((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  const resetDemo = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <DemoContext.Provider value={{ state, executeTrade, addXP, resetDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
