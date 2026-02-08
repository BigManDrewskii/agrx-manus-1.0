/**
 * TrendingSection — Trending stocks section
 *
 * Pro: horizontal carousel of trending cards. Simple: top 3 rows.
 *
 * Usage:
 *   <TrendingSection
 *     trendingStocks={stocks}
 *     isPro={true}
 *     isLoading={false}
 *   />
 */
import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SectionHeader } from "@/components/ui/section-header";
import { TrendingCard } from "@/components/ui/trending-card";
import { AssetRow } from "@/components/ui/asset-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useColors } from "@/hooks/use-colors";
import type { LiveStockQuote } from "@/hooks/use-stocks";

interface TrendingSectionProps {
  trendingStocks: LiveStockQuote[];
  isPro: boolean;
  isLoading: boolean;
}

export function TrendingSection({ trendingStocks, isPro, isLoading }: TrendingSectionProps) {
  const colors = useColors();
  const router = useRouter();

  if (isLoading) {
    return (
      <Animated.View entering={FadeInDown.duration(250).delay(240)} style={styles.section}>
        <SectionHeader
          title={isPro ? "Trending on ATHEX" : "Top Movers"}
          actionLabel="See All"
          onAction={() => router.push("/(tabs)/markets")}
        />
        <View style={isPro ? styles.trendingLoading : { paddingHorizontal: 16, gap: 0 }}>
          {(isPro ? [1, 2, 3] : [1, 2, 3]).map((i) =>
            isPro ? (
              <View
                key={i}
                style={[
                  styles.trendingSkeletonCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Skeleton width={32} height={32} borderRadius={16} />
                <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
                <Skeleton width={80} height={10} style={{ marginTop: 4 }} />
                <Skeleton width={50} height={28} style={{ marginTop: 10 }} />
                <Skeleton width={55} height={12} style={{ marginTop: 6 }} />
              </View>
            ) : (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  gap: 12,
                }}
              >
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={{ flex: 1 }}>
                  <Skeleton width={80} height={14} />
                  <Skeleton width={50} height={10} style={{ marginTop: 4 }} />
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Skeleton width={60} height={14} />
                  <Skeleton width={40} height={10} style={{ marginTop: 4 }} />
                </View>
              </View>
            ),
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(240)} style={styles.section}>
      <SectionHeader
        title={isPro ? "Trending on ATHEX" : "Top Movers"}
        actionLabel="See All"
        onAction={() => router.push("/(tabs)/markets")}
      />
      {isPro ? (
        <FlatList
          data={trendingStocks}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrendingCard
              asset={{
                id: item.id,
                ticker: item.ticker,
                name: item.name,
                price: item.price,
                change: item.change,
                changePercent: item.changePercent,
                sparkline: item.sparkline,
                category: item.category,
              }}
              onPress={() =>
                router.push({
                  pathname: "/asset/[id]" as any,
                  params: { id: item.id },
                })
              }
            />
          )}
        />
      ) : (
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {trendingStocks.slice(0, 3).map((stock) => (
            <AssetRow
              key={stock.id}
              asset={stock}
              showSparkline={false}
              onPress={() =>
                router.push({
                  pathname: "/asset/[id]" as any,
                  params: { id: stock.id },
                })
              }
            />
          ))}
        </View>
      )}
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
  trendingList: {
    paddingHorizontal: 16,
  },
  trendingLoading: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingSkeletonCard: {
    width: 148,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
});
