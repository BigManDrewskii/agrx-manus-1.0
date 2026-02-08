import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.action, { color: colors.primary }]}>
            {actionLabel}
          </Text>
        </Pressable>
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  action: {
    fontSize: 14,
    fontWeight: "600",
  },
});
