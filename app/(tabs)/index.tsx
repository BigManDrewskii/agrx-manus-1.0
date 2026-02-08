import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Linking,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Sparkline } from "@/components/ui/sparkline";
import { PnLText } from "@/components/ui/pnl-text";
import { TrendingCard } from "@/components/ui/trending-card";
import { SectionHeader } from "@/components/ui/section-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { DemoBanner } from "@/components/ui/demo-banner";
import { XPBar } from "@/components/ui/xp-bar";
import { LiveBadge } from "@/components/ui/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetRow } from "@/components/ui/asset-row";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
import { useNotifications } from "@/lib/notification-context";
import { useDemo, type LivePriceMap } from "@/lib/demo-context";
import { useViewMode } from "@/lib/viewmode-context";
import { useWatchlist } from "@/lib/watchlist-context";
import { useMarketNews } from "@/hooks/use-news";
import {
  Footnote,
  Title2,
  Caption1,
  Caption2,
  Callout,
  Headline,
  MonoLargeTitle,
  MonoCaption1,
  Subhead,
  Body,
} from "@/components/ui/typography";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { FontFamily } from "@/constants/typography";
import {
  PORTFOLIO_SPARKLINE,
  DAILY_CHALLENGE,
  USER_STREAK,
  SOCIAL_FEED,
} from "@/lib/mock-data";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { stocks, isLoading, isLive, lastUpdated, refetch } = useStockQuotes();
  const refreshCache = useRefreshCache();
  const marketNewsQuery = useMarketNews();
  const marketNews = marketNewsQuery.data?.success ? marketNewsQuery.data.data : [];
  const newsLoading = marketNewsQuery.isLoading;

  const { unreadCount } = useNotifications();
  const { getPortfolioValue, getPortfolioPnL, state: demoState } = useDemo();
  const { isSimple, isPro } = useViewMode();
  const { watchlist, isWatchlisted, toggle: toggleWatchlist } = useWatchlist();

  // Build live price map from stock quotes
  const livePriceMap: LivePriceMap = useMemo(() => {
    const map: LivePriceMap = {};
    for (const s of stocks) {
      map[s.id] = s.price;
    }
    return map;
  }, [stocks]);

  // Derive portfolio values from DemoContext + live prices
  const portfolioTotalValue = getPortfolioValue(livePriceMap);
  const { pnl: portfolioPnl, pnlPercent: portfolioPnlPercent } = getPortfolioPnL(livePriceMap);
  const totalAccountValue = portfolioTotalValue + demoState.balance;
  const isPositive = portfolioPnl >= 0;

  // Get top 5 trending stocks by absolute change percent
  const trendingStocks = useMemo(
    () =>
      [...stocks]
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 5),
    [stocks],
  );

  // Get watchlisted stocks
  const watchlistedStocks = useMemo(
    () => stocks.filter((s) => isWatchlisted(s.id)),
    [stocks, watchlist],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCache.mutateAsync();
      await refetch();
    } catch {
      // Silently handle refresh errors
    } finally {
      setRefreshing(false);
    }
  }, [refreshCache, refetch]);

  // ── Greeting based on time of day ──
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <ScreenContainer>
      <DemoBanner />
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
            HEADER — Greeting, mode toggle, bell, settings
            ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Footnote color="muted">{greeting}</Footnote>
              <Title2>Andreas</Title2>
            </View>
            <View style={styles.headerActions}>
              {isPro && <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />}
              {isPro && (
                <View style={styles.streakBadge}>
                  <IconSymbol name="flame.fill" size={14} color={colors.warning} />
                  <Caption1
                    color="warning"
                    style={{ fontFamily: FontFamily.bold, fontVariant: ["tabular-nums"] }}
                  >
                    {USER_STREAK}
                  </Caption1>
                </View>
              )}
              <AnimatedPressable
                variant="icon"
                onPress={() => router.push("/notification-history" as any)}
                style={[
                  styles.iconButton,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <IconSymbol
                  name="bell.fill"
                  size={18}
                  color={unreadCount > 0 ? colors.primary : colors.muted}
                />
                {unreadCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.error }]}>
                    <Caption2
                      style={{
                        color: colors.onPrimary,
                        fontFamily: FontFamily.bold,
                        fontSize: 9,
                        lineHeight: 12,
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Caption2>
                  </View>
                )}
              </AnimatedPressable>
              <AnimatedPressable
                variant="icon"
                onPress={() => router.push("/settings" as any)}
                style={[
                  styles.iconButton,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <IconSymbol name="gearshape.fill" size={18} color={colors.muted} />
              </AnimatedPressable>
            </View>
          </View>
          {/* Mode toggle — sits below greeting row */}
          <View style={styles.modeToggleRow}>
            <ViewModeToggle compact />
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            PORTFOLIO HERO
            ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.portfolioHero}>
          <Footnote color="muted" style={{ letterSpacing: 0.3 }}>
            Total Balance
          </Footnote>
          <AnimatedNumber
            value={totalAccountValue}
            prefix="€"
            decimals={2}
            style={{
              fontSize: 34,
              lineHeight: 42,
              fontFamily: "JetBrainsMono_700Bold",
              color: colors.foreground,
              textShadowColor: isPositive ? colors.successAlpha : colors.errorAlpha,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 16,
            }}
          />
          <View style={styles.pnlRow}>
            <AnimatedPnLNumber
              value={portfolioPnl}
              format="currency"
              size="md"
              showArrow={true}
              successColor={colors.success}
              errorColor={colors.error}
              mutedColor={colors.muted}
            />
            <Footnote color="muted"> · </Footnote>
            <AnimatedPnLNumber
              value={portfolioPnlPercent}
              format="percent"
              size="md"
              showArrow={false}
              successColor={colors.success}
              errorColor={colors.error}
              mutedColor={colors.muted}
            />
            <Footnote color="muted"> all time</Footnote>
          </View>

          {/* Sparkline + time selectors — Pro only */}
          {isPro && (
            <>
              <View style={styles.sparklineContainer}>
                <Sparkline
                  data={PORTFOLIO_SPARKLINE}
                  width={320}
                  height={44}
                  positive={isPositive}
                  strokeWidth={1.8}
                />
              </View>
              <View style={styles.timePeriodRow}>
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period, i) => (
                  <AnimatedPressable
                    key={period}
                    variant="chip"
                    style={[
                      styles.timePeriodButton,
                      i === 0 && { backgroundColor: colors.primaryAlpha },
                    ]}
                  >
                    <Caption1
                      color={i === 0 ? "primary" : "muted"}
                      style={{
                        fontFamily: i === 0 ? FontFamily.bold : FontFamily.medium,
                        letterSpacing: 0.3,
                      }}
                    >
                      {period}
                    </Caption1>
                  </AnimatedPressable>
                ))}
              </View>
            </>
          )}
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            QUICK ACTIONS — Simple mode gets prominent action buttons
            ═══════════════════════════════════════════════════════════════════ */}
        {isSimple && (
          <Animated.View entering={FadeInDown.duration(250).delay(120)} style={styles.quickActions}>
            <AnimatedPressable
              variant="button"
              onPress={() => router.push("/(tabs)/trade")}
              style={[
                styles.quickActionButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <IconSymbol name="plus.circle.fill" size={20} color={colors.onPrimary} />
              <Subhead style={{ fontFamily: FontFamily.semibold, color: colors.onPrimary }}>
                Trade
              </Subhead>
            </AnimatedPressable>
            <AnimatedPressable
              variant="button"
              onPress={() => router.push("/(tabs)/portfolio")}
              style={[
                styles.quickActionButton,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <IconSymbol name="briefcase.fill" size={20} color={colors.foreground} />
              <Subhead style={{ fontFamily: FontFamily.semibold }}>Portfolio</Subhead>
            </AnimatedPressable>
            <AnimatedPressable
              variant="button"
              onPress={() => router.push("/(tabs)/markets")}
              style={[
                styles.quickActionButton,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.foreground} />
              <Subhead style={{ fontFamily: FontFamily.semibold }}>Markets</Subhead>
            </AnimatedPressable>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            XP PROGRESS — Pro only
            ═══════════════════════════════════════════════════════════════════ */}
        {isPro && <XPBar />}

        {/* ═══════════════════════════════════════════════════════════════════
            DAILY CHALLENGE — Pro only
            ═══════════════════════════════════════════════════════════════════ */}
        {isPro && (
          <Animated.View entering={FadeInDown.duration(250).delay(150)} style={styles.section}>
            <AnimatedPressable
              variant="card"
              style={[
                styles.challengeCard,
                {
                  backgroundColor: colors.warningAlpha,
                  borderColor: colors.warningAlpha,
                },
              ]}
            >
              <View style={styles.challengeHeader}>
                <View style={styles.challengeLeft}>
                  <IconSymbol name="trophy.fill" size={18} color={colors.warning} />
                  <Headline style={{ fontSize: 15 }}>{DAILY_CHALLENGE.title}</Headline>
                </View>
                <View style={[styles.rewardBadge, { backgroundColor: colors.warningAlpha }]}>
                  <Caption1 color="warning" style={{ fontFamily: FontFamily.bold }}>
                    {DAILY_CHALLENGE.reward}
                  </Caption1>
                </View>
              </View>
              <Footnote color="muted">{DAILY_CHALLENGE.description}</Footnote>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.warningAlpha }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.warning,
                        width: `${(DAILY_CHALLENGE.progress / DAILY_CHALLENGE.total) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <MonoCaption1 color="muted">
                  {DAILY_CHALLENGE.progress}/{DAILY_CHALLENGE.total}
                </MonoCaption1>
              </View>
            </AnimatedPressable>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            WATCHLIST — Both modes (if user has watchlisted stocks)
            ═══════════════════════════════════════════════════════════════════ */}
        {watchlistedStocks.length > 0 && (
          <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.section}>
            <SectionHeader
              title="Watchlist"
              actionLabel="Edit"
              onAction={() => router.push("/(tabs)/markets")}
            />
            <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {watchlistedStocks.map((stock, i) => (
                <AssetRow
                  key={stock.id}
                  asset={stock}
                  showSparkline={isPro}
                  showStar={false}
                  onPress={() =>
                    router.push({
                      pathname: "/asset/[id]" as any,
                      params: { id: stock.id },
                    })
                  }
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty watchlist prompt — Simple mode only */}
        {isSimple && watchlistedStocks.length === 0 && !isLoading && (
          <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.section}>
            <SectionHeader title="Watchlist" />
            <AnimatedPressable
              variant="card"
              onPress={() => router.push("/(tabs)/markets")}
              style={[
                styles.emptyWatchlistCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <IconSymbol name="star.fill" size={24} color={colors.border} />
              <Subhead color="muted" style={{ fontFamily: FontFamily.medium, marginTop: 8 }}>
                Star stocks from Markets to add them here
              </Subhead>
              <Caption1 color="primary" style={{ fontFamily: FontFamily.semibold, marginTop: 4 }}>
                Browse Markets →
              </Caption1>
            </AnimatedPressable>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TRENDING ON ATHEX — Pro shows carousel, Simple shows top 3 rows
            ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(250).delay(240)} style={styles.section}>
          <SectionHeader
            title={isSimple ? "Top Movers" : "Trending on ATHEX"}
            actionLabel="See All"
            onAction={() => router.push("/(tabs)/markets")}
          />
          {isLoading ? (
            <View style={isPro ? styles.trendingLoading : { paddingHorizontal: 16, gap: 0 }}>
              {(isPro ? [1, 2, 3] : [1, 2, 3]).map((i) =>
                isPro ? (
                  <View
                    key={i}
                    style={[
                      styles.trendingSkeletonCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Skeleton width={32} height={32} borderRadius={16} />
                    <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
                    <Skeleton width={80} height={10} style={{ marginTop: 4 }} />
                    <Skeleton width={50} height={28} style={{ marginTop: 10 }} />
                    <Skeleton width={55} height={12} style={{ marginTop: 6 }} />
                  </View>
                ) : (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      gap: 12,
                    }}
                  >
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <View style={{ flex: 1 }}>
                      <Skeleton width={80} height={14} />
                      <Skeleton width={50} height={10} style={{ marginTop: 4 }} />
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Skeleton width={60} height={14} />
                      <Skeleton width={40} height={10} style={{ marginTop: 4 }} />
                    </View>
                  </View>
                ),
              )}
            </View>
          ) : isPro ? (
            <FlatList
              data={trendingStocks}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TrendingCard
                  asset={{
                    id: item.id,
                    ticker: item.ticker,
                    name: item.name,
                    price: item.price,
                    change: item.change,
                    changePercent: item.changePercent,
                    sparkline: item.sparkline,
                    category: item.category,
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/asset/[id]" as any,
                      params: { id: item.id },
                    })
                  }
                />
              )}
            />
          ) : (
            <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {trendingStocks.slice(0, 3).map((stock) => (
                <AssetRow
                  key={stock.id}
                  asset={stock}
                  showSparkline={false}
                  onPress={() =>
                    router.push({
                      pathname: "/asset/[id]" as any,
                      params: { id: stock.id },
                    })
                  }
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            MARKET NEWS — Simple: 2 articles, Pro: 4 articles
            ═══════════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(250).delay(300)} style={styles.section}>
          <SectionHeader
            title="Market News"
            actionLabel={isPro && marketNews.length > 4 ? "See All" : undefined}
          />
          {newsLoading ? (
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {[1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.newsCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Skeleton width="100%" height={14} borderRadius={4} />
                  <Skeleton width="70%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                    <Skeleton width={80} height={10} borderRadius={4} />
                    <Skeleton width={50} height={10} borderRadius={4} />
                  </View>
                </View>
              ))}
            </View>
          ) : marketNews.length > 0 ? (
            marketNews.slice(0, isSimple ? 2 : 4).map((article, index) => (
              <AnimatedPressable
                key={`${article.url}-${index}`}
                variant="card"
                onPress={() => {
                  if (article.url) Linking.openURL(article.url).catch(() => {});
                }}
                style={[
                  styles.newsCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Subhead style={{ fontFamily: FontFamily.semibold, lineHeight: 20 }} numberOfLines={2}>
                  {article.title}
                </Subhead>
                <View style={styles.newsMetaRow}>
                  <Caption1 color="primary" style={{ fontFamily: FontFamily.semibold }}>
                    {article.source}
                  </Caption1>
                  <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
                    {article.relativeTime}
                  </Caption1>
                </View>
              </AnimatedPressable>
            ))
          ) : (
            <View
              style={[
                styles.newsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  alignItems: "center",
                  paddingVertical: 20,
                  marginHorizontal: 16,
                },
              ]}
            >
              <Footnote color="muted" style={{ fontFamily: FontFamily.medium }}>
                No market news available
              </Footnote>
            </View>
          )}
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════════════
            SOCIAL FEED PREVIEW — Pro only
            ═══════════════════════════════════════════════════════════════════ */}
        {isPro && (
          <Animated.View entering={FadeInDown.duration(250).delay(360)} style={styles.section}>
            <SectionHeader
              title="Community"
              actionLabel="See All"
              onAction={() => router.push("/(tabs)/social")}
            />
            {SOCIAL_FEED.slice(0, 3).map((post) => (
              <AnimatedPressable
                key={post.id}
                variant="card"
                style={[
                  styles.socialCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.socialHeader}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryAlpha }]}>
                    <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
                      {post.avatar}
                    </Caption1>
                  </View>
                  <View style={styles.socialMeta}>
                    <Subhead style={{ fontFamily: FontFamily.semibold }}>{post.username}</Subhead>
                    <Caption2 color="muted">{post.timestamp}</Caption2>
                  </View>
                  {post.pnlPercent !== undefined && (
                    <PnLText value={post.pnlPercent} size="sm" showArrow={false} />
                  )}
                </View>
                <Subhead numberOfLines={2} style={{ marginBottom: 10 }}>
                  {post.content}
                </Subhead>
                <View style={styles.socialFooter}>
                  <View style={styles.socialStat}>
                    <IconSymbol name="star.fill" size={14} color={colors.muted} />
                    <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
                      {post.likes}
                    </Caption1>
                  </View>
                  <View style={styles.socialStat}>
                    <IconSymbol name="paperplane.fill" size={14} color={colors.muted} />
                    <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
                      {post.comments}
                    </Caption1>
                  </View>
                </View>
              </AnimatedPressable>
            ))}
          </Animated.View>
        )}

        {/* Bottom Spacer for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    gap: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 1,
    right: 1,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  modeToggleRow: {
    marginTop: 12,
    alignSelf: "flex-start",
  },

  // ── Portfolio Hero ──
  portfolioHero: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "center",
  },
  pnlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sparklineContainer: {
    marginTop: 14,
    alignItems: "center",
  },
  timePeriodRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 4,
  },
  timePeriodButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },

  // ── Quick Actions (Simple mode) ──
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },

  // ── Sections ──
  section: {
    marginTop: 20,
  },

  // ── List card (watchlist, simple trending) ──
  listCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },

  // ── Empty watchlist ──
  emptyWatchlistCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },

  // ── Challenge (Pro) ──
  challengeCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  challengeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2.5,
  },

  // ── Trending (Pro carousel) ──
  trendingList: {
    paddingHorizontal: 16,
  },
  trendingLoading: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingSkeletonCard: {
    width: 148,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },

  // ── News ──
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  newsMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  // ── Social (Pro) ──
  socialCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  socialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  socialMeta: {
    flex: 1,
  },
  socialFooter: {
    flexDirection: "row",
    gap: 16,
  },
  socialStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
