/**
 * Social Screen — Community feed, leaderboard, and achievements
 *
 * Refactored to use extracted feature components for better maintainability.
 */
import React, { useState } from "react";
import { ScrollView, View, FlatList, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/layouts";
import { PostCard, TabSelector, LeaderboardRow, AchievementCard } from "@/components/features/social";
import { useColors } from "@/hooks/use-colors";
import { Title3, Footnote } from "@/components/ui/typography";
import { SOCIAL_FEED, LEADERBOARD, ACHIEVEMENTS } from "@/lib/mock-data";

const TABS = ["Feed", "Leaderboard", "Achievements"];

export default function SocialScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("Feed");

  return (
    <ScreenContainer>
      {/* Header */}
      <ScreenHeader title="Community" />

      {/* Tab Selector */}
      <TabSelector
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      {activeTab === "Feed" && (
        <FlatList
          data={SOCIAL_FEED}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
          renderItem={({ item, index }) => <PostCard post={item} index={index} />}
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
          {LEADERBOARD.map((entry, index) => (
            <LeaderboardRow key={entry.rank} entry={entry} index={index} />
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
            {ACHIEVEMENTS.map((achievement, index) => (
              <AchievementCard key={achievement.id} achievement={achievement} index={index} />
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  feedContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
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
  achievementsContent: {
    padding: 16,
    paddingBottom: 20,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
