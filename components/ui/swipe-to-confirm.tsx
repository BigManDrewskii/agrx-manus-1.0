import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, Platform, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  interpolateColor,
  runOnJS,
  Easing,
  clamp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { FontFamily } from "@/constants/typography";
import { Callout, Caption1 } from "@/components/ui/typography";

// ─── Constants ──────────────────────────────────────────────────────────
const THUMB_SIZE = 52;
const TRACK_HEIGHT = 56;
const TRACK_PADDING = 2;
const COMPLETION_THRESHOLD = 0.85; // 85% of track to trigger
const HAPTIC_MILESTONES = [0.25, 0.5, 0.75]; // light haptic at these points

interface SwipeToConfirmProps {
  /** Text displayed on the track (e.g., "Slide to Buy €50.00 OPAP") */
  label: string;
  /** Whether the component is in a valid/enabled state */
  enabled?: boolean;
  /** Called when the user completes the swipe */
  onConfirm: () => void;
  /** Color variant: 'buy' (green) or 'sell' (red) */
  variant?: "buy" | "sell";
  /** Text to show when disabled */
  disabledLabel?: string;
}

export function SwipeToConfirm({
  label,
  enabled = true,
  onConfirm,
  variant = "buy",
  disabledLabel = "Enter an amount",
}: SwipeToConfirmProps) {
  const colors = useColors();

  // ─── Shared values ──────────────────────────────────────────────────
  const translateX = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const isCompleted = useSharedValue(false);
  const lastMilestone = useSharedValue(0);
  const thumbScale = useSharedValue(1);

  // Max distance the thumb can travel
  const maxTranslateX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;

  // Reset when enabled state changes
  useEffect(() => {
    translateX.value = withTiming(0, { duration: 200 });
    isCompleted.value = false;
    lastMilestone.value = 0;
    thumbScale.value = 1;
  }, [enabled, label]);

  // ─── Haptic helpers (run on JS thread) ──────────────────────────────
  const triggerLightHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const triggerMediumHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const triggerSuccessHaptic = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  // ─── Confirm handler (run on JS thread) ─────────────────────────────
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  // ─── Track layout measurement ───────────────────────────────────────
  const onTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidth.value = event.nativeEvent.layout.width;
    },
    [trackWidth]
  );

  // ─── Pan gesture ────────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onBegin(() => {
      thumbScale.value = withTiming(1.05, { duration: 80 });
      runOnJS(triggerLightHaptic)();
    })
    .onChange((event) => {
      if (isCompleted.value) return;

      const maxX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;
      if (maxX <= 0) return;

      const newX = clamp(event.translationX, 0, maxX);
      translateX.value = newX;

      // Check milestones for haptic feedback
      const progress = newX / maxX;
      for (const milestone of HAPTIC_MILESTONES) {
        if (progress >= milestone && lastMilestone.value < milestone) {
          lastMilestone.value = milestone;
          runOnJS(triggerLightHaptic)();
        }
      }
    })
    .onEnd(() => {
      const maxX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;
      if (maxX <= 0) return;

      const progress = translateX.value / maxX;

      if (progress >= COMPLETION_THRESHOLD) {
        // ✅ Completed — snap to end, trigger confirm
        isCompleted.value = true;
        translateX.value = withTiming(maxX, { duration: 150 });
        thumbScale.value = withSequence(
          withTiming(1.15, { duration: 100 }),
          withTiming(1, { duration: 150 })
        );
        runOnJS(triggerSuccessHaptic)();
        runOnJS(handleConfirm)();
      } else {
        // ❌ Not enough — spring back to start
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
          mass: 0.8,
        });
        lastMilestone.value = 0;
        runOnJS(triggerMediumHaptic)();
      }
    })
    .onFinalize(() => {
      thumbScale.value = withTiming(1, { duration: 100 });
    });

  // ─── Animated styles ────────────────────────────────────────────────

  // Track fill color (progress bar behind thumb)
  const activeColor = variant === "buy" ? colors.success : colors.error;
  const activeColorAlpha =
    variant === "buy" ? colors.successAlpha : colors.errorAlpha;

  // Thumb position
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: thumbScale.value },
    ],
  }));

  // Progress fill behind the thumb
  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE + TRACK_PADDING,
  }));

  // Label opacity — fades as thumb moves
  const labelStyle = useAnimatedStyle(() => {
    const maxX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;
    const progress = maxX > 0 ? translateX.value / maxX : 0;
    return {
      opacity: interpolate(progress, [0, 0.4], [1, 0]),
    };
  });

  // Chevrons animation — subtle shimmer effect
  const chevronStyle = useAnimatedStyle(() => {
    const maxX = trackWidth.value - THUMB_SIZE - TRACK_PADDING * 2;
    const progress = maxX > 0 ? translateX.value / maxX : 0;
    return {
      opacity: interpolate(progress, [0, 0.3], [0.4, 0]),
    };
  });

  // Checkmark on completion
  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: isCompleted.value ? withTiming(1, { duration: 200 }) : 0,
      transform: [
        {
          scale: isCompleted.value
            ? withSpring(1, { damping: 12, stiffness: 200 })
            : 0.5,
        },
      ],
    };
  });

  // Arrow icon on thumb — hides on completion
  const arrowStyle = useAnimatedStyle(() => {
    return {
      opacity: isCompleted.value ? withTiming(0, { duration: 150 }) : 1,
    };
  });

  // ─── Disabled state ─────────────────────────────────────────────────
  if (!enabled) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.track,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Callout
            color="muted"
            style={{ fontFamily: FontFamily.semibold, textAlign: "center" }}
          >
            {disabledLabel}
          </Callout>
        </View>
      </View>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: activeColorAlpha,
            borderColor: activeColor + "30",
          },
        ]}
        onLayout={onTrackLayout}
      >
        {/* Progress fill */}
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: activeColor + "18" },
            fillStyle,
          ]}
        />

        {/* Label text */}
        <Animated.View style={[styles.labelContainer, labelStyle]}>
          <Callout
            style={{
              fontFamily: FontFamily.semibold,
              color: activeColor,
              textAlign: "center",
            }}
          >
            {label}
          </Callout>
        </Animated.View>

        {/* Chevron hints (>>>) */}
        <Animated.View style={[styles.chevronContainer, chevronStyle]}>
          <View style={styles.chevronGroup}>
            <IconSymbol
              name="chevron.right"
              size={14}
              color={activeColor}
              style={{ opacity: 0.4 }}
            />
            <IconSymbol
              name="chevron.right"
              size={14}
              color={activeColor}
              style={{ opacity: 0.6 }}
            />
            <IconSymbol
              name="chevron.right"
              size={14}
              color={activeColor}
              style={{ opacity: 0.8 }}
            />
          </View>
        </Animated.View>

        {/* Completion checkmark (centered in track) */}
        <Animated.View style={[styles.completionCheck, checkmarkStyle]}>
          <IconSymbol name="checkmark" size={24} color={activeColor} />
        </Animated.View>

        {/* Draggable thumb */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: activeColor,
                shadowColor: activeColor,
              },
              thumbStyle,
            ]}
          >
            {/* Arrow icon */}
            <Animated.View style={arrowStyle}>
              <IconSymbol
                name="chevron.right"
                size={22}
                color={colors.onPrimary}
              />
            </Animated.View>

            {/* Checkmark icon (on completion) */}
            <Animated.View style={[styles.thumbCheckmark, checkmarkStyle]}>
              <IconSymbol name="checkmark" size={22} color={colors.onPrimary} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: TRACK_HEIGHT / 2,
  },
  labelContainer: {
    position: "absolute",
    left: THUMB_SIZE + TRACK_PADDING + 8,
    right: 16,
    alignItems: "center",
  },
  chevronContainer: {
    position: "absolute",
    right: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronGroup: {
    flexDirection: "row",
    gap: -4,
  },
  completionCheck: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    position: "absolute",
    left: TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbCheckmark: {
    position: "absolute",
  },
});
