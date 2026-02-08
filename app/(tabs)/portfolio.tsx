import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PnLText } from "@/components/ui/pnl-text";
import { Sparkline } from "@/components/ui/sparkline";
import { LiveBadge } from "@/components/ui/live-badge";
import { StockListSkeleton } from "@/components/ui/skeleton";
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
import {
  PORTFOLIO_HOLDINGS,
  PORTFOLIO_SPARKLINE,
  type Holding,
} from "@/lib/mock-data";

const TABS = ["All", "Stocks", "Options", "Copied"];

interface EnrichedHolding extends Holding {
  livePrice?: number;
  liveChange?: number;
  liveChangePercent?: number;
  liveValue: number;
  livePnl: number;
  livePnlPercent: number;
  liveSparkline: number[];
}

export default function PortfolioScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const { stocks, isLoading, isLive, lastUpdated, refetch } = useStockQuotes();
  const refreshCache = useRefreshCache();

  // Enrich holdings with live prices
  const enrichedHoldings: EnrichedHolding[] = useMemo(() => {
    return PORTFOLIO_HOLDINGS.map((holding) => {
      const liveStock = stocks.find((s) => s.id === holding.asset.id);
      const currentPrice = liveStock?.price ?? holding.asset.price;
      const liveValue = holding.shares * currentPrice;
      const costBasis = holding.shares * holding.avgCost;
      const livePnl = liveValue - costBasis;
      const livePnlPercent = costBasis > 0 ? (livePnl / costBasis) * 100 : 0;

      return {
        ...holding,
        livePrice: liveStock?.price,
        liveChange: liveStock?.change,
        liveChangePercent: liveStock?.changePercent,
        liveValue,
        livePnl,
        livePnlPercent,
        liveSparkline: liveStock?.sparkline ?? holding.asset.sparkline,
      };
    });
  }, [stocks]);

  // Calculate portfolio totals from live data
  const portfolioTotal = enrichedHoldings.reduce((sum, h) => sum + h.liveValue, 0);
  const portfolioCost = enrichedHoldings.reduce((sum, h) => sum + h.shares * h.avgCost, 0);
  const portfolioPnl = portfolioTotal - portfolioCost;
  const portfolioPnlPercent = portfolioCost > 0 ? (portfolioPnl / portfolioCost) * 100 : 0;

  const isPositive = portfolioPnl >= 0;
  const glowColor = isPositive ? colors.success : colors.error;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCache.mutateAsync();
      await refetch();
    } catch {
      // Silently handle
    } finally {
      setRefreshing(false);
    }
  }, [refreshCache, refetch]);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Portfolio
          </Text>
          <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
        </View>

        {/* Portfolio Value Hero */}
        <View style={styles.heroContainer}>
          <Text style={[styles.heroLabel, { color: colors.muted }]}>
            Total Value
          </Text>
          <Text
            style={[
              styles.heroValue,
              {
                color: colors.foreground,
                textShadowColor: glowColor + "40",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 24,
              },
            ]}
          >
            €{portfolioTotal.toLocaleString("el-GR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View style={styles.heroPnl}>
            <PnLText
              value={portfolioPnl}
              format="currency"
              size="lg"
              showArrow={true}
            />
            <Text style={[styles.heroPnlSep, { color: colors.muted }]}>
              {" · "}
            </Text>
            <PnLText
              value={portfolioPnlPercent}
              format="percent"
              size="lg"
              showArrow={false}
            />
          </View>
          <View style={styles.sparklineContainer}>
            <Sparkline
              data={PORTFOLIO_SPARKLINE}
              width={320}
              height={56}
              positive={isPositive}
              strokeWidth={2}
            />
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  styles.tab,
                  isActive && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? colors.primary : colors.muted,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          <View style={styles.holdingsHeader}>
            <Text style={[styles.holdingsTitle, { color: colors.muted }]}>
              {enrichedHoldings.length} Holdings
            </Text>
          </View>
          {isLoading ? (
            <StockListSkeleton count={4} />
          ) : (
            enrichedHoldings.map((holding) => (
              <Pressable
                key={holding.asset.id}
                onPress={() =>
                  router.push({
                    pathname: "/asset/[id]" as any,
                    params: { id: holding.asset.id },
                  })
                }
                style={({ pressed }) => [
                  styles.holdingRow,
                  { borderBottomColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.holdingLeft}>
                  <View
                    style={[
                      styles.holdingIcon,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <Text style={[styles.holdingIconText, { color: colors.primary }]}>
                      {holding.asset.ticker.slice(0, 2)}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.holdingName, { color: colors.foreground }]}>
                      {holding.asset.ticker}
                    </Text>
                    <Text style={[styles.holdingShares, { color: colors.muted }]}>
                      {holding.shares} shares · avg €{holding.avgCost.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.holdingCenter}>
                  <Sparkline
                    data={holding.liveSparkline}
                    width={48}
                    height={20}
                    positive={holding.livePnl >= 0}
                  />
                </View>
                <View style={styles.holdingRight}>
                  <Text style={[styles.holdingValue, { color: colors.foreground }]}>
                    €{holding.liveValue.toFixed(2)}
                  </Text>
                  <PnLText value={holding.livePnlPercent} size="sm" showArrow={false} />
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Dividend Section */}
        <View style={styles.dividendSection}>
          <Text style={[styles.dividendTitle, { color: colors.foreground }]}>
            Upcoming Dividends
          </Text>
          <View
            style={[
              styles.dividendCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.dividendRow}>
              <Text style={[styles.dividendAsset, { color: colors.foreground }]}>
                OPAP
              </Text>
              <Text style={[styles.dividendDate, { color: colors.muted }]}>
                Mar 15, 2026
              </Text>
              <Text style={[styles.dividendAmount, { color: colors.success }]}>
                €0.60/share
              </Text>
            </View>
            <View style={styles.dividendRow}>
              <Text style={[styles.dividendAsset, { color: colors.foreground }]}>
                PPC
              </Text>
              <Text style={[styles.dividendDate, { color: colors.muted }]}>
                Apr 02, 2026
              </Text>
              <Text style={[styles.dividendAmount, { color: colors.success }]}>
                €0.85/share
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  heroContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  heroPnl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  heroPnlSep: {
    fontSize: 14,
  },
  sparklineContainer: {
    marginTop: 16,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "transparent",
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
  },
  holdingsContainer: {
    paddingTop: 8,
  },
  holdingsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  holdingsTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  holdingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  holdingIconText: {
    fontSize: 14,
    fontWeight: "700",
  },
  holdingName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  holdingShares: {
    fontSize: 12,
    fontWeight: "500",
  },
  holdingCenter: {
    marginHorizontal: 12,
  },
  holdingRight: {
    alignItems: "flex-end",
  },
  holdingValue: {
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    marginBottom: 2,
  },
  dividendSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  dividendTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  dividendCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  dividendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dividendAsset: {
    fontSize: 15,
    fontWeight: "600",
    width: 60,
  },
  dividendDate: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  dividendAmount: {
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
