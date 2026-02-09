/**
 * CardList — Grouped card container with hairline dividers
 *
 * Reusable container for displaying a list of items within a bordered card.
 * Each item should handle its own border styling if needed.
 *
 * Usage:
 *   <CardList>
 *     <AssetRow {...stock1} />
 *     <AssetRow {...stock2} />
 *   </CardList>
 */
import React, { ReactNode } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface CardListProps {
  children: ReactNode;
  style?: ViewStyle;
  /** Optional padding override (default: 0) */
  contentPadding?: number;
  /** Optional border radius override (default: 14) */
  borderRadius?: number;
}

export function CardList({
  children,
  style,
  contentPadding = 0,
  borderRadius = 14,
}: CardListProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius,
        },
        style,
      ]}
    >
      <View style={{ padding: contentPadding }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: "hidden",
  },
});
