import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useDemo } from "@/lib/demo-context";
import { Footnote, MonoCaption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

export function XPBar() {
  const colors = useColors();
  const { state } = useDemo();
  const xpInLevel = state.xp % 100;
  const progressPercent = xpInLevel;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Footnote color="primary" style={{ fontFamily: FontFamily.bold }}>
          Level {state.level}
        </Footnote>
        <MonoCaption1 color="muted" style={{ fontFamily: FontFamily.monoMedium }}>
          {xpInLevel}/100 XP
        </MonoCaption1>
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
