import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { PnLText } from "@/components/ui/pnl-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  SOCIAL_FEED,
  LEADERBOARD,
  ACHIEVEMENTS,
  type SocialPost,
  type LeaderboardEntry,
  type Achievement,
} from "@/lib/mock-data";

const TABS = ["Feed", "Leaderboard", "Achievements"];

function PostCard({ post }: { post: SocialPost }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.postCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.postHeader}>
        <View
          style={[styles.avatar, { backgroundColor: colors.primaryAlpha }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {post.avatar}
          </Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={[styles.postUsername, { color: colors.foreground }]}>
            {post.username}
          </Text>
          <Text style={[styles.postTime, { color: colors.muted }]}>
            {post.timestamp}
          </Text>
        </View>
        {post.pnlPercent !== undefined && (
          <View
            style={[
              styles.pnlBadge,
              {
                backgroundColor:
                  post.pnlPercent >= 0
                    ? colors.successAlpha
                    : colors.errorAlpha,
              },
            ]}
          >
            <PnLText value={post.pnlPercent} size="sm" showArrow={false} />
          </View>
        )}
      </View>
      <Text style={[styles.postContent, { color: colors.foreground }]}>
        {post.content}
      </Text>
      {post.assetTag && (
        <View
          style={[
            styles.assetTag,
            { backgroundColor: colors.primaryAlpha },
          ]}
        >
          <Text style={[styles.assetTagText, { color: colors.primary }]}>
            ${post.assetTag}
          </Text>
        </View>
      )}
      <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.postAction,
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="star.fill" size={16} color={colors.muted} />
          <Text style={[styles.postActionText, { color: colors.muted }]}>
            {post.likes}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.postAction,
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="paperplane.fill" size={16} color={colors.muted} />
          <Text style={[styles.postActionText, { color: colors.muted }]}>
            {post.comments}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.postAction,
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const colors = useColors();
  const isTop3 = entry.rank <= 3;
  const rankColors = ["", colors.gold, colors.silver, colors.bronze];

  return (
    <View
      style={[
        styles.leaderRow,
        { borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.leaderRank}>
        <Text
          style={[
            styles.leaderRankText,
            {
              color: isTop3 ? rankColors[entry.rank] : colors.muted,
              fontWeight: isTop3 ? "800" : "600",
            },
          ]}
        >
          {entry.rank}
        </Text>
      </View>
      <View
        style={[styles.leaderAvatar, { backgroundColor: colors.primaryAlpha }]}
      >
        <Text style={[styles.leaderAvatarText, { color: colors.primary }]}>
          {entry.avatar}
        </Text>
      </View>
      <View style={styles.leaderInfo}>
        <Text style={[styles.leaderName, { color: colors.foreground }]}>
          {entry.username}
        </Text>
        <View style={styles.leaderStats}>
          <Text style={[styles.leaderStat, { color: colors.muted }]}>
            {entry.trades} trades
          </Text>
          <Text style={[styles.leaderStat, { color: colors.muted }]}>
            {" · "}
          </Text>
          <IconSymbol name="flame.fill" size={12} color={colors.warning} />
          <Text style={[styles.leaderStat, { color: colors.warning }]}>
            {entry.streak}
          </Text>
        </View>
      </View>
      <PnLText value={entry.returnPercent} size="md" showArrow={false} />
    </View>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const colors = useColors();
  const progressPercent = (achievement.progress / achievement.total) * 100;

  return (
    <View
      style={[
        styles.achievementCard,
        {
          backgroundColor: colors.surface,
          borderColor: achievement.unlocked
            ? colors.warningAlpha
            : colors.border,
          opacity: achievement.unlocked ? 1 : 0.7,
        },
      ]}
    >
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <Text
        style={[styles.achievementTitle, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>
      <Text
        style={[styles.achievementDesc, { color: colors.muted }]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>
      {!achievement.unlocked && (
        <View style={styles.achievementProgress}>
          <View
            style={[
              styles.achievementBar,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <View
              style={[
                styles.achievementFill,
                {
                  backgroundColor: colors.warning,
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.achievementProgressText, { color: colors.muted }]}
          >
            {achievement.progress}/{achievement.total}
          </Text>
        </View>
      )}
      {achievement.unlocked && (
        <View
          style={[
            styles.unlockedBadge,
            { backgroundColor: colors.warningAlpha },
          ]}
        >
          <IconSymbol name="checkmark" size={12} color={colors.warning} />
          <Text style={[styles.unlockedText, { color: colors.warning }]}>
            Unlocked
          </Text>
        </View>
      )}
    </View>
  );
}

export default function SocialScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("Feed");

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Community
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={({ pressed }) => [
                styles.tab,
                isActive && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? colors.primary : colors.muted,
                    fontWeight: isActive ? "700" : "500",
                  },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === "Feed" && (
        <FlatList
          data={SOCIAL_FEED}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
          renderItem={({ item }) => <PostCard post={item} />}
        />
      )}

      {activeTab === "Leaderboard" && (
        <ScrollView
          contentContainerStyle={styles.leaderContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.leaderHeader,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.leaderHeaderTitle, { color: colors.foreground }]}>
              Weekly Top Performers
            </Text>
            <Text style={[styles.leaderHeaderSub, { color: colors.muted }]}>
              Based on portfolio return percentage
            </Text>
          </View>
          {LEADERBOARD.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {activeTab === "Achievements" && (
        <ScrollView
          contentContainerStyle={styles.achievementsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
  },
  // Feed
  feedContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
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
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  postMeta: {
    flex: 1,
  },
  postUsername: {
    fontSize: 15,
    fontWeight: "600",
  },
  postTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  pnlBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  assetTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  assetTagText: {
    fontSize: 13,
    fontWeight: "600",
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
  postActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Leaderboard
  leaderContent: {
    paddingBottom: 20,
  },
  leaderHeader: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  leaderHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  leaderHeaderSub: {
    fontSize: 13,
    fontWeight: "500",
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  leaderRank: {
    width: 28,
    alignItems: "center",
  },
  leaderRankText: {
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  leaderAvatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  leaderStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  leaderStat: {
    fontSize: 12,
    fontWeight: "500",
  },
  // Achievements
  achievementsContent: {
    padding: 16,
    paddingBottom: 20,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
    marginBottom: 8,
  },
  achievementProgress: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  achievementBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  achievementFill: {
    height: "100%",
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
