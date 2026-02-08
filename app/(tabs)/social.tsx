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
  Title1,
  Title3,
  Headline,
  Body,
  Subhead,
  Footnote,
  Caption1,
  Caption2,
  MonoSubhead,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
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
            <PnLText value={post.pnlPercent} size="sm" showArrow={false} />
          </View>
        )}
      </View>
      <Body style={{ lineHeight: 21, marginBottom: 10 }}>{post.content}</Body>
      {post.assetTag && (
        <View style={[styles.assetTag, { backgroundColor: colors.primaryAlpha }]}>
          <Footnote color="primary" style={{ fontFamily: FontFamily.semibold }}>
            ${post.assetTag}
          </Footnote>
        </View>
      )}
      <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="star.fill" size={16} color={colors.muted} />
          <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
            {post.likes}
          </Caption1>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="paperplane.fill" size={16} color={colors.muted} />
          <Caption1 color="muted" style={{ fontFamily: FontFamily.semibold }}>
            {post.comments}
          </Caption1>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.postAction, pressed && { opacity: 0.6 }]}
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
    <View style={[styles.leaderRow, { borderBottomColor: colors.border }]}>
      <View style={styles.leaderRank}>
        <MonoSubhead
          style={{
            color: isTop3 ? rankColors[entry.rank] : colors.muted,
            fontFamily: isTop3 ? FontFamily.monoBold : FontFamily.monoMedium,
            fontSize: 16,
          }}
        >
          {entry.rank}
        </MonoSubhead>
      </View>
      <View style={[styles.leaderAvatar, { backgroundColor: colors.primaryAlpha }]}>
        <Caption1 color="primary" style={{ fontFamily: FontFamily.bold }}>
          {entry.avatar}
        </Caption1>
      </View>
      <View style={styles.leaderInfo}>
        <Subhead style={{ fontFamily: FontFamily.semibold, marginBottom: 2 }}>
          {entry.username}
        </Subhead>
        <View style={styles.leaderStats}>
          <Caption1 color="muted" style={{ fontFamily: FontFamily.medium }}>
            {entry.trades} trades
          </Caption1>
          <Caption1 color="muted"> · </Caption1>
          <IconSymbol name="flame.fill" size={12} color={colors.warning} />
          <Caption1 style={{ color: colors.warning, fontFamily: FontFamily.medium }}>
            {entry.streak}
          </Caption1>
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
          borderColor: achievement.unlocked ? colors.warningAlpha : colors.border,
          opacity: achievement.unlocked ? 1 : 0.7,
        },
      ]}
    >
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <Subhead
        style={{ fontFamily: FontFamily.bold, textAlign: "center", marginBottom: 4 }}
        numberOfLines={1}
      >
        {achievement.title}
      </Subhead>
      <Caption2
        color="muted"
        style={{ textAlign: "center", lineHeight: 15, marginBottom: 8 }}
        numberOfLines={2}
      >
        {achievement.description}
      </Caption2>
      {!achievement.unlocked && (
        <View style={styles.achievementProgress}>
          <View style={[styles.achievementBar, { backgroundColor: colors.surfaceSecondary }]}>
            <View
              style={[
                styles.achievementFill,
                { backgroundColor: colors.warning, width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Caption2
            color="muted"
            style={{ fontFamily: FontFamily.monoMedium }}
          >
            {achievement.progress}/{achievement.total}
          </Caption2>
        </View>
      )}
      {achievement.unlocked && (
        <View style={[styles.unlockedBadge, { backgroundColor: colors.warningAlpha }]}>
          <IconSymbol name="checkmark" size={12} color={colors.warning} />
          <Caption2 style={{ color: colors.warning, fontFamily: FontFamily.semibold }}>
            Unlocked
          </Caption2>
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
        <Title1>Community</Title1>
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
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Subhead
                color={isActive ? "primary" : "muted"}
                style={{ fontFamily: isActive ? FontFamily.bold : FontFamily.medium }}
              >
                {tab}
              </Subhead>
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
            <Title3 style={{ marginBottom: 4 }}>Weekly Top Performers</Title3>
            <Footnote color="muted">Based on portfolio return percentage</Footnote>
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
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
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
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
