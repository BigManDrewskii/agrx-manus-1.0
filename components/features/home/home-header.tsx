/**
 * HomeHeader — Home screen header
 *
 * Shows greeting, mode toggle, streak badge (Pro), live badge (Pro), notifications bell with badge, and settings button.
 *
 * Usage:
 *   <HomeHeader
 *     greeting="Good morning"
 *     userName="Andreas"
 *     isPro={true}
 *     isLive={true}
 *     lastUpdated={1234567890}
 *     userStreak={7}
 *     unreadCount={3}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiveBadge } from "@/components/ui/live-badge";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { useColors } from "@/hooks/use-colors";
import { Footnote, Title2, Caption1, Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface HomeHeaderProps {
  greeting: string;
  userName: string;
  isPro: boolean;
  isLive: boolean;
  lastUpdated?: number | null;
  userStreak: number;
  unreadCount: number;
}

export function HomeHeader({
  greeting,
  userName,
  isPro,
  isLive,
  lastUpdated,
  userStreak,
  unreadCount,
}: HomeHeaderProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Footnote color="muted">{greeting}</Footnote>
          <Title2>{userName}</Title2>
        </View>
        <View style={styles.headerActions}>
          {isPro && <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />}
          {isPro && (
            <View style={styles.streakBadge}>
              <IconSymbol name="flame.fill" size={14} color={colors.warning} />
              <Caption1
                color="warning"
                style={{ fontFamily: FontFamily.bold, fontVariant: ["tabular-nums"] }}
              >
                {userStreak}
              </Caption1>
            </View>
          )}
          <AnimatedPressable
            variant="icon"
            onPress={() => router.push("/notification-history" as any)}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <IconSymbol
              name="bell.fill"
              size={18}
              color={unreadCount > 0 ? colors.primary : colors.muted}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Caption2
                  style={{
                    color: colors.onPrimary,
                    fontFamily: FontFamily.bold,
                    fontSize: 9,
                    lineHeight: 12,
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Caption2>
              </View>
            )}
          </AnimatedPressable>
          <AnimatedPressable
            variant="icon"
            onPress={() => router.push("/settings" as any)}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <IconSymbol name="gearshape.fill" size={18} color={colors.muted} />
          </AnimatedPressable>
        </View>
      </View>
      {/* Mode toggle — sits below greeting row */}
      <View style={styles.modeToggleRow}>
        <ViewModeToggle compact />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    gap: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 1,
    right: 1,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  modeToggleRow: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
});
