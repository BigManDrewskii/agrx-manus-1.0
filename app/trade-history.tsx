/**
 * Trade History Screen
 *
 * Chronological record of all executed trades (buy/sell) from DemoContext.
 * Grouped by date (Today, Yesterday, This Week, Earlier).
 * Each trade shows side indicator, ticker, shares, execution price,
 * and per-trade P&L computed against live prices.
 *
 * Animation: AGRX motion language applied —
 *   Header: FadeIn.duration(200)
 *   Summary card: FadeInDown.duration(250).delay(60)
 *   Section headers: FadeIn.duration(200)
 *   Trade rows: FadeInDown.duration(250).delay(stagger)
 *   Empty state: FadeIn.duration(300)
 */
import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDemo, type DemoTrade } from "@/lib/demo-context";
import { useStockQuotes } from "@/hooks/use-stocks";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  LargeTitle,
  Title3,
  Headline,
  Body,
  Subhead,
  Footnote,
  Caption1,
  Caption2,
  MonoSubhead,
  MonoCaption1,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";

// ─── Date Grouping ─────────────────────────────────────────────────────────

type DateGroup = "Today" | "Yesterday" | "This Week" | "Earlier";

interface GroupedSection {
  title: DateGroup;
  data: DemoTrade[];
}

function getDateGroup(timestamp: number): DateGroup {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  if (timestamp >= todayStart) return "Today";
  if (timestamp >= yesterdayStart) return "Yesterday";
  if (timestamp >= weekStart) return "This Week";
  return "Earlier";
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatDateWithYear(timestamp: number): string {
  const date = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function TradeHistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useDemo();
  const { stocks } = useStockQuotes();

  // Build live price map
  const livePriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (stocks && stocks.length > 0) {
      for (const s of stocks) {
        map[s.id] = s.price;
      }
    }
    return map;
  }, [stocks]);

  // Sort trades newest first
  const sortedTrades = useMemo(
    () => [...state.trades].sort((a, b) => b.timestamp - a.timestamp),
    [state.trades]
  );

  // Group trades by date
  const sections = useMemo<GroupedSection[]>(() => {
    const groups: Record<DateGroup, DemoTrade[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: [],
    };

    for (const trade of sortedTrades) {
      const group = getDateGroup(trade.timestamp);
      groups[group].push(trade);
    }

    const result: GroupedSection[] = [];
    const order: DateGroup[] = ["Today", "Yesterday", "This Week", "Earlier"];
    for (const key of order) {
      if (groups[key].length > 0) {
        result.push({ title: key, data: groups[key] });
      }
    }
    return result;
  }, [sortedTrades]);

  // Flatten for FlatList with section headers
  type ListItem =
    | { kind: "header"; title: DateGroup; key: string }
    | { kind: "trade"; trade: DemoTrade; key: string; index: number };

  const flatData = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];
    let tradeIndex = 0;
    for (const section of sections) {
      result.push({ kind: "header", title: section.title, key: `header-${section.title}` });
      for (const trade of section.data) {
        result.push({ kind: "trade", trade, key: trade.id, index: tradeIndex });
        tradeIndex++;
      }
    }
    return result;
  }, [sections]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalTrades = state.trades.length;
    const buyCount = state.trades.filter((t) => t.type === "buy").length;
    const sellCount = state.trades.filter((t) => t.type === "sell").length;

    // Realized P&L from sells: (sell price - avg cost at time) × shares
    // For buys: unrealized P&L = (live price - buy price) × shares
    let totalPnL = 0;
    for (const trade of state.trades) {
      const livePrice = livePriceMap[trade.stockId];
      if (trade.type === "buy") {
        // Unrealized: current value vs cost
        if (livePrice != null) {
          totalPnL += (livePrice - trade.price) * trade.shares;
        }
      } else {
        // Realized: sell price vs cost (we use the trade's execution price)
        // For sells, P&L is already locked in — but we don't have the original buy price
        // stored per-sell. We'll show the trade amount as realized.
        // A simpler approach: show P&L relative to current price
        if (livePrice != null) {
          totalPnL += (trade.price - livePrice) * trade.shares;
        }
      }
    }

    return { totalTrades, buyCount, sellCount, totalPnL };
  }, [state.trades, livePriceMap]);

  // Compute per-trade P&L
  const getTradeP_L = useCallback(
    (trade: DemoTrade): { pnl: number; pnlPercent: number } | null => {
      const livePrice = livePriceMap[trade.stockId];
      if (livePrice == null) return null;

      if (trade.type === "buy") {
        // Unrealized: (current - buy) × shares
        const pnl = (livePrice - trade.price) * trade.shares;
        const pnlPercent = ((livePrice - trade.price) / trade.price) * 100;
        return { pnl, pnlPercent };
      } else {
        // Realized: (sell - current) × shares — profit if sold above current
        const pnl = (trade.price - livePrice) * trade.shares;
        const pnlPercent = ((trade.price - livePrice) / livePrice) * 100;
        return { pnl, pnlPercent };
      }
    },
    [livePriceMap]
  );

  const handleTradePress = useCallback(
    (trade: DemoTrade) => {
      router.push(`/asset/${trade.stockId}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item: listItem }: { item: ListItem }) => {
      if (listItem.kind === "header") {
        return (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.sectionHeader}
          >
            <Footnote
              color="muted"
              style={{ fontFamily: FontFamily.semibold, letterSpacing: 0.5 }}
            >
              {listItem.title.toUpperCase()}
            </Footnote>
          </Animated.View>
        );
      }

      const { trade, index } = listItem;
      const isBuy = trade.type === "buy";
      const sideColor = isBuy ? colors.success : colors.error;
      const sideLabel = isBuy ? "BUY" : "SELL";
      const sideIcon = isBuy ? "arrow.up" : "arrow.down";
      const tradePnL = getTradeP_L(trade);
      const group = getDateGroup(trade.timestamp);
      const timeStr =
        group === "Today" || group === "Yesterday"
          ? formatTime(trade.timestamp)
          : group === "This Week"
          ? formatFullDate(trade.timestamp)
          : formatDateWithYear(trade.timestamp);

      // Staggered entrance: cap at STAGGER_MAX to avoid long waits
      const staggerMs = Math.min(index, STAGGER_MAX) * STAGGER_DELAY;

      return (
        <Animated.View entering={FadeInDown.duration(250).delay(staggerMs)}>
          <AnimatedPressable
            variant="card"
            onPress={() => handleTradePress(trade)}
            style={[
              styles.tradeRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Side Indicator */}
            <View
              style={[
                styles.sideIndicator,
                { backgroundColor: sideColor + "18" },
              ]}
            >
              <IconSymbol name={sideIcon as any} size={16} color={sideColor} />
            </View>

            {/* Trade Info */}
            <View style={styles.tradeInfo}>
              <View style={styles.tradeTopRow}>
                <View style={styles.tradeNameRow}>
                  <Subhead style={{ fontFamily: FontFamily.semibold }} numberOfLines={1}>
                    {trade.ticker}
                  </Subhead>
                  <Caption1
                    style={{
                      fontFamily: FontFamily.semibold,
                      color: sideColor,
                      marginLeft: 6,
                    }}
                  >
                    {sideLabel}
                  </Caption1>
                </View>
                <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
                  €{trade.amount.toFixed(2)}
                </MonoSubhead>
              </View>

              <View style={styles.tradeBottomRow}>
                <View style={styles.tradeMetaRow}>
                  <Caption2 color="muted">
                    {trade.shares.toFixed(trade.shares < 1 ? 4 : 2)} shares @ €{trade.price.toFixed(2)}
                  </Caption2>
                  <Caption2 color="muted" style={{ marginLeft: 8 }}>
                    {timeStr}
                  </Caption2>
                </View>
                {tradePnL && (
                  <View style={styles.pnlContainer}>
                    <MonoCaption1
                      style={{
                        color: tradePnL.pnl >= 0 ? colors.success : colors.error,
                        fontFamily: FontFamily.monoMedium,
                      }}
                    >
                      {tradePnL.pnl >= 0 ? "+" : ""}€{Math.abs(tradePnL.pnl).toFixed(2)}
                    </MonoCaption1>
                  </View>
                )}
              </View>
            </View>
          </AnimatedPressable>
        </Animated.View>
      );
    },
    [colors, getTradeP_L, handleTradePress]
  );

  const totalPnLColor =
    summaryStats.totalPnL === 0
      ? colors.muted
      : summaryStats.totalPnL > 0
      ? colors.success
      : colors.error;

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
        <View style={styles.headerLeft}>
          <AnimatedPressable
            variant="icon"
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <IconSymbol
              name="chevron.right"
              size={20}
              color={colors.foreground}
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </AnimatedPressable>
          <View>
            <LargeTitle style={{ letterSpacing: -0.5 }}>Trade History</LargeTitle>
            {state.trades.length > 0 && (
              <Caption1 color="muted" style={{ marginTop: 2 }}>
                {summaryStats.totalTrades} trade{summaryStats.totalTrades !== 1 ? "s" : ""}
                {" · "}
                {summaryStats.buyCount} buy{summaryStats.buyCount !== 1 ? "s" : ""}
                {" · "}
                {summaryStats.sellCount} sell{summaryStats.sellCount !== 1 ? "s" : ""}
              </Caption1>
            )}
          </View>
        </View>
      </Animated.View>

      {/* ── Summary Card ── */}
      {state.trades.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(250).delay(60)}
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold, letterSpacing: 0.3 }}>
                TOTAL VOLUME
              </Caption1>
              <MonoSubhead style={{ marginTop: 4, fontFamily: FontFamily.monoMedium }}>
                €{state.trades.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </MonoSubhead>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold, letterSpacing: 0.3 }}>
                NET P&L
              </Caption1>
              <MonoSubhead
                style={{
                  marginTop: 4,
                  fontFamily: FontFamily.monoMedium,
                  color: totalPnLColor,
                }}
              >
                {summaryStats.totalPnL >= 0 ? "+" : ""}€{Math.abs(summaryStats.totalPnL).toFixed(2)}
              </MonoSubhead>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Empty State ── */}
      {state.trades.length === 0 ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <IconSymbol name="clock" size={40} color={colors.muted} />
          </View>
          <Title3 style={{ textAlign: "center", marginTop: 16 }}>
            No Trades Yet
          </Title3>
          <Body
            color="muted"
            style={{
              textAlign: "center",
              marginTop: 8,
              paddingHorizontal: 40,
              lineHeight: 22,
            }}
          >
            Your executed trades will appear here with date grouping and profit/loss tracking.
          </Body>
          <AnimatedPressable
            variant="button"
            onPress={() => router.push("/(tabs)/trade" as any)}
            style={[
              styles.emptyActionBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Caption1
              style={{
                color: colors.onPrimary,
                fontFamily: FontFamily.semibold,
              }}
            >
              Start Trading
            </Caption1>
          </AnimatedPressable>
        </Animated.View>
      ) : (
        <FlatList
          data={flatData}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}
    </ScreenContainer>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    marginHorizontal: 12,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tradeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  sideIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tradeInfo: {
    flex: 1,
  },
  tradeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tradeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tradeBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tradeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pnlContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActionBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
