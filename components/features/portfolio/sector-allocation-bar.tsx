/**
 * SectorAllocationBar — Pro mode sector allocation
 *
 * Shows colored bar with legend for sector breakdown.
 *
 * Usage:
 *   <SectorAllocationBar
 *     sectorAllocation={[
 *       { sector: "Technology", value: 5000, percent: 50, icon: "💻" },
 *       { sector: "Finance", value: 3000, percent: 30, icon: "🏦" },
 *     ]}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { Sector } from "@/lib/sectors";

interface SectorAllocationItem {
  sector: Sector;
  value: number;
  percent: number;
  icon: string;
}

interface SectorAllocationBarProps {
  sectorAllocation: SectorAllocationItem[];
}

export function SectorAllocationBar({ sectorAllocation }: SectorAllocationBarProps) {
  const colors = useColors();
  const barColors = [colors.primary, colors.success, colors.accent, colors.warning, colors.error, colors.muted];

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(330)} style={styles.allocationSection}>
      <Caption1
        color="muted"
        style={{
          fontFamily: FontFamily.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        Allocation
      </Caption1>

      {/* Allocation bar */}
      <View style={[styles.allocationBar, { backgroundColor: colors.surfaceSecondary }]}>
        {sectorAllocation.map((item, i) => {
          const barColor = barColors[i % barColors.length];
          return (
            <View
              key={item.sector}
              style={{
                flex: item.percent,
                height: "100%" as any,
                backgroundColor: barColor,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === sectorAllocation.length - 1 ? 4 : 0,
                borderBottomRightRadius: i === sectorAllocation.length - 1 ? 4 : 0,
              }}
            />
          );
        })}
      </View>

      {/* Allocation legend */}
      <View style={styles.allocationLegend}>
        {sectorAllocation.map((item, i) => {
          const barColor = barColors[i % barColors.length];
          return (
            <View key={item.sector} style={styles.allocationLegendItem}>
              <View style={[styles.allocationDot, { backgroundColor: barColor }]} />
              <Caption1 color="muted" style={{ fontFamily: FontFamily.medium, flex: 1 }}>
                {item.sector}
              </Caption1>
              <Caption1 style={{ fontFamily: FontFamily.monoMedium }}>
                {item.percent.toFixed(1)}%
              </Caption1>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  allocationSection: {
    marginTop: 28,
  },
  allocationBar: {
    marginHorizontal: 20,
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  allocationLegend: {
    marginHorizontal: 20,
    marginTop: 14,
    gap: 10,
  },
  allocationLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  allocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
