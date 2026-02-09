/**
 * SectorFilterChips — Horizontal scrollable sector filter chips
 *
 * Filter chips for "All", "Watchlist", and sector categories with badges showing counts.
 * Now using CDS-styled chips with AGRX haptic feedback.
 *
 * Usage:
 *   <SectorFilterChips
 *     activeFilter="All"
 *     onFilterChange={(filter) => setActiveFilter(filter)}
 *     sectorCounts={{ All: 135, "Banks": 25, ... }}
 *     watchlistCount={5}
 *   />
 */
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CDSChip } from "@/components/ui/cds-chip";
import { SECTORS, SECTOR_ICONS } from "@/lib/sectors";

type FilterMode = "All" | "Watchlist" | string;

interface SectorFilterChipsProps {
  activeFilter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
  sectorCounts: Record<string, number>;
  watchlistCount: number;
  /** Animation delay in ms (default: 120) */
  animationDelay?: number;
}

export function SectorFilterChips({
  activeFilter,
  onFilterChange,
  sectorCounts,
  watchlistCount,
  animationDelay = 120,
}: SectorFilterChipsProps) {
  return (
    <Animated.View entering={FadeInDown.duration(250).delay(animationDelay)} style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      >
        {/* "All" chip */}
        <CDSChip
          label="All"
          count={sectorCounts.All ?? 0}
          selected={activeFilter === "All"}
          onPress={() => onFilterChange("All")}
        />

        {/* Watchlist chip */}
        <CDSChip
          label="★ Watchlist"
          count={watchlistCount}
          selected={activeFilter === "Watchlist"}
          onPress={() => onFilterChange("Watchlist")}
        />

        {/* Sector chips */}
        {SECTORS.map((sector) => {
          const isActive = activeFilter === sector;
          const count = sectorCounts[sector] ?? 0;
          if (count === 0) return null;
          return (
            <CDSChip
              key={sector}
              label={`${SECTOR_ICONS[sector]} ${sector}`}
              count={count}
              selected={isActive}
              onPress={() => onFilterChange(sector)}
            />
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  chipList: {
    paddingHorizontal: 16,
    gap: 8,
  },
});
