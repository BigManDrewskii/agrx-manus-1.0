/**
 * HoldingsHeader — Holdings section header
 *
 * Shows "Holdings" label and optional history chip.
 *
 * Usage:
 *   <HoldingsHeader
 *     hasTrades={true}
 *     onPressHistory={() => router.push("/trade-history")}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface HoldingsHeaderProps {
  hasTrades: boolean;
}

export function HoldingsHeader({ hasTrades }: HoldingsHeaderProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.holdingsHeader}>
      <Caption1
        color="muted"
        style={{
          fontFamily: FontFamily.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Holdings
      </Caption1>
      {hasTrades && (
        <AnimatedPressable
          variant="chip"
          onPress={() => router.push("/trade-history" as any)}
          style={[styles.historyChip, { backgroundColor: colors.surfaceSecondary }]}
          accessibilityLabel="View trade history"
          accessibilityHint="Opens your trade history"
        >
          <IconSymbol name="clock" size={12} color={colors.muted} />
          <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
            History
          </Caption1>
        </AnimatedPressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  holdingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  historyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
});
