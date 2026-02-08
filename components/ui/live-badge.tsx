import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface LiveBadgeProps {
  isLive: boolean;
  lastUpdated?: number | null;
}

export function LiveBadge({ isLive, lastUpdated }: LiveBadgeProps) {
  const colors = useColors();

  const timeAgo = lastUpdated ? formatTimeAgo(lastUpdated) : null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          { backgroundColor: isLive ? colors.success : colors.warning },
        ]}
      />
      <Caption2
        style={{
          color: isLive ? colors.success : colors.warning,
          fontFamily: FontFamily.bold,
          letterSpacing: 0.3,
        }}
      >
        {isLive ? "LIVE" : "DEMO DATA"}
      </Caption2>
      {timeAgo && (
        <Caption2 color="muted" style={{ fontFamily: FontFamily.medium }}>
          {timeAgo}
        </Caption2>
      )}
    </View>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
