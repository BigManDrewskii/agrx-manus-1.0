/**
 * QuickActions — Simple mode quick action buttons
 *
 * Shows Trade, Portfolio, and Markets action buttons.
 *
 * Usage:
 *   <QuickActions />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Subhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

export function QuickActions() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(120)} style={styles.quickActions}>
      <AnimatedPressable
        variant="button"
        onPress={() => router.push("/(tabs)/trade")}
        style={[
          styles.quickActionButton,
          { backgroundColor: colors.primary },
        ]}
        accessibilityLabel="Navigate to Trade screen"
        accessibilityHint="Buy and sell stocks"
      >
        <IconSymbol name="plus.circle.fill" size={20} color={colors.onPrimary} />
        <Subhead style={{ fontFamily: FontFamily.semibold, color: colors.onPrimary }}>
          Trade
        </Subhead>
      </AnimatedPressable>
      <AnimatedPressable
        variant="button"
        onPress={() => router.push("/(tabs)/portfolio")}
        style={[
          styles.quickActionButton,
          { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
        ]}
        accessibilityLabel="Navigate to Portfolio screen"
        accessibilityHint="View your holdings and performance"
      >
        <IconSymbol name="briefcase.fill" size={20} color={colors.foreground} />
        <Subhead style={{ fontFamily: FontFamily.semibold }}>Portfolio</Subhead>
      </AnimatedPressable>
      <AnimatedPressable
        variant="button"
        onPress={() => router.push("/(tabs)/markets")}
        style={[
          styles.quickActionButton,
          { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
        ]}
        accessibilityLabel="Navigate to Markets screen"
        accessibilityHint="Browse and search all stocks"
      >
        <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.foreground} />
        <Subhead style={{ fontFamily: FontFamily.semibold }}>Markets</Subhead>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
});
