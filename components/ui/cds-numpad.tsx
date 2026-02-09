/**
 * CDSNumpad — Numeric keypad following CDS design patterns
 *
 * Clean numeric input pad with haptic feedback and CDS styling.
 * Perfect for amount entry in trading flows.
 *
 * Usage:
 *   <CDSNumpad
 *     onKeyPress={(key) => handleInput(key)}
 *     onDelete={() => deleteChar()}
 *     onSubmit={() => submit()}
 *   />
 */
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { Title2, Subhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { IconSymbol } from "./icon-symbol";

export type NumpadKey =
  | "1" | "2" | "3"
  | "4" | "5" | "6"
  | "7" | "8" | "9"
  | "." | "0"
  | "delete" | "submit";

interface CDSNumpadProps {
  onKeyPress: (key: string) => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  submitText?: string;
  disabled?: boolean;
}

const NUMPAD_LAYOUT: NumpadKey[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "delete"],
];

export function CDSNumpad({
  onKeyPress,
  onDelete,
  onSubmit,
  submitText = "Done",
  disabled = false,
}: CDSNumpadProps) {
  const colors = useColors();

  const handleKeyPress = (key: NumpadKey) => {
    if (disabled) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (key === "delete") {
      onDelete?.();
    } else if (key === "submit") {
      onSubmit?.();
    } else {
      onKeyPress(key);
    }
  };

  const NumpadKey = ({ keyValue, index }: { keyValue: NumpadKey; index: number }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const tapGesture = Gesture.Tap()
      .enabled(!disabled)
      .onBegin(() => {
        "worklet";
        scale.value = withSpring(0.92, { damping: 15, stiffness: 180 });
      })
      .onFinalize(() => {
        "worklet";
        scale.value = withSpring(1, { damping: 15, stiffness: 180 });
      })
      .onEnd(() => {
        "worklet";
        handleKeyPress(keyValue);
      });

    const isActionKey = keyValue === "delete" || keyValue === "submit";
    const isSubmit = keyValue === "submit";

    return (
      <GestureDetector key={index} gesture={tapGesture}>
        <Animated.View
          style={[
            styles.key,
            animatedStyle,
            isActionKey && styles.actionKey,
            isSubmit && styles.submitKey,
            disabled && styles.keyDisabled,
          ]}
        >
          {keyValue === "delete" ? (
            <IconSymbol
              name="delete.left"
              size={24}
              color={disabled ? colors.border : colors.muted}
            />
          ) : (
            <Title2
              style={{
                color: isSubmit
                  ? colors.onPrimary
                  : disabled
                  ? colors.border
                  : colors.foreground,
                fontFamily: FontFamily.medium,
              }}
            >
              {keyValue === "submit" ? submitText : keyValue}
            </Title2>
          )}
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <View style={styles.container}>
      {NUMPAD_LAYOUT.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((keyValue, keyIndex) => (
            <NumpadKey key={`${rowIndex}-${keyIndex}`} keyValue={keyValue} index={keyIndex} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  key: {
    flex: 1,
    aspectRatio: 1.5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#ffffff10",
  },
  actionKey: {
    backgroundColor: "transparent",
  },
  submitKey: {
    backgroundColor: "#0052FF",
  },
  keyDisabled: {
    opacity: 0.3,
  },
});
