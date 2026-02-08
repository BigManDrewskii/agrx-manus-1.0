import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useDemo } from "@/lib/demo-context";

export function DemoBanner() {
  const colors = useColors();
  const { state } = useDemo();

  if (!state.isDemo) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.warning + "15" }]}>
      <View style={[styles.dot, { backgroundColor: colors.warning }]} />
      <Text style={[styles.text, { color: colors.warning }]}>
        Demo Mode
      </Text>
      <Text style={[styles.balance, { color: colors.warning }]}>
        €{state.balance.toLocaleString("el-GR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  balance: {
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
