/**
 * EmptyPortfolioState — Empty portfolio state
 *
 * Shows icon, title, description, and start trading CTA.
 *
 * Usage:
 *   <EmptyPortfolioState
 *     onStartTrading={() => router.push("/(tabs)/trade")}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Headline, Subhead, Footnote } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface EmptyPortfolioStateProps {
  onStartTrading: () => void;
}

export function EmptyPortfolioState({ onStartTrading }: EmptyPortfolioStateProps) {
  const colors = useColors();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceSecondary }]}>
        <IconSymbol name="chart.bar.fill" size={36} color={colors.muted} />
      </View>
      <Headline style={{ marginTop: 20, marginBottom: 8 }}>
        No Holdings Yet
      </Headline>
      <Footnote
        color="muted"
        style={{ textAlign: "center", maxWidth: 280, lineHeight: 20 }}
      >
        Start trading to build your portfolio. Your holdings and performance will appear here.
      </Footnote>
      <AnimatedPressable
        variant="button"
        onPress={onStartTrading}
        style={[styles.startTradingButton, { backgroundColor: colors.primary }]}
      >
        <IconSymbol name="plus.circle.fill" size={18} color={colors.onPrimary} />
        <Subhead style={{ color: colors.onPrimary, fontFamily: FontFamily.semibold }}>
          Start Trading
        </Subhead>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  startTradingButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
