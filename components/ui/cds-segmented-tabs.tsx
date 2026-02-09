/**
 * CDSSegmentedTabs — Segmented control following CDS design patterns
 *
 * Two-option toggle switch with smooth transitions and CDS styling.
 * Perfect for buy/sell, simple/pro, and other binary toggles.
 *
 * Usage:
 *   <CDSSegmentedTabs
 *     options={["Buy", "Sell"]}
 *     selected={0}
 *     onChange={(index) => setSelected(index)}
 *     colorType="success"
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { Footnote } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

type ColorType = "success" | "error" | "primary" | "gold";

interface CDSSegmentedTabsProps {
  options: [string, string];
  selected: number;
  onChange: (index: number) => void;
  colorType?: ColorType;
  disabled?: boolean;
}

export function CDSSegmentedTabs({
  options,
  selected,
  onChange,
  colorType = "success",
  disabled = false,
}: CDSSegmentedTabsProps) {
  const colors = useColors();
  const translateX = useSharedValue(0);

  const getColor = (): string => {
    switch (colorType) {
      case "success":
        return colors.success;
      case "error":
        return colors.error;
      case "primary":
        return colors.primary;
      case "gold":
        return colors.gold;
      default:
        return colors.primary;
    }
  };

  const activeColor = getColor();

  React.useEffect(() => {
    translateX.value = withSpring(selected === 0 ? 0 : 1, { damping: 15, stiffness: 150 });
  }, [selected]);

  const handlePress = (index: number) => {
    if (disabled || index === selected) return;

    if (Haptics.ImpactFeedbackStyle) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(index);
  };

  const tabWidth = 0.5; // 50% width per tab

  const slidingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value * 100}%` }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
      {/* Sliding active indicator */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 3,
            top: 3,
            bottom: 3,
            width: "47%",
            borderRadius: 10,
            backgroundColor: activeColor,
          },
          slidingStyle,
        ]}
      />

      {options.map((option, index) => {
        const isFirst = index === 0;
        return (
          <View key={index} style={styles.tab}>
            <GestureDetector gesture={Gesture.Tap()
              .enabled(!disabled)
              .onEnd(() => {
                "worklet";
                handlePress(index);
              })
            }>
              <Animated.View
                style={[
                  styles.tabContent,
                  disabled && styles.tabDisabled,
                ]}
              >
                <Footnote
                  color={selected === index ? "onPrimary" : "muted"}
                  style={{
                    fontFamily: FontFamily.semibold,
                    opacity: selected === index ? 1 : 0.7,
                  }}
                >
                  {option}
                </Footnote>
              </Animated.View>
            </GestureDetector>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    position: "relative",
    overflow: "hidden",
  },
  slider: {
    position: "absolute",
    left: 3,
    top: 3,
    bottom: 3,
    width: "47%",
    borderRadius: 10,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    zIndex: 1,
  },
  tabContent: {
    paddingVertical: 9,
    alignItems: "center",
  },
  tabDisabled: {
    opacity: 0.5,
  },
});
