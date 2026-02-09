/**
 * PortfolioHeroPro — Pro mode portfolio hero with sparkline
 *
 * Shows total value, P&L pill, and portfolio sparkline.
 *
 * Usage:
 *   <PortfolioHeroPro
 *     totalValue={10000}
 *     pnl={500}
 *     pnlPercent={5}
 *     hasHoldings={true}
 *     sparkline={[1, 2, 3, 4, 5]}
 *     sparklineWidth={340}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { Sparkline } from "@/components/ui/sparkline";
import { Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface PortfolioHeroProProps {
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  hasHoldings: boolean;
  sparkline: number[];
  sparklineWidth: number;
}

export function PortfolioHeroPro({
  totalValue,
  pnl,
  pnlPercent,
  hasHoldings,
  sparkline,
  sparklineWidth,
}: PortfolioHeroProProps) {
  const colors = useColors();
  const isPositive = pnl >= 0;

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.proHero}>
      <Caption1
        color="muted"
        style={{ fontFamily: FontFamily.semibold, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}
      >
        Total Value
      </Caption1>
      <AnimatedNumber
        value={totalValue}
        prefix="€"
        decimals={2}
        style={{
          fontSize: 42,
          lineHeight: 50,
          fontFamily: "JetBrainsMono_700Bold",
          color: colors.foreground,
        }}
      />
      <View style={[styles.heroPnlRow, { marginTop: 8 }]}>
        <View style={[styles.pnlPill, { backgroundColor: isPositive ? colors.successAlpha : colors.errorAlpha }]}>
          <AnimatedPnLNumber value={pnl} format="currency" size="lg" showArrow={true} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
          <View style={[styles.pnlDot, { backgroundColor: colors.muted }]} />
          <AnimatedPnLNumber value={pnlPercent} format="percent" size="lg" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
        </View>
      </View>
      {hasHoldings && (
        <View style={styles.sparklineContainer}>
          <Sparkline
            data={sparkline}
            width={sparklineWidth}
            height={64}
            positive={isPositive}
            strokeWidth={2}
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  proHero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroPnlRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pnlPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
  },
  pnlDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 6,
  },
  sparklineContainer: {
    marginTop: 20,
  },
});
