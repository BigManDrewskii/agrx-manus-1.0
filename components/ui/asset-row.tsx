import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { Sparkline } from "./sparkline";
import { AnimatedNumber, AnimatedPnLNumber } from "./animated-number";
import { Subhead, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { IconSymbol } from "./icon-symbol";
import type { Asset } from "@/lib/mock-data";

interface AssetRowProps {
  asset: Asset;
  onPress?: () => void;
  showSparkline?: boolean;
  /** Whether to show the star/watchlist toggle */
  showStar?: boolean;
  /** Whether this stock is currently watchlisted */
  isWatchlisted?: boolean;
  /** Callback when the star is toggled */
  onToggleWatchlist?: () => void;
}

export function AssetRow({
  asset,
  onPress,
  showSparkline = true,
  showStar = false,
  isWatchlisted = false,
  onToggleWatchlist,
}: AssetRowProps) {
  const colors = useColors();

  const handleStarPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleWatchlist?.();
  };

  return (
    <AnimatedPressable
      variant="card"
      onPress={onPress}
      style={[
        styles.container,
        { borderBottomColor: colors.border },
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

      {/* Right: Price + Change + Star */}
      <View style={styles.rightGroup}>
        <View style={styles.right}>
          <AnimatedNumber
            value={asset.price}
            prefix="€"
            decimals={2}
            style={{
              fontSize: 15,
              lineHeight: 20,
              fontFamily: FontFamily.monoMedium,
              color: colors.foreground,
              marginBottom: 2,
            }}
          />
          <AnimatedPnLNumber value={asset.changePercent} format="percent" size="sm" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
        </View>
        {showStar && (
          <AnimatedPressable
            variant="icon"
            onPress={handleStarPress}
            hitSlop={12}
            style={styles.starButton}
            accessibilityLabel={`${isWatchlisted ? "Remove from" : "Add to"} watchlist`}
            accessibilityRole="button"
            accessibilityState={{ selected: isWatchlisted }}
          >
            <IconSymbol
              name="star.fill"
              size={18}
              color={isWatchlisted ? colors.gold : colors.border}
            />
          </AnimatedPressable>
        )}
      </View>
    </AnimatedPressable>
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
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  right: {
    alignItems: "flex-end",
  },
  starButton: {
    padding: 4,
  },
});
