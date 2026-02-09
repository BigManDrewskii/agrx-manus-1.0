/**
 * CDSStepper — Quantity stepper following CDS design patterns
 *
 * Clean increment/decrement controls with haptic feedback.
 * Perfect for adjusting quantities, amounts, or values.
 *
 * Usage:
 *   <CDSStepper
 *     value={quantity}
 *     onChange={setQuantity}
 *     min={1}
 *     max={100}
 *     step={1}
 *   />
 */
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { Subhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { IconSymbol } from "./icon-symbol";
import { Spacing } from "@/constants/spacing";

interface CDSStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function CDSStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  disabled = false,
  size = "md",
  showValue = true,
}: CDSStepperProps) {
  const colors = useColors();

  const decrementScale = useSharedValue(1);
  const incrementScale = useSharedValue(1);

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = value - step;
    if (newValue >= min) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = value + step;
    if (newValue <= max) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onChange(newValue);
    }
  };

  const decrementAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: decrementScale.value }],
  }));

  const incrementAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: incrementScale.value }],
  }));

  const decrementGesture = Gesture.Tap()
    .enabled(!disabled && value > min)
    .onBegin(() => {
      "worklet";
      decrementScale.value = withSpring(0.9, { damping: 15, stiffness: 180 });
    })
    .onFinalize(() => {
      "worklet";
      decrementScale.value = withSpring(1, { damping: 15, stiffness: 180 });
    })
    .onEnd(() => {
      "worklet";
      handleDecrement();
    });

  const incrementGesture = Gesture.Tap()
    .enabled(!disabled && value < max)
    .onBegin(() => {
      "worklet";
      incrementScale.value = withSpring(0.9, { damping: 15, stiffness: 180 });
    })
    .onFinalize(() => {
      "worklet";
      incrementScale.value = withSpring(1, { damping: 15, stiffness: 180 });
    })
    .onEnd(() => {
      "worklet";
      handleIncrement();
    });

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { buttonSize: 36, iconSize: 18, fontSize: 16, padding: 8 };
      case "lg":
        return { buttonSize: 52, iconSize: 24, fontSize: 18, padding: 12 };
      default: // md
        return { buttonSize: 44, iconSize: 20, fontSize: 17, padding: 10 };
    }
  };

  const { buttonSize, iconSize, fontSize, padding } = getSizeStyles();

  return (
    <View style={[styles.container, { height: buttonSize }]}>
      {/* Decrement button */}
      <GestureDetector gesture={decrementGesture}>
        <Animated.View
          style={[
            styles.button,
            decrementAnimatedStyle,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: value <= min ? colors.surfaceSecondary : colors.surface,
              opacity: disabled || value <= min ? 0.4 : 1,
            },
          ]}
        >
          <IconSymbol
            name="minus"
            size={iconSize}
            color={disabled || value <= min ? colors.border : colors.foreground}
          />
        </Animated.View>
      </GestureDetector>

      {/* Value display */}
      {showValue && (
        <View style={[styles.valueContainer, { paddingHorizontal: padding }]}>
          <Subhead
            style={{
              fontSize,
              fontFamily: FontFamily.semibold,
              color: disabled ? colors.muted : colors.foreground,
            }}
          >
            {value}
          </Subhead>
        </View>
      )}

      {/* Increment button */}
      <GestureDetector gesture={incrementGesture}>
        <Animated.View
          style={[
            styles.button,
            incrementAnimatedStyle,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: value >= max ? colors.surfaceSecondary : colors.surface,
              opacity: disabled || value >= max ? 0.4 : 1,
            },
          ]}
        >
          <IconSymbol
            name="plus"
            size={iconSize}
            color={disabled || value >= max ? colors.border : colors.foreground}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[3],
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  valueContainer: {
    minWidth: 48,
    alignItems: "center",
  },
});
