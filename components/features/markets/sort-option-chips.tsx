/**
 * SortOptionChips — Horizontal sort mode selector chips
 *
 * Sort options for stock list: Default, Top Gainers, Top Losers, Volume, A → Z
 * Now using CDS-styled chips with AGRX haptic feedback.
 *
 * Usage:
 *   <SortOptionChips
 *     sortMode="gainers"
 *     onSortChange={(mode) => setSortMode(mode)}
 *     stockCount={42}
 *   />
 */
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CDSChip } from "@/components/ui/cds-chip";
import { useColors } from "@/hooks/use-colors";
import { Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

type SortMode = "default" | "gainers" | "losers" | "volume" | "alpha";

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "gainers", label: "Top Gainers" },
  { key: "losers", label: "Top Losers" },
  { key: "volume", label: "Volume" },
  { key: "alpha", label: "A → Z" },
];

interface SortOptionChipsProps {
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  stockCount: number;
  /** Animation delay in ms (default: 180) */
  animationDelay?: number;
}

export function SortOptionChips({
  sortMode,
  onSortChange,
  stockCount,
  animationDelay = 180,
}: SortOptionChipsProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(animationDelay)} style={styles.container}>
      <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
        {stockCount} {stockCount === 1 ? "stock" : "stocks"}
      </Caption1>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      >
        {SORT_OPTIONS.map((opt) => (
          <CDSChip
            key={opt.key}
            label={opt.label}
            selected={sortMode === opt.key}
            onPress={() => onSortChange(opt.key)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingBottom: 10,
    gap: 12,
  },
  chipList: {
    gap: 8,
    paddingRight: 16,
  },
});
