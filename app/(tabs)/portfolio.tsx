import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
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
  Title1,
  Title3,
  Headline,
  Subhead,
  Footnote,
  Caption1,
  MonoLargeTitle,
  MonoSubhead,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
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
          <Title1>Portfolio</Title1>
          <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
        </View>

        {/* Portfolio Value Hero */}
        <View style={styles.heroContainer}>
          <Footnote color="muted">Total Value</Footnote>
          <MonoLargeTitle
            style={{
              fontSize: 40,
              textShadowColor: isPositive ? colors.successAlpha : colors.errorAlpha,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 24,
            }}
          >
            €{portfolioTotal.toLocaleString("el-GR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </MonoLargeTitle>
          <View style={styles.heroPnl}>
            <PnLText value={portfolioPnl} format="currency" size="lg" showArrow={true} />
            <Footnote color="muted"> · </Footnote>
            <PnLText value={portfolioPnlPercent} format="percent" size="lg" showArrow={false} />
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
        <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  styles.tab,
                  isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Subhead
                  color={isActive ? "primary" : "muted"}
                  style={{ fontFamily: isActive ? FontFamily.bold : FontFamily.medium }}
                >
                  {tab}
                </Subhead>
              </Pressable>
            );
          })}
        </View>

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          <View style={styles.holdingsHeader}>
            <Caption1
              color="muted"
              style={{
                fontFamily: FontFamily.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {enrichedHoldings.length} Holdings
            </Caption1>
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
                  <View style={[styles.holdingIcon, { backgroundColor: colors.surfaceSecondary }]}>
                    <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
                      {holding.asset.ticker.slice(0, 2)}
                    </Caption1>
                  </View>
                  <View>
                    <Subhead style={{ fontFamily: FontFamily.semibold, marginBottom: 2 }}>
                      {holding.asset.ticker}
                    </Subhead>
                    <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
                      {holding.shares} shares · avg €{holding.avgCost.toFixed(2)}
                    </Caption1>
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
                  <MonoSubhead style={{ fontFamily: FontFamily.monoMedium, marginBottom: 2 }}>
                    €{holding.liveValue.toFixed(2)}
                  </MonoSubhead>
                  <PnLText value={holding.livePnlPercent} size="sm" showArrow={false} />
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Dividend Section */}
        <View style={styles.dividendSection}>
          <Title3 style={{ marginBottom: 12 }}>Upcoming Dividends</Title3>
          <View style={[styles.dividendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.dividendRow}>
              <Subhead style={{ fontFamily: FontFamily.semibold, width: 60 }}>OPAP</Subhead>
              <Footnote color="muted" style={{ flex: 1, textAlign: "center" }}>Mar 15, 2026</Footnote>
              <MonoSubhead color="success">€0.60/share</MonoSubhead>
            </View>
            <View style={styles.dividendRow}>
              <Subhead style={{ fontFamily: FontFamily.semibold, width: 60 }}>PPC</Subhead>
              <Footnote color="muted" style={{ flex: 1, textAlign: "center" }}>Apr 02, 2026</Footnote>
              <MonoSubhead color="success">€0.85/share</MonoSubhead>
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
  heroContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  heroPnl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sparklineContainer: {
    marginTop: 16,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  holdingsContainer: {
    paddingTop: 8,
  },
  holdingsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
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
  holdingCenter: {
    marginHorizontal: 12,
  },
  holdingRight: {
    alignItems: "flex-end",
  },
  dividendSection: {
    paddingHorizontal: 16,
    marginTop: 24,
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
});
