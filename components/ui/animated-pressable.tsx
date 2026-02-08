/**
 * AnimatedPressable — Consistent press feedback component
 *
 * Drop-in replacement for Pressable/TouchableOpacity with spring-based
 * press feedback following the AGRX motion language.
 *
 * Usage:
 *   <AnimatedPressable variant="button" onPress={handlePress}>
 *     <Text>Submit</Text>
 *   </AnimatedPressable>
 */
import React, { useCallback } from "react";
import { Platform, type ViewStyle, type StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { SPRING_SNAPPY, TIMING_INSTANT, PRESS } from "@/lib/animations";

type PressVariant = keyof typeof PRESS;

interface AnimatedPressableProps {
  children?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: PressVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  /** Hit slop for expanding touch area */
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
  /** Optional test ID */
  testID?: string;
}

const HAPTIC_MAP: Record<PressVariant, Haptics.ImpactFeedbackStyle | null> = {
  button: Haptics.ImpactFeedbackStyle.Light,
  card: null,
  icon: Haptics.ImpactFeedbackStyle.Light,
  chip: Haptics.ImpactFeedbackStyle.Light,
  toggle: Haptics.ImpactFeedbackStyle.Light,
  destructive: Haptics.ImpactFeedbackStyle.Medium,
};

export function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  variant = "button",
  disabled = false,
  style,
  haptic = true,
  hapticStyle,
  hitSlop,
  testID,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pressed = PRESS[variant];

  const handlePress = useCallback(() => {
    if (haptic && Platform.OS !== "web") {
      const feedbackStyle = hapticStyle ?? HAPTIC_MAP[variant];
      if (feedbackStyle !== null) {
        Haptics.impactAsync(feedbackStyle);
      }
    }
    onPress?.();
  }, [haptic, hapticStyle, variant, onPress]);

  const handleLongPress = useCallback(() => {
    if (haptic && Platform.OS !== "web") {
      const feedbackStyle = hapticStyle ?? HAPTIC_MAP[variant];
      if (feedbackStyle !== null) {
        Haptics.impactAsync(feedbackStyle);
      }
    }
    onLongPress?.();
  }, [haptic, hapticStyle, variant, onLongPress]);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      "worklet";
      scale.value = withSpring(pressed.scale, SPRING_SNAPPY);
      opacity.value = withTiming(pressed.opacity, TIMING_INSTANT);
    })
    .onFinalize(() => {
      "worklet";
      scale.value = withSpring(1, SPRING_SNAPPY);
      opacity.value = withTiming(1, TIMING_INSTANT);
    })
    .onEnd(() => {
      "worklet";
      if (onPress) {
        runOnJS(handlePress)();
      }
    });

  const longPressGesture = onLongPress
    ? Gesture.LongPress()
        .enabled(!disabled)
        .minDuration(400)
        .onStart(() => {
          "worklet";
          runOnJS(handleLongPress)();
        })
    : undefined;

  const composedGesture = longPressGesture
    ? Gesture.Race(tapGesture, longPressGesture)
    : tapGesture;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        testID={testID}
        hitSlop={hitSlop}
        style={[animatedStyle, disabled && { opacity: 0.4 }, style]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
