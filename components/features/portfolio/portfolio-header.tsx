/**
 * PortfolioHeader — Portfolio screen header
 *
 * Shows title, holding count subtitle, share button, and live badge.
 *
 * Usage:
 *   <PortfolioHeader
 *     holdingCount={5}
 *     hasHoldings={true}
 *     isLive={true}
 *     lastUpdated={1234567890}
 *     onShare={() => setShowShareModal(true)}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LiveBadge } from "@/components/ui/live-badge";
import { useColors } from "@/hooks/use-colors";
import { Title1, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";

interface PortfolioHeaderProps {
  holdingCount: number;
  hasHoldings: boolean;
  isLive: boolean;
  lastUpdated?: number | null;
  onShare: () => void;
}

export function PortfolioHeader({
  holdingCount,
  hasHoldings,
  isLive,
  lastUpdated,
  onShare,
}: PortfolioHeaderProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.header}>
      <View style={styles.headerLeft}>
        <Title1 style={{ letterSpacing: -0.5 }}>Portfolio</Title1>
        {hasHoldings && (
          <Caption1 color="muted" style={{ marginTop: 2, fontFamily: FontFamily.medium }}>
            {holdingCount} holding{holdingCount !== 1 ? "s" : ""}
          </Caption1>
        )}
      </View>
      <View style={styles.headerRight}>
        {hasHoldings && (
          <AnimatedPressable
            variant="icon"
            onPress={onShare}
            style={[
              styles.headerIconButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
            accessibilityLabel="Share portfolio"
            accessibilityHint="Share your portfolio"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.primary} />
          </AnimatedPressable>
        )}
        <LiveBadge isLive={isLive} lastUpdated={lastUpdated} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLeft: {
    gap: 0,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
