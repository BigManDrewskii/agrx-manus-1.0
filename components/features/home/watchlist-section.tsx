/**
 * WatchlistSection — Watchlist section
 *
 * Shows user's watchlisted stocks in a list card. Empty state for Simple mode when no watchlist.
 *
 * Usage:
 *   <WatchlistSection
 *     watchlistedStocks={stocks}
 *     isPro={true}
 *     isLoading={false}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SectionHeader } from "@/components/ui/section-header";
import { AssetRow } from "@/components/ui/asset-row";
import { useColors } from "@/hooks/use-colors";
import { Subhead, Caption1 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { LiveStockQuote } from "@/hooks/use-stocks";

interface WatchlistSectionProps {
  watchlistedStocks: LiveStockQuote[];
  isPro: boolean;
  isLoading: boolean;
}

export function WatchlistSection({ watchlistedStocks, isPro, isLoading }: WatchlistSectionProps) {
  const colors = useColors();
  const router = useRouter();

  if (watchlistedStocks.length === 0 && !isLoading && !isPro) {
    return (
      <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.section}>
        <SectionHeader title="Watchlist" />
        <AnimatedPressable
          variant="card"
          onPress={() => router.push("/(tabs)/markets")}
          style={[
            styles.emptyWatchlistCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          accessibilityLabel="Browse markets to add stocks to watchlist"
          accessibilityHint="Opens Markets screen where you can star stocks"
        >
          <IconSymbol name="star.fill" size={24} color={colors.border} />
          <Subhead color="muted" style={{ fontFamily: FontFamily.medium, marginTop: 8 }}>
            Star stocks from Markets to add them here
          </Subhead>
          <Caption1 color="primary" style={{ fontFamily: FontFamily.semibold, marginTop: 4 }}>
            Browse Markets →
          </Caption1>
        </AnimatedPressable>
      </Animated.View>
    );
  }

  if (watchlistedStocks.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(180)} style={styles.section}>
      <SectionHeader
        title="Watchlist"
        actionLabel="Edit"
        onAction={() => router.push("/(tabs)/markets")}
      />
      <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {watchlistedStocks.map((stock) => (
          <AssetRow
            key={stock.id}
            asset={stock}
            showSparkline={isPro}
            showStar={false}
            onPress={() =>
              router.push({
                pathname: "/asset/[id]" as any,
                params: { id: stock.id },
              })
            }
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  listCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  emptyWatchlistCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
});
