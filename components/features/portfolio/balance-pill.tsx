/**
 * BalancePill — Simple mode balance pill
 *
 * Shows cash available in a compact horizontal pill.
 *
 * Usage:
 *   <BalancePill
 *     cashBalance={5000}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Caption1, MonoSubhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface BalancePillProps {
  cashBalance: number;
}

export function BalancePill({ cashBalance }: BalancePillProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(120)}
      style={[styles.simpleBalancePill, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.balancePillLeft}>
        <IconSymbol name="briefcase.fill" size={16} color={colors.muted} />
        <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>Cash Available</Caption1>
      </View>
      <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
        €{cashBalance.toLocaleString("el-GR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </MonoSubhead>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  simpleBalancePill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  balancePillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
