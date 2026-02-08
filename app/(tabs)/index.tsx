import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Linking,
} from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
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
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
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
import { FontFamily } from "@/constants/typography";
import {
  PORTFOLIO_TOTAL_VALUE,
  PORTFOLIO_PNL_PERCENT,
  PORTFOLIO_TOTAL_PNL,
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

  const isPositive = PORTFOLIO_TOTAL_PNL >= 0;

  // Get top 5 trending stocks by absolute change percent
  const trendingStocks = [...stocks]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 5);

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Footnote color="muted">Good morning</Footnote>
            <Title2>Andreas</Title2>
          </View>
          <View style={styles.headerRight}>
            <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
            <View style={styles.streakBadge}>
              <IconSymbol name="flame.fill" size={16} color={colors.warning} />
              <Callout
                color="warning"
                style={{ fontFamily: FontFamily.bold, fontVariant: ["tabular-nums"] }}
              >
                {USER_STREAK}
              </Callout>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.notifButton,
                { backgroundColor: colors.surface },
                pressed && { opacity: 0.6 },
              ]}
            >
              <IconSymbol name="bell.fill" size={20} color={colors.muted} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/settings" as any)}
              style={({ pressed }) => [
                styles.notifButton,
                { backgroundColor: colors.surface },
                pressed && { opacity: 0.6 },
              ]}
            >
              <IconSymbol name="gearshape.fill" size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Portfolio Hero */}
        <View style={styles.portfolioHero}>
          <Footnote color="muted">Portfolio Value</Footnote>
          <MonoLargeTitle
            style={{
              textShadowColor: isPositive ? colors.successAlpha : colors.errorAlpha,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}
          >
            €{PORTFOLIO_TOTAL_VALUE.toLocaleString("el-GR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </MonoLargeTitle>
          <View style={styles.pnlRow}>
            <PnLText
              value={PORTFOLIO_TOTAL_PNL}
              format="currency"
              size="md"
              showArrow={true}
            />
            <Footnote color="muted"> · </Footnote>
            <PnLText
              value={PORTFOLIO_PNL_PERCENT}
              format="percent"
              size="md"
              showArrow={false}
            />
            <Footnote color="muted"> today</Footnote>
          </View>
          <View style={styles.sparklineContainer}>
            <Sparkline
              data={PORTFOLIO_SPARKLINE}
              width={320}
              height={48}
              positive={isPositive}
              strokeWidth={2}
            />
          </View>
          {/* Time Period Selector */}
          <View style={styles.timePeriodRow}>
            {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period, i) => (
              <Pressable
                key={period}
                style={({ pressed }) => [
                  styles.timePeriodButton,
                  i === 0 && { backgroundColor: colors.primaryAlpha },
                  pressed && { opacity: 0.6 },
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
              </Pressable>
            ))}
          </View>
        </View>

        {/* XP Progress */}
        <XPBar />

        {/* Daily Challenge */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.challengeCard,
              {
                backgroundColor: colors.warningAlpha,
                borderColor: colors.warningAlpha,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.challengeHeader}>
              <View style={styles.challengeLeft}>
                <IconSymbol name="trophy.fill" size={20} color={colors.warning} />
                <Headline>{DAILY_CHALLENGE.title}</Headline>
              </View>
              <View style={[styles.rewardBadge, { backgroundColor: colors.warningAlpha }]}>
                <Caption1
                  color="warning"
                  style={{ fontFamily: FontFamily.bold }}
                >
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
          </Pressable>
        </View>

        {/* Trending on ATHEX — Live Data */}
        <View style={styles.section}>
          <SectionHeader
            title="Trending on ATHEX"
            actionLabel="See All"
            onAction={() => router.push("/(tabs)/markets")}
          />
          {isLoading ? (
            <View style={styles.trendingLoading}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.trendingSkeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Skeleton width={40} height={40} borderRadius={20} />
                  <Skeleton width={60} height={14} style={{ marginTop: 8 }} />
                  <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
                  <Skeleton width={50} height={30} style={{ marginTop: 12 }} />
                  <Skeleton width={55} height={14} style={{ marginTop: 8 }} />
                </View>
              ))}
            </View>
          ) : (
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
          )}
        </View>

        {/* Market News */}
        <View style={styles.section}>
          <SectionHeader title="Market News" actionLabel={marketNews.length > 3 ? "See All" : undefined} />
          {newsLoading ? (
            <View style={{ paddingHorizontal: 16, gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.newsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
            marketNews.slice(0, 4).map((article, index) => (
              <Pressable
                key={`${article.url}-${index}`}
                onPress={() => {
                  if (article.url) Linking.openURL(article.url).catch(() => {});
                }}
                style={({ pressed }) => [
                  styles.newsCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
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
              </Pressable>
            ))
          ) : (
            <View style={[styles.newsCard, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: "center", paddingVertical: 20, marginHorizontal: 16 }]}>
              <Footnote color="muted" style={{ fontFamily: FontFamily.medium }}>No market news available</Footnote>
            </View>
          )}
        </View>

        {/* Social Feed Preview */}
        <View style={styles.section}>
          <SectionHeader
            title="Community"
            actionLabel="See All"
            onAction={() => router.push("/(tabs)/social")}
          />
          {SOCIAL_FEED.slice(0, 3).map((post) => (
            <Pressable
              key={post.id}
              style={({ pressed }) => [
                styles.socialCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.7 },
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
            </Pressable>
          ))}
        </View>

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  portfolioHero: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: "center",
  },
  pnlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sparklineContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  timePeriodRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 4,
  },
  timePeriodButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  section: {
    marginTop: 24,
  },
  challengeCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  trendingList: {
    paddingHorizontal: 16,
  },
  trendingLoading: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingSkeletonCard: {
    width: 150,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  socialCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  socialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 10,
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
});
