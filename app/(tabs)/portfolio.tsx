/**
 * Portfolio Screen — Demo portfolio with Simple/Pro variants
 *
 * Refactored to use extracted feature components for better maintainability.
 */
import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { LiveBadge } from "@/components/ui/live-badge";
import { StockListSkeleton } from "@/components/ui/skeleton";
import { useStockQuotes, useRefreshCache } from "@/hooks/use-stocks";
import { ShareCardModal } from "@/components/ui/share-card-modal";
import type { ShareCardData } from "@/components/ui/share-card";
import { useDemo, type LivePriceMap } from "@/lib/demo-context";
import { useViewMode } from "@/lib/viewmode-context";
import { GREEK_STOCKS, PORTFOLIO_SPARKLINE } from "@/lib/mock-data";
import { getSector, type Sector } from "@/lib/sectors";
import {
  PortfolioHeader,
  PortfolioHeroSimple,
  PortfolioHeroPro,
  BalanceRow,
  BalancePill,
  HoldingsHeader,
  EmptyPortfolioState,
  HoldingCardSimple,
  HoldingCardPro,
  SectorAllocationBar,
  DividendSection,
} from "@/components/features/portfolio";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SPARKLINE_WIDTH = Math.min(SCREEN_WIDTH - 64, 340);

interface EnrichedHolding {
  holding: {
    stockId: string;
    ticker: string;
    name: string;
    shares: number;
    totalCost: number;
  };
  livePrice: number;
  liveValue: number;
  livePnl: number;
  livePnlPercent: number;
  liveSparkline: number[];
  avgCost: number;
}

interface SectorAllocationItem {
  sector: Sector;
  value: number;
  percent: number;
  icon: string;
}

export default function PortfolioScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSimple, isPro } = useViewMode();
  const [refreshing, setRefreshing] = useState(false);
  const { stocks, isLoading, isLive, lastUpdated, refetch } = useStockQuotes();
  const refreshCache = useRefreshCache();
  const { state, holdingsArray, getPortfolioValue, getPortfolioCost, getPortfolioPnL } = useDemo();

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  // Build live price map from stock quotes
  const livePriceMap: LivePriceMap = useMemo(() => {
    const map: LivePriceMap = {};
    for (const s of stocks) {
      map[s.id] = s.price;
    }
    return map;
  }, [stocks]);

  // Enrich holdings with live prices from DemoContext
  const enrichedHoldings: EnrichedHolding[] = useMemo(() => {
    return holdingsArray.map((h) => {
      const liveStock = stocks.find((s) => s.id === h.stockId);
      const mockAsset = GREEK_STOCKS.find((s) => s.id === h.stockId);
      const currentPrice = liveStock?.price ?? mockAsset?.price ?? 0;
      const liveValue = h.shares * currentPrice;
      const avgCost = h.shares > 0 ? h.totalCost / h.shares : 0;
      const costBasis = h.totalCost;
      const livePnl = liveValue - costBasis;
      const livePnlPercent = costBasis > 0 ? (livePnl / costBasis) * 100 : 0;

      return {
        holding: {
          stockId: h.stockId,
          ticker: h.ticker,
          name: h.name,
          shares: h.shares,
          totalCost: h.totalCost,
        },
        livePrice: currentPrice,
        liveValue,
        livePnl,
        livePnlPercent,
        liveSparkline: liveStock?.sparkline ?? mockAsset?.sparkline ?? [],
        avgCost,
      };
    });
  }, [holdingsArray, stocks]);

  // Calculate portfolio totals from DemoContext
  const portfolioTotal = getPortfolioValue(livePriceMap);
  const portfolioCost = getPortfolioCost();
  const { pnl: portfolioPnl, pnlPercent: portfolioPnlPercent } = getPortfolioPnL(livePriceMap);

  // Sector allocation for Pro mode
  const sectorAllocation: SectorAllocationItem[] = useMemo(() => {
    if (enrichedHoldings.length === 0) return [];
    const totalValue = enrichedHoldings.reduce((sum, e) => sum + e.liveValue, 0);
    if (totalValue === 0) return [];

    const sectorMap: Record<string, number> = {};
    for (const e of enrichedHoldings) {
      const sector = getSector(e.holding.stockId);
      sectorMap[sector] = (sectorMap[sector] ?? 0) + e.liveValue;
    }

    return Object.entries(sectorMap)
      .map(([sector, value]) => ({
        sector: sector as Sector,
        value,
        percent: (value / totalValue) * 100,
        icon: "", // Icon is displayed by sector name, not needed here
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [enrichedHoldings]);

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

  // Open share modal for a specific holding
  const handleShareHolding = useCallback(
    (enriched: EnrichedHolding) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setShareData({
        ticker: enriched.holding.ticker,
        companyName: enriched.holding.name,
        price: enriched.livePrice,
        pnlAmount: enriched.livePnl,
        pnlPercent: enriched.livePnlPercent,
        sparkline: enriched.liveSparkline,
        timeFrame: "All Time",
        shares: enriched.holding.shares,
      });
      setShowShareModal(true);
    },
    []
  );

  // Open share modal for the whole portfolio
  const handleSharePortfolio = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareData({
      ticker: "PORTFOLIO",
      companyName: `${enrichedHoldings.length} Holdings`,
      price: portfolioTotal,
      pnlAmount: portfolioPnl,
      pnlPercent: portfolioPnlPercent,
      sparkline: PORTFOLIO_SPARKLINE,
      timeFrame: "All Time",
    });
    setShowShareModal(true);
  }, [enrichedHoldings.length, portfolioTotal, portfolioPnl, portfolioPnlPercent]);

  // Empty state
  const hasHoldings = enrichedHoldings.length > 0;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <PortfolioHeader
          holdingCount={enrichedHoldings.length}
          hasHoldings={hasHoldings}
          isLive={isLive}
          lastUpdated={lastUpdated}
          onShare={handleSharePortfolio}
        />

        {/* Simple Mode: Hero */}
        {isSimple && (
          <PortfolioHeroSimple
            totalValue={portfolioTotal}
            pnl={portfolioPnl}
            pnlPercent={portfolioPnlPercent}
          />
        )}

        {/* Pro Mode: Hero with Sparkline */}
        {isPro && (
          <PortfolioHeroPro
            totalValue={portfolioTotal}
            pnl={portfolioPnl}
            pnlPercent={portfolioPnlPercent}
            hasHoldings={hasHoldings}
            sparkline={PORTFOLIO_SPARKLINE}
            sparklineWidth={SPARKLINE_WIDTH}
          />
        )}

        {/* Balance Row — Pro */}
        {isPro && (
          <BalanceRow
            cashBalance={state.balance}
            invested={portfolioCost}
          />
        )}

        {/* Balance Pill — Simple */}
        {isSimple && (
          <BalancePill
            cashBalance={state.balance}
          />
        )}

        {/* Holdings Section */}
        <HoldingsHeader
          hasTrades={state.trades.length > 0}
        />

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          {isLoading ? (
            <StockListSkeleton count={4} />
          ) : !hasHoldings ? (
            <EmptyPortfolioState
              onStartTrading={() => router.push("/(tabs)/trade")}
            />
          ) : (
            <>
              {/* Simple Mode: Cards */}
              {isSimple && (
                <View style={[styles.simpleCardList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {enrichedHoldings.map((enriched, index) => (
                    <HoldingCardSimple
                      key={enriched.holding.stockId}
                      ticker={enriched.holding.ticker}
                      shares={enriched.holding.shares}
                      liveValue={enriched.liveValue}
                      livePnlPercent={enriched.livePnlPercent}
                      onPress={() =>
                        router.push({
                          pathname: "/asset/[id]" as any,
                          params: { id: enriched.holding.stockId },
                        })
                      }
                      isLast={index === enrichedHoldings.length - 1}
                      index={index}
                    />
                  ))}
                </View>
              )}

              {/* Pro Mode: Detailed Rows */}
              {isPro && (
                <View style={[styles.proCardList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {enrichedHoldings.map((enriched, index) => (
                    <HoldingCardPro
                      key={enriched.holding.stockId}
                      ticker={enriched.holding.ticker}
                      name={enriched.holding.name}
                      shares={enriched.holding.shares}
                      avgCost={enriched.avgCost}
                      liveValue={enriched.liveValue}
                      livePnlPercent={enriched.livePnlPercent}
                      liveSparkline={enriched.liveSparkline}
                      livePnl={enriched.livePnl}
                      onPress={() =>
                        router.push({
                          pathname: "/asset/[id]" as any,
                          params: { id: enriched.holding.stockId },
                        })
                      }
                      onShare={() => handleShareHolding(enriched)}
                      isLast={index === enrichedHoldings.length - 1}
                      index={index}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Sector Allocation — Pro Only */}
        {isPro && hasHoldings && sectorAllocation.length > 0 && (
          <SectorAllocationBar
            sectorAllocation={sectorAllocation}
          />
        )}

        {/* Upcoming Dividends — Pro Only */}
        {isPro && hasHoldings && (
          <DividendSection />
        )}

        {/* Bottom Spacer for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Share Card Modal */}
      {shareData && (
        <ShareCardModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          data={shareData}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  holdingsContainer: {
    paddingTop: 0,
  },
  simpleCardList: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  proCardList: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
});
