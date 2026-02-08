import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { AssetRow } from "@/components/ui/asset-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  GREEK_STOCKS,
  TOP_GAINERS,
  TOP_LOSERS,
  type Asset,
} from "@/lib/mock-data";

const CATEGORIES = ["All", "Blue Chips", "Gainers", "Losers", "Dividend"];

export default function MarketsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredStocks = useMemo(() => {
    let stocks: Asset[];
    switch (activeCategory) {
      case "Gainers":
        stocks = TOP_GAINERS;
        break;
      case "Losers":
        stocks = TOP_LOSERS;
        break;
      case "Blue Chips":
        stocks = GREEK_STOCKS.filter((s) => s.category === "blue-chip");
        break;
      case "Dividend":
        stocks = GREEK_STOCKS.filter((s) => s.category === "dividend");
        break;
      default:
        stocks = GREEK_STOCKS;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      stocks = stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q)
      );
    }
    return stocks;
  }, [search, activeCategory]);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Markets</Text>
        <View style={styles.marketStatus}>
          <View
            style={[styles.statusDot, { backgroundColor: colors.success }]}
          />
          <Text style={[styles.statusText, { color: colors.success }]}>
            ATHEX Open
          </Text>
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
            style={[styles.searchInput, { color: colors.foreground }]}
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
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.surface,
                    borderColor: isActive
                      ? colors.primary
                      : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive ? "#FFFFFF" : colors.muted,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Stock List */}
      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AssetRow
            asset={item}
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
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No stocks found
            </Text>
          </View>
        }
      />
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
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
    fontWeight: "500",
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
  chipText: {
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
