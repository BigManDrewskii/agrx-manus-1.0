/**
 * CDSChip — Coinbase Design System Chip with AGRX haptics
 *
 * Wraps CDS Chip component with AGRX's superior haptic feedback.
 * Maintains CDS styling while adding consistent press feedback.
 *
 * Usage:
 *   <CDSChip
 *     label="Banks"
 *     selected={isActive}
 *     onPress={() => onSelect("Banks")}
 *   />
 */
import React from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { Caption1, Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface CDSChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  testID?: string;
  count?: number; // Optional badge count
}

export function CDSChip({
  label,
  selected = false,
  disabled = false,
  onPress,
  testID,
  count,
}: CDSChipProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      "worklet";
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    })
    .onFinalize(() => {
      "worklet";
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    })
    .onEnd(() => {
      "worklet";
      if (onPress) {
        runOnJS(handlePress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        testID={testID}
        style={[
          styles.chip,
          animatedStyle,
          {
            backgroundColor: selected ? colors.primary : colors.surface,
            borderColor: selected ? colors.primary : colors.border,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        <Caption1
          color={selected ? "onPrimary" : "foreground"}
          style={{
            fontFamily: selected ? FontFamily.bold : FontFamily.medium,
          }}
        >
          {label}
        </Caption1>
        {count !== undefined && (
          <Caption2
            color={selected ? "onPrimary" : "muted"}
            style={{ fontFamily: FontFamily.medium }}
          >
            {count}
          </Caption2>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
});

