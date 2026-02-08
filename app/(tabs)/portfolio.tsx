import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
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
import { getSector, SECTOR_ICONS, type Sector } from "@/lib/sectors";
import {
  Title1,
  Title3,
  Headline,
  Subhead,
  Footnote,
  Caption1,
  Caption2,
  MonoLargeTitle,
  MonoSubhead,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SPARKLINE_WIDTH = Math.min(SCREEN_WIDTH - 64, 340);

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

  // Sector allocation for Pro mode
  const sectorAllocation = useMemo(() => {
    if (enrichedHoldings.length === 0) return [];
    const totalValue = enrichedHoldings.reduce((sum, e) => sum + e.liveValue, 0);
    if (totalValue === 0) return [];

    const sectorMap: Record<string, number> = {};
    for (const e of enrichedHoldings) {
      const sector = getSector(e.holding.stockId);
      sectorMap[sector] = (sectorMap[sector] ?? 0) + e.liveValue;
    }

    return Object.entries(sectorMap)
      .map(([sector, value]) => ({
        sector: sector as Sector,
        value,
        percent: (value / totalValue) * 100,
        icon: SECTOR_ICONS[sector as Sector] ?? "🔀",
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [enrichedHoldings]);

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
        {/* ═══════════════════════════════════════════════════════════════════
            HEADER
            ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Title1 style={{ letterSpacing: -0.5 }}>Portfolio</Title1>
            {hasHoldings && (
              <Caption1 color="muted" style={{ marginTop: 2, fontFamily: FontFamily.medium }}>
                {enrichedHoldings.length} holding{enrichedHoldings.length !== 1 ? "s" : ""}
              </Caption1>
            )}
          </View>
          <View style={styles.headerRight}>
            {hasHoldings && (
              <AnimatedPressable
                variant="icon"
                onPress={handleSharePortfolio}
                style={[
                  styles.headerIconButton,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <IconSymbol name="square.and.arrow.up" size={18} color={colors.primary} />
              </AnimatedPressable>
            )}
            <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SIMPLE MODE: HERO
            ═══════════════════════════════════════════════════════════════════ */}
        {isSimple && (
          <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.simpleHero}>
            <Caption1
              color="muted"
              style={{ fontFamily: FontFamily.semibold, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}
            >
              Total Value
            </Caption1>
            <AnimatedNumber
              value={portfolioTotal}
              prefix="€"
              decimals={2}
              style={{
                fontSize: 38,
                lineHeight: 46,
                fontFamily: "JetBrainsMono_700Bold",
                color: colors.foreground,
              }}
            />
            <View style={[styles.heroPnlRow, { marginTop: 8 }]}>
              <View style={[styles.pnlPill, { backgroundColor: isPositive ? colors.successAlpha : colors.errorAlpha }]}>
                <AnimatedPnLNumber value={portfolioPnl} format="currency" size="lg" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
                <View style={[styles.pnlDot, { backgroundColor: colors.muted }]} />
                <AnimatedPnLNumber value={portfolioPnlPercent} format="percent" size="lg" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
              </View>
            </View>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            PRO MODE: HERO WITH SPARKLINE
            ═══════════════════════════════════════════════════════════════════ */}
        {isPro && (
          <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.proHero}>
            <Caption1
              color="muted"
              style={{ fontFamily: FontFamily.semibold, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}
            >
              Total Value
            </Caption1>
            <AnimatedNumber
              value={portfolioTotal}
              prefix="€"
              decimals={2}
              style={{
                fontSize: 42,
                lineHeight: 50,
                fontFamily: "JetBrainsMono_700Bold",
                color: colors.foreground,
              }}
            />
            <View style={[styles.heroPnlRow, { marginTop: 8 }]}>
              <View style={[styles.pnlPill, { backgroundColor: isPositive ? colors.successAlpha : colors.errorAlpha }]}>
                <AnimatedPnLNumber value={portfolioPnl} format="currency" size="lg" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
                <View style={[styles.pnlDot, { backgroundColor: colors.muted }]} />
                <AnimatedPnLNumber value={portfolioPnlPercent} format="percent" size="lg" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
              </View>
            </View>
            {hasHoldings && (
              <View style={styles.sparklineContainer}>
                <Sparkline
                  data={PORTFOLIO_SPARKLINE}
                  width={SPARKLINE_WIDTH}
                  height={64}
                  positive={isPositive}
                  strokeWidth={2}
                />
              </View>
            )}
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            BALANCE ROW — PRO
            ═══════════════════════════════════════════════════════════════════ */}
        {isPro && (
          <Animated.View
            entering={FadeInDown.duration(250).delay(120)}
            style={[styles.balanceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.balanceItem}>
              <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 4 }}>
                Cash Balance
              </Caption1>
              <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
                €{state.balance.toLocaleString("el-GR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </MonoSubhead>
            </View>
            <View style={[styles.balanceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.balanceItem}>
              <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 4 }}>
                Invested
              </Caption1>
              <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
                €{portfolioCost.toLocaleString("el-GR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </MonoSubhead>
            </View>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            BALANCE PILL — SIMPLE
            ═══════════════════════════════════════════════════════════════════ */}
        {isSimple && (
          <Animated.View
            entering={FadeInDown.duration(250).delay(120)}
            style={[styles.simpleBalancePill, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.balancePillLeft}>
              <IconSymbol name="briefcase.fill" size={16} color={colors.muted} />
              <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>Cash Available</Caption1>
            </View>
            <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
              €{state.balance.toLocaleString("el-GR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </MonoSubhead>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            HOLDINGS SECTION
            ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.holdingsHeader}>
          <Caption1
            color="muted"
            style={{
              fontFamily: FontFamily.semibold,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Holdings
          </Caption1>
          {state.trades.length > 0 && (
            <AnimatedPressable
              variant="chip"
              onPress={() => router.push("/trade-history" as any)}
              style={[styles.historyChip, { backgroundColor: colors.surfaceSecondary }]}
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
            /* ── Empty State ── */
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <IconSymbol name="chart.bar.fill" size={36} color={colors.muted} />
              </View>
              <Headline style={{ marginTop: 20, marginBottom: 8 }}>
                No Holdings Yet
              </Headline>
              <Footnote
                color="muted"
                style={{ textAlign: "center", maxWidth: 280, lineHeight: 20 }}
              >
                Start trading to build your portfolio. Your holdings and performance will appear here.
              </Footnote>
              <AnimatedPressable
                variant="button"
                onPress={() => router.push("/(tabs)/trade")}
                style={[styles.startTradingButton, { backgroundColor: colors.primary }]}
              >
                <IconSymbol name="plus.circle.fill" size={18} color={colors.onPrimary} />
                <Subhead style={{ color: colors.onPrimary, fontFamily: FontFamily.semibold }}>
                  Start Trading
                </Subhead>
              </AnimatedPressable>
            </View>
          ) : (
            <>
              {/* ── Simple Mode: Cards ── */}
              {isSimple && (
                <View style={[styles.simpleCardList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {enrichedHoldings.map((enriched, index) => (
                    <Animated.View
                      key={enriched.holding.stockId}
                      entering={FadeInDown.duration(250).delay(210 + Math.min(index, STAGGER_MAX) * STAGGER_DELAY)}
                    >
                      <AnimatedPressable
                        variant="card"
                        onPress={() =>
                          router.push({
                            pathname: "/asset/[id]" as any,
                            params: { id: enriched.holding.stockId },
                          })
                        }
                        style={[
                          styles.simpleCardRow,
                          index < enrichedHoldings.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
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
                            {enriched.holding.shares.toFixed(enriched.holding.shares % 1 === 0 ? 0 : 2)} shares
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
                      </AnimatedPressable>
                    </Animated.View>
                  ))}
                </View>
              )}

              {/* ── Pro Mode: Detailed Rows ── */}
              {isPro && (
                <View style={[styles.proCardList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {enrichedHoldings.map((enriched, index) => (
                    <Animated.View
                      key={enriched.holding.stockId}
                      entering={FadeInDown.duration(250).delay(210 + Math.min(index, STAGGER_MAX) * STAGGER_DELAY)}
                    >
                      <AnimatedPressable
                        variant="card"
                        onPress={() =>
                          router.push({
                            pathname: "/asset/[id]" as any,
                            params: { id: enriched.holding.stockId },
                          })
                        }
                        style={[
                          styles.holdingPressable,
                          index < enrichedHoldings.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
                        {/* Top row: icon + ticker + value */}
                        <View style={styles.holdingTopRow}>
                          <View style={[styles.holdingIcon, { backgroundColor: colors.primaryAlpha }]}>
                            <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
                              {enriched.holding.ticker.slice(0, 2)}
                            </Caption1>
                          </View>
                          <View style={styles.holdingNameCol}>
                            <Subhead style={{ fontFamily: FontFamily.semibold }} numberOfLines={1}>
                              {enriched.holding.ticker}
                            </Subhead>
                            <Caption1 color="muted" numberOfLines={1} style={{ fontFamily: FontFamily.medium }}>
                              {enriched.holding.name}
                            </Caption1>
                          </View>
                          <View style={styles.holdingValueCol}>
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
                        {/* Bottom row: shares info + sparkline + share btn */}
                        <View style={styles.holdingBottomRow}>
                          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
                            {enriched.holding.shares.toFixed(enriched.holding.shares % 1 === 0 ? 0 : 2)} shares · avg €{enriched.avgCost.toFixed(2)}
                          </Caption1>
                          <View style={styles.holdingBottomRight}>
                            <Sparkline
                              data={enriched.liveSparkline}
                              width={48}
                              height={18}
                              positive={enriched.livePnl >= 0}
                            />
                            <AnimatedPressable
                              variant="icon"
                              onPress={() => handleShareHolding(enriched)}
                              style={[styles.holdingShareButton, { backgroundColor: colors.surfaceSecondary }]}
                            >
                              <IconSymbol name="square.and.arrow.up" size={13} color={colors.muted} />
                            </AnimatedPressable>
                          </View>
                        </View>
                      </AnimatedPressable>
                    </Animated.View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTOR ALLOCATION — PRO ONLY
            ═══════════════════════════════════════════════════════════════════ */}
        {isPro && hasHoldings && sectorAllocation.length > 0 && (
          <Animated.View entering={FadeInDown.duration(250).delay(330)} style={styles.allocationSection}>
            <Caption1
              color="muted"
              style={{
                fontFamily: FontFamily.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              Allocation
            </Caption1>

            {/* Allocation bar */}
            <View style={[styles.allocationBar, { backgroundColor: colors.surfaceSecondary }]}>
              {sectorAllocation.map((item, i) => {
                const barColors = [colors.primary, colors.success, colors.accent, colors.warning, colors.error, colors.muted];
                const barColor = barColors[i % barColors.length];
                return (
                  <View
                    key={item.sector}
                    style={{
                      flex: item.percent,
                      height: "100%" as any,
                      backgroundColor: barColor,
                      borderTopLeftRadius: i === 0 ? 4 : 0,
                      borderBottomLeftRadius: i === 0 ? 4 : 0,
                      borderTopRightRadius: i === sectorAllocation.length - 1 ? 4 : 0,
                      borderBottomRightRadius: i === sectorAllocation.length - 1 ? 4 : 0,
                    }}
                  />
                );
              })}
            </View>

            {/* Allocation legend */}
            <View style={styles.allocationLegend}>
              {sectorAllocation.map((item, i) => {
                const barColors = [colors.primary, colors.success, colors.accent, colors.warning, colors.error, colors.muted];
                const barColor = barColors[i % barColors.length];
                return (
                  <View key={item.sector} style={styles.allocationLegendItem}>
                    <View style={[styles.allocationDot, { backgroundColor: barColor }]} />
                    <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, flex: 1 }}>
                      {item.sector}
                    </Caption1>
                    <Caption1 style={{ fontFamily: FontFamily.monoMedium }}>
                      {item.percent.toFixed(1)}%
                    </Caption1>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            UPCOMING DIVIDENDS — PRO ONLY
            ═══════════════════════════════════════════════════════════════════ */}
        {isPro && hasHoldings && (
          <Animated.View entering={FadeInDown.duration(250).delay(390)} style={styles.dividendSection}>
            <Caption1
              color="muted"
              style={{
                fontFamily: FontFamily.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Upcoming Dividends
            </Caption1>
            <View style={[styles.dividendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.dividendRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                <View style={styles.dividendLeft}>
                  <Subhead style={{ fontFamily: FontFamily.semibold }}>OPAP</Subhead>
                  <Caption2 color="muted">Mar 15, 2026</Caption2>
                </View>
                <MonoSubhead color="success" style={{ fontFamily: FontFamily.monoMedium }}>€0.60/share</MonoSubhead>
              </View>
              <View style={styles.dividendRow}>
                <View style={styles.dividendLeft}>
                  <Subhead style={{ fontFamily: FontFamily.semibold }}>PPC</Subhead>
                  <Caption2 color="muted">Apr 02, 2026</Caption2>
                </View>
                <MonoSubhead color="success" style={{ fontFamily: FontFamily.monoMedium }}>€0.85/share</MonoSubhead>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Bottom Spacer for Tab Bar */}
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

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLeft: {
    gap: 0,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Simple Hero ──
  simpleHero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },

  // ── Pro Hero ──
  proHero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },

  // ── P&L Row (shared) ──
  heroPnlRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pnlPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
  },
  pnlDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 6,
  },

  sparklineContainer: {
    marginTop: 20,
  },

  // ── Pro Balance Row ──
  balanceRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
  },
  balanceDivider: {
    width: 1,
    marginVertical: 2,
  },

  // ── Simple Balance Pill ──
  simpleBalancePill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  balancePillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // ── Holdings Header ──
  holdingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  historyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  holdingsContainer: {
    paddingTop: 0,
  },

  // ── Simple Card List (grouped card) ──
  simpleCardList: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  simpleCardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  simpleCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
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

  // ── Pro Card List (grouped card) ──
  proCardList: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  holdingPressable: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  holdingTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  holdingNameCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  holdingValueCol: {
    alignItems: "flex-end",
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  holdingBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingLeft: 52,
  },
  holdingBottomRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  holdingShareButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Empty State ──
  emptyState: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  startTradingButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // ── Allocation (Pro) ──
  allocationSection: {
    marginTop: 28,
  },
  allocationBar: {
    marginHorizontal: 20,
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  allocationLegend: {
    marginHorizontal: 20,
    marginTop: 14,
    gap: 10,
  },
  allocationLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  allocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Dividends (Pro) ──
  dividendSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  dividendCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  dividendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dividendLeft: {
    gap: 2,
  },
});
