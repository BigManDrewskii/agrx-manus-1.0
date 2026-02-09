/**
 * SocialFeedPreview — Pro mode social feed preview
 *
 * Shows first 3 posts from social feed with avatar, username, content, P&L badge, likes, and comments.
 *
 * Usage:
 *   <SocialFeedPreview />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SectionHeader } from "@/components/ui/section-header";
import { AnimatedPnLNumber } from "@/components/ui/animated-number";
import { useColors } from "@/hooks/use-colors";
import { Subhead, Caption1, Caption2 } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { SOCIAL_FEED } from "@/lib/mock-data";

export function SocialFeedPreview() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.duration(250).delay(360)} style={styles.section}>
      <SectionHeader
        title="Community"
        actionLabel="See All"
        onAction={() => router.push("/(tabs)/social")}
      />
      {SOCIAL_FEED.slice(0, 3).map((post) => (
        <AnimatedPressable
          key={post.id}
          variant="card"
          style={[
            styles.socialCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityLabel={`Post by ${post.username}`}
          accessibilityHint={`${post.likes} likes, ${post.comments} comments`}
        >
          <View style={styles.socialHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryAlpha }]}>
              <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
                {post.avatar}
              </Caption1>
            </View>
            <View style={styles.socialMeta}>
              <Subhead style={{ fontFamily: FontFamily.semibold }}>{post.username}</Subhead>
              <Caption2 color="muted">{post.timestamp}</Caption2>
            </View>
            {post.pnlPercent !== undefined && (
              <AnimatedPnLNumber value={post.pnlPercent} size="sm" showArrow={false} successColor={colors.success} errorColor={colors.error} mutedColor={colors.muted} />
            )}
          </View>
          <Subhead numberOfLines={2} style={{ marginBottom: 10 }}>
            {post.content}
          </Subhead>
          <View
            style={styles.socialFooter}
            accessibilityRole="text"
            accessibilityLabel={`${post.likes} likes, ${post.comments} comments`}
          >
            <View style={styles.socialStat}>
              <IconSymbol name="star.fill" size={14} color={colors.muted} />
              <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
                {post.likes}
              </Caption1>
            </View>
            <View style={styles.socialStat}>
              <IconSymbol name="paperplane.fill" size={14} color={colors.muted} />
              <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
                {post.comments}
              </Caption1>
            </View>
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
  socialCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  socialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  socialMeta: {
    flex: 1,
  },
  socialFooter: {
    flexDirection: "row",
    gap: 16,
  },
  socialStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
