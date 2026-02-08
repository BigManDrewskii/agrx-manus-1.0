import React, { useState, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PnLText } from "@/components/ui/pnl-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Sparkline } from "@/components/ui/sparkline";
import { GREEK_STOCKS, generateChartData } from "@/lib/mock-data";
import Svg, { Polyline, Defs, LinearGradient, Stop, Rect, Path } from "react-native-svg";

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

  // Area fill path
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

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const [activePeriod, setActivePeriod] = useState("1D");

  const asset = useMemo(
    () => GREEK_STOCKS.find((s) => s.id === id) ?? GREEK_STOCKS[0],
    [id]
  );

  const chartData = useMemo(() => {
    const points =
      activePeriod === "1D"
        ? 48
        : activePeriod === "1W"
        ? 7 * 24
        : activePeriod === "1M"
        ? 30
        : activePeriod === "3M"
        ? 90
        : activePeriod === "1Y"
        ? 365
        : 730;
    return generateChartData(
      asset.price * 0.9,
      asset.price * 0.02,
      points
    ).map((d) => d.value);
  }, [asset, activePeriod]);

  const isPositive = asset.change >= 0;
  const buyPercent = 68;
  const sellPercent = 32;

  const NEWS = [
    {
      id: "1",
      title: `${asset.name} reports strong Q4 earnings, beats estimates`,
      source: "Capital.gr",
      time: "2h ago",
    },
    {
      id: "2",
      title: `Analysts upgrade ${asset.ticker} price target to €${(asset.price * 1.15).toFixed(2)}`,
      source: "Naftemporiki",
      time: "5h ago",
    },
    {
      id: "3",
      title: `ATHEX: ${asset.name} among top traded stocks today`,
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
            <Text style={[styles.headerTicker, { color: colors.foreground }]}>
              {asset.ticker}
            </Text>
            <Text style={[styles.headerName, { color: colors.muted }]}>
              {asset.name}
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
          <Text style={[styles.price, { color: colors.foreground }]}>
            €{asset.price.toFixed(2)}
          </Text>
          <PnLText
            value={asset.changePercent}
            format="percent"
            size="lg"
            showArrow={true}
          />
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <PriceChart
            data={chartData}
            width={360}
            height={200}
            positive={isPositive}
          />
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
                  isActive && { backgroundColor: colors.primary + "20" },
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

        {/* Key Stats */}
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.statsGrid}>
            {[
              { label: "Market Cap", value: asset.marketCap ?? "N/A" },
              { label: "Day Range", value: `€${(asset.price * 0.97).toFixed(2)} - €${(asset.price * 1.02).toFixed(2)}` },
              { label: "Volume", value: "1.2M" },
              { label: "P/E Ratio", value: "14.8" },
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

      {/* Sticky Buy/Sell CTAs */}
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
          <Text style={styles.ctaText}>Buy</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/trade" as any)}
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: colors.error },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
        >
          <Text style={styles.ctaText}>Sell</Text>
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
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
