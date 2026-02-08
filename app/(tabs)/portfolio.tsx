import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { Sparkline } from "@/components/ui/sparkline";
import { LiveBadge } from "@/components/ui/live-badge";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StockListSkeleton } from "@/components/ui/skeleton";
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
import { ShareCardModal } from "@/components/ui/share-card-modal";
import type { ShareCardData } from "@/components/ui/share-card";
import { useDemo, type DemoHolding, type LivePriceMap } from "@/lib/demo-context";
import { useViewMode } from "@/lib/viewmode-context";
import { GREEK_STOCKS, PORTFOLIO_SPARKLINE } from "@/lib/mock-data";
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
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface EnrichedHolding {
  holding: DemoHolding;
  livePrice: number;
  liveChange: number;
  liveChangePercent: number;
  liveValue: number;
  livePnl: number;
  livePnlPercent: number;
  liveSparkline: number[];
  avgCost: number;
}

export default function PortfolioScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSimple, isPro } = useViewMode();
  const [refreshing, setRefreshing] = useState(false);
  const { stocks, isLoading, isLive, lastUpdated, refetch } = useStockQuotes();
  const refreshCache = useRefreshCache();
  const { state, holdingsArray, getPortfolioValue, getPortfolioCost, getPortfolioPnL } = useDemo();

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  // Build live price map from stock quotes
  const livePriceMap: LivePriceMap = useMemo(() => {
    const map: LivePriceMap = {};
    for (const s of stocks) {
      map[s.id] = s.price;
    }
    return map;
  }, [stocks]);

  // Enrich holdings with live prices from DemoContext
  const enrichedHoldings: EnrichedHolding[] = useMemo(() => {
    return holdingsArray.map((h) => {
      const liveStock = stocks.find((s) => s.id === h.stockId);
      const mockAsset = GREEK_STOCKS.find((s) => s.id === h.stockId);
      const currentPrice = liveStock?.price ?? mockAsset?.price ?? 0;
      const liveValue = h.shares * currentPrice;
      const avgCost = h.shares > 0 ? h.totalCost / h.shares : 0;
      const costBasis = h.totalCost;
      const livePnl = liveValue - costBasis;
      const livePnlPercent = costBasis > 0 ? (livePnl / costBasis) * 100 : 0;

      return {
        holding: h,
        livePrice: currentPrice,
        liveChange: liveStock?.change ?? mockAsset?.change ?? 0,
        liveChangePercent: liveStock?.changePercent ?? mockAsset?.changePercent ?? 0,
        liveValue,
        livePnl,
        livePnlPercent,
        liveSparkline: liveStock?.sparkline ?? mockAsset?.sparkline ?? [],
        avgCost,
      };
    });
  }, [holdingsArray, stocks]);

  // Calculate portfolio totals from DemoContext
  const portfolioTotal = getPortfolioValue(livePriceMap);
  const portfolioCost = getPortfolioCost();
  const { pnl: portfolioPnl, pnlPercent: portfolioPnlPercent } = getPortfolioPnL(livePriceMap);
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

  // Open share modal for a specific holding
  const handleShareHolding = useCallback(
    (enriched: EnrichedHolding) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setShareData({
        ticker: enriched.holding.ticker,
        companyName: enriched.holding.name,
        price: enriched.livePrice,
        pnlAmount: enriched.livePnl,
        pnlPercent: enriched.livePnlPercent,
        sparkline: enriched.liveSparkline,
        timeFrame: "All Time",
        shares: enriched.holding.shares,
      });
      setShowShareModal(true);
    },
    []
  );

  // Open share modal for the whole portfolio
  const handleSharePortfolio = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareData({
      ticker: "PORTFOLIO",
      companyName: `${enrichedHoldings.length} Holdings`,
      price: portfolioTotal,
      pnlAmount: portfolioPnl,
      pnlPercent: portfolioPnlPercent,
      sparkline: PORTFOLIO_SPARKLINE,
      timeFrame: "All Time",
    });
    setShowShareModal(true);
  }, [enrichedHoldings.length, portfolioTotal, portfolioPnl, portfolioPnlPercent]);

  // Empty state
  const hasHoldings = enrichedHoldings.length > 0;

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
        <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
          <Title1>Portfolio</Title1>
          <View style={styles.headerRight}>
            {hasHoldings && (
              <AnimatedPressable
                variant="icon"
                onPress={handleSharePortfolio}
                style={[
                  styles.shareHeaderButton,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <IconSymbol name="square.and.arrow.up" size={18} color={colors.primary} />
              </AnimatedPressable>
            )}
            <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
          </View>
        </Animated.View>

        {/* ── Simple Mode: Clean Hero ── */}
        {isSimple && (
          <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.simpleHero}>
            <Footnote color="muted">Total Value</Footnote>
            <AnimatedNumber
              value={portfolioTotal}
              prefix="€"
              decimals={2}
              style={{
                fontSize: 36,
                lineHeight: 44,
                fontFamily: "JetBrainsMono_700Bold",
                color: colors.foreground,
                textShadowColor: isPositive ? colors.successAlpha : colors.errorAlpha,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 20,
              }}
            />
            <View style={styles.heroPnl}>
              <AnimatedPnLNumber value={portfolioPnl} format="currency" size="lg" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
              <Footnote color="muted"> · </Footnote>
              <AnimatedPnLNumber value={portfolioPnlPercent} format="percent" size="lg" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
            </View>
          </Animated.View>
        )}

        {/* ── Pro Mode: Full Hero with Sparkline ── */}
        {isPro && (
          <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.proHero}>
            <Footnote color="muted">Total Value</Footnote>
            <AnimatedNumber
              value={portfolioTotal}
              prefix="€"
              decimals={2}
              style={{
                fontSize: 40,
                lineHeight: 48,
                fontFamily: "JetBrainsMono_700Bold",
                color: colors.foreground,
                textShadowColor: isPositive ? colors.successAlpha : colors.errorAlpha,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 24,
              }}
            />
            <View style={styles.heroPnl}>
              <AnimatedPnLNumber value={portfolioPnl} format="currency" size="lg" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
              <Footnote color="muted"> · </Footnote>
              <AnimatedPnLNumber value={portfolioPnlPercent} format="percent" size="lg" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
            </View>
            {hasHoldings && (
              <View style={styles.sparklineContainer}>
                <Sparkline
                  data={PORTFOLIO_SPARKLINE}
                  width={320}
                  height={56}
                  positive={isPositive}
                  strokeWidth={2}
                />
              </View>
            )}
          </Animated.View>
        )}

        {/* Balance Info — Pro only shows full breakdown, Simple shows combined */}
        {isPro && (
          <Animated.View entering={FadeInDown.duration(250).delay(120)} style={[styles.balanceRow, { borderColor: colors.border }]}>
            <View style={styles.balanceItem}>
              <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 2 }}>
                Cash Balance
              </Caption1>
              <MonoSubhead>
                €{state.balance.toLocaleString("el-GR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </MonoSubhead>
            </View>
            <View style={[styles.balanceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.balanceItem}>
              <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 2 }}>
                Invested
              </Caption1>
              <MonoSubhead>
                €{portfolioCost.toLocaleString("el-GR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </MonoSubhead>
            </View>
          </Animated.View>
        )}

        {/* Simple mode: compact balance pill */}
        {isSimple && (
          <Animated.View entering={FadeInDown.duration(250).delay(120)} style={[styles.simpleBalancePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>Cash</Caption1>
            <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
              €{state.balance.toLocaleString("el-GR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </MonoSubhead>
          </Animated.View>
        )}

        {/* Holdings Header */}
        <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.holdingsHeader}>
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
          {state.trades.length > 0 && (
            <AnimatedPressable
              variant="chip"
              onPress={() => router.push("/trade-history" as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <IconSymbol name="clock" size={12} color={colors.muted} />
              <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
                History
              </Caption1>
            </AnimatedPressable>
          )}
        </Animated.View>

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          {isLoading ? (
            <StockListSkeleton count={4} />
          ) : !hasHoldings ? (
            <View style={styles.emptyState}>
              <IconSymbol name="chart.bar.fill" size={48} color={colors.muted} />
              <Headline style={{ marginTop: 16, marginBottom: 8 }}>
                No Holdings Yet
              </Headline>
              <Footnote color="muted" style={{ textAlign: "center", maxWidth: 260 }}>
                Start trading to build your portfolio. Your holdings will appear here.
              </Footnote>
              <AnimatedPressable
                variant="button"
                onPress={() => router.push("/(tabs)/trade")}
                style={[
                  styles.startTradingButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Subhead style={{ color: colors.onPrimary, fontFamily: FontFamily.semibold }}>
                  Start Trading
                </Subhead>
              </AnimatedPressable>
            </View>
          ) : (
            enrichedHoldings.map((enriched, index) => (
              <Animated.View
                key={enriched.holding.stockId}
                entering={FadeInDown.duration(250).delay(210 + Math.min(index, STAGGER_MAX) * STAGGER_DELAY)}
              >
                {/* ── Simple Mode: Clean Card ── */}
                {isSimple && (
                  <AnimatedPressable
                    variant="card"
                    onPress={() =>
                      router.push({
                        pathname: "/asset/[id]" as any,
                        params: { id: enriched.holding.stockId },
                      })
                    }
                    style={[
                      styles.simpleCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.simpleCardTop}>
                      <View style={[styles.simpleCardIcon, { backgroundColor: colors.primaryAlpha }]}>
                        <Caption1 color="primary" style={{ fontFamily: FontFamily.bold, fontSize: 13 }}>
                          {enriched.holding.ticker.slice(0, 2)}
                        </Caption1>
                      </View>
                      <View style={styles.simpleCardInfo}>
                        <Subhead style={{ fontFamily: FontFamily.semibold }}>
                          {enriched.holding.ticker}
                        </Subhead>
                        <Caption1 color="muted" numberOfLines={1}>
                          {enriched.holding.name}
                        </Caption1>
                      </View>
                      <View style={styles.simpleCardValue}>
                        <AnimatedNumber
                          value={enriched.liveValue}
                          prefix="€"
                          decimals={2}
                          style={{
                            fontSize: 15,
                            lineHeight: 20,
                            fontFamily: FontFamily.monoMedium,
                            color: colors.foreground,
                          }}
                        />
                        <AnimatedPnLNumber value={enriched.livePnlPercent} format="percent" size="sm" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
                      </View>
                    </View>
                  </AnimatedPressable>
                )}

                {/* ── Pro Mode: Detailed Row ── */}
                {isPro && (
                  <View style={[styles.holdingRow, { borderBottomColor: colors.border }]}>
                    <AnimatedPressable
                      variant="card"
                      onPress={() =>
                        router.push({
                          pathname: "/asset/[id]" as any,
                          params: { id: enriched.holding.stockId },
                        })
                      }
                      style={styles.holdingPressable}
                    >
                      <View style={styles.holdingLeft}>
                        <View style={[styles.holdingIcon, { backgroundColor: colors.surfaceSecondary }]}>
                          <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
                            {enriched.holding.ticker.slice(0, 2)}
                          </Caption1>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Subhead style={{ fontFamily: FontFamily.semibold, marginBottom: 2 }}>
                            {enriched.holding.ticker}
                          </Subhead>
                          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
                            {enriched.holding.shares.toFixed(enriched.holding.shares % 1 === 0 ? 0 : 4)} shares · avg €{enriched.avgCost.toFixed(2)}
                          </Caption1>
                        </View>
                      </View>
                      <View style={styles.holdingCenter}>
                        <Sparkline
                          data={enriched.liveSparkline}
                          width={48}
                          height={20}
                          positive={enriched.livePnl >= 0}
                        />
                      </View>
                      <View style={styles.holdingRight}>
                        <AnimatedNumber
                          value={enriched.liveValue}
                          prefix="€"
                          decimals={2}
                          style={{
                            fontSize: 15,
                            lineHeight: 20,
                            fontFamily: FontFamily.monoMedium,
                            color: colors.foreground,
                            marginBottom: 2,
                          }}
                        />
                        <AnimatedPnLNumber value={enriched.livePnlPercent} format="percent" size="sm" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
                      </View>
                    </AnimatedPressable>
                    {/* Share button for this holding */}
                    <AnimatedPressable
                      variant="icon"
                      onPress={() => handleShareHolding(enriched)}
                      style={[
                        styles.holdingShareButton,
                        { backgroundColor: colors.surfaceSecondary },
                      ]}
                    >
                      <IconSymbol name="square.and.arrow.up" size={14} color={colors.muted} />
                    </AnimatedPressable>
                  </View>
                )}
              </Animated.View>
            ))
          )}
        </View>

        {/* Dividend Section — Pro only */}
        {isPro && hasHoldings && (
          <Animated.View entering={FadeInDown.duration(250).delay(360)} style={styles.dividendSection}>
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
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Share Card Modal */}
      {shareData && (
        <ShareCardModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          data={shareData}
        />
      )}
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shareHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  // ── Simple Hero ──
  simpleHero: {
    alignItems: "center",
    paddingVertical: 16,
  },
  // ── Pro Hero ──
  proHero: {
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
  // ── Pro Balance Row ──
  balanceRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
  },
  balanceDivider: {
    width: 1,
    marginVertical: 4,
  },
  // ── Simple Balance Pill ──
  simpleBalancePill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  // ── Holdings ──
  holdingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  holdingsContainer: {
    paddingTop: 0,
  },
  // ── Simple Card ──
  simpleCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  simpleCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  simpleCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  simpleCardInfo: {
    flex: 1,
  },
  simpleCardValue: {
    alignItems: "flex-end",
  },
  // ── Pro Holding Row ──
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    borderBottomWidth: 0.5,
  },
  holdingPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  holdingShareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  startTradingButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
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
