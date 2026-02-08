import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useDemo } from "@/lib/demo-context";

export function XPBar() {
  const colors = useColors();
  const { state } = useDemo();
  const xpInLevel = state.xp % 100;
  const progressPercent = xpInLevel;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.level, { color: colors.primary }]}>
          Level {state.level}
        </Text>
        <Text style={[styles.xp, { color: colors.muted }]}>
          {xpInLevel}/100 XP
        </Text>
      </View>
      <View style={[styles.bar, { backgroundColor: colors.surfaceSecondary }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${progressPercent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  level: {
    fontSize: 13,
    fontWeight: "700",
  },
  xp: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  bar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
});
