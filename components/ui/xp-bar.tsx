import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { useDemo } from "@/lib/demo-context";
import { Footnote } from "@/components/ui/typography";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { FontFamily } from "@/constants/typography";
import { SPRING_RESPONSIVE, SPRING_BOUNCY } from "@/lib/animations";

export function XPBar() {
  const colors = useColors();
  const { state } = useDemo();
  const xpInLevel = state.xp % 100;
  const progressPercent = xpInLevel / 100; // 0..1

  // Animated fill width
  const fillWidth = useSharedValue(progressPercent);

  useEffect(() => {
    fillWidth.value = withSpring(progressPercent, SPRING_RESPONSIVE);
  }, [progressPercent]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Footnote color="primary" style={{ fontFamily: FontFamily.bold }}>
          Level {state.level}
        </Footnote>
        <View style={styles.xpCounter}>
          <AnimatedNumber
            value={xpInLevel}
            decimals={0}
            suffix="/100 XP"
            style={{
              fontSize: 11,
              lineHeight: 14,
              fontFamily: FontFamily.monoMedium,
              color: colors.muted,
            }}
            springConfig={SPRING_BOUNCY}
          />
        </View>
      </View>
      <View style={[styles.bar, { backgroundColor: colors.surfaceSecondary }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: colors.primary },
            fillStyle,
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
    alignItems: "center",
    marginBottom: 6,
  },
  xpCounter: {
    flexDirection: "row",
    alignItems: "center",
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
