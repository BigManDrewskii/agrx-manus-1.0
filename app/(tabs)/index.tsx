import React, { useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
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

  const isPositive = PORTFOLIO_TOTAL_PNL >= 0;
  const glowColor = isPositive ? colors.success : colors.error;

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
            <Text style={[styles.greeting, { color: colors.muted }]}>
              Good morning
            </Text>
            <Text style={[styles.username, { color: colors.foreground }]}>
              Andreas
            </Text>
          </View>
          <View style={styles.headerRight}>
            <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
            <View style={styles.streakBadge}>
              <IconSymbol name="flame.fill" size={16} color={colors.warning} />
              <Text style={[styles.streakText, { color: colors.warning }]}>
                {USER_STREAK}
              </Text>
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
          </View>
        </View>

        {/* Portfolio Hero */}
        <View style={styles.portfolioHero}>
          <Text style={[styles.portfolioLabel, { color: colors.muted }]}>
            Portfolio Value
          </Text>
          <View style={styles.portfolioValueRow}>
            <Text
              style={[
                styles.portfolioValue,
                {
                  color: colors.foreground,
                  textShadowColor: glowColor + "40",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 20,
                },
              ]}
            >
              €{PORTFOLIO_TOTAL_VALUE.toLocaleString("el-GR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.pnlRow}>
            <PnLText
              value={PORTFOLIO_TOTAL_PNL}
              format="currency"
              size="md"
              showArrow={true}
            />
            <Text style={[styles.pnlSeparator, { color: colors.muted }]}>
              {" · "}
            </Text>
            <PnLText
              value={PORTFOLIO_PNL_PERCENT}
              format="percent"
              size="md"
              showArrow={false}
            />
            <Text style={[styles.timePeriod, { color: colors.muted }]}>
              {" "}today
            </Text>
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
                  i === 0 && {
                    backgroundColor: colors.primary + "20",
                  },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.timePeriodText,
                    {
                      color: i === 0 ? colors.primary : colors.muted,
                      fontWeight: i === 0 ? "700" : "500",
                    },
                  ]}
                >
                  {period}
                </Text>
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
                backgroundColor: colors.warning + "12",
                borderColor: colors.warning + "30",
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.challengeHeader}>
              <View style={styles.challengeLeft}>
                <IconSymbol name="trophy.fill" size={20} color={colors.warning} />
                <Text style={[styles.challengeTitle, { color: colors.foreground }]}>
                  {DAILY_CHALLENGE.title}
                </Text>
              </View>
              <View
                style={[
                  styles.rewardBadge,
                  { backgroundColor: colors.warning + "25" },
                ]}
              >
                <Text style={[styles.rewardText, { color: colors.warning }]}>
                  {DAILY_CHALLENGE.reward}
                </Text>
              </View>
            </View>
            <Text style={[styles.challengeDesc, { color: colors.muted }]}>
              {DAILY_CHALLENGE.description}
            </Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: colors.warning + "20" },
                ]}
              >
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
              <Text style={[styles.progressText, { color: colors.muted }]}>
                {DAILY_CHALLENGE.progress}/{DAILY_CHALLENGE.total}
              </Text>
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
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {post.avatar}
                  </Text>
                </View>
                <View style={styles.socialMeta}>
                  <Text style={[styles.socialUsername, { color: colors.foreground }]}>
                    {post.username}
                  </Text>
                  <Text style={[styles.socialTime, { color: colors.muted }]}>
                    {post.timestamp}
                  </Text>
                </View>
                {post.pnlPercent !== undefined && (
                  <PnLText value={post.pnlPercent} size="sm" showArrow={false} />
                )}
              </View>
              <Text
                style={[styles.socialContent, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {post.content}
              </Text>
              <View style={styles.socialFooter}>
                <View style={styles.socialStat}>
                  <IconSymbol name="star.fill" size={14} color={colors.muted} />
                  <Text style={[styles.socialStatText, { color: colors.muted }]}>
                    {post.likes}
                  </Text>
                </View>
                <View style={styles.socialStat}>
                  <IconSymbol name="paperplane.fill" size={14} color={colors.muted} />
                  <Text style={[styles.socialStatText, { color: colors.muted }]}>
                    {post.comments}
                  </Text>
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
  greeting: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
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
  streakText: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
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
  portfolioLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  portfolioValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  portfolioValue: {
    fontSize: 38,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  pnlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  pnlSeparator: {
    fontSize: 14,
  },
  timePeriod: {
    fontSize: 13,
    fontWeight: "500",
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
  timePeriodText: {
    fontSize: 13,
    letterSpacing: 0.3,
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
  challengeTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "700",
  },
  challengeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
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
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  socialMeta: {
    flex: 1,
  },
  socialUsername: {
    fontSize: 14,
    fontWeight: "600",
  },
  socialTime: {
    fontSize: 11,
    fontWeight: "500",
  },
  socialContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
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
  socialStatText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
