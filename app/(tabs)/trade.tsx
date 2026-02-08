import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AssetRow } from "@/components/ui/asset-row";
import { LiveBadge } from "@/components/ui/live-badge";
import { StockListSkeleton } from "@/components/ui/skeleton";
import { useStockQuotes } from "@/hooks/use-stocks";
import { QUICK_AMOUNTS } from "@/lib/mock-data";

interface SelectedStock {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  category: string;
}

export default function TradeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<SelectedStock | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isBuy, setIsBuy] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const { stocks, isLoading, isLive, lastUpdated } = useStockQuotes();

  const filteredStocks = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ticker.toLowerCase().includes(q)
      );
    }
    return stocks.slice(0, 8);
  }, [stocks, search]);

  const handleConfirm = useCallback(() => {
    if (!selectedAsset || !selectedAmount) return;
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedAsset(null);
      setSelectedAmount(null);
    }, 3000);
  }, [selectedAsset, selectedAmount]);

  if (showSuccess && selectedAsset && selectedAmount) {
    const shares = (selectedAmount / selectedAsset.price).toFixed(4);
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <View
            style={[
              styles.successIcon,
              { backgroundColor: colors.successAlpha },
            ]}
          >
            <IconSymbol name="checkmark" size={48} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Trade Executed!
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.muted }]}>
            You now own {shares} shares of {selectedAsset.ticker}
          </Text>
          <Text style={[styles.successAmount, { color: colors.foreground }]}>
            €{selectedAmount.toFixed(2)}
          </Text>
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [
              styles.shareTradeButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.onPrimary} />
            <Text style={[styles.shareButtonText, { color: colors.onPrimary }]}>Share with friends</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (selectedAsset) {
    return (
      <ScreenContainer>
        <View style={styles.sheetHeader}>
          <Pressable
            onPress={() => {
              setSelectedAsset(null);
              setSelectedAmount(null);
            }}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <IconSymbol name="xmark" size={22} color={colors.muted} />
          </Pressable>
          <View style={styles.sheetTitleRow}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              {selectedAsset.ticker}
            </Text>
            <LiveBadge isLive={isLive} />
          </View>
          <View style={{ width: 22 }} />
        </View>

        {/* Buy/Sell Toggle */}
        <View
          style={[
            styles.toggleContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Pressable
            onPress={() => setIsBuy(true)}
            style={({ pressed }) => [
              styles.toggleButton,
              isBuy && { backgroundColor: colors.success },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: isBuy ? colors.onPrimary : colors.muted },
              ]}
            >
              Buy
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsBuy(false)}
            style={({ pressed }) => [
              styles.toggleButton,
              !isBuy && { backgroundColor: colors.error },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                { color: !isBuy ? colors.onPrimary : colors.muted },
              ]}
            >
              Sell
            </Text>
          </Pressable>
        </View>

        {/* Asset Info with Live Price */}
        <View style={styles.assetInfo}>
          <View
            style={[
              styles.assetIcon,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Text style={[styles.assetIconText, { color: colors.primary }]}>
              {selectedAsset.ticker.slice(0, 2)}
            </Text>
          </View>
          <Text style={[styles.assetName, { color: colors.foreground }]}>
            {selectedAsset.name}
          </Text>
          <Text style={[styles.assetPrice, { color: colors.foreground }]}>
            €{selectedAsset.price.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.assetChange,
              {
                color:
                  selectedAsset.changePercent >= 0
                    ? colors.success
                    : colors.error,
              },
            ]}
          >
            {selectedAsset.changePercent >= 0 ? "▲" : "▼"}{" "}
            {Math.abs(selectedAsset.changePercent).toFixed(2)}% today
          </Text>
        </View>

        {/* Quick Amounts */}
        <View style={styles.amountsContainer}>
          <Text style={[styles.amountsLabel, { color: colors.muted }]}>
            Select amount
          </Text>
          <View style={styles.amountsGrid}>
            {QUICK_AMOUNTS.map((amount) => {
              const isSelected = selectedAmount === amount;
              return (
                <Pressable
                  key={amount}
                  onPress={() => setSelectedAmount(amount)}
                  style={({ pressed }) => [
                    styles.amountButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surfaceSecondary,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.border,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color: isSelected ? colors.onPrimary : colors.foreground,
                        fontWeight: isSelected ? "700" : "600",
                      },
                    ]}
                  >
                    €{amount}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Order Preview */}
        {selectedAmount && (
          <View
            style={[
              styles.orderPreview,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.orderRow}>
              <Text style={[styles.orderLabel, { color: colors.muted }]}>
                Estimated shares
              </Text>
              <Text style={[styles.orderValue, { color: colors.foreground }]}>
                {(selectedAmount / selectedAsset.price).toFixed(4)}
              </Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={[styles.orderLabel, { color: colors.muted }]}>
                Market price (live)
              </Text>
              <Text style={[styles.orderValue, { color: colors.foreground }]}>
                €{selectedAsset.price.toFixed(2)}
              </Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={[styles.orderLabel, { color: colors.muted }]}>
                Commission
              </Text>
              <Text style={[styles.orderValue, { color: colors.success }]}>
                €0.00
              </Text>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <View style={styles.confirmContainer}>
          <Pressable
            onPress={handleConfirm}
            disabled={!selectedAmount}
            style={({ pressed }) => [
              styles.confirmButton,
              {
                backgroundColor:
                  selectedAmount
                    ? isBuy
                      ? colors.success
                      : colors.error
                    : colors.surfaceSecondary,
              },
              pressed && selectedAmount ? { transform: [{ scale: 0.97 }], opacity: 0.9 } : undefined,
            ]}
          >
            <Text
              style={[
                styles.confirmText,
                {
                  color: selectedAmount ? colors.onPrimary : colors.muted,
                },
              ]}
            >
              {selectedAmount
                ? `${isBuy ? "Buy" : "Sell"} €${selectedAmount} of ${selectedAsset.ticker}`
                : "Select an amount"}
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Trade</Text>
        <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
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
            placeholder="Search for a stock to trade..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Quick Trade Label */}
      <View style={styles.quickLabel}>
        <Text style={[styles.quickLabelText, { color: colors.muted }]}>
          {search.trim() ? "Search results" : "Popular stocks"}
        </Text>
      </View>

      {/* Stock List */}
      {isLoading ? (
        <StockListSkeleton count={6} />
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
              onPress={() => setSelectedAsset(item)}
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
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
  quickLabel: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickLabelText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  // Sheet styles
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  assetInfo: {
    alignItems: "center",
    paddingBottom: 24,
  },
  assetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  assetIconText: {
    fontSize: 18,
    fontWeight: "700",
  },
  assetName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  assetPrice: {
    fontSize: 24,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginBottom: 2,
  },
  assetChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  amountsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  amountsLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  amountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amountButton: {
    width: "30%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  amountText: {
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  orderPreview: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  orderLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderValue: {
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  confirmContainer: {
    paddingHorizontal: 16,
    marginTop: "auto",
    paddingBottom: 40,
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Success screen
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 36,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginBottom: 32,
  },
  shareTradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
