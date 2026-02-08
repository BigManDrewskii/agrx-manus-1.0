import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PnLText } from "@/components/ui/pnl-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiveBadge } from "@/components/ui/live-badge";
import { ChartSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useStockQuote, useStockChart } from "@/hooks/use-stocks";
import { GREEK_STOCKS } from "@/lib/mock-data";
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from "react-native-svg";

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

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const [activePeriod, setActivePeriod] = useState("1D");

  const { stock, isLoading: quoteLoading, isLive } = useStockQuote(id ?? "");
  const { chartData, isLoading: chartLoading, isLive: chartIsLive } = useStockChart(id ?? "", activePeriod);

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
  const buyPercent = 68;
  const sellPercent = 32;

  const NEWS = [
    {
      id: "1",
      title: `${name} reports strong Q4 earnings, beats estimates`,
      source: "Capital.gr",
      time: "2h ago",
    },
    {
      id: "2",
      title: `Analysts upgrade ${ticker} price target to €${(price * 1.15).toFixed(2)}`,
      source: "Naftemporiki",
      time: "5h ago",
    },
    {
      id: "3",
      title: `ATHEX: ${name} among top traded stocks today`,
      source: "Reuters",
      time: "8h ago",
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.6 },
            ]}
          >
            <IconSymbol name="chevron.right" size={20} color={colors.foreground} style={{ transform: [{ scaleX: -1 }] }} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTicker, { color: colors.foreground }]}>
                {ticker}
              </Text>
              <LiveBadge isLive={isLive} />
            </View>
            <Text style={[styles.headerName, { color: colors.muted }]}>
              {name}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.shareButton,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.6 },
            ]}
          >
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.foreground} />
          </Pressable>
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
              <Text style={[styles.price, { color: colors.foreground }]}>
                €{price.toFixed(2)}
              </Text>
              <View style={styles.changeRow}>
                <PnLText
                  value={change}
                  format="currency"
                  size="md"
                  showArrow={true}
                />
                <Text style={[styles.changeSep, { color: colors.muted }]}> · </Text>
                <PnLText
                  value={changePercent}
                  format="percent"
                  size="md"
                  showArrow={false}
                />
              </View>
            </>
          )}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {chartLoading ? (
            <ChartSkeleton />
          ) : (
            <PriceChart
              data={chartData}
              width={360}
              height={200}
              positive={isPositive}
            />
          )}
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodRow}>
          {TIME_PERIODS.map((period) => {
            const isActive = period === activePeriod;
            return (
              <Pressable
                key={period}
                onPress={() => setActivePeriod(period)}
                style={({ pressed }) => [
                  styles.periodButton,
                  isActive && { backgroundColor: colors.primaryAlpha },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color: isActive ? colors.primary : colors.muted,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Key Stats — Live Data */}
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.statsGrid}>
            {[
              { label: "Market Cap", value: marketCap },
              { label: "Day Range", value: `€${dayLow.toFixed(2)} - €${dayHigh.toFixed(2)}` },
              { label: "Volume", value: volume > 0 ? formatVolume(volume) : "N/A" },
              { label: "52W Range", value: `€${fiftyTwoWeekLow.toFixed(2)} - €${fiftyTwoWeekHigh.toFixed(2)}` },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.muted }]}>
                  {stat.label}
                </Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Community Sentiment */}
        <View style={styles.sentimentSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Community Sentiment
          </Text>
          <View
            style={[
              styles.sentimentCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.sentimentBar}>
              <View
                style={[
                  styles.sentimentFillBuy,
                  {
                    backgroundColor: colors.success,
                    width: `${buyPercent}%`,
                  },
                ]}
              />
              <View
                style={[
                  styles.sentimentFillSell,
                  {
                    backgroundColor: colors.error,
                    width: `${sellPercent}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.sentimentLabels}>
              <Text style={[styles.sentimentLabel, { color: colors.success }]}>
                {buyPercent}% Buy
              </Text>
              <Text style={[styles.sentimentLabel, { color: colors.error }]}>
                {sellPercent}% Sell
              </Text>
            </View>
          </View>
        </View>

        {/* News */}
        <View style={styles.newsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Latest News
          </Text>
          {NEWS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.newsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[styles.newsTitle, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View style={styles.newsMeta}>
                <Text style={[styles.newsSource, { color: colors.primary }]}>
                  {item.source}
                </Text>
                <Text style={[styles.newsTime, { color: colors.muted }]}>
                  {item.time}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={[
          styles.ctaContainer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => router.push("/(tabs)/trade" as any)}
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: colors.success },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
        >
          <Text style={[styles.ctaText, { color: colors.onPrimary }]}>Buy</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/trade" as any)}
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: colors.error },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
        >
          <Text style={[styles.ctaText, { color: colors.onPrimary }]}>Sell</Text>
        </Pressable>
      </View>
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
  headerTicker: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerName: {
    fontSize: 13,
    fontWeight: "500",
  },
  shareButton: {
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
  price: {
    fontSize: 36,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeSep: {
    fontSize: 14,
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
  periodText: {
    fontSize: 13,
    letterSpacing: 0.3,
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
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  sentimentSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  sentimentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
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
  sentimentLabel: {
    fontSize: 13,
    fontWeight: "600",
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
  newsTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 8,
  },
  newsMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  newsSource: {
    fontSize: 12,
    fontWeight: "600",
  },
  newsTime: {
    fontSize: 12,
    fontWeight: "500",
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
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
