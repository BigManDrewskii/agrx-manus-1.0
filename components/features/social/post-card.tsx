/**
 * PostCard — Social feed post display
 *
 * Shows a user's post with avatar, username, content, P&L badge (if applicable),
 * and engagement actions (likes, comments, share).
 *
 * Usage:
 *   <PostCard
 *     post={postData}
 *     index={0}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { STAGGER_DELAY, STAGGER_MAX } from "@/lib/animations";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { AnimatedPnLNumber } from "@/components/ui/animated-number";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Body, Subhead, Caption1, Caption2, Footnote } from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import type { SocialPost } from "@/lib/mock-data";

interface PostCardProps {
  post: SocialPost;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInDown.duration(250).delay(Math.min(index, STAGGER_MAX) * STAGGER_DELAY)}
      style={[
        styles.postCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Header: avatar + username + timestamp + P&L badge */}
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryAlpha }]}>
          <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
            {post.avatar}
          </Caption1>
        </View>
        <View style={styles.postMeta}>
          <Subhead style={{ fontFamily: FontFamily.semibold }}>{post.username}</Subhead>
          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>{post.timestamp}</Caption1>
        </View>
        {post.pnlPercent !== undefined && (
          <View
            style={[
              styles.pnlBadge,
              {
                backgroundColor:
                  post.pnlPercent >= 0 ? colors.successAlpha : colors.errorAlpha,
              },
            ]}
          >
            <AnimatedPnLNumber
              value={post.pnlPercent}
              size="sm"
              showArrow={false}
              successColor={colors.success}
              errorColor={colors.error}
              mutedColor={colors.muted}
            />
          </View>
        )}
      </View>

      {/* Post content */}
      <Body style={{ lineHeight: 21, marginBottom: 10 }}>{post.content}</Body>

      {/* Asset tag (if present) */}
      {post.assetTag && (
        <View style={[styles.assetTag, { backgroundColor: colors.primaryAlpha }]}>
          <Footnote color="primary" style={{ fontFamily: FontFamily.semibold }}>
            ${post.assetTag}
          </Footnote>
        </View>
      )}

      {/* Footer: engagement actions */}
      <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
        <AnimatedPressable
          variant="icon"
          style={styles.postAction}
          accessibilityLabel={`Like post by ${post.username}`}
          accessibilityRole="button"
        >
          <IconSymbol name="star.fill" size={16} color={colors.muted} />
          <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
            {post.likes}
          </Caption1>
        </AnimatedPressable>
        <AnimatedPressable
          variant="icon"
          style={styles.postAction}
          accessibilityLabel={`Comment on post by ${post.username}`}
          accessibilityRole="button"
        >
          <IconSymbol name="paperplane.fill" size={16} color={colors.muted} />
          <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
            {post.comments}
          </Caption1>
        </AnimatedPressable>
        <AnimatedPressable
          variant="icon"
          style={styles.postAction}
          accessibilityLabel={`Share post by ${post.username}`}
          accessibilityRole="button"
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={colors.muted} />
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  postMeta: {
    flex: 1,
  },
  pnlBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assetTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 10,
    borderTopWidth: 0.5,
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
