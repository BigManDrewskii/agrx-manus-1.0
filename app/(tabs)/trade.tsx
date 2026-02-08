import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  Platform,
  Keyboard,
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
import { useDemo } from "@/lib/demo-context";
import { ShareCardModal } from "@/components/ui/share-card-modal";
import type { ShareCardData } from "@/components/ui/share-card";
import {
  Title1,
  Title3,
  Headline,
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

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 250];

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
  const [amountText, setAmountText] = useState("");
  const [isBuy, setIsBuy] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const amountInputRef = useRef<TextInput>(null);
  const { stocks, isLoading, isLive, lastUpdated } = useStockQuotes();
  const { executeTrade, state: demoState, getHolding } = useDemo();

  // Parse amount from text input
  const parsedAmount = useMemo(() => {
    const num = parseFloat(amountText);
    if (isNaN(num) || num <= 0) return 0;
    return Math.round(num * 100) / 100; // 2 decimal places
  }, [amountText]);

  // Compute current holding for sell validation
  const currentHolding = selectedAsset ? getHolding(selectedAsset.id) : undefined;
  const currentShares = currentHolding?.shares ?? 0;
  const currentHoldingValue = selectedAsset ? currentShares * selectedAsset.price : 0;

  // Max amount available
  const maxAmount = useMemo(() => {
    if (isBuy) {
      return Math.floor(demoState.balance * 100) / 100;
    }
    return Math.floor(currentHoldingValue * 100) / 100;
  }, [isBuy, demoState.balance, currentHoldingValue]);

  // Validation
  const validationError = useMemo(() => {
    if (parsedAmount === 0) return null; // No input yet
    if (parsedAmount < 1) return "Minimum trade amount is €1.00";
    if (isBuy && parsedAmount > demoState.balance) {
      return `Insufficient balance (€${demoState.balance.toFixed(2)} available)`;
    }
    if (!isBuy && parsedAmount > currentHoldingValue) {
      return `Insufficient shares (€${currentHoldingValue.toFixed(2)} available)`;
    }
    return null;
  }, [parsedAmount, isBuy, demoState.balance, currentHoldingValue]);

  const isValidAmount = parsedAmount >= 1 && !validationError;

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

  const handleAmountChange = useCallback((text: string) => {
    // Allow only digits and one decimal point, max 2 decimal places
    const cleaned = text.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) return;
    // Prevent leading zeros (except "0." for decimals)
    if (parts[0].length > 1 && parts[0].startsWith("0") && parts[0] !== "0") {
      return;
    }
    // Limit to reasonable max (999999.99)
    if (parts[0].length > 6) return;
    setAmountText(cleaned);
    setTradeError(null);
  }, []);

  const handleQuickAmount = useCallback((amount: number) => {
    setAmountText(amount.toString());
    setTradeError(null);
    Keyboard.dismiss();
  }, []);

  const handleMax = useCallback(() => {
    if (maxAmount > 0) {
      setAmountText(maxAmount.toFixed(2));
      setTradeError(null);
      Keyboard.dismiss();
    }
  }, [maxAmount]);

  const handleConfirm = useCallback(() => {
    if (!selectedAsset || !isValidAmount) return;
    setTradeError(null);
    const result = executeTrade({
      stockId: selectedAsset.id,
      ticker: selectedAsset.ticker,
      name: selectedAsset.name,
      type: isBuy ? "buy" : "sell",
      amount: parsedAmount,
      price: selectedAsset.price,
    });
    if (result.success) {
      setShowSuccess(true);
    } else {
      setTradeError(result.error ?? "Trade failed");
    }
  }, [selectedAsset, isValidAmount, parsedAmount, isBuy, executeTrade]);

  const handleDismissSuccess = useCallback(() => {
    setShowSuccess(false);
    setSelectedAsset(null);
    setAmountText("");
    setTradeError(null);
  }, []);

  // Build share card data from the current trade
  const shareCardData: ShareCardData | null = useMemo(() => {
    if (!selectedAsset || !parsedAmount) return null;
    const shares = parsedAmount / selectedAsset.price;
    return {
      ticker: selectedAsset.ticker,
      companyName: selectedAsset.name,
      price: selectedAsset.price,
      pnlAmount: 0,
      pnlPercent: selectedAsset.changePercent,
      sparkline: selectedAsset.sparkline,
      timeFrame: "Today" as const,
      tradeType: isBuy ? ("buy" as const) : ("sell" as const),
      tradeAmount: parsedAmount,
      shares,
    };
  }, [selectedAsset, parsedAmount, isBuy]);

  // ─── Success Screen ─────────────────────────────────────────────
  if (showSuccess && selectedAsset && parsedAmount) {
    const shares = (parsedAmount / selectedAsset.price).toFixed(4);
    return (
      <ScreenContainer>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.successAlpha }]}>
            <IconSymbol name="checkmark" size={48} color={colors.success} />
          </View>
          <Title1 style={{ marginBottom: 8 }}>Trade Executed!</Title1>
          <Callout color="muted" style={{ textAlign: "center", marginBottom: 8 }}>
            You {isBuy ? "bought" : "sold"} {shares} shares of {selectedAsset.ticker}
          </Callout>
          <MonoLargeTitle style={{ marginBottom: 32 }}>
            €{parsedAmount.toFixed(2)}
          </MonoLargeTitle>

          {/* Share Button — Primary CTA */}
          <Pressable
            onPress={() => setShowShareModal(true)}
            style={({ pressed }) => [
              styles.shareTradeButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.onPrimary} />
            <Callout color="onPrimary" style={{ fontFamily: FontFamily.semibold }}>
              Share with friends
            </Callout>
          </Pressable>

          {/* Done Button — Secondary */}
          <Pressable
            onPress={handleDismissSuccess}
            style={({ pressed }) => [
              styles.doneButton,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Subhead color="muted" style={{ fontFamily: FontFamily.medium }}>
              Done
            </Subhead>
          </Pressable>
        </View>

        {/* Share Card Modal */}
        {shareCardData && (
          <ShareCardModal
            visible={showShareModal}
            onClose={() => setShowShareModal(false)}
            data={shareCardData}
          />
        )}
      </ScreenContainer>
    );
  }

  // ─── Order Sheet ────────────────────────────────────────────────
  if (selectedAsset) {
    const balanceAfter = isBuy
      ? demoState.balance - parsedAmount
      : demoState.balance + parsedAmount;

    return (
      <ScreenContainer>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Pressable
              onPress={() => {
                setSelectedAsset(null);
                setAmountText("");
                setTradeError(null);
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
              onPress={() => { setIsBuy(true); setTradeError(null); }}
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
              onPress={() => { setIsBuy(false); setTradeError(null); }}
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

          {/* Custom Amount Input */}
          <View style={styles.amountInputSection}>
            <Caption1
              color="muted"
              style={{
                fontFamily: FontFamily.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Enter amount
            </Caption1>

            {/* Hero Amount Display */}
            <Pressable
              onPress={() => amountInputRef.current?.focus()}
              style={[
                styles.amountHero,
                {
                  backgroundColor: colors.surface,
                  borderColor: amountText ? (validationError ? colors.error : colors.primary) : colors.border,
                },
              ]}
            >
              <View style={styles.amountHeroInner}>
                <MonoLargeTitle
                  color={amountText ? (validationError ? "error" : "foreground") : "muted"}
                  style={{ fontSize: 40, lineHeight: 48 }}
                >
                  €
                </MonoLargeTitle>
                <TextInput
                  ref={amountInputRef}
                  style={[
                    styles.amountInput,
                    {
                      color: validationError ? colors.error : colors.foreground,
                      fontFamily: FontFamily.monoBold,
                    },
                  ]}
                  value={amountText}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  maxLength={9}
                  autoFocus={false}
                />
              </View>

              {/* MAX button */}
              <Pressable
                onPress={handleMax}
                style={({ pressed }) => [
                  styles.maxButton,
                  { backgroundColor: colors.primaryAlpha ?? colors.primary + "20" },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
                  MAX
                </Caption1>
              </Pressable>
            </Pressable>

            {/* Available balance / holdings info */}
            <View style={styles.availableRow}>
              {isBuy ? (
                <Footnote color="muted" style={{ fontFamily: FontFamily.medium }}>
                  Available: <MonoSubhead color="foreground">€{demoState.balance.toFixed(2)}</MonoSubhead>
                </Footnote>
              ) : (
                <Footnote color="muted" style={{ fontFamily: FontFamily.medium }}>
                  You own: <MonoSubhead color="foreground">{currentShares.toFixed(currentShares % 1 === 0 ? 0 : 4)} shares</MonoSubhead>
                  {currentShares > 0 && (
                    <Footnote color="muted"> (€{currentHoldingValue.toFixed(2)})</Footnote>
                  )}
                </Footnote>
              )}
            </View>

            {/* Validation Error */}
            {validationError && (
              <View style={[styles.validationError, { backgroundColor: colors.errorAlpha }]}>
                <IconSymbol name="xmark" size={12} color={colors.error} />
                <Caption1 color="error" style={{ fontFamily: FontFamily.medium, flex: 1 }}>
                  {validationError}
                </Caption1>
              </View>
            )}
          </View>

          {/* Quick Amount Chips */}
          <View style={styles.quickChipsSection}>
            <Caption1
              color="muted"
              style={{
                fontFamily: FontFamily.semibold,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              Quick amounts
            </Caption1>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickChipsRow}
            >
              {QUICK_AMOUNTS.map((amount) => {
                const isSelected = parsedAmount === amount;
                const isDisabled = amount > maxAmount;
                return (
                  <Pressable
                    key={amount}
                    onPress={() => !isDisabled && handleQuickAmount(amount)}
                    style={({ pressed }) => [
                      styles.quickChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: isDisabled ? 0.4 : 1,
                      },
                      pressed && !isDisabled && { opacity: 0.7 },
                    ]}
                  >
                    <MonoBody
                      color={isSelected ? "onPrimary" : "foreground"}
                      style={{
                        fontSize: 14,
                        fontFamily: isSelected ? FontFamily.monoBold : FontFamily.monoMedium,
                      }}
                    >
                      €{amount}
                    </MonoBody>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Order Preview */}
          {isValidAmount && (
            <View style={[styles.orderPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.orderRow}>
                <Subhead color="muted">Estimated shares</Subhead>
                <MonoSubhead>{(parsedAmount / selectedAsset.price).toFixed(4)}</MonoSubhead>
              </View>
              <View style={styles.orderRow}>
                <Subhead color="muted">Market price (live)</Subhead>
                <MonoSubhead>€{selectedAsset.price.toFixed(2)}</MonoSubhead>
              </View>
              <View style={styles.orderRow}>
                <Subhead color="muted">Commission</Subhead>
                <MonoSubhead color="success">€0.00</MonoSubhead>
              </View>
              <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />
              <View style={styles.orderRow}>
                <Subhead color="muted">Balance after</Subhead>
                <MonoSubhead color={balanceAfter >= 0 ? "foreground" : "error"}>
                  €{balanceAfter.toFixed(2)}
                </MonoSubhead>
              </View>
            </View>
          )}

          {/* Trade Error from server */}
          {tradeError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorAlpha }]}>
              <IconSymbol name="xmark" size={14} color={colors.error} />
              <Footnote color="error" style={{ fontFamily: FontFamily.medium, flex: 1 }}>
                {tradeError}
              </Footnote>
            </View>
          )}

          {/* Spacer to push confirm button down */}
          <View style={{ flex: 1, minHeight: 20 }} />

          {/* Confirm Button */}
          <View style={styles.confirmContainer}>
            <Pressable
              onPress={handleConfirm}
              disabled={!isValidAmount}
              style={({ pressed }) => [
                styles.confirmButton,
                {
                  backgroundColor: isValidAmount
                    ? isBuy ? colors.success : colors.error
                    : colors.surfaceSecondary,
                },
                pressed && isValidAmount ? { transform: [{ scale: 0.97 }], opacity: 0.9 } : undefined,
              ]}
            >
              <Callout
                color={isValidAmount ? "onPrimary" : "muted"}
                style={{ fontFamily: FontFamily.bold }}
              >
                {isValidAmount
                  ? `${isBuy ? "Buy" : "Sell"} €${parsedAmount.toFixed(2)} of ${selectedAsset.ticker}`
                  : amountText ? "Fix amount to continue" : "Enter an amount"}
              </Callout>
            </Pressable>
          </View>
        </ScrollView>
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
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  assetInfo: {
    alignItems: "center",
    paddingBottom: 20,
  },
  assetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  // Custom Amount Input
  amountInputSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  amountHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  amountHeroInner: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
  },
  amountInput: {
    fontSize: 40,
    lineHeight: 48,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 4,
    ...Platform.select({
      web: { outlineStyle: "none" as any },
    }),
  },
  maxButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  availableRow: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  validationError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  // Quick Amount Chips
  quickChipsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  quickChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  // Order Preview
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
  orderDivider: {
    height: 1,
    marginVertical: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmContainer: {
    paddingHorizontal: 16,
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
    marginBottom: 16,
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
});
