import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { AssetRow } from "@/components/ui/asset-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiveBadge } from "@/components/ui/live-badge";
import { StockListSkeleton } from "@/components/ui/skeleton";
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
import {
  Title1,
  Caption1,
  Caption2,
  Callout,
  Footnote,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { SECTORS, SECTOR_ICONS, type Sector } from "@/lib/sectors";
import { useWatchlist } from "@/lib/watchlist-context";

// ── Filter Types ────────────────────────────────────────────────────────────
type FilterMode = "All" | "Watchlist" | Sector;
type SortMode = "default" | "gainers" | "losers" | "volume" | "alpha";

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "gainers", label: "Top Gainers" },
  { key: "losers", label: "Top Losers" },
  { key: "volume", label: "Volume" },
  { key: "alpha", label: "A → Z" },
];

export default function MarketsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterMode>("All");
  const { isWatchlisted, toggle: toggleWatchlist, count: watchlistCount } = useWatchlist();
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [refreshing, setRefreshing] = useState(false);
  const { stocks, isLoading, isLive, lastUpdated, refetch } = useStockQuotes();
  const refreshCache = useRefreshCache();

  const filteredStocks = useMemo(() => {
    let filtered = [...stocks];

    // Watchlist or Sector filter
    if (activeFilter === "Watchlist") {
      filtered = filtered.filter((s) => isWatchlisted(s.id));
    } else if (activeFilter !== "All") {
      filtered = filtered.filter((s) => s.sector === activeFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortMode) {
      case "gainers":
        filtered.sort((a, b) => b.changePercent - a.changePercent);
        break;
      case "losers":
        filtered.sort((a, b) => a.changePercent - b.changePercent);
        break;
      case "volume":
        filtered.sort((a, b) => b.volume - a.volume);
        break;
      case "alpha":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default: blue-chip first, then by market cap hint
        break;
    }

    return filtered;
  }, [stocks, search, activeFilter, sortMode, isWatchlisted]);

  // Count stocks per sector for badge display
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = { All: stocks.length };
    for (const s of stocks) {
      counts[s.sector] = (counts[s.sector] ?? 0) + 1;
    }
    return counts;
  }, [stocks]);

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

  // ATHEX market status — derived in useMemo to satisfy React Compiler purity rules
  const isMarketOpen = useMemo(() => {
    const now = new Date();
    const athensHour = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Athens" })
    ).getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    return isWeekday && athensHour >= 10 && athensHour < 17;
  }, [lastUpdated]); // Re-derive when data refreshes

  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
        <Title1>Markets</Title1>
        <View style={styles.headerRight}>
          <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
          <View style={styles.marketStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isMarketOpen
                    ? colors.success
                    : colors.muted,
                },
              ]}
            />
            <Caption1
              color={isMarketOpen ? "success" : "muted"}
              style={{ fontFamily: FontFamily.semibold }}
            >
              {isMarketOpen ? "ATHEX Open" : "ATHEX Closed"}
            </Caption1>
          </View>
        </View>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            style={[
              styles.searchInput,
              { color: colors.foreground, fontFamily: FontFamily.medium },
            ]}
            placeholder="Search 135 ATHEX stocks..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="done"
          />
          {search.length > 0 && (
            <AnimatedPressable
              variant="icon"
              onPress={() => setSearch("")}
            >
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </AnimatedPressable>
          )}
        </View>
      </Animated.View>

      {/* Sector Chips — Horizontal Scrollable */}
      <Animated.View entering={FadeInDown.duration(250).delay(120)} style={styles.sectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectorList}
        >
          {/* "All" chip */}
          <AnimatedPressable
            variant="chip"
            onPress={() => setActiveFilter("All")}
            style={[
              styles.sectorChip,
              {
                backgroundColor:
                  activeFilter === "All" ? colors.primary : colors.surface,
                borderColor:
                  activeFilter === "All" ? colors.primary : colors.border,
              },
            ]}
          >
            <Caption1
              color={activeFilter === "All" ? "onPrimary" : "foreground"}
              style={{
                fontFamily:
                  activeFilter === "All"
                    ? FontFamily.bold
                    : FontFamily.medium,
              }}
            >
              All
            </Caption1>
            <Caption2
              color={activeFilter === "All" ? "onPrimary" : "muted"}
              style={{ fontFamily: FontFamily.medium }}
            >
              {sectorCounts.All ?? 0}
            </Caption2>
          </AnimatedPressable>

          {/* Watchlist chip */}
          <AnimatedPressable
            variant="chip"
            onPress={() => setActiveFilter("Watchlist")}
            style={[
              styles.sectorChip,
              {
                backgroundColor:
                  activeFilter === "Watchlist" ? colors.gold : colors.surface,
                borderColor:
                  activeFilter === "Watchlist" ? colors.gold : colors.border,
              },
            ]}
          >
            <Caption1
              color={activeFilter === "Watchlist" ? "onPrimary" : "foreground"}
              style={{
                fontFamily:
                  activeFilter === "Watchlist"
                    ? FontFamily.bold
                    : FontFamily.medium,
              }}
            >
              ★ Watchlist
            </Caption1>
            <Caption2
              color={activeFilter === "Watchlist" ? "onPrimary" : "muted"}
              style={{ fontFamily: FontFamily.medium }}
            >
              {watchlistCount}
            </Caption2>
          </AnimatedPressable>

          {/* Sector chips */}
          {SECTORS.map((sector) => {
            const isActive = activeFilter === sector;
            const count = sectorCounts[sector] ?? 0;
            if (count === 0) return null;
            return (
              <AnimatedPressable
                key={sector}
                variant="chip"
                onPress={() => setActiveFilter(sector)}
                style={[
                  styles.sectorChip,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Caption1
                  color={isActive ? "onPrimary" : "foreground"}
                  style={{
                    fontFamily: isActive
                      ? FontFamily.bold
                      : FontFamily.medium,
                  }}
                >
                  {SECTOR_ICONS[sector]} {sector}
                </Caption1>
                <Caption2
                  color={isActive ? "onPrimary" : "muted"}
                  style={{ fontFamily: FontFamily.medium }}
                >
                  {count}
                </Caption2>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Sort Row */}
      <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.sortRow}>
        <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
          {filteredStocks.length}{" "}
          {filteredStocks.length === 1 ? "stock" : "stocks"}
        </Caption1>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortChipList}
        >
          {SORT_OPTIONS.map((opt) => {
            const isActive = sortMode === opt.key;
            return (
              <AnimatedPressable
                key={opt.key}
                variant="chip"
                onPress={() => setSortMode(opt.key)}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: isActive
                      ? colors.primaryAlpha
                      : "transparent",
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Caption2
                  color={isActive ? "primary" : "muted"}
                  style={{
                    fontFamily: isActive
                      ? FontFamily.bold
                      : FontFamily.medium,
                  }}
                >
                  {opt.label}
                </Caption2>
              </AnimatedPressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Stock List */}
      {isLoading ? (
        <StockListSkeleton count={8} />
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <AssetRow
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
              showStar
              isWatchlisted={isWatchlisted(item.id)}
              onToggleWatchlist={() => toggleWatchlist(item.id)}
              onPress={() =>
                router.push({
                  pathname: "/asset/[id]" as any,
                  params: { id: item.id },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="magnifyingglass"
                size={32}
                color={colors.muted}
              />
              <Callout
                color="muted"
                style={{ fontFamily: FontFamily.semibold }}
              >
                No stocks found
              </Callout>
              <Footnote color="muted">
                {search.trim()
                  ? "Try a different search term"
                  : activeFilter === "Watchlist"
                  ? "Star stocks to add them to your watchlist"
                  : activeFilter !== "All"
                  ? `No stocks in ${activeFilter} sector`
                  : "Try a different filter"}
              </Footnote>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  marketStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  sectorContainer: {
    marginBottom: 8,
  },
  sectorList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectorChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingBottom: 6,
    gap: 12,
  },
  sortChipList: {
    gap: 6,
    paddingRight: 16,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    gap: 8,
  },
});
