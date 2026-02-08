/**
 * EmptyStateCard — Consistent empty state display
 *
 * Used across screens when there's no content to display.
 * Supports optional icon, title, description, and CTA button.
 *
 * Usage:
 *   <EmptyStateCard
 *     icon="chart.bar.fill"
 *     title="No Holdings Yet"
 *     description="Start trading to build your portfolio"
 *     buttonText="Start Trading"
 *     onPress={() => router.push("/trade")}
 *   />
 */
import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Headline, Footnote, Subhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface EmptyStateCardProps {
  /** SF Symbol name for the icon */
  icon?: React.ComponentProps<typeof IconSymbol>["name"];
  /** Main heading text */
  title: string;
  /** Supporting description */
  description?: string;
  /** Optional button text */
  buttonText?: string;
  /** Button press handler */
  onPress?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Icon size (default: 36) */
  iconSize?: number;
  /** Use circular icon background (default: true) */
  circularIcon?: boolean;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  buttonText,
  onPress,
  style,
  iconSize = 36,
  circularIcon = true,
}: EmptyStateCardProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay(120)}
      style={[styles.container, style]}
    >
      {icon && (
        <View
          style={[
            styles.iconContainer,
            circularIcon && styles.circularIcon,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <IconSymbol name={icon} size={iconSize} color={colors.muted} />
        </View>
      )}
      <Headline style={{ marginTop: 20, marginBottom: 8 }}>{title}</Headline>
      {description && (
        <Footnote
          color="muted"
          style={{
            textAlign: "center",
            maxWidth: 280,
            lineHeight: 20,
            paddingHorizontal: 24,
          }}
        >
          {description}
        </Footnote>
      )}
      {buttonText && onPress && (
        <AnimatedPressable
          variant="button"
          onPress={onPress}
          style={[
            styles.button,
            { backgroundColor: colors.primary },
          ]}
        >
          <IconSymbol name="plus.circle.fill" size={18} color={colors.onPrimary} />
          <Subhead style={{ color: colors.onPrimary, fontFamily: FontFamily.semibold }}>
            {buttonText}
          </Subhead>
        </AnimatedPressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  iconContainer: {
    padding: 20,
    borderRadius: 16,
  },
  circularIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
