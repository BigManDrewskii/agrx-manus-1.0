import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { Sparkline } from "./sparkline";
import { AnimatedNumber, AnimatedPnLNumber } from "./animated-number";
import { Subhead, Caption1, Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { Asset } from "@/lib/mock-data";

interface TrendingCardProps {
  asset: Asset;
  onPress?: () => void;
}

export function TrendingCard({ asset, onPress }: TrendingCardProps) {
  const colors = useColors();

  return (
    <AnimatedPressable
      variant="card"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
          <Caption2 color="primary" style={{ fontFamily: FontFamily.bold }}>
            {asset.ticker.slice(0, 2)}
          </Caption2>
        </View>
        <View style={styles.headerText}>
          <Subhead
            style={{ fontFamily: FontFamily.bold, fontSize: 14 }}
            numberOfLines={1}
          >
            {asset.ticker}
          </Subhead>
          <Caption2 color="muted" style={{ fontFamily: FontFamily.medium }} numberOfLines={1}>
            {asset.name}
          </Caption2>
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
        <AnimatedNumber
          value={asset.price}
          prefix="€"
          decimals={2}
          style={{
            fontSize: 14,
            lineHeight: 20,
            fontFamily: FontFamily.monoMedium,
            color: colors.foreground,
          }}
        />
        <AnimatedPnLNumber value={asset.changePercent} format="percent" size="sm" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
      </View>
    </AnimatedPressable>
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
  headerText: {
    flex: 1,
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
});
