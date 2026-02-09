/**
 * HoldingCardSimple — Simple mode holding card
 *
 * Single-row card with icon, ticker, shares, value, and P&L.
 *
 * Usage:
 *   <HoldingCardSimple
 *     ticker="OPAP"
 *     shares={10}
 *     liveValue={250}
 *     livePnlPercent={5}
 *     onPress={() => router.push(`/asset/${id}`)}
 *     isLast={false}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { Subhead, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface HoldingCardSimpleProps {
  ticker: string;
  shares: number;
  liveValue: number;
  livePnlPercent: number;
  onPress: () => void;
  isLast: boolean;
  index: number;
}

export function HoldingCardSimple({
  ticker,
  shares,
  liveValue,
  livePnlPercent,
  onPress,
  isLast,
  index,
}: HoldingCardSimpleProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(210 + Math.min(index, 10) * 40)}
    >
      <AnimatedPressable
        variant="card"
        onPress={onPress}
        style={[
          styles.simpleCardRow,
          !isLast && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={[styles.simpleCardIcon, { backgroundColor: colors.primaryAlpha }]}>
          <Caption1 color="primary" style={{ fontFamily: FontFamily.bold, fontSize: 13 }}>
            {ticker.slice(0, 2)}
          </Caption1>
        </View>
        <View style={styles.simpleCardInfo}>
          <Subhead style={{ fontFamily: FontFamily.semibold }}>
            {ticker}
          </Subhead>
          <Caption1 color="muted" numberOfLines={1}>
            {shares.toFixed(shares % 1 === 0 ? 0 : 2)} shares
          </Caption1>
        </View>
        <View style={styles.simpleCardValue}>
          <AnimatedNumber
            value={liveValue}
            prefix="€"
            decimals={2}
            style={{
              fontSize: 15,
              lineHeight: 20,
              fontFamily: FontFamily.monoMedium,
              color: colors.foreground,
            }}
          />
          <AnimatedPnLNumber value={livePnlPercent} format="percent" size="sm" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  simpleCardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  simpleCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  simpleCardInfo: {
    flex: 1,
  },
  simpleCardValue: {
    alignItems: "flex-end",
  },
});
