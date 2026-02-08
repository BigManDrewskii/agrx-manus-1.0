import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
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
import {
  Title1,
  Title2,
  Title3,
  Headline,
  Body,
  Callout,
  Subhead,
  Footnote,
  Caption1,
  MonoLargeTitle,
  MonoHeadline,
  MonoBody,
  MonoSubhead,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

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

  // ─── Success Screen ─────────────────────────────────────────────
  if (showSuccess && selectedAsset && selectedAmount) {
    const shares = (selectedAmount / selectedAsset.price).toFixed(4);
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.successAlpha }]}>
            <IconSymbol name="checkmark" size={48} color={colors.success} />
          </View>
          <Title1 style={{ marginBottom: 8 }}>Trade Executed!</Title1>
          <Callout color="muted" style={{ textAlign: "center", marginBottom: 8 }}>
            You now own {shares} shares of {selectedAsset.ticker}
          </Callout>
          <MonoLargeTitle style={{ marginBottom: 32 }}>
            €{selectedAmount.toFixed(2)}
          </MonoLargeTitle>
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [
              styles.shareTradeButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.onPrimary} />
            <Callout color="onPrimary" style={{ fontFamily: FontFamily.semibold }}>
              Share with friends
            </Callout>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ─── Order Sheet ────────────────────────────────────────────────
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
            <Title3>{selectedAsset.ticker}</Title3>
            <LiveBadge isLive={isLive} />
          </View>
          <View style={{ width: 22 }} />
        </View>

        {/* Buy/Sell Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setIsBuy(true)}
            style={({ pressed }) => [
              styles.toggleButton,
              isBuy && { backgroundColor: colors.success },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Subhead
              color={isBuy ? "onPrimary" : "muted"}
              style={{ fontFamily: FontFamily.semibold }}
            >
              Buy
            </Subhead>
          </Pressable>
          <Pressable
            onPress={() => setIsBuy(false)}
            style={({ pressed }) => [
              styles.toggleButton,
              !isBuy && { backgroundColor: colors.error },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Subhead
              color={!isBuy ? "onPrimary" : "muted"}
              style={{ fontFamily: FontFamily.semibold }}
            >
              Sell
            </Subhead>
          </Pressable>
        </View>

        {/* Asset Info with Live Price */}
        <View style={styles.assetInfo}>
          <View style={[styles.assetIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Headline color="primary">{selectedAsset.ticker.slice(0, 2)}</Headline>
          </View>
          <Title3 style={{ marginBottom: 4 }}>{selectedAsset.name}</Title3>
          <MonoHeadline style={{ fontSize: 24, marginBottom: 2 }}>
            €{selectedAsset.price.toFixed(2)}
          </MonoHeadline>
          <MonoSubhead color={selectedAsset.changePercent >= 0 ? "success" : "error"}>
            {selectedAsset.changePercent >= 0 ? "▲" : "▼"}{" "}
            {Math.abs(selectedAsset.changePercent).toFixed(2)}% today
          </MonoSubhead>
        </View>

        {/* Quick Amounts */}
        <View style={styles.amountsContainer}>
          <Caption1
            color="muted"
            style={{
              fontFamily: FontFamily.semibold,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            Select amount
          </Caption1>
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
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <MonoBody
                    color={isSelected ? "onPrimary" : "foreground"}
                    style={{ fontFamily: isSelected ? FontFamily.monoBold : FontFamily.monoMedium }}
                  >
                    €{amount}
                  </MonoBody>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Order Preview */}
        {selectedAmount && (
          <View style={[styles.orderPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.orderRow}>
              <Subhead color="muted">Estimated shares</Subhead>
              <MonoSubhead>{(selectedAmount / selectedAsset.price).toFixed(4)}</MonoSubhead>
            </View>
            <View style={styles.orderRow}>
              <Subhead color="muted">Market price (live)</Subhead>
              <MonoSubhead>€{selectedAsset.price.toFixed(2)}</MonoSubhead>
            </View>
            <View style={styles.orderRow}>
              <Subhead color="muted">Commission</Subhead>
              <MonoSubhead color="success">€0.00</MonoSubhead>
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
                backgroundColor: selectedAmount
                  ? isBuy ? colors.success : colors.error
                  : colors.surfaceSecondary,
              },
              pressed && selectedAmount ? { transform: [{ scale: 0.97 }], opacity: 0.9 } : undefined,
            ]}
          >
            <Callout
              color={selectedAmount ? "onPrimary" : "muted"}
              style={{ fontFamily: FontFamily.bold }}
            >
              {selectedAmount
                ? `${isBuy ? "Buy" : "Sell"} €${selectedAmount} of ${selectedAsset.ticker}`
                : "Select an amount"}
            </Callout>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // ─── Stock Picker ───────────────────────────────────────────────
  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Title1>Trade</Title1>
        <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: FontFamily.medium }]}
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
        <Caption1
          color="muted"
          style={{
            fontFamily: FontFamily.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {search.trim() ? "Search results" : "Popular stocks"}
        </Caption1>
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
              <Callout color="muted">No stocks found</Callout>
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
  quickLabel: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
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
  amountsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
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
  shareTradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
});
