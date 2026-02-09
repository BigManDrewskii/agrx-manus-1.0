/**
 * BalanceRow — Pro mode balance row
 *
 * Shows cash balance and invested amount in a bordered card.
 *
 * Usage:
 *   <BalanceRow
 *     cashBalance={5000}
 *     invested={5000}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { Caption1, MonoSubhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface BalanceRowProps {
  cashBalance: number;
  invested: number;
}

export function BalanceRow({ cashBalance, invested }: BalanceRowProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(120)}
      style={[styles.balanceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.balanceItem}>
        <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 4 }}>
          Cash Balance
        </Caption1>
        <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
          €{cashBalance.toLocaleString("el-GR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </MonoSubhead>
      </View>
      <View style={[styles.balanceDivider, { backgroundColor: colors.border }]} />
      <View style={styles.balanceItem}>
        <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, marginBottom: 4 }}>
          Invested
        </Caption1>
        <MonoSubhead style={{ fontFamily: FontFamily.monoMedium }}>
          €{invested.toLocaleString("el-GR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </MonoSubhead>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  balanceRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
  },
  balanceDivider: {
    width: 1,
    marginVertical: 2,
  },
});
