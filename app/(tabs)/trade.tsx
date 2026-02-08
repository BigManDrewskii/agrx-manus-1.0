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
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
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
import { SwipeToConfirm } from "@/components/ui/swipe-to-confirm";
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
          <AnimatedPressable
            variant="button"
            onPress={() => setShowShareModal(true)}
            style={[
              styles.shareTradeButton,
              { backgroundColor: colors.primary },
            ]}
          >
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.onPrimary} />
            <Callout color="onPrimary" style={{ fontFamily: FontFamily.semibold }}>
              Share with friends
            </Callout>
          </AnimatedPressable>

          {/* Done Button — Secondary */}
          <AnimatedPressable
            variant="icon"
            onPress={handleDismissSuccess}
            style={styles.doneButton}
          >
            <Subhead color="muted" style={{ fontFamily: FontFamily.medium }}>
              Done
            </Subhead>
          </AnimatedPressable>
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
          {/* ── Header ─────────────────────────────────────────── */}
          <View style={styles.sheetHeader}>
            <AnimatedPressable
              variant="icon"
              onPress={() => {
                setSelectedAsset(null);
                setAmountText("");
                setTradeError(null);
              }}
              style={[
                styles.closeButton,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <IconSymbol name="xmark" size={16} color={colors.muted} />
            </AnimatedPressable>
            <View style={styles.sheetTitleRow}>
              <Subhead style={{ fontFamily: FontFamily.semibold }}>{selectedAsset.ticker}</Subhead>
              <LiveBadge isLive={isLive} />
            </View>
            <View style={{ width: 32 }} />
          </View>

          {/* ── Buy / Sell Toggle ───────────────────────────────── */}
          <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <AnimatedPressable
              variant="toggle"
              onPress={() => { setIsBuy(true); setTradeError(null); }}
              style={[
                styles.toggleButton,
                isBuy && [styles.toggleActive, { backgroundColor: colors.success }],
              ]}
            >
              <Footnote
                color={isBuy ? "onPrimary" : "muted"}
                style={{ fontFamily: FontFamily.semibold }}
              >
                Buy
              </Footnote>
            </AnimatedPressable>
            <AnimatedPressable
              variant="toggle"
              onPress={() => { setIsBuy(false); setTradeError(null); }}
              style={[
                styles.toggleButton,
                !isBuy && [styles.toggleActive, { backgroundColor: colors.error }],
              ]}
            >
              <Footnote
                color={!isBuy ? "onPrimary" : "muted"}
                style={{ fontFamily: FontFamily.semibold }}
              >
                Sell
              </Footnote>
            </AnimatedPressable>
          </View>

          {/* ── Asset Info Card ─────────────────────────────────── */}
          <View style={[styles.assetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.assetIconSmall, { backgroundColor: colors.surfaceSecondary }]}>
              <Footnote color="primary" style={{ fontFamily: FontFamily.bold }}>
                {selectedAsset.ticker.slice(0, 2)}
              </Footnote>
            </View>
            <View style={styles.assetInfoText}>
              <Subhead style={{ fontFamily: FontFamily.semibold }} numberOfLines={1}>
                {selectedAsset.name}
              </Subhead>
            </View>
            <View style={styles.assetPriceBlock}>
              <MonoHeadline style={{ fontSize: 17, lineHeight: 22 }}>
                €{selectedAsset.price.toFixed(2)}
              </MonoHeadline>
              <MonoSubhead
                color={selectedAsset.changePercent >= 0 ? "success" : "error"}
                style={{ fontSize: 12, textAlign: "right" }}
              >
                {selectedAsset.changePercent >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(selectedAsset.changePercent).toFixed(2)}%
              </MonoSubhead>
            </View>
          </View>

          {/* ── Amount Hero ────────────────────────────────────── */}
          <AnimatedPressable
            variant="card"
            onPress={() => amountInputRef.current?.focus()}
            style={[
              styles.amountHero,
              {
                borderColor: amountText
                  ? (validationError ? colors.error : (isBuy ? colors.success : colors.error))
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

            {/* MAX pill */}
            <AnimatedPressable
              variant="chip"
              onPress={handleMax}
              style={[
                styles.maxButton,
                { backgroundColor: colors.primaryAlpha ?? colors.primary + "20" },
              ]}
            >
              <Caption1 color="primary" style={{ fontFamily: FontFamily.bold, fontSize: 11 }}>
                MAX
              </Caption1>
            </AnimatedPressable>
          </AnimatedPressable>

          {/* Available balance — right below amount */}
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

          {/* ── Quick Amount Chips ──────────────────────────────── */}
          <View style={styles.quickChipsContainer}>
            {QUICK_AMOUNTS.map((amount) => {
              const isSelected = parsedAmount === amount;
              const isDisabled = amount > maxAmount;
              return (
                <AnimatedPressable
                  key={amount}
                  variant="chip"
                  disabled={isDisabled}
                  onPress={() => handleQuickAmount(amount)}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: isSelected
                        ? (isBuy ? colors.success : colors.error)
                        : colors.surface,
                      borderColor: isSelected
                        ? (isBuy ? colors.success : colors.error)
                        : colors.border,
                    },
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
                </AnimatedPressable>
              );
            })}
          </View>

          {/* ── Order Preview ───────────────────────────────────── */}
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

          {/* Spacer pushes swipe-to-confirm to bottom */}
          <View style={{ flex: 1, minHeight: 16 }} />

          {/* ── Swipe to Confirm ────────────────────────────────── */}
          <SwipeToConfirm
            label={isValidAmount
              ? `Slide to ${isBuy ? "Buy" : "Sell"} €${parsedAmount.toFixed(2)} ${selectedAsset.ticker}`
              : ""}
            enabled={isValidAmount}
            onConfirm={handleConfirm}
            variant={isBuy ? "buy" : "sell"}
            disabledLabel={amountText ? "Fix amount to continue" : "Enter an amount"}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ─── Stock Picker ───────────────────────────────────────────────
  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
        <Title1>Trade</Title1>
        <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.searchContainer}>
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
      </Animated.View>

      {/* Quick Trade Label */}
      <Animated.View entering={FadeIn.duration(200).delay(120)} style={styles.quickLabel}>
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
      </Animated.View>

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
    paddingBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
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

  // Toggle
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: {
    // shadow for the active toggle pill
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
    }),
  },

  // Asset info card
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
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
  assetPriceBlock: {
    alignItems: "flex-end",
  },

  // Amount input
  amountHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  availableRow: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  validationError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  // Quick amount chips — flex-wrap row (not horizontal scroll)
  quickChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  quickChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 56,
    alignItems: "center",
  },

  // Order preview
  orderPreview: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  orderDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },

  // Simple mode preview
  simplePreviewRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginHorizontal: 16,
    marginBottom: 12,
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
