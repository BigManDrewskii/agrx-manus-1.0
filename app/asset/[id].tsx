import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PnLText } from "@/components/ui/pnl-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiveBadge } from "@/components/ui/live-badge";
import { ChartSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useStockQuote, useStockChart } from "@/hooks/use-stocks";
import { useStockNews } from "@/hooks/use-news";
import { GREEK_STOCKS } from "@/lib/mock-data";
import { ShareCardModal } from "@/components/ui/share-card-modal";
import type { ShareCardData, ShareSentiment } from "@/components/ui/share-card";
import {
  Title3,
  Headline,
  Body,
  Callout,
  Subhead,
  Footnote,
  Caption1,
  Caption2,
  MonoLargeTitle,
  MonoBody,
  MonoSubhead,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from "react-native-svg";
import { useWatchlist } from "@/lib/watchlist-context";
import { useNotifications } from "@/lib/notification-context";
import { AddAlertModal } from "@/components/ui/add-alert-modal";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const TIME_PERIODS = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

function PriceChart({
  data,
  width,
  height,
  positive,
}: {
  data: number[];
  width: number;
  height: number;
  positive: boolean;
}) {
  const colors = useColors();
  const color = positive ? colors.success : colors.error;

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 8;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartW;
    const y = padding + chartH - ((value - min) / range) * chartH;
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPath = `M${points[0].x},${points[0].y} ${points
    .map((p) => `L${p.x},${p.y}`)
    .join(" ")} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.15" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#areaGrad)" />
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
  return vol.toString();
}

// ─── Sentiment Dot Indicator ────────────────────────────────────────────────

function SentimentDot({ sentiment }: { sentiment: "bullish" | "bearish" | "neutral" }) {
  const colors = useColors();
  const dotColor =
    sentiment === "bullish" ? colors.success : sentiment === "bearish" ? colors.error : colors.muted;
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: dotColor,
        marginRight: 6,
        marginTop: 2,
      }}
    />
  );
}

// ─── News Skeleton ──────────────────────────────────────────────────────────

function NewsSkeleton() {
  return (
    <View style={{ gap: 10 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ borderRadius: 12, padding: 14, gap: 8 }}>
          <Skeleton width="100%" height={16} borderRadius={6} />
          <Skeleton width="70%" height={16} borderRadius={6} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            <Skeleton width={80} height={12} borderRadius={4} />
            <Skeleton width={50} height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const [activePeriod, setActivePeriod] = useState("1D");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const { getAlertsForStock } = useNotifications();
  const stockAlerts = getAlertsForStock(id ?? "");
  const hasActiveAlerts = stockAlerts.some((a) => a.enabled);

  const { stock, isLoading: quoteLoading, isLive } = useStockQuote(id ?? "");
  const { isWatchlisted, toggle: toggleWatchlist } = useWatchlist();
  const starred = isWatchlisted(id ?? "");
  const { chartData, isLoading: chartLoading } = useStockChart(id ?? "", activePeriod);

  // Live news + sentiment
  const newsQuery = useStockNews(id);
  const newsData = newsQuery.data?.success ? newsQuery.data.data : null;
  const newsLoading = newsQuery.isLoading;

  // Fallback to mock data if stock not found
  const mockAsset = GREEK_STOCKS.find((s) => s.id === id);

  const ticker = stock?.ticker ?? mockAsset?.ticker ?? "---";
  const name = stock?.name ?? mockAsset?.name ?? "Unknown";
  const price = stock?.price ?? mockAsset?.price ?? 0;
  const change = stock?.change ?? mockAsset?.change ?? 0;
  const changePercent = stock?.changePercent ?? mockAsset?.changePercent ?? 0;
  const dayHigh = stock?.dayHigh ?? price * 1.02;
  const dayLow = stock?.dayLow ?? price * 0.98;
  const volume = stock?.volume ?? 0;
  const fiftyTwoWeekHigh = stock?.fiftyTwoWeekHigh ?? price * 1.2;
  const fiftyTwoWeekLow = stock?.fiftyTwoWeekLow ?? price * 0.8;
  const marketCap = stock?.marketCap ?? "N/A";

  const isPositive = change >= 0;

  // Sentiment from live news or fallback
  const sentimentData = newsData?.sentiment;
  const buyPercent = sentimentData?.bullishPercent ?? 68;
  const sellPercent = sentimentData?.bearishPercent ?? 32;
  const neutralPercent = sentimentData?.neutralPercent ?? 0;
  const sentimentLabel = sentimentData?.label ?? "Neutral";
  const sentimentScore = sentimentData?.score ?? 0;

  const articles = newsData?.articles ?? [];
  const hasLiveNews = articles.length > 0;

  // Build share card data
  const shareCardData: ShareCardData = {
    ticker,
    companyName: name,
    price,
    pnlAmount: change,
    pnlPercent: changePercent,
    sparkline: chartData.length > 0 ? chartData : (mockAsset?.sparkline ?? []),
    timeFrame: "Today",
    sentiment: (sentimentLabel === "Bullish" || sentimentLabel === "Bearish" || sentimentLabel === "Neutral"
      ? sentimentLabel
      : "Neutral") as ShareSentiment,
    sentimentScore,
  };

  const handleShare = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowShareModal(true);
  }, []);

  const handleAddAlert = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAlertModal(true);
  }, []);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable
            variant="icon"
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <IconSymbol name="chevron.right" size={20} color={colors.foreground} style={{ transform: [{ scaleX: -1 }] }} />
          </AnimatedPressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Title3>{ticker}</Title3>
              <LiveBadge isLive={isLive} />
            </View>
            <Footnote color="muted">{name}</Footnote>
          </View>
          <View style={styles.headerActions}>
            <AnimatedPressable
              variant="icon"
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                toggleWatchlist(id ?? "");
              }}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface },
              ]}
            >
              <IconSymbol
                name="star.fill"
                size={18}
                color={starred ? colors.gold : colors.muted}
              />
            </AnimatedPressable>
            <AnimatedPressable
              variant="icon"
              onPress={handleAddAlert}
              style={[
                styles.iconButton,
                { backgroundColor: hasActiveAlerts ? colors.primary + "15" : colors.surface },
              ]}
            >
              <IconSymbol
                name={hasActiveAlerts ? "bell.badge.fill" : "bell.fill"}
                size={18}
                color={hasActiveAlerts ? colors.primary : colors.muted}
              />
            </AnimatedPressable>
            <AnimatedPressable
              variant="icon"
              onPress={handleShare}
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface },
              ]}
            >
              <IconSymbol name="square.and.arrow.up" size={18} color={colors.foreground} />
            </AnimatedPressable>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          {quoteLoading ? (
            <>
              <Skeleton width={120} height={36} borderRadius={8} />
              <Skeleton width={80} height={20} borderRadius={6} style={{ marginTop: 8 }} />
            </>
          ) : (
            <>
              <MonoLargeTitle style={{ fontSize: 36, letterSpacing: -1, marginBottom: 4 }}>
                €{price.toFixed(2)}
              </MonoLargeTitle>
              <View style={styles.changeRow}>
                <PnLText value={change} format="currency" size="md" showArrow={true} />
                <Footnote color="muted"> · </Footnote>
                <PnLText value={changePercent} format="percent" size="md" showArrow={false} />
              </View>
            </>
          )}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {chartLoading ? (
            <ChartSkeleton />
          ) : (
            <PriceChart data={chartData} width={360} height={200} positive={isPositive} />
          )}
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodRow}>
          {TIME_PERIODS.map((period) => {
            const isActive = period === activePeriod;
            return (
              <AnimatedPressable
                key={period}
                variant="chip"
                onPress={() => setActivePeriod(period)}
                style={[
                  styles.periodButton,
                  isActive && { backgroundColor: colors.primaryAlpha },
                ]}
              >
                <Caption1
                  color={isActive ? "primary" : "muted"}
                  style={{
                    fontFamily: isActive ? FontFamily.bold : FontFamily.medium,
                    letterSpacing: 0.3,
                  }}
                >
                  {period}
                </Caption1>
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Key Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statsGrid}>
            {[
              { label: "Market Cap", value: marketCap },
              { label: "Day Range", value: `€${dayLow.toFixed(2)} - €${dayHigh.toFixed(2)}` },
              { label: "Volume", value: volume > 0 ? formatVolume(volume) : "N/A" },
              { label: "52W Range", value: `€${fiftyTwoWeekLow.toFixed(2)} - €${fiftyTwoWeekHigh.toFixed(2)}` },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 2 }}>
                  {stat.label}
                </Caption1>
                <Subhead style={{ fontFamily: FontFamily.semibold }}>{stat.value}</Subhead>
              </View>
            ))}
          </View>
        </View>

        {/* AI Sentiment — Powered by Live News */}
        <View style={styles.sentimentSection}>
          <View style={styles.sectionTitleRow}>
            <Title3>Sentiment Analysis</Title3>
            {hasLiveNews && (
              <View style={[styles.aiBadge, { backgroundColor: colors.primaryAlpha }]}>
                <Caption2 color="primary" style={{ fontFamily: FontFamily.bold, letterSpacing: 0.5 }}>
                  AI · LIVE
                </Caption2>
              </View>
            )}
          </View>

          <View style={[styles.sentimentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Sentiment Score Header */}
            <View style={styles.sentimentHeader}>
              <View style={styles.sentimentLabelRow}>
                <View
                  style={[
                    styles.sentimentIndicator,
                    {
                      backgroundColor:
                        sentimentLabel === "Bullish"
                          ? colors.success
                          : sentimentLabel === "Bearish"
                          ? colors.error
                          : colors.warning,
                    },
                  ]}
                />
                <Headline
                  style={{
                    fontFamily: FontFamily.bold,
                    color:
                      sentimentLabel === "Bullish"
                        ? colors.success
                        : sentimentLabel === "Bearish"
                        ? colors.error
                        : colors.warning,
                  }}
                >
                  {sentimentLabel}
                </Headline>
              </View>
              <MonoSubhead style={{ color: colors.muted }}>
                {sentimentScore > 0 ? "+" : ""}
                {sentimentScore.toFixed(2)}
              </MonoSubhead>
            </View>

            {/* Three-way sentiment bar */}
            <View style={styles.sentimentBar}>
              {buyPercent > 0 && (
                <View
                  style={[
                    styles.sentimentFillBuy,
                    { backgroundColor: colors.success, width: `${buyPercent}%` },
                  ]}
                />
              )}
              {neutralPercent > 0 && (
                <View
                  style={{
                    height: "100%",
                    backgroundColor: colors.warning,
                    width: `${neutralPercent}%`,
                  }}
                />
              )}
              {sellPercent > 0 && (
                <View
                  style={[
                    styles.sentimentFillSell,
                    { backgroundColor: colors.error, width: `${sellPercent}%` },
                  ]}
                />
              )}
            </View>

            <View style={styles.sentimentLabels}>
              <Footnote color="success" style={{ fontFamily: FontFamily.semibold }}>
                {buyPercent}% Bullish
              </Footnote>
              <Footnote style={{ fontFamily: FontFamily.semibold, color: colors.warning }}>
                {neutralPercent}% Neutral
              </Footnote>
              <Footnote color="error" style={{ fontFamily: FontFamily.semibold }}>
                {sellPercent}% Bearish
              </Footnote>
            </View>

            {hasLiveNews && (
              <Caption2
                color="muted"
                style={{ fontFamily: FontFamily.medium, marginTop: 8, textAlign: "center" }}
              >
                Based on {articles.length} recent news articles
              </Caption2>
            )}
          </View>
        </View>

        {/* Live News Feed */}
        <View style={styles.newsSection}>
          <View style={styles.sectionTitleRow}>
            <Title3>Latest News</Title3>
            {hasLiveNews && (
              <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
                {articles.length} articles
              </Caption1>
            )}
          </View>

          {newsLoading ? (
            <NewsSkeleton />
          ) : hasLiveNews ? (
            articles.map((article, index) => (
              <AnimatedPressable
                key={`${article.url}-${index}`}
                variant="card"
                onPress={() => {
                  if (article.url) {
                    Linking.openURL(article.url).catch(() => {});
                  }
                }}
                style={[
                  styles.newsCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.newsContent}>
                  {article.sentiment && <SentimentDot sentiment={article.sentiment} />}
                  <View style={{ flex: 1 }}>
                    <Subhead
                      style={{ fontFamily: FontFamily.semibold, lineHeight: 20, marginBottom: 8 }}
                      numberOfLines={2}
                    >
                      {article.title}
                    </Subhead>
                    <View style={styles.newsMeta}>
                      <View style={styles.newsSourceRow}>
                        <Caption1 color="primary" style={{ fontFamily: FontFamily.semibold }}>
                          {article.source}
                        </Caption1>
                        {article.sentiment && (
                          <Caption2
                            style={{
                              fontFamily: FontFamily.bold,
                              color:
                                article.sentiment === "bullish"
                                  ? colors.success
                                  : article.sentiment === "bearish"
                                  ? colors.error
                                  : colors.muted,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {article.sentiment}
                          </Caption2>
                        )}
                      </View>
                      <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
                        {article.relativeTime}
                      </Caption1>
                    </View>
                  </View>
                </View>
              </AnimatedPressable>
            ))
          ) : (
            <View
              style={[
                styles.newsCard,
                { backgroundColor: colors.surface, borderColor: colors.border, alignItems: "center", paddingVertical: 24 },
              ]}
            >
              <Footnote color="muted" style={{ fontFamily: FontFamily.medium }}>
                No recent news found for {ticker}
              </Footnote>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.ctaContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <AnimatedPressable
          variant="button"
          onPress={() => router.push("/(tabs)/trade" as any)}
          style={[
            styles.ctaButton,
            { backgroundColor: colors.success },
          ]}
        >
          <Callout color="onPrimary" style={{ fontFamily: FontFamily.bold }}>Buy</Callout>
        </AnimatedPressable>
        <AnimatedPressable
          variant="button"
          onPress={() => router.push("/(tabs)/trade" as any)}
          style={[
            styles.ctaButton,
            { backgroundColor: colors.error },
          ]}
        >
          <Callout color="onPrimary" style={{ fontFamily: FontFamily.bold }}>Sell</Callout>
        </AnimatedPressable>
      </View>

      {/* Share Card Modal */}
      <ShareCardModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        data={shareCardData}
      />

      {/* Add Price Alert Modal */}
      <AddAlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        stockId={id ?? ""}
        stockName={name}
        currentPrice={price}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  priceContainer: {
    alignItems: "center",
    paddingBottom: 16,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    width: "50%",
    paddingVertical: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sentimentSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sentimentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sentimentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sentimentLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sentimentIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sentimentBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  sentimentFillBuy: {
    height: "100%",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  sentimentFillSell: {
    height: "100%",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  sentimentLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  newsSection: {
    paddingHorizontal: 16,
  },
  newsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  newsContent: {
    flexDirection: "row",
  },
  newsMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsSourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopWidth: 0.5,
  },
  ctaButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
