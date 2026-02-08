/**
 * PortfolioHero — Home screen portfolio hero
 *
 * Shows total balance, P&L, sparkline (Pro), and time period selectors (Pro).
 *
 * Usage:
 *   <PortfolioHero
 *     totalAccountValue={10000}
 *     portfolioPnl={500}
 *     portfolioPnlPercent={5}
 *     isPro={true}
 *     portfolioSparkline={[1, 2, 3, 4, 5]}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";
import { Sparkline } from "@/components/ui/sparkline";
import { AnimatedNumber, AnimatedPnLNumber } from "@/components/ui/animated-number";
import { Footnote, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface PortfolioHeroProps {
  totalAccountValue: number;
  portfolioPnl: number;
  portfolioPnlPercent: number;
  isPro: boolean;
  portfolioSparkline: number[];
}

export function PortfolioHero({
  totalAccountValue,
  portfolioPnl,
  portfolioPnlPercent,
  isPro,
  portfolioSparkline,
}: PortfolioHeroProps) {
  const colors = useColors();
  const isPositive = portfolioPnl >= 0;

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(60)} style={styles.portfolioHero}>
      <Footnote color="muted" style={{ letterSpacing: 0.3 }}>
        Total Balance
      </Footnote>
      <AnimatedNumber
        value={totalAccountValue}
        prefix="€"
        decimals={2}
        style={{
          fontSize: 34,
          lineHeight: 42,
          fontFamily: "JetBrainsMono_700Bold",
          color: colors.foreground,
          textShadowColor: isPositive ? colors.successAlpha : colors.errorAlpha,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 16,
        }}
      />
      <View style={styles.pnlRow}>
        <AnimatedPnLNumber
          value={portfolioPnl}
          format="currency"
          size="md"
          showArrow={true}
          successColor={colors.success}
          errorColor={colors.error}
          mutedColor={colors.muted}
        />
        <Footnote color="muted"> · </Footnote>
        <AnimatedPnLNumber
          value={portfolioPnlPercent}
          format="percent"
          size="md"
          showArrow={false}
          successColor={colors.success}
          errorColor={colors.error}
          mutedColor={colors.muted}
        />
        <Footnote color="muted"> all time</Footnote>
      </View>

      {/* Sparkline + time selectors — Pro only */}
      {isPro && (
        <>
          <View style={styles.sparklineContainer}>
            <Sparkline
              data={portfolioSparkline}
              width={320}
              height={44}
              positive={isPositive}
              strokeWidth={1.8}
            />
          </View>
          <View style={styles.timePeriodRow}>
            {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period, i) => (
              <AnimatedPressable
                key={period}
                variant="chip"
                style={[
                  styles.timePeriodButton,
                  i === 0 && { backgroundColor: colors.primaryAlpha },
                ]}
              >
                <Caption1
                  color={i === 0 ? "primary" : "muted"}
                  style={{
                    fontFamily: i === 0 ? FontFamily.bold : FontFamily.medium,
                    letterSpacing: 0.3,
                  }}
                >
                  {period}
                </Caption1>
              </AnimatedPressable>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  portfolioHero: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    alignItems: "center",
  },
  pnlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sparklineContainer: {
    marginTop: 14,
    alignItems: "center",
  },
  timePeriodRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 4,
  },
  timePeriodButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
});
