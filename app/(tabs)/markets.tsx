/**
 * Markets Screen — Browse and search ATHEX stocks
 *
 * Refactored to use extracted feature components for better maintainability.
 */
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AssetRow } from "@/components/ui/asset-row";
import { StockListSkeleton } from "@/components/ui/skeleton";
import { MarketsHeader, SearchBarWithClear, SectorFilterChips, SortOptionChips } from "@/components/features/markets";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
import {
  Caption1,
  Callout,
  Footnote,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { useWatchlist } from "@/lib/watchlist-context";

type FilterMode = "All" | "Watchlist" | string;
type SortMode = "default" | "gainers" | "losers" | "volume" | "alpha";

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

  return (
    <ScreenContainer>
      {/* Header */}
      <MarketsHeader isLive={isLive} lastUpdated={lastUpdated} />

      {/* Search */}
      <SearchBarWithClear value={search} onChange={setSearch} />

      {/* Sector Chips */}
      <SectorFilterChips
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sectorCounts={sectorCounts}
        watchlistCount={watchlistCount}
      />

      {/* Sort Row */}
      <SortOptionChips
        sortMode={sortMode}
        onSortChange={setSortMode}
        stockCount={filteredStocks.length}
      />

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
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    gap: 8,
  },
});
