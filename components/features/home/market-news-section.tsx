/**
 * MarketNewsSection — Market news section
 *
 * Shows news article cards with title, source, and timestamp.
 *
 * Usage:
 *   <MarketNewsSection
 *     marketNews={articles}
 *     isLoading={false}
 *     isSimple={true}
 *   />
 */
import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { Skeleton } from "@/components/ui/skeleton";
import { useColors } from "@/hooks/use-colors";
import { Subhead, Caption1, Footnote } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { NewsArticle } from "@/server/newsService";

interface MarketNewsSectionProps {
  marketNews: NewsArticle[];
  isLoading: boolean;
  isSimple: boolean;
}

export function MarketNewsSection({ marketNews, isLoading, isSimple }: MarketNewsSectionProps) {
  const colors = useColors();

  if (isLoading) {
    return (
      <Animated.View entering={FadeInDown.duration(250).delay(300)} style={styles.section}>
        <SectionHeader title="Market News" />
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {[1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.newsCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Skeleton width="100%" height={14} borderRadius={4} />
              <Skeleton width="70%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <Skeleton width={80} height={10} borderRadius={4} />
                <Skeleton width={50} height={10} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  }

  if (marketNews.length === 0) {
    return (
      <Animated.View entering={FadeInDown.duration(250).delay(300)} style={styles.section}>
        <SectionHeader title="Market News" />
        <View
          style={[
            styles.newsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              alignItems: "center",
              paddingVertical: 20,
              marginHorizontal: 16,
            },
          ]}
        >
          <Footnote color="muted" style={{ fontFamily: FontFamily.medium }}>
            No market news available
          </Footnote>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(300)} style={styles.section}>
      <SectionHeader
        title="Market News"
        actionLabel={!isSimple && marketNews.length > 4 ? "See All" : undefined}
      />
      {marketNews.slice(0, isSimple ? 2 : 4).map((article, index) => (
        <AnimatedPressable
          key={`${article.url}-${index}`}
          variant="card"
          onPress={() => {
            if (article.url) Linking.openURL(article.url).catch(() => {});
          }}
          style={[
            styles.newsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Subhead style={{ fontFamily: FontFamily.semibold, lineHeight: 20 }} numberOfLines={2}>
            {article.title}
          </Subhead>
          <View style={styles.newsMetaRow}>
            <Caption1 color="primary" style={{ fontFamily: FontFamily.semibold }}>
              {article.source}
            </Caption1>
            <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
              {article.relativeTime}
            </Caption1>
          </View>
        </AnimatedPressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  newsMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
});
