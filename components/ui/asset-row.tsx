import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Sparkline } from "./sparkline";
import { PnLText } from "./pnl-text";
import type { Asset } from "@/lib/mock-data";

interface AssetRowProps {
  asset: Asset;
  onPress?: () => void;
  showSparkline?: boolean;
}

export function AssetRow({ asset, onPress, showSparkline = true }: AssetRowProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      {/* Left: Icon + Name */}
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.iconText, { color: colors.primary }]}>
            {asset.ticker.slice(0, 2)}
          </Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={[styles.ticker, { color: colors.muted }]}>
            {asset.ticker}
          </Text>
        </View>
      </View>

      {/* Center: Sparkline */}
      {showSparkline && (
        <View style={styles.center}>
          <Sparkline
            data={asset.sparkline}
            width={56}
            height={24}
            positive={asset.change >= 0}
          />
        </View>
      )}

      {/* Right: Price + Change */}
      <View style={styles.right}>
        <Text style={[styles.price, { color: colors.foreground }]}>
          €{asset.price.toFixed(2)}
        </Text>
        <PnLText value={asset.changePercent} size="sm" showArrow={false} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  ticker: {
    fontSize: 12,
    fontWeight: "500",
  },
  center: {
    marginHorizontal: 12,
  },
  right: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    marginBottom: 2,
  },
});
