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
import { useViewMode } from "@/lib/viewmode-context";
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
  const { isSimple, isPro } = useViewMode();
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
    return Math.round(num * 100) / 100;
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
    if (parsedAmount === 0) return null;
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
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts.length === 2 && parts[1].length > 2) return;
    if (parts[0].length > 1 && parts[0].startsWith("0") && parts[0] !== "0") {
      return;
    }
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
          contentContainerStyle={styles.sheetScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header — compact row with close, ticker, live badge */}
          <View style={styles.sheetHeader}>
            <Pressable
              onPress={() => {
                setSelectedAsset(null);
                setAmountText("");
                setTradeError(null);
              }}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <IconSymbol name="xmark" size={18} color={colors.muted} />
            </Pressable>
            <View style={styles.sheetTitleRow}>
              <Subhead style={{ fontFamily: FontFamily.semibold }}>{selectedAsset.ticker}</Subhead>
              <LiveBadge isLive={isLive} />
            </View>
            <View style={{ width: 32 }} />
          </View>

          {/* Buy/Sell Toggle — compact */}
          <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
            <Pressable
              onPress={() => { setIsBuy(true); setTradeError(null); }}
              style={({ pressed }) => [
                styles.toggleButton,
                isBuy && { backgroundColor: colors.success },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Footnote
                color={isBuy ? "onPrimary" : "muted"}
                style={{ fontFamily: FontFamily.semibold }}
              >
                Buy
              </Footnote>
            </Pressable>
            <Pressable
              onPress={() => { setIsBuy(false); setTradeError(null); }}
              style={({ pressed }) => [
                styles.toggleButton,
                !isBuy && { backgroundColor: colors.error },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Footnote
                color={!isBuy ? "onPrimary" : "muted"}
                style={{ fontFamily: FontFamily.semibold }}
              >
                Sell
              </Footnote>
            </Pressable>
          </View>

          {/* Asset Info — compact inline layout */}
          <View style={styles.assetInfoCompact}>
            <View style={[styles.assetIconSmall, { backgroundColor: colors.surfaceSecondary }]}>
              <Footnote color="primary" style={{ fontFamily: FontFamily.bold }}>
                {selectedAsset.ticker.slice(0, 2)}
              </Footnote>
            </View>
            <View style={styles.assetInfoText}>
              <Subhead style={{ fontFamily: FontFamily.semibold }} numberOfLines={1}>
                {selectedAsset.name}
              </Subhead>
              <View style={styles.assetPriceRow}>
                <MonoHeadline style={styles.assetPrice}>
                  €{selectedAsset.price.toFixed(2)}
                </MonoHeadline>
                <MonoSubhead
                  color={selectedAsset.changePercent >= 0 ? "success" : "error"}
                  style={{ fontSize: 13 }}
                >
                  {selectedAsset.changePercent >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(selectedAsset.changePercent).toFixed(2)}%
                </MonoSubhead>
              </View>
            </View>
          </View>

          {/* Amount Input — streamlined hero */}
          <View style={styles.amountSection}>
            <Pressable
              onPress={() => amountInputRef.current?.focus()}
              style={[
                styles.amountHero,
                {
                  backgroundColor: colors.surface,
                  borderColor: amountText
                    ? (validationError ? colors.error : colors.primary)
                    : colors.border,
                },
              ]}
            >
              <View style={styles.amountHeroInner}>
                <MonoLargeTitle
                  color={amountText ? (validationError ? "error" : "foreground") : "muted"}
                  style={styles.eurSign}
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
                <Caption1 color="primary" style={{ fontFamily: FontFamily.bold, fontSize: 11 }}>
                  MAX
                </Caption1>
              </Pressable>
            </Pressable>

            {/* Available balance / holdings — tight row */}
            <View style={styles.availableRow}>
              {isBuy ? (
                <Footnote color="muted">
                  Available:{" "}
                  <MonoSubhead color="foreground" style={{ fontSize: 13 }}>
                    €{demoState.balance.toFixed(2)}
                  </MonoSubhead>
                </Footnote>
              ) : (
                <Footnote color="muted">
                  You own:{" "}
                  <MonoSubhead color="foreground" style={{ fontSize: 13 }}>
                    {currentShares.toFixed(currentShares % 1 === 0 ? 0 : 4)} shares
                  </MonoSubhead>
                  {currentShares > 0 && (
                    <Footnote color="muted"> (€{currentHoldingValue.toFixed(2)})</Footnote>
                  )}
                </Footnote>
              )}
            </View>

            {/* Validation Error */}
            {validationError && (
              <View style={[styles.validationError, { backgroundColor: colors.errorAlpha }]}>
                <IconSymbol name="xmark" size={11} color={colors.error} />
                <Caption1 color="error" style={{ fontFamily: FontFamily.medium, flex: 1 }}>
                  {validationError}
                </Caption1>
              </View>
            )}
          </View>

          {/* Quick Amount Chips — compact inline row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickChipsRow}
            style={styles.quickChipsScroll}
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
                      opacity: isDisabled ? 0.35 : 1,
                    },
                    pressed && !isDisabled && { opacity: 0.7 },
                  ]}
                >
                  <MonoBody
                    color={isSelected ? "onPrimary" : "foreground"}
                    style={{
                      fontSize: 13,
                      fontFamily: isSelected ? FontFamily.monoBold : FontFamily.monoMedium,
                    }}
                  >
                    €{amount}
                  </MonoBody>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Order Preview — Pro: full detail, Simple: just balance after */}
          {isValidAmount && isPro && (
            <View style={[styles.orderPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.orderRow}>
                <Footnote color="muted">Est. shares</Footnote>
                <MonoSubhead style={{ fontSize: 13 }}>
                  {(parsedAmount / selectedAsset.price).toFixed(4)}
                </MonoSubhead>
              </View>
              <View style={styles.orderRow}>
                <Footnote color="muted">Price (live)</Footnote>
                <MonoSubhead style={{ fontSize: 13 }}>€{selectedAsset.price.toFixed(2)}</MonoSubhead>
              </View>
              <View style={styles.orderRow}>
                <Footnote color="muted">Commission</Footnote>
                <MonoSubhead color="success" style={{ fontSize: 13 }}>€0.00</MonoSubhead>
              </View>
              <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />
              <View style={styles.orderRow}>
                <Footnote color="muted">Balance after</Footnote>
                <MonoSubhead
                  color={balanceAfter >= 0 ? "foreground" : "error"}
                  style={{ fontSize: 13 }}
                >
                  €{balanceAfter.toFixed(2)}
                </MonoSubhead>
              </View>
            </View>
          )}
          {isValidAmount && isSimple && (
            <View style={styles.simplePreviewRow}>
              <Footnote color="muted">Balance after trade</Footnote>
              <MonoSubhead
                color={balanceAfter >= 0 ? "foreground" : "error"}
                style={{ fontSize: 13 }}
              >
                €{balanceAfter.toFixed(2)}
              </MonoSubhead>
            </View>
          )}

          {/* Trade Error */}
          {tradeError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorAlpha }]}>
              <IconSymbol name="xmark" size={12} color={colors.error} />
              <Caption1 color="error" style={{ fontFamily: FontFamily.medium, flex: 1 }}>
                {tradeError}
              </Caption1>
            </View>
          )}

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: 12 }} />

          {/* Confirm Button — always reachable */}
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
  // ─── Stock Picker ─────────────────────────────────────────────
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

  // ─── Order Sheet ──────────────────────────────────────────────
  sheetScroll: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Toggle — compact
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  // Asset info — horizontal compact layout
  assetInfoCompact: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  assetIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  assetInfoText: {
    flex: 1,
  },
  assetPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 2,
  },
  assetPrice: {
    fontSize: 20,
    lineHeight: 26,
  },

  // Amount input — streamlined
  amountSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  amountHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  amountHeroInner: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
  },
  eurSign: {
    fontSize: 32,
    lineHeight: 40,
  },
  amountInput: {
    fontSize: 32,
    lineHeight: 40,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 4,
    ...Platform.select({
      web: { outlineStyle: "none" as any },
    }),
  },
  maxButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  availableRow: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  validationError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  // Quick chips — compact
  quickChipsScroll: {
    marginBottom: 14,
  },
  quickChipsRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },

  // Order preview — compact
  orderPreview: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  orderDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 3,
  },

  // Simple mode preview
  simplePreviewRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 4,
  },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  // Confirm button
  confirmContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  confirmButton: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Success Screen ───────────────────────────────────────────
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
