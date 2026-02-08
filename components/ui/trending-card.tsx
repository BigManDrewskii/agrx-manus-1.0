import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Sparkline } from "./sparkline";
import { PnLText } from "./pnl-text";
import type { Asset } from "@/lib/mock-data";

interface TrendingCardProps {
  asset: Asset;
  onPress?: () => void;
}

export function TrendingCard({ asset, onPress }: TrendingCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.iconText, { color: colors.primary }]}>
            {asset.ticker.slice(0, 2)}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.ticker, { color: colors.foreground }]} numberOfLines={1}>
            {asset.ticker}
          </Text>
          <Text style={[styles.name, { color: colors.muted }]} numberOfLines={1}>
            {asset.name}
          </Text>
        </View>
      </View>

      <View style={styles.sparklineContainer}>
        <Sparkline
          data={asset.sparkline}
          width={100}
          height={32}
          positive={asset.change >= 0}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.price, { color: colors.foreground }]}>
          €{asset.price.toFixed(2)}
        </Text>
        <PnLText value={asset.changePercent} size="sm" showArrow={false} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  iconText: {
    fontSize: 11,
    fontWeight: "700",
  },
  headerText: {
    flex: 1,
  },
  ticker: {
    fontSize: 14,
    fontWeight: "700",
  },
  name: {
    fontSize: 11,
    fontWeight: "500",
  },
  sparklineContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
