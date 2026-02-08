import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
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
  Callout,
  Footnote,
  Headline,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

const CATEGORIES = ["All", "Blue Chips", "Gainers", "Losers", "Dividend", "Growth"];

export default function MarketsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const { stocks, isLoading, isLive, lastUpdated, refetch } = useStockQuotes();
  const refreshCache = useRefreshCache();

  const filteredStocks = useMemo(() => {
    let filtered = [...stocks];
    switch (activeCategory) {
      case "Gainers":
        filtered = filtered.filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
        break;
      case "Losers":
        filtered = filtered.filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
        break;
      case "Blue Chips":
        filtered = filtered.filter((s) => s.category === "blue-chip");
        break;
      case "Dividend":
        filtered = filtered.filter((s) => s.category === "dividend");
        break;
      case "Growth":
        filtered = filtered.filter((s) => s.category === "growth");
        break;
      default:
        break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [stocks, search, activeCategory]);

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

  // Determine ATHEX market status based on current time (EEST)
  const now = new Date();
  const athensHour = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Athens" })).getHours();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const isMarketOpen = isWeekday && athensHour >= 10 && athensHour < 17;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Title1>Markets</Title1>
        <View style={styles.headerRight}>
          <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
          <View style={styles.marketStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isMarketOpen ? colors.success : colors.muted },
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
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
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
            placeholder="Search stocks, ETFs..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.chipContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isActive = item === activeCategory;
            return (
              <Pressable
                onPress={() => setActiveCategory(item)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Caption1
                  color={isActive ? "onPrimary" : "muted"}
                  style={{ fontFamily: isActive ? FontFamily.bold : FontFamily.medium }}
                >
                  {item}
                </Caption1>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Stock Count */}
      <View style={styles.countRow}>
        <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
          {filteredStocks.length} {filteredStocks.length === 1 ? "stock" : "stocks"}
        </Caption1>
      </View>

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
              <IconSymbol name="magnifyingglass" size={32} color={colors.muted} />
              <Callout color="muted" style={{ fontFamily: FontFamily.semibold }}>
                No stocks found
              </Callout>
              <Footnote color="muted">Try a different search or category</Footnote>
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
  chipContainer: {
    marginBottom: 8,
  },
  chipList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  countRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
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
