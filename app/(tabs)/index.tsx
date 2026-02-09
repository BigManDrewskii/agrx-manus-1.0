/**
 * Home Screen — Main dashboard with Simple/Pro variants
 *
 * Refactored to use extracted feature components for better maintainability.
 */
import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { DemoBanner } from "@/components/ui/demo-banner";
import { XPBar } from "@/components/ui/xp-bar";
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
import { useNotifications } from "@/lib/notification-context";
import { useDemo, type LivePriceMap } from "@/lib/demo-context";
import { useViewMode } from "@/lib/viewmode-context";
import { useWatchlist } from "@/lib/watchlist-context";
import { useMarketNews } from "@/hooks/use-news";
import {
  HomeHeader,
  PortfolioHero,
  QuickActions,
  DailyChallengeCard,
  WatchlistSection,
  TrendingSection,
  MarketNewsSection,
  SocialFeedPreview,
} from "@/components/features/home";
import {
  PORTFOLIO_SPARKLINE,
  USER_STREAK,
} from "@/lib/mock-data";

export default function HomeScreen() {
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
  const { watchlist, isWatchlisted } = useWatchlist();

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
            tintColor="rgb(0, 122, 255)"
            colors={["rgb(0, 122, 255)"]}
          />
        }
      >
        {/* Header */}
        <HomeHeader
          greeting={greeting}
          userName="Andreas"
          isPro={isPro}
          isLive={isLive}
          lastUpdated={lastUpdated}
          userStreak={USER_STREAK}
          unreadCount={unreadCount}
        />

        {/* Portfolio Hero */}
        <PortfolioHero
          totalAccountValue={totalAccountValue}
          portfolioPnl={portfolioPnl}
          portfolioPnlPercent={portfolioPnlPercent}
          isPro={isPro}
          portfolioSparkline={PORTFOLIO_SPARKLINE}
        />

        {/* Quick Actions — Simple mode */}
        {isSimple && <QuickActions />}

        {/* XP Progress — Pro only */}
        {isPro && <XPBar />}

        {/* Daily Challenge — Pro only */}
        {isPro && <DailyChallengeCard />}

        {/* Watchlist */}
        <WatchlistSection
          watchlistedStocks={watchlistedStocks}
          isPro={isPro}
          isLoading={isLoading}
        />

        {/* Trending on ATHEX */}
        <TrendingSection
          trendingStocks={trendingStocks}
          isPro={isPro}
          isLoading={isLoading}
        />

        {/* Market News */}
        <MarketNewsSection
          marketNews={marketNews}
          isLoading={newsLoading}
          isSimple={isSimple}
        />

        {/* Social Feed Preview — Pro only */}
        {isPro && <SocialFeedPreview />}

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
});
