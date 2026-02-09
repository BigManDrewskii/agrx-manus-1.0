/**
 * QuickActions — Simple mode quick action buttons
 *
 * Shows Trade, Portfolio, and Markets action buttons using CDSButton with icons.
 *
 * Usage:
 *   <QuickActions />
 */
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { CDSButton } from "@/components/ui/cds-button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { FontFamily } from "@/constants/typography";

export function QuickActions() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(120)} style={styles.quickActions}>
      <View style={styles.quickActionButton}>
        <CDSButton
          variant="primary"
          onPress={() => router.push("/(tabs)/trade")}
          accessibilityLabel="Navigate to Trade screen"
          accessibilityHint="Buy and sell stocks"
        >
          <View style={styles.buttonContent}>
            <IconSymbol name="plus.circle.fill" size={18} color={colors.onPrimary} />
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Trade</Text>
          </View>
        </CDSButton>
      </View>
      <View style={styles.quickActionButton}>
        <CDSButton
          variant="tertiary"
          onPress={() => router.push("/(tabs)/portfolio")}
          accessibilityLabel="Navigate to Portfolio screen"
          accessibilityHint="View your holdings and performance"
        >
          <View style={styles.buttonContent}>
            <IconSymbol name="briefcase.fill" size={18} color={colors.primary} />
            <Text style={[styles.buttonText, { color: colors.primary }]}>Portfolio</Text>
          </View>
        </CDSButton>
      </View>
      <View style={styles.quickActionButton}>
        <CDSButton
          variant="tertiary"
          onPress={() => router.push("/(tabs)/markets")}
          accessibilityLabel="Navigate to Markets screen"
          accessibilityHint="Browse and search all stocks"
        >
          <View style={styles.buttonContent}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={18} color={colors.primary} />
            <Text style={[styles.buttonText, { color: colors.primary }]}>Markets</Text>
          </View>
        </CDSButton>
      </View>
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
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonText: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
  },
});
