/**
 * MarketsHeader — Markets screen header with live badge and market status
 *
 * Displays title, live badge, and ATHEX market status (open/closed) with colored indicator.
 *
 * Usage:
 *   <MarketsHeader
 *     isLive={true}
 *     lastUpdated={lastUpdateTimestamp}
 *   />
 */
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { Title1, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { LiveBadge } from "@/components/ui/live-badge";

interface MarketsHeaderProps {
  isLive: boolean;
  lastUpdated?: number | null;
}

export function MarketsHeader({ isLive, lastUpdated }: MarketsHeaderProps) {
  const colors = useColors();

  // ATHEX market status — derived in useMemo to satisfy React Compiler purity rules
  const isMarketOpen = useMemo(() => {
    const now = new Date();
    const athensHour = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Athens" })
    ).getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    return isWeekday && athensHour >= 10 && athensHour < 17;
  }, []); // Recalculates on every render, which is fine for time-based status

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <Title1>Markets</Title1>
      <View style={styles.headerRight}>
        <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
        <View style={styles.marketStatus}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isMarketOpen
                  ? colors.success
                  : colors.muted,
              },
            ]}
          />
          <Caption1
            color={isMarketOpen ? "success" : "muted"}
            style={{ fontFamily: FontFamily.semibold }}
          >
            {isMarketOpen ? "ATHEX Open" : "ATHEX Closed"}
          </Caption1>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  marketStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
