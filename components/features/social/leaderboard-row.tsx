/**
 * LeaderboardRow — Leaderboard entry display
 *
 * Shows rank, avatar, username, stats (trades, streak), and return percentage.
 * Top 3 ranks get special colored treatment (gold, silver, bronze).
 *
 * Usage:
 *   <LeaderboardRow
 *     entry={leaderboardData}
 *     index={0}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";
import { useColors } from "@/hooks/use-colors";
import { AnimatedPnLNumber } from "@/components/ui/animated-number";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Subhead, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { LeaderboardEntry } from "@/lib/mock-data";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
}

export function LeaderboardRow({ entry, index }: LeaderboardRowProps) {
  const colors = useColors();
  const isTop3 = entry.rank <= 3;
  const rankColors = ["", colors.gold, colors.silver, colors.bronze];

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(Math.min(index, STAGGER_MAX) * STAGGER_DELAY)}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      {/* Rank */}
      <View style={styles.rank}>
        <Subhead
          style={{
            color: isTop3 ? rankColors[entry.rank] : colors.muted,
            fontFamily: isTop3 ? FontFamily.monoBold : FontFamily.monoMedium,
            fontSize: 16,
          }}
        >
          {entry.rank}
        </Subhead>
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.primaryAlpha }]}>
        <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
          {entry.avatar}
        </Caption1>
      </View>

      {/* User info */}
      <View style={styles.info}>
        <Subhead style={{ fontFamily: FontFamily.semibold, marginBottom: 2 }}>
          {entry.username}
        </Subhead>
        <View style={styles.stats}>
          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
            {entry.trades} trades
          </Caption1>
          <Caption1 color="muted"> · </Caption1>
          <IconSymbol name="flame.fill" size={12} color={colors.warning} />
          <Caption1 style={{ color: colors.warning, fontFamily: FontFamily.medium }}>
            {entry.streak}
          </Caption1>
        </View>
      </View>

      {/* Return % */}
      <AnimatedPnLNumber
        value={entry.returnPercent}
        size="md"
        showArrow={false}
        successColor={colors.success}
        errorColor={colors.error}
        mutedColor={colors.muted}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  rank: {
    width: 28,
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
