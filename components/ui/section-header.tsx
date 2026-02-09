import React from "react";
import { View, StyleSheet } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { Title3, Subhead } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Title3 style={{ fontSize: 18, letterSpacing: -0.3 }}>{title}</Title3>
      {actionLabel && onAction && (
        <AnimatedPressable
          variant="icon"
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Subhead color="primary" style={{ fontFamily: FontFamily.semibold, fontSize: 14 }}>
            {actionLabel}
          </Subhead>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
