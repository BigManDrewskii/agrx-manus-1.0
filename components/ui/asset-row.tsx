import React from "react";
import { View, StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Sparkline } from "./sparkline";
import { PnLText } from "./pnl-text";
import { Subhead, Caption1, MonoSubhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
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
          <Caption1
            color="primary"
            style={{ fontFamily: FontFamily.bold, letterSpacing: 0.5 }}
          >
            {asset.ticker.slice(0, 2)}
          </Caption1>
        </View>
        <View style={styles.nameContainer}>
          <Subhead
            style={{ fontFamily: FontFamily.semibold, marginBottom: 2 }}
            numberOfLines={1}
          >
            {asset.name}
          </Subhead>
          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
            {asset.ticker}
          </Caption1>
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
        <MonoSubhead style={{ fontFamily: FontFamily.monoMedium, marginBottom: 2 }}>
          €{asset.price.toFixed(2)}
        </MonoSubhead>
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
  nameContainer: {
    flex: 1,
  },
  center: {
    marginHorizontal: 12,
  },
  right: {
    alignItems: "flex-end",
  },
});
