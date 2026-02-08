import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useDemo } from "@/lib/demo-context";
import { Caption1, MonoCaption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

export function DemoBanner() {
  const colors = useColors();
  const { state } = useDemo();

  if (!state.isDemo) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.warningAlpha }]}>
      <View style={[styles.dot, { backgroundColor: colors.warning }]} />
      <Caption1
        style={{
          color: colors.warning,
          fontFamily: FontFamily.bold,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        Demo Mode
      </Caption1>
      <MonoCaption1 style={{ color: colors.warning, fontFamily: FontFamily.monoBold }}>
        €{state.balance.toLocaleString("el-GR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </MonoCaption1>
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
});
